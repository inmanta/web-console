export class Deferred {
  readonly promise: Promise<unknown>;
  resolve: (value: unknown) => void = () => undefined;
  reject: (value: unknown) => void = () => undefined;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
