import JsonBigInt from "../index";

const getJSONbig = (options?) => JsonBigInt(options);

describe("Testing bigint support", () => {
  const input = '{"big":9223372036854775807,"small":123}';

  it("Should show classic JSON.parse lacks bigint support", () => {
    const obj = JSON.parse(input);
    expect(obj.small.toString()).toBe("123");
    expect(obj.big.toString()).not.toBe("9223372036854775807");

    const output = JSON.stringify(obj);
    expect(output).not.toBe(input);
  });

  it("Should show JSONbig does support bigint parse/stringify roundtrip", () => {
    const JSONbig = getJSONbig();
    const obj = JSONbig.parse(input);
    expect(obj.small.toString()).toBe("123");
    expect(obj.big.toString()).toBe("9223372036854775807");
    const output = JSONbig.stringify(obj);
    expect(output).toBe(input);
  });
});
