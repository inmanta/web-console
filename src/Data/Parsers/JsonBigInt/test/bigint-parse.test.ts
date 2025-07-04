import JsonBigInt from "../index";

const input =
  '{"big":92233720368547758070,"small":123,"deci":1234567890.0123456,"shortExp":1.79e+308,"longExp":1.7976931348623157e+308}';

const getJSONbig = () => JsonBigInt;

describe("Testing native BigInt support: parse", () => {
  it("Should show JSONbig does support parsing native BigInt", () => {
    const JSONbig = getJSONbig()({ useNativeBigInt: true });
    const obj = JSONbig.parse(input);
    expect(obj.small).toBe(123);
    expect(obj.big.toString()).toBe("92233720368547758070");
    expect(typeof obj.big).toBe("bigint");
  });

  it("Should show JSONbig does support forced parsing to native BigInt", () => {
    const JSONbig = getJSONbig()({ alwaysParseAsBig: true, useNativeBigInt: true });
    const obj = JSONbig.parse(input);
    expect(obj.big.toString()).toBe("92233720368547758070");
    expect(typeof obj.big).toBe("bigint");
    expect(obj.small.toString()).toBe("123");
    expect(typeof obj.small).toBe("bigint");
  });

  it("Should show JSONbig does support decimal and scientific notation parse/stringify roundtrip", () => {
    const JSONbig = getJSONbig()({ useNativeBigInt: true });
    const obj = JSONbig.parse(input);
    expect(obj.deci.toString()).toBe("1234567890.0123456");
    expect(typeof obj.deci).toBe("number");
    expect(obj.shortExp.toString()).toBe("1.79e+308");
    expect(typeof obj.shortExp).toBe("number");
    expect(obj.longExp.toString()).toBe("1.7976931348623157e+308");
    expect(typeof obj.longExp).toBe("number");
    const output = JSONbig.stringify(obj);
    expect(output).toBe(input);
  });

  it("Should show JSONbig does support native Bigint parse/stringify roundtrip", () => {
    const JSONbig = getJSONbig()({ useNativeBigInt: true });
    const obj = JSONbig.parse(input);
    const output = JSONbig.stringify(obj);
    expect(output).toBe(input);
  });

  it("Should show JSONbig does support native Bigint parse/stringify roundtrip when BigInt is forced", () => {
    const JSONbig = getJSONbig()({ alwaysParseAsBig: true, useNativeBigInt: true });
    const obj = JSONbig.parse(input);
    const output = JSONbig.stringify(obj);
    expect(output).toBe(input);
  });
});
