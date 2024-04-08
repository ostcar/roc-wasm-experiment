app "wasm"
    packages {
        pf: "platform/main.roc",
    }
    imports [
        pf.Task.{ Task, consoleLog, getTime },
    ]
    provides [main] to pf

main =
    time <- getTime |> Task.await
    consoleLog time
