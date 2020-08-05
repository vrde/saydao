export function set(key, value) {
  localStorage.setItem("saydao:cache:" + key, JSON.stringify(value));
}

export function get(key) {
  return JSON.parse(localStorage.getItem("saydao:cache:" + key));
}

// Yes this works for funcs with one arg only.
export function wrap(f) {
  return async (...args) => {
    if (args.length !== 1) {
      throw new Error("Cache only works with functions of arity 1");
    }
    const key = args[0];
    let value = get(key);
    if (value === null) {
      value = await f(key);
      set(key, value);
    }
    return value;
  };
}
