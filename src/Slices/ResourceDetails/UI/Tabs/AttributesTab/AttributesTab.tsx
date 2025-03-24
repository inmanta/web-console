import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList } from "@/UI/Components";
import { Details } from "@/Core/Domain/Resource/Resource";

interface Props {
  details: Details;
}

export const AttributesTab: React.FC<Props> = ({ details }) => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
  );

  const classifiedAttributes = classifier.classify(details.attributes);

  return (
    <Card isCompact>
      <CardBody>
        <AttributeList attributes={classifiedAttributes} />
      </CardBody>
    </Card>
  );
};
