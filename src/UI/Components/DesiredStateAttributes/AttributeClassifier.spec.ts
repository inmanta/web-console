import { Maybe } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier } from "./AttributeClassifier";
import { attributes, classified } from "./Data";

test("GIVEN AttributeClassifier WHEN provided with a mixed attributes object THEN returns the correct list of ClassifiedAttributes", () => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter()
  );

  expect(classifier.classify(attributes)).toEqual(classified.sort());
});

test("GIVEN AttributeClassifier WHEN provided with a custom multiline classifier THEN returns the correct list of ClassifiedAttributes", () => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
    (key: string, value: string) => Maybe.some({ kind: "Python", key, value })
  );

  expect(
    classifier.classify({ f: attributes["f"], ff: attributes["ff"] })
  ).toStrictEqual([
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
