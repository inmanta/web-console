import React from "react";
import { Card, CardBody } from "@patternfly/react-core";
import { Query, RemoteData } from "@/Core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import {
  AttributeClassifier,
  AttributeList,
  RemoteDataView,
} from "@/UI/Components";

interface Props {
  data: Query.UsedApiData<"GetResourceDetails">;
}

export const AttributesTab: React.FC<Props> = ({ data }) => {
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
