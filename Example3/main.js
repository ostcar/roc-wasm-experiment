// A very simple arena allocator. Set "last_alloc" to 0 to reset the arena.
let last_alloc = 0;
function alloc(size) {
  const ptr = last_alloc;
  last_alloc += size;
  return ptr;
}

function write_roc_str(input, memory, ptr) {
  const encoded = (new TextEncoder).encode(input);

  str_ptr = alloc(encoded.length + 4);
  const str_mem = new Uint32Array(memory, str_ptr);
  str_mem[0] = 2147483648; // Refcount
  const memory_bytes = new Uint8Array(memory, str_ptr + 4, encoded.length);
  memory_bytes.set(encoded);

  const memory_as_u32 = new Uint32Array(memory, ptr);
  memory_as_u32[0] = str_ptr + 4; // pointer to the string data (behind the refcount)
  memory_as_u32[1] = encoded.length; // string length
  memory_as_u32[2] = encoded.length; // string capacity
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
      consoleLog: (ptr) => {
        console.log(read_roc_str(memory.buffer, ptr));
      },
      getTime: (ptr) => {
        const str = new Date().toString();
        write_roc_str(str, memory.buffer, ptr);
      },
    },
  };

  wasm = await WebAssembly.instantiateStreaming(fetch(wasm_file), importObj);
  const memory = wasm.instance.exports.memory;
  const roc = wasm.instance.exports.roc__mainforPlatform_1_exposed_generic;
  const call_closure = wasm.instance.exports.roc__mainforPlatform_0_caller;
  const getCallbackSize = wasm.instance.exports.roc__mainforPlatform_1_exposed_size;
  const getCallbackResultSize = wasm.instance.exports.roc__mainforPlatform_0_result_size;

  return function () {
    try {
      // There is a bug in roc__mainforPlatform_1_exposed_size. It returns an i64 instead of usize
      const callback_ptr = alloc(Number(getCallbackSize()));
      roc(callback_ptr);

      // There is a bug in roc__mainforPlatform_0_result_size. It returns an i64 instead of usize
      const result_ptr = alloc(Number(getCallbackResultSize()));

      call_closure(0, callback_ptr, result_ptr);
      return read_roc_str(memory.buffer, result_ptr);

    } catch (e) {
      console.error(e);
    }
  }
}
