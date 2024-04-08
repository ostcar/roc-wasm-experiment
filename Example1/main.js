async function load_wasm(wasm_file) {
  let wasm;

  const importObj = {
    // wasi_snapshot_preview1 would not be necessary, if roc would cal "zig build-lib" instead of "zig build-exe"
    wasi_snapshot_preview1: {
      proc_exit: (code) => {
        if (code !== 0) {
          console.error(`Exited with code ${code}`);
        }
      },
      fd_write: (x) => {
        console.error(`fd_write not supported: ${x}`);
      },
      random_get: (bufPtr, bufLen) => {
        const wasmMemoryBuffer = new Uint8Array(wasm.instance.exports.memory.buffer);
        const buf = wasmMemoryBuffer.subarray(bufPtr, bufPtr + bufLen);
        crypto.getRandomValues(buf);
        return 0;
      },
    },
    env: {
      roc_panic: (_pointer, _tag_id) => {
        throw "Roc panicked!";
      },
    },
  };

  wasm = await WebAssembly.instantiateStreaming(fetch(wasm_file), importObj);
  return wasm.instance.exports.roc__mainforPlatform_1_exposed;;
}
