import React from "react";
import { ServiceModel } from "@/Core";

import { CatalogTabs } from "./Tabs";
import { Wrapper } from "./Wrapper";

export const ServiceDetails: React.FunctionComponent<{
  serviceName: string;
  service: ServiceModel;
}> = ({ serviceName, service }) => {
  return (
    <Wrapper name={serviceName}>
      <CatalogTabs service={service} />
    </Wrapper>
  );
};
