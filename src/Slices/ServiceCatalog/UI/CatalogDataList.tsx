import React from "react";
import { DataList } from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { ServiceItem } from "./ServiceItem";

interface Props {
  services: ServiceModel[];
}

export const CatalogDataList: React.FunctionComponent<Props> = ({
  services,
}) => {
  return (
    <DataList aria-label="List of service entities">
      {services.map((service) => (
        <ServiceItem key={service.name + "-item"} service={service} />
      ))}
    </DataList>
  );
};
