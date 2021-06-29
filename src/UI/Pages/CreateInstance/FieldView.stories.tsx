import React from "react";
import { ServiceModel } from "@/Core";
import { data as service } from "./service.json";
import { FieldView } from "./FieldView";
import { FieldCreator } from "../../Components/ServiceInstanceForm/FieldCreator";

export default {
  title: "FieldView",
  component: FieldView,
};

export const Simple: React.FC = () => (
  <FieldView
    fields={new FieldCreator().create(service as unknown as ServiceModel)}
  />
);
