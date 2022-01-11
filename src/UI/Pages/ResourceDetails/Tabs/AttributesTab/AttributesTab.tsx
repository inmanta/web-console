import React, { useContext } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import {
  AttributeClassifier,
  AttributeList,
  ErrorView,
  LoadingView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  id: string;
}

export const AttributesTab: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
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
      loading: () => <LoadingView aria-label="ResourceAttributes-Loading" />,
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
