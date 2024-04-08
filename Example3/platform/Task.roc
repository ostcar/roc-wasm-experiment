interface Task
    exposes [
        Task,
        await,
        consoleLog,
        getTime,
    ]
    imports [
        Effect.{ Effect },
    ]

Task ok err := Effect (Result ok err)

err : a -> Task * a
err = \a -> @Task (Effect.always (Err a))

fromEffect : Effect (Result ok err) -> Task ok err
fromEffect = \effect -> @Task effect

toEffect : Task ok err -> Effect (Result ok err)
toEffect = \@Task effect -> effect

await : Task a b, (a -> Task c b) -> Task c b
await = \task, transform ->
    effect = Effect.after
        (toEffect task)
        \result ->
            when result is
                Ok a -> transform a |> toEffect
                Err b -> err b |> toEffect

    fromEffect effect

consoleLog : Str -> Task {} *
consoleLog = \str ->
    Effect.consoleLog str
    |> Effect.map (\_ -> Ok {})
    |> Task.fromEffect

getTime : Task Str *
getTime =
    Effect.getTime
    |> Effect.map \str ->
        Ok str
    |> Task.fromEffect
