import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { AttributeClassifier } from "./AttributeClassifier";
import { AttributeList } from "./AttributeList";
import { Card, CardBody } from "@patternfly/react-core";
import { JsonFormatter, XmlFormatter } from "@/Data";

interface Props {
  id: string;
}

export const AttributesTab: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"ResourceDetails">({
    kind: "ResourceDetails",
    id,
  });

  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter()
  );

  const classifiedAttributes = RemoteData.mapSuccess(
    (resource) => classifier.classify(resource.attributes),
    data
  );

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <LoadingView delay={500} aria-label="ResourceAttributes-Loading" />
      ),
      failed: (error) => (
        <ErrorView
          aria-label="ResourceAttributes-Failed"
          title={words("error")}
          message={words("error.fetch")(error)}
        />
      ),
      success: (attributes) => (
        <Card isCompact>
          <CardBody>
            <AttributeList attributes={attributes} />
          </CardBody>
        </Card>
      ),
    },
    classifiedAttributes
  );
};
