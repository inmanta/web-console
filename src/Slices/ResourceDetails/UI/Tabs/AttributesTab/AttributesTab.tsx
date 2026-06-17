import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { Details } from "@/Core/Domain/Resource/Resource";
import { createAttributeClassifier } from "@/Data";
import { AttributeList } from "@/UI/Components";

interface Props {
  details: Details;
}

/**
 * The AttributesTab component.
 *
 * This component is responsible of displaying the attributes of a resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {Details} details - The details of the resource
 * @returns {React.FC<Props>} A React Component displaying the attributes of a resource
 */
export const AttributesTab: React.FC<Props> = ({ details }) => {
  const classifiedAttributes = createAttributeClassifier().classify(details.attributes);

  return (
    <Card isCompact>
      <CardBody>
        <AttributeList attributes={classifiedAttributes} />
      </CardBody>
    </Card>
  );
};
