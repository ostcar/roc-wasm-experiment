app "wasm"
    packages {
        pf: "platform.roc",
    }
    imports []
    provides [main] to pf

main : U32, U32 -> U32
main = \a, b -> a + b
