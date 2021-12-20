import React from "react";
import { ExclamationCircleIcon } from "@patternfly/react-icons";
import { Resource } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import {
  RequiresTable,
  AttributeClassifier,
  AttributeList,
  PageSectionWithTitle,
} from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Resource.Details;
}

export const Details: React.FC<Props> = ({ details, ...props }) => (
  <div {...props}>
    <PageSectionWithTitle title={words("resources.requires.title")}>
      {Object.keys(details.requires_status).length <= 0 ? (
        <p>
          <ExclamationCircleIcon /> {words("resources.requires.empty.message")}
        </p>
      ) : (
        <RequiresTable requiresStatus={details.requires_status} />
      )}
    </PageSectionWithTitle>
    <PageSectionWithTitle title={words("resources.attributes.title")}>
      <AttributeList attributes={classifier.classify(details.attributes)} />
    </PageSectionWithTitle>
  </div>
);

const classifier = new AttributeClassifier(
  new JsonFormatter(),
  new XmlFormatter()
);
