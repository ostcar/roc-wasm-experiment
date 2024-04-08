platform "platform"
    requires {} { main : Task {} Str }
    exposes []
    packages {}
    imports [
        Task.{ Task },
    ]
    provides [mainforPlatform]

mainforPlatform : Task {} Str
mainforPlatform = main
