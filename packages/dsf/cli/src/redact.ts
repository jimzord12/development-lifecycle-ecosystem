const SECRET_KEY_PATTERN =
  /(password|secret|token|credential|passwd|authorization|api[_-]?key|private[_-]?key)/i;

export function redactSecrets<T>(value: T): T {
  return redactUnknown(value) as T;
}

export function isSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

function redactUnknown(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactUnknown);
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const out: Record<string, unknown> = {};
    for (const [key, nested] of entries) {
      out[key] = isSecretKey(key) ? '[redacted]' : redactUnknown(nested);
    }
    return out;
  }

  return value;
}
