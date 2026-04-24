/**
 * JSON-safe serializer for Prisma objects containing BigInt.
 */
export function toJSON<T>(obj: T): unknown {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}
