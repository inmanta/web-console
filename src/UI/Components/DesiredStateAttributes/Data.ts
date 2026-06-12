import { ClassifiedAttribute } from "./ClassifiedAttribute";

export const attributes = {
  a: 123,
  aa: false,
  aaa: true,
  b: "some string",
  c: "<note><to>Tove</to><from>Jani</from></note>",
  d: {
    key: "value",
  },
  e: "<<undefined>>",
  f: "This text has a length longer than 80. abcdefghijklmnopqrstvuwxyz abcdefghijklmnopqrstvuwxyz",
  ff: "This text contains a newline.\nblablabla...",
  g: {},
  hash: "filehash",
  jsonArrayString: "[1, 2, 3]",
  jsonObjectString: '{"key": "value"}',
  jsonScalarString: '"just a quoted string"',
  some_password: "abcde",
  wrongXml1: "<class 'AttributeError'>: 'RPCError' object has no attribute '_tag'",
  wrongXml2: "<class 'AttributeError'>",
  whiteSpacedXML: "  <note><to>Tove</to><from>Jani</from></note> ",
  // "version" and "requires" are ignored by default and never appear in `classified`.
  version: "1.0",
  requires: "std::testmodule",
};

export const classified: ClassifiedAttribute[] = [
  { kind: "SingleLine", key: "a", value: "123" },
  { kind: "SingleLine", key: "aa", value: "false" },
  { kind: "SingleLine", key: "aaa", value: "true" },
  { kind: "SingleLine", key: "b", value: "some string" },
  {
    kind: "Xml",
    key: "c",
    value: "<note>\n    <to>Tove</to>\n    <from>Jani</from>\n</note>",
  },
  {
    kind: "Json",
    key: "d",
    value: '{\n    "key": "value"\n}',
  },
  { kind: "Undefined", key: "e" },
  {
    kind: "MultiLine",
    key: "f",
    value:
      "This text has a length longer than 80. abcdefghijklmnopqrstvuwxyz abcdefghijklmnopqrstvuwxyz",
  },
  {
    kind: "MultiLine",
    key: "ff",
    value: "This text contains a newline.\nblablabla...",
  },
  { kind: "Json", key: "g", value: "{}" },
  {
    kind: "File",
    key: "hash",
    value: "filehash",
  },
  {
    kind: "Json",
    key: "jsonArrayString",
    value: "[\n    1,\n    2,\n    3\n]",
  },
  {
    kind: "Json",
    key: "jsonObjectString",
    value: '{\n    "key": "value"\n}',
  },
  {
    kind: "SingleLine",
    key: "jsonScalarString",
    value: '"just a quoted string"',
  },
  {
    kind: "Password",
    key: "some_password",
    value: "****",
  },
  {
    kind: "Xml",
    key: "whiteSpacedXML",
    value: "<note>\n    <to>Tove</to>\n    <from>Jani</from>\n</note>",
  },
  {
    kind: "SingleLine",
    key: "wrongXml1",
    value: "<class 'AttributeError'>: 'RPCError' object has no attribute '_tag'",
  },
  {
    kind: "SingleLine",
    key: "wrongXml2",
    value: "<class 'AttributeError'>",
  },
];
