# Roc Wasm Example

This repo shows in a few examples, how easy it is, to build Wasm modules with
Roc, and what obstacles there currently are.

Each example has its own directory. To build and run it, go to the directory,
build the Wasm module and start a webserver. For example:

```bash
cd Example1
roc build --target=wasm32
python -m http.server 8050
```

To access it, open your webbrowser on http://localhost:8050/


# Example 1 - No-Platform


This example builds a simple `add`-function, that adds two numbers and returns
the result.

As you can see, the platform is very simple. `platform/main.roc` basicly does
nothing. It just calls the main-function. The file `platform/host.zig` is even
simpler. It only contains a `main` function, that is never called.


**Question 1:** Is the platform realy necessary? Would it be possible for an Roc
app to be compiled to a Wasm module, without any platform? Since the platform
does nothing, why depend on it?

There could be a special syntax, that tells Roc, not to use any platform:

```roc
app "wasm"
    packages {
        pf: "wasm",
    }
    imports []
    provides [main] to pf
```

This would it make very easy, to build Wasm modules with Roc. Would this be in
the scope of the Roc-project?


**Question 2:** Would it be possible for Roc to detect, that it build a
Wasm module and sets the `--target` to `wasm32` per default?


# Example 2 - Strings And Allocations

The first example was simple, since it only used numbers. The second examples
takes a string and returns it in reversed order (only ascii supported).

To give and return strings to Wasm is not a Roc-problem, but a Wasm-problem.
Every language has the problem, that Wasm only accespts numbers. If you want to
give it another type, you have to write it in memory and pass the pointer. For
Roc, this is not notably, since all platforms have to do it anyway. When you
look at the comunication between a Roc-platform and the Roc-app, it also
writes the object in memory and give Roc a pointer.

For this to work, the host-language (rust, zig, go, javascript) has to
understand the Roc-types. For this example, a simple Roc-string-type is
implemented in javascript. For the future, this would be a task of `roc glue`.

This example has a very basic allocator written in javascript. This
demonstrates, that a platform is not needed for memory management.


# Example 3 - Tasks

This example demonstrates, how to use Effects/Task. Javascript exports the
functions `getTime` and `consoleLog`. Roc calls this using its Task system.

For this to work, the Effects had to be defined in a `hosted`-roc-module inside
the platform.

**Question 3:** Would it be possible for an Wasm-roc-app, that has no platform,
to define effects? Maybe after `Task` will be a builtin?

It was currently also necessary, to define the effects in the `host.zig`-file.
This does not seem necessary. Is this a bug?
