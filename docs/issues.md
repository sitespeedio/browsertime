Running one of the example from the example docs produces the following error:

``` shellsession
browsertime https://www.sitespeed.io/             
[2016-04-06 22:40:03] Running chrome for url: https://www.sitespeed.io/
events.js:141
      throw er; // Unhandled 'error' event
      ^

Error: spawn java ENOENT
    at exports._errnoException (util.js:870:11)
    at Process.ChildProcess._handle.onexit (internal/child_process.js:178:32)
    at onErrorNT (internal/child_process.js:344:16)
    at nextTickCallbackWith2Args (node.js:442:9)
    at process._tickCallback (node.js:356:17)
```

Solution: Java is missing from your system and you will need install it.
