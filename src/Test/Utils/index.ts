export function flushPromises(): Promise<void> {
  return new Promise((resolve) => process.nextTick(resolve));
}
