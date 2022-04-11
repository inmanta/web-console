import React from "react";
import { Service } from "@/Test";
import { AttributeTable } from "./AttributeTable";

export default {
  title: "Catalog/AttributeTable",
  component: AttributeTable,
};

export const RealData = () => (
  <AttributeTable
    service={Service.a}
    scrollIntoView={() => {
      return;
    }}
  />
);

export const Nested = () => (
  <AttributeTable
    service={Service.nestedEditable}
    scrollIntoView={() => {
      return;
    }}
  />
);
