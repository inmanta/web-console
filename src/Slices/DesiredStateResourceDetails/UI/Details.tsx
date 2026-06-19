import React from "react";
import { PageSection, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { AttributeClassifier } from "@/Data";
import { AttributeList } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Resource.VersionedDetails;
}

const classifier = new AttributeClassifier({ includeAllKeys: true });

export const Details: React.FC<Props> = ({ details, ...props }) => (
  <div {...props}>
    <Title headingLevel="h2">{words("resources.attributes.title")}</Title>
    <PageSection hasBodyWrapper={false}>
      <AttributeList attributes={classifier.classify(details.attributes)} />
    </PageSection>
  </div>
);
