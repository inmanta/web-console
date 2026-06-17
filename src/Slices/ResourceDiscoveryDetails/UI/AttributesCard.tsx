import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { createAttributeClassifier } from "@/Data";
import { DiscoveredResource } from "@/Data/Queries";
import { AttributeList } from "@/UI/Components";

interface Props {
  resource: DiscoveredResource;
}

/**
 * The AttributesCard component.
 *
 * This component is responsible of displaying the attributes of a resource.
 *
 * @Props {Props} - The props of the component
 *  @prop {DiscoveredResource} resource - The discovered resource
 *
 * @returns {React.FC<Props>} A React Component displaying the attributes of a discovered resource
 */
export const AttributesCard: React.FC<Props> = ({ resource }) => {
  const classifiedAttributes = createAttributeClassifier().classify(resource.values);

  return (
    <Card isCompact>
      <CardBody>
        <AttributeList attributes={classifiedAttributes} />
      </CardBody>
    </Card>
  );
};
