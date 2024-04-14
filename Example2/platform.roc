platform "platform"
    requires {} { main : _ }
    exposes []
    packages {}
    imports []
    provides [mainforPlatform]

mainforPlatform = \input ->
    main input
