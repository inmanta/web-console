import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { AttributeClassifier } from "@inmanta/web-console-core/Common";
import { DiscoveredResource } from "@inmanta/web-console-core/Queries/Slices/DiscoveredResources";
import { AttributeList } from "@inmanta/web-console-ui/Components/AttributeList";

interface Props {
  resource: DiscoveredResource;
}

const classifier = new AttributeClassifier();

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
  const classifiedAttributes = classifier.classify(resource.values);

  return (
    <Card isCompact>
      <CardBody>
        <AttributeList attributes={classifiedAttributes} />
      </CardBody>
    </Card>
  );
};
