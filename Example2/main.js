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
  let memory;

  const importObj = {
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
      memcpy: (dest, src, len) => {
        let memory_bytes = new Uint8Array(memory.buffer);
        memory_bytes.copyWithin(dest, src, len);
      },
    },
  };

  const wasm = await WebAssembly.instantiateStreaming(fetch(wasm_file), importObj);
  memory = wasm.instance.exports.memory;
  const roc = wasm.instance.exports.roc__mainforPlatform_1_exposed_generic;

  return function (input) {
    try {
      const input_str_ptr = alloc(3 * 4); // 3 times usize bytes, for a roc-string-struct
      write_roc_str(input, memory.buffer, input_str_ptr);
      var output_str_ptr = alloc(3 * 4); // 3 times usize bytes, for a roc-string-struct
      roc(output_str_ptr, input_str_ptr);
      return read_roc_str(memory.buffer, output_str_ptr);

    } catch (e) {
      console.error(e);
    }
  }
}
