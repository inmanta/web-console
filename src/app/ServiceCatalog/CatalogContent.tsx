import React from "react";
import { ServiceModel } from "@/Core";
import { CatalogTabs } from "./CatalogTabs";

export const CatalogContent: React.FunctionComponent<{
  service: ServiceModel;
}> = (props) => {
  return <CatalogTabs service={props.service} />;
};
