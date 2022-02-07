export class EncodableParam {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString() {
    return encodeURIComponent(this.value);
  }
}
