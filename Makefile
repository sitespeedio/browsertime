HERE = $(shell pwd)
BIN = $(HERE)/bin
PYTHON = $(BIN)/python
INSTALL = $(BIN)/pip install --no-deps
BUILD_DIRS = bin build include lib lib64 man share
VIRTUALENV = virtualenv

.PHONY: all test build install_linters lint

all: build

$(PYTHON):
	$(VIRTUALENV) $(VTENV_OPTS) .

build: $(PYTHON)
	$(BIN)/pip install tox

clean:
	rm -rf $(BUILD_DIRS)

test: build
	$(BIN)/tox

install_linters:
	$(BIN)/pip install black
	$(BIN)/pip install flake8

lint: install_linters
	$(BIN)/black browsertime
	$(BIN)/flake8 browsertime
