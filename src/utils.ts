export function invariant(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const warn = (condition: unknown, message: string): void => {
  if (!condition) {
    console.warn(message);
  }
};

export const debug = (...args: unknown[]): void => {
  if (process.env.DEBUG) {
    console.debug(...args);
  }
};
