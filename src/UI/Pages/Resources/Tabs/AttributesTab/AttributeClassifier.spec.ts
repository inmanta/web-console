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
