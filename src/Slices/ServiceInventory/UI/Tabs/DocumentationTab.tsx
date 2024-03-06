import React from "react";
import { Attributes, ServiceModel } from "@/Core";

interface Props {
  attributes: Attributes;
  service?: ServiceModel;
}

export const DocumentationTab = ({ attributes, service }: Props) => {
  console.log(attributes, service);
  return (
    <div>
      <h1>Documentation Tab</h1>
    </div>
  );
};
