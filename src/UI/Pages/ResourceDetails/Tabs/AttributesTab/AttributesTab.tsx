import React, { useContext } from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { RemoteData } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import {
  AttributeClassifier,
  AttributeList,
  RemoteDataView,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

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

  return (
    <RemoteDataView
      data={classifiedAttributes}
      label="ResourceAttributes"
      SuccessView={(attributes) => (
        <Card isCompact>
          <CardBody>
            <AttributeList attributes={attributes} />
          </CardBody>
        </Card>
      )}
    />
  );
};
