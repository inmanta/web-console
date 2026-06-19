import { AttributeClassifier } from "./AttributeClassifier";
import { attributes, classified } from "./Mock";

test("GIVEN AttributeClassifier WHEN provided with a mixed attributes object THEN returns the correct list of ClassifiedAttributes", () => {
  const classifier = new AttributeClassifier();

  expect(classifier.classify(attributes)).toEqual(classified);
});

test("GIVEN AttributeClassifier WHEN includeAllKeys is true THEN the version and requires keys are classified too", () => {
  const classifier = new AttributeClassifier({ includeAllKeys: true });

  expect(
    classifier.classify({ version: attributes.version, requires: attributes.requires })
  ).toEqual([
    { kind: "SingleLine", key: "requires", value: attributes.requires },
    { kind: "SingleLine", key: "version", value: attributes.version },
  ]);
});
