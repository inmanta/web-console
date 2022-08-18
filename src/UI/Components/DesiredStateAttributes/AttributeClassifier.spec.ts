import { Maybe } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier } from "./AttributeClassifier";
import { attributes, classified } from "./Data";

test("GIVEN AttributeClassifier WHEN provided with a mixed attributes object THEN returns the correct list of ClassifiedAttributes", () => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter()
  );

  expect(classifier.classify(attributes)).toEqual(classified);
});

test("GIVEN AttributeClassifier WHEN provided with a custom multiline classifier THEN returns the correct list of ClassifiedAttributes", () => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
    (key: string, value: string) => Maybe.some({ kind: "Python", key, value })
  );

  expect(
    classifier.classify({ f: attributes["f"], ff: attributes["ff"] })
  ).toEqual([
    {
      kind: "Python",
      key: "f",
      value:
        "This text has a length longer than 80. abcdefghijklmnopqrstvuwxyz abcdefghijklmnopqrstvuwxyz",
    },
    {
      kind: "Python",
      key: "ff",
      value: "This text contains a newline.\nblablabla...",
    },
  ]);
});

test("GIVEN AttributeClassifier WHEN provided with a wrong xml THEN return the string without formating to prevent crash", () => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter()
  );

  expect(
    classifier.classify({
      goodXml: attributes["c"],
      wrongXml1: attributes["wrongXml1"],
      wrongXml2: attributes["wrongXml2"],
    })
  ).toEqual([
    {
      kind: "Xml",
      key: "goodXml",
      value: "<note>\n    <to>Tove</to>\n    <from>Jani</from>\n</note>",
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
  ]);
});
