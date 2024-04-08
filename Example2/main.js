// A very simple allocator, that never frees
let last_alloc = 0;
function alloc(size) {
  const ptr = last_alloc;
  last_alloc += size;
  return ptr;
}

function to_roc_str(input, memory) {
  const encoded = (new TextEncoder).encode(input);
  const ptr = encoded.length + 4 * 4; // bytes len + 3 * usize for str-struct + 1 * usize for refcount

  const memory_as_u32 = new Uint32Array(memory, ptr);
  memory_as_u32[0] = ptr + 16; // pointer to the string data, we put it behind the str-struct
  memory_as_u32[1] = encoded.length; // string length
  memory_as_u32[2] = encoded.length; // string capacity
  memory_as_u32[3] = 2147483648; // Refcount

  const memory_bytes = new Uint8Array(memory, ptr + 16, encoded.length);
  memory_bytes.set(encoded);
  return ptr;
}

function read_roc_str(memory, ptr) {
  // TODO: support small strings
  const memory_bytes = new Uint32Array(memory, ptr);
  const data_ptr = memory_bytes[0];
  const len = memory_bytes[1];

  const data = new Uint8Array(memory, data_ptr, len);
  const str = (new TextDecoder).decode(data);
  return str;
}


async function load_wasm(wasm_file) {
  let wasm;

  const importObj = {
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
      roc_alloc: (size, alignment) => {
        return alloc(size);
      },
      roc_realloc: (old_ptr, new_size, alignment) => {
        return alloc(new_size);
      },
      roc_dealloc: (ptr, alignment) => {
        // Do nothing
      },
    },
  };

  wasm = await WebAssembly.instantiateStreaming(fetch(wasm_file), importObj);
  const memory = wasm.instance.exports.memory;
  const roc = wasm.instance.exports.roc__mainforPlatform_1_exposed_generic;

  return function (input) {
    try {
      const input_str_ptr = to_roc_str(input, memory.buffer);
      let output_str_ptr = alloc(3 * 4);
      roc(output_str_ptr, input_str_ptr);
      return read_roc_str(memory.buffer, output_str_ptr);

    } catch (e) {
      console.error(e);
    }
  }
}
