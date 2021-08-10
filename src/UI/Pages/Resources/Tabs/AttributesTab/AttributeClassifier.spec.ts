import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier } from "./AttributeClassifier";
import { ClassifiedAttribute } from "./ClassifiedAttribute";

test("GIVEN AttributeClassifier WHEN provided with a mixed attributes object THEN returns the correct list of ClassifiedAttributes", () => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter()
  );
  const attributes = {
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
    hash: "filehash",
    some_password: "abcde",
  };

  const classifiedAttributes: ClassifiedAttribute[] = [
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
  ];

  expect(classifier.classify(attributes)).toEqual(classifiedAttributes);
});
