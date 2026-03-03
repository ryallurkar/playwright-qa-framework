export const generateRandomString = (length = 10): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    value += chars[randomIndex];
  }

  return value;
};

export const generateRandomEmail = (domain = 'example.test'): string => {
  const localPart = generateRandomString(12);
  return `${localPart}@${domain}`;
};

export const formatDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> => {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const intervalMs = options.intervalMs ?? 250;
  const startedAt = Date.now();

  while (Date.now() - startedAt <= timeoutMs) {
    if (await condition()) {
      return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, intervalMs);
    });
  }

  throw new Error(`Condition was not met within ${timeoutMs}ms.`);
};

export const parseJwt = (token: string): Record<string, unknown> | null => {
  const segments = token.split('.');

  if (segments.length < 2) {
    return null;
  }

  try {
    const normalizedPayload = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );
    const decoded = Buffer.from(paddedPayload, 'base64').toString('utf8');
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};
