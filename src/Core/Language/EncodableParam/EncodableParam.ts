export class EncodableParam {
  constructor(private value: string) {}
  toString() {
    return encodeURIComponent(this.value);
  }
}
