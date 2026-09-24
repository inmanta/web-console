import React from "react";
import { PageSection, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { AttributeClassifier, useUrlStateWithExpansion } from "@/Data";
import { ResourceAttributes } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Resource.VersionedDetails;
}

const classifier = new AttributeClassifier({ includeAllKeys: true });

/**
 * The attributes of a resource in one desired state version, rendered with the
 * same reference-aware view as the Desired State tab. Reference expansion is kept
 * in the URL.
 *
 * @prop {Resource.VersionedDetails} details - The details of the versioned resource
 */
export const Details: React.FC<Props> = ({ details, ...props }) => {
  const [isExpanded, onToggle] = useUrlStateWithExpansion({
    key: "references",
    route: "DesiredStateResourceDetails",
  });

  return (
    <div {...props}>
      <Title headingLevel="h2">{words("resources.attributes.title")}</Title>
      <PageSection hasBodyWrapper={false}>
        <ResourceAttributes
          attributes={details.attributes}
          classifier={classifier}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      </PageSection>
    </div>
  );
};
