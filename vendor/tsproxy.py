#!/usr/bin/python
"""
Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""
import asyncore
import gc
import logging
import Queue
import signal
import socket
import sys
import threading
import time

server = None
in_pipe = None
out_pipe = None
must_exit = False
options = None
dest_addresses = None
connections = {}
dns_cache = {}
port_mappings = None
map_localhost = False
needs_flush = False
flush_pipes = False
REMOVE_TCP_OVERHEAD = 1460.0 / 1500.0


def PrintMessage(msg):
  # Print the message to stdout & flush to make sure that the message is not
  # buffered when tsproxy is run as a subprocess.
  print >> sys.stdout, msg
  sys.stdout.flush()


########################################################################################################################
#   Traffic-shaping pipe (just passthrough for now)
########################################################################################################################
class TSPipe():
  PIPE_IN = 0
  PIPE_OUT = 1

  def __init__(self, direction, latency, kbps):
    self.direction = direction
    self.latency = latency
    self.kbps = kbps
    self.queue = Queue.Queue()
    self.last_tick = time.clock()
    self.next_message = None
    self.available_bytes = .0
    self.peer = 'server'
    if self.direction == self.PIPE_IN:
      self.peer = 'client'

  def SendMessage(self, message):
    global connections
    try:
      connection_id = message['connection']
      if connection_id in connections and self.peer in connections[connection_id]:
        now = time.clock()
        if message['message'] == 'closed':
          message['time'] = now
        else:
          message['time'] = time.clock() + self.latency
        message['size'] = .0
        if 'data' in message:
          message['size'] = float(len(message['data']))
        self.queue.put(message)
    except:
      pass

  def tick(self):
    global connections
    global flush_pipes
    processed_messages = False
    now = time.clock()
    try:
      if self.next_message is None:
        self.next_message = self.queue.get_nowait()

      # Accumulate bandwidth if an available packet/message was waiting since our last tick
      if self.next_message is not None and self.kbps > .0 and self.next_message['time'] <= now:
        elapsed = now - self.last_tick
        accumulated_bytes = elapsed * self.kbps * 1000.0 / 8.0
        self.available_bytes += accumulated_bytes

      # process messages as long as the next message is sendable (latency or available bytes)
      while (self.next_message is not None) and\
          (flush_pipes or ((self.next_message['time'] <= now) and\
                          (self.kbps <= .0 or self.next_message['size'] <= self.available_bytes))):
        processed_messages = True
        self.queue.task_done()
        connection_id = self.next_message['connection']
        if connection_id in connections:
          if self.peer in connections[connection_id]:
            try:
              if self.kbps > .0:
                self.available_bytes -= self.next_message['size']
              connections[connection_id][self.peer].handle_message(self.next_message)
            except:
              # Clean up any disconnected connections
              try:
                connections[connection_id]['server'].close()
              except:
                pass
              try:
                connections[connection_id]['client'].close()
              except:
                pass
              del connections[connection_id]
        self.next_message = None
        self.next_message = self.queue.get_nowait()
    except:
      pass

    # Only accumulate bytes while we have messages that are ready to send
    if self.next_message is None or self.next_message['time'] > now:
      self.available_bytes = .0
    self.last_tick = now

    return processed_messages


########################################################################################################################
#   Threaded DNS resolver
########################################################################################################################
class AsyncDNS(threading.Thread):
  def __init__(self, client_id, hostname, port, result_pipe):
    threading.Thread.__init__(self)
    self.hostname = hostname
    self.port = port
    self.client_id = client_id
    self.result_pipe = result_pipe

  def run(self):
    try:
      addresses = socket.getaddrinfo(self.hostname, self.port)
      logging.info('[{0:d}] Resolving {1}:{2:d} Completed'.format(self.client_id, self.hostname, self.port))
    except:
      addresses = ()
      logging.info('[{0:d}] Resolving {1}:{2:d} Failed'.format(self.client_id, self.hostname, self.port))
    message = {'message': 'resolved', 'connection': self.client_id, 'addresses': addresses}
    self.result_pipe.SendMessage(message)


########################################################################################################################
#   TCP Client
########################################################################################################################
class TCPConnection(asyncore.dispatcher):
  STATE_ERROR = -1
  STATE_IDLE = 0
  STATE_RESOLVING = 1
  STATE_CONNECTING = 2
  STATE_CONNECTED = 3

  def __init__(self, client_id):
    global options
    asyncore.dispatcher.__init__(self)
    self.client_id = client_id
    self.state = self.STATE_IDLE
    self.buffer = ''
    self.addr = None
    self.dns_thread = None
    self.hostname = None
    self.port = None
    self.needs_config = True
    self.needs_close = False
    self.read_available = False
    self.window_available = options.window
    self.is_localhost = False
    self.did_resolve = False;

  def SendMessage(self, type, message):
    message['message'] = type
    message['connection'] = self.client_id
    in_pipe.SendMessage(message)

  def handle_message(self, message):
    if message['message'] == 'data' and 'data' in message and len(message['data']) and self.state == self.STATE_CONNECTED:
      if not self.needs_close:
        self.buffer += message['data']
        self.SendMessage('ack', {})
    elif message['message'] == 'ack':
      # Increase the congestion window by 2 packets for every packet transmitted up to 350 packets (~512KB)
      self.window_available = min(self.window_available + 2, 350)
      if self.read_available:
        self.handle_read()
    elif message['message'] == 'resolve':
      self.HandleResolve(message)
    elif message['message'] == 'connect':
      self.HandleConnect(message)
    elif message['message'] == 'closed':
      if len(self.buffer) == 0:
        self.handle_close()
      else:
        self.needs_close = True

  def handle_error(self):
    logging.warning('[{0:d}] Error'.format(self.client_id))
    if self.state == self.STATE_CONNECTING:
      self.SendMessage('connected', {'success': False, 'address': self.addr})

  def handle_close(self):
    logging.info('[{0:d}] Server Connection Closed'.format(self.client_id))
    self.state = self.STATE_ERROR
    self.close()
    try:
      if self.client_id in connections:
        if 'server' in connections[self.client_id]:
          del connections[self.client_id]['server']
        if 'client' in connections[self.client_id]:
          self.SendMessage('closed', {})
        else:
          del connections[self.client_id]
    except:
      pass

  def writable(self):
    if self.state == self.STATE_CONNECTING:
      self.state = self.STATE_CONNECTED
      self.SendMessage('connected', {'success': True, 'address': self.addr})
      logging.info('[{0:d}] Connected'.format(self.client_id))
    return (len(self.buffer) > 0 and self.state == self.STATE_CONNECTED)

  def handle_write(self):
    if self.needs_config:
      self.needs_config = False
      self.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
    sent = self.send(self.buffer)
    logging.debug('[{0:d}] TCP => {1:d} byte(s)'.format(self.client_id, sent))
    self.buffer = self.buffer[sent:]
    if self.needs_close and len(self.buffer) == 0:
      self.needs_close = False
      self.handle_close()

  def handle_read(self):
    if self.window_available == 0:
      self.read_available = True
      return
    self.read_available = False
    try:
      while self.window_available > 0:
        data = self.recv(1460)
        if data:
          if self.state == self.STATE_CONNECTED:
            self.window_available -= 1
            logging.debug('[{0:d}] TCP <= {1:d} byte(s)'.format(self.client_id, len(data)))
            self.SendMessage('data', {'data': data})
        else:
          return
    except:
      pass

  def HandleResolve(self, message):
    global in_pipe
    global map_localhost
    self.did_resolve = True
    if 'hostname' in message:
      self.hostname = message['hostname']
    self.port = 0
    if 'port' in message:
      self.port = message['port']
    logging.info('[{0:d}] Resolving {1}:{2:d}'.format(self.client_id, self.hostname, self.port))
    if self.hostname == 'localhost':
      self.hostname = '127.0.0.1'
    if self.hostname == '127.0.0.1':
      logging.info('[{0:d}] Connection to localhost detected'.format(self.client_id))
      self.is_localhost = True
    if (dest_addresses is not None) and (not self.is_localhost or map_localhost):
      self.SendMessage('resolved', {'addresses': dest_addresses})
    else:
      self.state = self.STATE_RESOLVING
      self.dns_thread = AsyncDNS(self.client_id, self.hostname, self.port, in_pipe)
      self.dns_thread.start()

  def HandleConnect(self, message):
    global map_localhost
    if 'addresses' in message and len(message['addresses']):
      self.state = self.STATE_CONNECTING
      if not self.did_resolve and message['addresses'][0] == '127.0.0.1':
        logging.info('[{0:d}] Connection to localhost detected'.format(self.client_id))
        self.is_localhost = True
      if (dest_addresses is not None) and (not self.is_localhost or map_localhost):
        self.addr = dest_addresses[0]
      else:
        self.addr = message['addresses'][0]
      self.create_socket(self.addr[0], socket.SOCK_STREAM)
      addr = self.addr[4][0]
      if not self.is_localhost or map_localhost:
        port = GetDestPort(self.addr[4][1])
      else:
        port = self.addr[4][1]
      logging.info('[{0:d}] Connecting to {1}:{2:d}'.format(self.client_id, addr, port))
      self.connect((addr, port))


########################################################################################################################
#   Socks5 Server
########################################################################################################################
class Socks5Server(asyncore.dispatcher):

  def __init__(self, host, port):
    asyncore.dispatcher.__init__(self)
    self.create_socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
      self.set_reuse_addr()
      self.bind((host, port))
      self.listen(socket.SOMAXCONN)
      self.ipaddr, self.port = self.getsockname()
      self.current_client_id = 0
    except Exception as e:
      PrintMessage("Unable to listen on {0}:{1}. Is the port already in use?".format(host, port))
      PrintMessage(e)
      exit(1)

  def handle_accept(self):
    global connections
    pair = self.accept()
    if pair is not None:
      sock, addr = pair
      self.current_client_id += 1
      logging.info('[{0:d}] Incoming connection from {1}'.format(self.current_client_id, repr(addr)))
      connections[self.current_client_id] = {
        'client' : Socks5Connection(sock, self.current_client_id),
        'server' : None
      }


# Socks5 reference: https://en.wikipedia.org/wiki/SOCKS#SOCKS5
class Socks5Connection(asyncore.dispatcher):
  STATE_ERROR = -1
  STATE_WAITING_FOR_HANDSHAKE = 0
  STATE_WAITING_FOR_CONNECT_REQUEST = 1
  STATE_RESOLVING = 2
  STATE_CONNECTING = 3
  STATE_CONNECTED = 4

  def __init__(self, connected_socket, client_id):
    global options
    asyncore.dispatcher.__init__(self, connected_socket)
    self.client_id = client_id
    self.state = self.STATE_WAITING_FOR_HANDSHAKE
    self.ip = None
    self.addresses = None
    self.hostname = None
    self.port = None
    self.requested_address = None
    self.buffer = ''
    self.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
    self.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 1460)
    self.needs_close = False
    self.read_available = False
    self.window_available = options.window

  def SendMessage(self, type, message):
    message['message'] = type
    message['connection'] = self.client_id
    out_pipe.SendMessage(message)

  def handle_message(self, message):
    if message['message'] == 'data' and 'data' in message and len(message['data']) and self.state == self.STATE_CONNECTED:
      if not self.needs_close:
        self.buffer += message['data']
        self.SendMessage('ack', {})
    elif message['message'] == 'ack':
      # Increase the congestion window by 2 packets for every packet transmitted up to 350 packets (~512KB)
      self.window_available = min(self.window_available + 2, 350)
      if self.read_available:
        self.handle_read()
    elif message['message'] == 'resolved':
      self.HandleResolved(message)
    elif message['message'] == 'connected':
      self.HandleConnected(message)
    elif message['message'] == 'closed':
      if len(self.buffer) == 0:
        self.handle_close()
      else:
        self.needs_close = True

  def writable(self):
    return (len(self.buffer) > 0)

  def handle_write(self):
    sent = self.send(self.buffer)
    logging.debug('[{0:d}] SOCKS <= {1:d} byte(s)'.format(self.client_id, sent))
    self.buffer = self.buffer[sent:]
    if self.needs_close and len(self.buffer) == 0:
      self.needs_close = False
      self.handle_close()

  def handle_read(self):
    global connections
    global dns_cache
    if self.window_available == 0:
      self.read_available = True
      return
    self.read_available = False
    try:
      while self.window_available > 0:
        # Consume in up-to packet-sized chunks (TCP packet payload as 1460 bytes from 1500 byte ethernet frames)
        data = self.recv(1460)
        if data:
          data_len = len(data)
          if self.state == self.STATE_CONNECTED:
            logging.debug('[{0:d}] SOCKS => {1:d} byte(s)'.format(self.client_id, data_len))
            self.window_available -= 1
            self.SendMessage('data', {'data': data})
          elif self.state == self.STATE_WAITING_FOR_HANDSHAKE:
            self.state = self.STATE_ERROR #default to an error state, set correctly if things work out
            if data_len >= 2 and ord(data[0]) == 0x05:
              supports_no_auth = False
              auth_count = ord(data[1])
              if data_len == auth_count + 2:
                for i in range(auth_count):
                  offset = i + 2
                  if ord(data[offset]) == 0:
                    supports_no_auth = True
              if supports_no_auth:
                # Respond with a message that "No Authentication" was agreed to
                logging.info('[{0:d}] New Socks5 client'.format(self.client_id))
                response = chr(0x05) + chr(0x00)
                self.state = self.STATE_WAITING_FOR_CONNECT_REQUEST
                self.buffer += response
          elif self.state == self.STATE_WAITING_FOR_CONNECT_REQUEST:
            self.state = self.STATE_ERROR #default to an error state, set correctly if things work out
            if data_len >= 10 and ord(data[0]) == 0x05 and ord(data[2]) == 0x00:
              if ord(data[1]) == 0x01: #TCP connection (only supported method for now)
                connections[self.client_id]['server'] = TCPConnection(self.client_id)
              self.requested_address = data[3:]
              port_offset = 0
              if ord(data[3]) == 0x01:
                port_offset = 8
                self.ip = '{0:d}.{1:d}.{2:d}.{3:d}'.format(ord(data[4]), ord(data[5]), ord(data[6]), ord(data[7]))
              elif ord(data[3]) == 0x03:
                name_len = ord(data[4])
                if data_len >= 6 + name_len:
                  port_offset = 5 + name_len
                  self.hostname = data[5:5 + name_len]
              elif ord(data[3]) == 0x04 and data_len >= 22:
                port_offset = 20
                self.ip = ''
                for i in range(16):
                  self.ip += '{0:02x}'.format(ord(data[4 + i]))
                  if i % 2 and i < 15:
                    self.ip += ':'
              if port_offset and connections[self.client_id]['server'] is not None:
                self.port = 256 * ord(data[port_offset]) + ord(data[port_offset + 1])
                if self.port:
                  if self.ip is None and self.hostname is not None:
                    if self.hostname in dns_cache:
                      self.state = self.STATE_CONNECTING
                      self.addresses = dns_cache[self.hostname]
                      self.SendMessage('connect', {'addresses': self.addresses, 'port': self.port})
                    else:
                      self.state = self.STATE_RESOLVING
                      self.SendMessage('resolve', {'hostname': self.hostname, 'port': self.port})
                  elif self.ip is not None:
                    self.state = self.STATE_CONNECTING
                    self.addresses = socket.getaddrinfo(self.ip, self.port)
                    self.SendMessage('connect', {'addresses': self.addresses, 'port': self.port})
        else:
          return
    except:
      pass

  def handle_close(self):
    logging.info('[{0:d}] Browser Connection Closed'.format(self.client_id))
    self.state = self.STATE_ERROR
    self.close()
    try:
      if self.client_id in connections:
        if 'client' in connections[self.client_id]:
          del connections[self.client_id]['client']
        if 'server' in connections[self.client_id]:
          self.SendMessage('closed', {})
        else:
          del connections[self.client_id]
    except:
      pass

  def HandleResolved(self, message):
    global dns_cache
    if self.state == self.STATE_RESOLVING:
      if 'addresses' in message and len(message['addresses']):
        self.state = self.STATE_CONNECTING
        self.addresses = message['addresses']
        dns_cache[self.hostname] = self.addresses
        logging.debug('[{0:d}] Resolved {1}, Connecting'.format(self.client_id, self.hostname))
        self.SendMessage('connect', {'addresses': self.addresses, 'port': self.port})
      else:
        # Send host unreachable error
        self.state = self.STATE_ERROR
        self.buffer += chr(0x05) + chr(0x04) + self.requested_address

  def HandleConnected(self, message):
    if 'success' in message and self.state == self.STATE_CONNECTING:
      response = chr(0x05)
      if message['success']:
        response += chr(0x00)
        logging.debug('[{0:d}] Connected to {1}'.format(self.client_id, self.hostname))
        self.state = self.STATE_CONNECTED
      else:
        response += chr(0x04)
        self.state = self.STATE_ERROR
      response += chr(0x00)
      response += self.requested_address
      self.buffer += response


########################################################################################################################
#   stdin command processor
########################################################################################################################
class CommandProcessor():
  def __init__(self):
    thread = threading.Thread(target = self.run, args=())
    thread.daemon = True
    thread.start()

  def run(self):
    global must_exit
    while not must_exit:
      for line in iter(sys.stdin.readline, ''):
        self.ProcessCommand(line.strip())

  def ProcessCommand(self, input):
    global in_pipe
    global out_pipe
    global needs_flush
    global REMOVE_TCP_OVERHEAD
    if len(input):
      command = input.split()
      if len(command) and len(command[0]):
        ok = False
        if command[0].lower() == 'flush':
          needs_flush = True
          ok = True
        elif len(command) >= 3 and command[0].lower() == 'set' and command[1].lower() == 'rtt' and len(command[2]):
          rtt = float(command[2])
          latency = rtt / 2000.0
          in_pipe.latency = latency
          out_pipe.latency = latency
          needs_flush = True
          ok = True
        elif len(command) >= 3 and command[0].lower() == 'set' and command[1].lower() == 'inkbps' and len(command[2]):
          in_pipe.kbps = float(command[2]) * REMOVE_TCP_OVERHEAD
          needs_flush = True
          ok = True
        elif len(command) >= 3 and command[0].lower() == 'set' and command[1].lower() == 'outkbps' and len(command[2]):
          out_pipe.kbps = float(command[2]) * REMOVE_TCP_OVERHEAD
          needs_flush = True
          ok = True
        if not ok:
          PrintMessage('ERROR')


########################################################################################################################
#   Main Entry Point
########################################################################################################################
def main():
  global server
  global options
  global in_pipe
  global out_pipe
  global dest_addresses
  global port_mappings
  global map_localhost
  import argparse
  global REMOVE_TCP_OVERHEAD
  parser = argparse.ArgumentParser(description='Traffic-shaping socks5 proxy.',
                                   prog='tsproxy')
  parser.add_argument('-v', '--verbose', action='count', help="Increase verbosity (specify multiple times for more). -vvvv for full debug output.")
  parser.add_argument('-b', '--bind', default='localhost', help="Server interface address (defaults to localhost).")
  parser.add_argument('-p', '--port', type=int, default=1080, help="Server port (defaults to 1080, use 0 for randomly assigned).")
  parser.add_argument('-r', '--rtt', type=float, default=.0, help="Round Trip Time Latency (in ms).")
  parser.add_argument('-i', '--inkbps', type=float, default=.0, help="Download Bandwidth (in 1000 bits/s - Kbps).")
  parser.add_argument('-o', '--outkbps', type=float, default=.0, help="Upload Bandwidth (in 1000 bits/s - Kbps).")
  parser.add_argument('-w', '--window', type=int, default=10, help="Emulated TCP initial congestion window (defaults to 10).")
  parser.add_argument('-d', '--desthost', help="Redirect all outbound connections to the specified host.")
  parser.add_argument('-m', '--mapports', help="Remap outbound ports. Comma-separated list of original:new with * as a wildcard. --mapports '443:8443,*:8080'")
  parser.add_argument('-l', '--localhost', action='store_true', default=False,
                      help="Include connections already destined for localhost/127.0.0.1 in the host and port remapping.")
  options = parser.parse_args()

  # Set up logging
  log_level = logging.CRITICAL
  if options.verbose == 1:
    log_level = logging.ERROR
  elif options.verbose == 2:
    log_level = logging.WARNING
  elif options.verbose == 3:
    log_level = logging.INFO
  elif options.verbose >= 4:
    log_level = logging.DEBUG
  logging.basicConfig(level=log_level, format="%(asctime)s.%(msecs)03d - %(message)s", datefmt="%H:%M:%S")

  # Parse any port mappings
  if options.mapports:
    port_mappings = {}
    for pair in options.mapports.split(','):
      (src, dest) = pair.split(':')
      if src == '*':
        port_mappings['default'] = int(dest)
      else:
        port_mappings[src] = int(dest)

  map_localhost = options.localhost

  # Resolve the address for a rewrite destination host if one was specified
  if options.desthost:
    dest_addresses = socket.getaddrinfo(options.desthost, GetDestPort(80))

  # Set up the pipes.  1/2 of the latency gets applied in each direction (and /1000 to convert to seconds)
  in_pipe = TSPipe(TSPipe.PIPE_IN, options.rtt / 2000.0, options.inkbps * REMOVE_TCP_OVERHEAD)
  out_pipe = TSPipe(TSPipe.PIPE_OUT, options.rtt / 2000.0, options.outkbps * REMOVE_TCP_OVERHEAD)

  signal.signal(signal.SIGINT, signal_handler)
  server = Socks5Server(options.bind, options.port)
  command_processor = CommandProcessor()
  PrintMessage('Started Socks5 proxy server on {0}:{1:d}\nHit Ctrl-C to exit.'.format(server.ipaddr, server.port))
  run_loop()

def signal_handler(signal, frame):
  global server
  global must_exit
  logging.error('Exiting...')
  must_exit = True
  del server


# Wrapper around the asyncore loop that lets us poll the in/out pipes every 1ms
def run_loop():
  global must_exit
  global in_pipe
  global out_pipe
  global needs_flush
  global flush_pipes
  gc_check_count = 0
  last_activity = time.clock()
  # disable gc to avoid pauses during traffic shaping/proxying
  gc.disable()
  while not must_exit:
    asyncore.poll(0.001, asyncore.socket_map)
    if needs_flush:
      flush_pipes = True
      needs_flush = False
    if in_pipe.tick():
      last_activity = time.clock()
    if out_pipe.tick():
      last_activity = time.clock()
    if flush_pipes:
      PrintMessage('OK')
      flush_pipes = False
    # Every 500 loops (~0.5 second) check to see if it is a good time to do a gc
    if gc_check_count > 1000:
      gc_check_count = 0
      # manually gc after 5 seconds of idle
      if time.clock() - last_activity >= 5:
        last_activity = time.clock()
        logging.debug("Triggering manual GC")
        gc.collect()
    else:
      gc_check_count += 1

def GetDestPort(port):
  global port_mappings
  if port_mappings is not None:
    src_port = str(port)
    if src_port in port_mappings:
      return port_mappings[src_port]
    elif 'default' in port_mappings:
      return port_mappings['default']
  return port


if '__main__' == __name__:
  main()
