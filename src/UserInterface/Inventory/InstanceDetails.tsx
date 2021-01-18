import { Attributes } from "Core";
import React from "react";
import { AttributesList } from "./AttributesList";

interface Props {
  attributes: Attributes;
}

export const InstanceDetails: React.FC<Props> = ({ attributes }) => (
  <>
    {attributes.candidate !== null && (
      <AttributesList attributes={attributes.candidate} />
    )}
    {attributes.active !== null && (
      <AttributesList attributes={attributes.active} />
    )}
    {attributes.rollback !== null && (
      <AttributesList attributes={attributes.rollback} />
    )}
  </>
);
