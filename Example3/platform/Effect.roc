hosted Effect
    exposes [
        Effect,
        after,
        map,
        always,
        forever,
        loop,
        consoleLog,
        getTime,
    ]
    imports []
    generates Effect with [after, map, always, forever, loop]

consoleLog : Str -> Effect {}
getTime : Effect Str
