import JsonBigInt from "../index";

const getJSONbig = (options?) => JsonBigInt(options);

describe("Testing 'storeAsString' option", () => {
  const key = '{ "key": 12345678901234567 }';
  it("Should show that the key is of type object", () => {
    const JSONbig = getJSONbig();
    const result = JSONbig.parse(key);
    expect(typeof result.key).toBe("object");
  });

  it("Should show that key is of type string, when storeAsString option is true", () => {
    const JSONstring = getJSONbig({ storeAsString: true });
    const result = JSONstring.parse(key);
    expect(typeof result.key).toBe("string");
  });
});
