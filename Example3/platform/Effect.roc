hosted Effect
    exposes [
        Effect,
        after,
        map,
        always,
        consoleLog,
        getTime,
    ]
    imports []
    generates Effect with [after, map, always]

consoleLog : Str -> Effect {}
getTime : Effect Str
