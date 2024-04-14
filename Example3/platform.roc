platform "platform"
    requires {} { main : Task {} * }
    exposes []
    packages {}
    imports [
        Task.{ Task },
    ]
    provides [mainforPlatform]

mainforPlatform : Task {} *
mainforPlatform = main
