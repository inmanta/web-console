import JsonBigInt from "../index";

const getJSONbig = () => JsonBigInt;

describe("Testing 'strict' option", () => {
  const dupkeys = '{ "dupkey": "value 1", "dupkey": "value 2"}';

  it("Should show that duplicate keys just get overwritten by default", () => {
    let result: { dupkey: string } | string = "before";
    function tryParse() {
      result = getJSONbig().parse(dupkeys);
    }
    expect(tryParse).not.toThrow();
    if (typeof result === "object" && result !== null && "dupkey" in result) {
      expect((result as { dupkey: string }).dupkey).toBe("value 2");
    } else {
      throw new Error("Result is not the expected object");
    }
  });

  it("Should show that the 'strict' option will fail-fast on duplicate keys", () => {
    let result: { dupkey: string } | string = "before";
    function tryParse() {
      result = getJSONbig()({ strict: true }).parse(dupkeys);
    }
    expect(tryParse).toThrow('Duplicate key "dupkey"');
    expect(result).toBe("before");
  });
});
