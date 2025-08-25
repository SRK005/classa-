// General-purpose utilities used across the app
// These are browser-safe and can be imported in client components

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelayMs = 300
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, delay));
      attempt++;
    }
  }
  throw lastError;
}

export function handleFirebaseError(error: unknown, action = 'performing operation'): string {
  const err = error as { code?: string; message?: string } | undefined;
  const code = err?.code || '';

  switch (code) {
    case 'permission-denied':
      return `You do not have permission for ${action}.`;
    case 'unavailable':
      return `Service temporarily unavailable while ${action}. Please try again.`;
    case 'deadline-exceeded':
      return `The request timed out while ${action}.`;
    case 'not-found':
      return `Requested data was not found while ${action}.`;
    case 'unauthenticated':
      return `You must be signed in before ${action}.`;
    case 'resource-exhausted':
      return `Quota exceeded while ${action}. Please try later.`;
    case 'failed-precondition':
      return `Operation failed precondition while ${action}.`;
    case 'aborted':
      return `Operation aborted while ${action}.`;
    default:
      return err?.message || `Unexpected error while ${action}.`;
  }
}

export function isOnline(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

export function waitForNetwork(timeoutMs = 5000): Promise<boolean> {
  if (isOnline()) return Promise.resolve(true);
  if (typeof window === 'undefined') return Promise.resolve(true);

  return new Promise((resolve) => {
    const onOnline = () => {
      cleanup();
      resolve(true);
    };
    const onTimeout = () => {
      cleanup();
      resolve(isOnline());
    };

    const cleanup = () => {
      window.removeEventListener('online', onOnline);
      clearTimeout(timer);
    };

    window.addEventListener('online', onOnline);
    const timer = setTimeout(onTimeout, timeoutMs);
  });
}
