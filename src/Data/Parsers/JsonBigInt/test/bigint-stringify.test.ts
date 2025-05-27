import { describe, it, expect } from "@jest/globals";
import JsonBigInt from "../index";

const getJSONbig = () => JsonBigInt;

describe("Testing native BigInt support: stringify", () => {
  it("Should show JSONbig can stringify native BigInt", () => {
    const JSONbig = getJSONbig();
    // We cannot use n-literals - otherwise older NodeJS versions fail on this test

    const obj = {
      big: eval("123456789012345678901234567890n"),
      small: -42,
      bigConstructed: BigInt(1),
      smallConstructed: Number(2),
    };
    expect(obj.small.toString()).toBe("-42");
    expect(obj.big.toString()).toBe("123456789012345678901234567890");
    expect(typeof obj.big).toBe("bigint");

    const output = JSONbig.stringify(obj);
    expect(output).toBe(
      "{" +
        '"big":123456789012345678901234567890,' +
        '"small":-42,' +
        '"bigConstructed":1,' +
        '"smallConstructed":2' +
        "}"
    );
  });
});
