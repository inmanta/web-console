import { JsonFormatter } from "../JsonFormatter";
import { XmlFormatter } from "../XmlFormatter";
import { ClassifiedAttribute } from "./ClassifiedAttribute";

const json = new JsonFormatter();
const xml = new XmlFormatter();

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

// JSON/XML values are derived from the shared formatters (never hardcoded) so the
// expectations track the formatters' indentation instead of breaking when it changes.
export const classified: ClassifiedAttribute[] = [
  { kind: "SingleLine", key: "a", value: "123" },
  { kind: "SingleLine", key: "aa", value: "false" },
  { kind: "SingleLine", key: "aaa", value: "true" },
  { kind: "SingleLine", key: "b", value: attributes.b },
  { kind: "Xml", key: "c", value: xml.format(attributes.c) },
  { kind: "Json", key: "d", value: json.format(attributes.d) },
  { kind: "Undefined", key: "e" },
  { kind: "Code", key: "f", value: attributes.f },
  { kind: "Code", key: "ff", value: attributes.ff },
  { kind: "Json", key: "g", value: json.format(attributes.g) },
  { kind: "File", key: "hash", value: attributes.hash },
  {
    kind: "Json",
    key: "jsonArrayString",
    value: json.format(JSON.parse(attributes.jsonArrayString)),
  },
  {
    kind: "Json",
    key: "jsonObjectString",
    value: json.format(JSON.parse(attributes.jsonObjectString)),
  },
  { kind: "SingleLine", key: "jsonScalarString", value: attributes.jsonScalarString },
  { kind: "Password", key: "some_password", value: "****" },
  { kind: "Xml", key: "whiteSpacedXML", value: xml.format(attributes.whiteSpacedXML) },
  { kind: "SingleLine", key: "wrongXml1", value: attributes.wrongXml1 },
  { kind: "Xml", key: "wrongXml2", value: xml.format(attributes.wrongXml2) },
];
