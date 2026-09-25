import React from "react";
import { Flex, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { AttributeClassifier, useUrlStateWithExpansion } from "@/Data";
import { ResourceAttributesView } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Resource.VersionedDetails;
}

const classifier = new AttributeClassifier({ includeAllKeys: true });

/**
 * The attributes of a resource in one desired state version, with the same
 * Structured / JSON toggle as the Desired State tab. Reference expansion is kept in
 * the URL.
 *
 * @prop {Resource.VersionedDetails} details - The details of the versioned resource
 */
export const Details: React.FC<Props> = ({ details, ...props }) => {
  const [isExpanded, onToggle] = useUrlStateWithExpansion({
    key: "references",
    route: "DesiredStateResourceDetails",
  });

  return (
    <Flex
      {...props}
      direction={{ default: "column" }}
      flexWrap={{ default: "nowrap" }}
      style={{ flex: "1 1 auto", minHeight: 0 }}
    >
      <Title headingLevel="h2">{words("resources.attributes.title")}</Title>
      <ResourceAttributesView
        attributes={details.attributes}
        classifier={classifier}
        isExpanded={isExpanded}
        onToggle={onToggle}
      />
    </Flex>
  );
};
