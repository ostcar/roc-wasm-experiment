platform "platform"
    requires {} { main : _ }
    exposes []
    packages {}
    imports []
    provides [mainforPlatform]

mainforPlatform = \a, b ->
    main a b
