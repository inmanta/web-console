import JsonBigInt from "../index";

describe("Testing bigint support", () => {
  const getJSONbig = (options?) => JsonBigInt(options);
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

describe("Testing native BigInt support: parse", () => {
  const input =
    '{"big":92233720368547758070,"small":123,"deci":1234567890.0123456,"shortExp":1.79e+308,"longExp":1.7976931348623157e+308}';

  const getJSONbig = () => JsonBigInt;

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

describe("Testing native BigInt support: stringify", () => {
  const getJSONbig = () => JsonBigInt;

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

describe("__proto__ and constructor assignment", () => {
  const getJSONbig = (options?) => JsonBigInt(options);

  it("should set __proto__ property but not a prototype if protoAction is set to preserve", () => {
    const JSONbig = getJSONbig({ protoAction: "preserve" });
    const obj1 = JSONbig.parse('{ "__proto__": 1000000000000000 }');
    expect(Object.getPrototypeOf(obj1)).toBe(null);
    const obj2 = JSONbig.parse('{ "__proto__": { "admin": true } }');
    expect(obj2.admin).not.toBe(true);
  });

  it("should throw an exception if protoAction set to invalid value", () => {
    expect(() => {
      getJSONbig({ protoAction: "invalid value" });
    }).toThrow(
      'Incorrect value for protoAction option, must be "error", "ignore" or undefined but passed invalid value'
    );
  });

  it("should throw an exception if constructorAction set to invalid value", () => {
    expect(() => {
      getJSONbig({ constructorAction: "invalid value" });
    }).toThrow(
      'Incorrect value for constructorAction option, must be "error", "ignore" or undefined but passed invalid value'
    );
  });

  it("should throw an exception if protoAction set to error and there is __proto__ property", () => {
    const JSONbig = getJSONbig({ protoAction: "error" });
    expect(() => JSONbig.parse('{ "__proto__": 1000000000000000 }')).toThrow(
      "Object contains forbidden prototype property"
    );
  });

  it("should throw an exception if constructorAction set to error and there is constructor property", () => {
    const JSONbig = getJSONbig({ protoAction: "error" });
    expect(() => JSONbig.parse('{ "constructor": 1000000000000000 }')).toThrow(
      "Object contains forbidden constructor property"
    );
  });

  it("should ignore __proto__ property if protoAction is set to ignore", () => {
    const JSONbig = getJSONbig({ protoAction: "ignore" });
    const obj1 = JSONbig.parse(
      '{ "__proto__": 1000000000000000, "a" : 42, "nested": { "__proto__": false, "b": 43 } }'
    );
    expect(Object.getPrototypeOf(obj1)).toBe(null);
    expect(obj1).toEqual({ a: 42, nested: { b: 43 } });
  });

  it("should ignore constructor property if constructorAction is set to ignore", () => {
    const JSONbig = getJSONbig({ constructorAction: "ignore" });
    const obj1 = JSONbig.parse(
      '{ "constructor": 1000000000000000, "a" : 42, "nested": { "constructor": false, "b": 43 } }'
    );
    expect(obj1).toEqual({ a: 42, nested: { b: 43 } });
  });
});

describe("Testing 'strict' option", () => {
  const getJSONbig = () => JsonBigInt;
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

describe("Testing 'storeAsString' option", () => {
  const getJSONbig = (options?) => JsonBigInt(options);
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
