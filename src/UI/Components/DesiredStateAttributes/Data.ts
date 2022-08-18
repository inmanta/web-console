import { ClassifiedAttribute } from "./ClassifiedAttribute";

export const attributes = {
  a: 123,
  aa: false,
  aaa: true,
  b: "some string",
  c: `<note><to>Tove</to><from>Jani</from></note>`,
  d: {
    key: "value",
  },
  e: "<<undefined>>",
  f: "This text has a length longer than 80. abcdefghijklmnopqrstvuwxyz abcdefghijklmnopqrstvuwxyz",
  ff: "This text contains a newline.\nblablabla...",
  g: {},
  hash: "filehash",
  some_password: "abcde",
  wrongXml1: `<class 'AttributeError'>: 'RPCError' object has no attribute '_tag'`,
  wrongXml2: `<class 'AttributeError'>`,
};

export const classified: ClassifiedAttribute[] = [
  { kind: "SingleLine", key: "a", value: "123" },
  { kind: "SingleLine", key: "aa", value: "false" },
  { kind: "SingleLine", key: "aaa", value: "true" },
  { kind: "SingleLine", key: "b", value: "some string" },
  {
    kind: "Xml",
    key: "c",
    value: `<note>\n    <to>Tove</to>\n    <from>Jani</from>\n</note>`,
  },
  {
    kind: "Json",
    key: "d",
    value: `{\n    "key": "value"\n}`,
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
    kind: "Password",
    key: "some_password",
    value: "****",
  },
  {
    kind: "Xml",
    key: "wrongXml1",
    value:
      "<class 'AttributeError'>: 'RPCError' object has no attribute '_tag'",
  },
  {
    kind: "Xml",
    key: "wrongXml2",
    value: "<class 'AttributeError'>",
  },
];

export const longNames: ClassifiedAttribute[] = [
  {
    kind: "Xml",
    key: "c",
    value: `<note>\n    <to>Tove</to>\n    <from>Jani</from>\n</note>`,
  },
  {
    kind: "SingleLine",
    key: "use_get_schema_invalid_namespaces_workaround",
    value: "test",
  },
  {
    kind: "Json",
    key: "d",
    value: `{\n    "key": "value"\n}`,
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
    kind: "Password",
    key: "some_password",
    value: "****",
  },
  {
    kind: "MultiLine",
    key: "use_get_schema_invalid_namespaces_workaround 123456",
    value: "test\ntest",
  },
];
