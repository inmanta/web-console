import React from "react";
import { Attributes } from "@/Core";
import { TabProps } from "./InstanceDetails";
import { TreeTable } from "../Components";

interface Props extends TabProps {
  attributes: Attributes;
}

export const AttributesView: React.FC<Props> = ({ attributes }) => (
  <TreeTable attributes={attributes} />
);
