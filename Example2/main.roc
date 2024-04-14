app "wasm"
    packages {
        pf: "platform.roc",
    }
    imports []
    provides [main] to pf

main : Str -> Str
main = \input ->
    input
    |> Str.toUtf8
    |> List.reverse
    |> Str.fromUtf8
    |> Result.withDefault "invalid utf8"
