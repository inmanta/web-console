import React from "react";
import { Attributes } from "@/Core";
import { TreeTable } from "../Components";

interface Props {
  attributes: Attributes;
}

export const AttributesView: React.FC<Props> = ({ attributes }) => (
  <TreeTable attributes={attributes} />
);
