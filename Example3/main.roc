app "wasm"
    packages {
        pf: "platform.roc",
    }
    imports [
        pf.Task.{ Task, consoleLog, getTime },
    ]
    provides [main] to pf

main =
    time <- getTime |> Task.await
    _ <- consoleLog time |> Task.await
    Task.ok {}
