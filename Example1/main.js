async function load_wasm(wasm_file) {
  const importObj = {
    env: {
      roc_panic: (_pointer, _tag_id) => {
        throw "Roc panicked!";
      },
    },
  };

  const wasm = await WebAssembly.instantiateStreaming(fetch(wasm_file), importObj);
  return wasm.instance.exports.roc__mainforPlatform_1_exposed;;
}
