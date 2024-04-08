pub fn main() u8 {
    // TODO: This should be removed: https://github.com/roc-lang/roc/issues/5585
    return 0;
}

export fn roc_fx_consoleLog(ptr: [*]u8) void {
    consoleLog(ptr);
}
export fn roc_fx_getTime(ptr: [*]u8) void {
    getTime(ptr);
}

extern fn consoleLog(ptr: [*]u8) void;
extern fn getTime(ptr: [*]u8) void;
