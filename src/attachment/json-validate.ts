export function validateJsonData(input: unknown): boolean {
  const ancestors = new Set<object>();
  let nodes = 0;

  function visit(value: unknown, depth: number): boolean {
    if (++nodes > 10000 || depth > 32) return false;

    if (value === null) return true;

    if (typeof value === "string" ||
        typeof value === "boolean") return true;

    if (typeof value === "number") {
      return Number.isFinite(value);
    }

    if (typeof value !== "object") return false;

    if (ancestors.has(value)) return false;

    const prototype = Object.getPrototypeOf(value);

    if (!Array.isArray(value) &&
        prototype !== Object.prototype &&
        prototype !== null) return false;

    const descriptors = Object.getOwnPropertyDescriptors(value);

    for (const key of Reflect.ownKeys(value)) {
      if (typeof key === "symbol") return false;

      if (Array.isArray(value) && key === "length") {
        continue;
      }

      const descriptor = descriptors[key];

      if (!descriptor ||
          !("value" in descriptor) ||
          !descriptor.enumerable) {
        return false;
      }
    }

    ancestors.add(value);

    const valid = Array.isArray(value)
      ? Object.keys(value).length === value.length &&
        value.every(item => visit(item, depth + 1))
      : Object.entries(value).every(
          ([, item]) => visit(item, depth + 1)
        );

    ancestors.delete(value);
    return valid;
  }

  return visit(input, 0);
}
