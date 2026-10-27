import React from "react";
import { AttributeClassifier, useUrlStateWithExpansion } from "@inmanta/web-console-core/Common";
import { Details } from "@inmanta/web-console-core/Domain/Resource/Resource";
import { ResourceAttributesView } from "@inmanta/web-console-ui/Components/ResourceAttributes";

interface Props {
  details: Details;
}

const classifier = new AttributeClassifier();

/**
 * The Desired State tab. Shows the resource's attributes with a Structured / JSON
 * toggle, keeping reference expansion in the URL.
 *
 * @prop {Details} details - The details of the resource
 */
export const AttributesTab: React.FC<Props> = ({ details }) => {
  const [isExpanded, onToggle] = useUrlStateWithExpansion({
    key: "references",
    route: "ResourceDetails",
  });

  return (
    <ResourceAttributesView
      attributes={details.attributes}
      classifier={classifier}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
};
