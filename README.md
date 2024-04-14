# Roc Wasm Example

This repo shows in a few examples, how easy it is, to build Wasm modules with
Roc, and what obstacles there currently are.

Each example has its own directory. To build and run it, go to the directory,
build the Wasm module and start a webserver. For example:

```bash
cd Example1
roc build --target=wasm32 --no-link --output /tmp/main.o
wasm-ld /tmp/main.o -o main.wasm --no-entry --export-dynamic --strip-all --import-undefined
python -m http.server 8050
```

To access it, open your webbrowser on http://localhost:8050/


# Example 1 - No-Platform

This example builds a simple `add`-function, that adds two numbers and returns
the result.


# Example 2 - Strings And Allocations

The first example is simple, since it only uses numbers. The second examples
takes a string and returns it in reversed order (only ASCII supported).

To give and return strings to Wasm is not a Roc problem, but a Wasm problem.
Every language has the problem, that Wasm only accespts numbers. If you want to
give it another type, you have to write it in memory and pass the pointer. For
Roc, this is not notably, since all platforms have to do it anyway. When you
look at the communication between a Roc-platform and the Roc-app, it also writes
the object in memory and gives Roc a pointer.

For this to work, the host language (rust, zig, go, javascript) has to
understand the Roc types. For this example, a simple Roc string type is
implemented in javascript. For the future, this would be a task of `roc glue`.

This example has a very basic allocator written in javascript. This
demonstrates, that a platform is not necessary for memory management.


# Example 3 - Tasks

This example demonstrates, how to use Effects/Task. Javascript exports the
functions `getTime` and `consoleLog`. Roc calls this using its Task system.
