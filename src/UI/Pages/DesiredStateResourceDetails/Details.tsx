import React from "react";
import { PageSection, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Resource.VersionedDetails;
}

export const Details: React.FC<Props> = ({ details, ...props }) => (
  <div {...props}>
    <Title headingLevel="h2">{words("resources.attributes.title")}</Title>
    <PageSection variant="light">
      <AttributeList attributes={classifier.classify(details.attributes)} />
    </PageSection>
  </div>
);

const classifier = new AttributeClassifier(
  new JsonFormatter(),
  new XmlFormatter(),
  () => false
);
