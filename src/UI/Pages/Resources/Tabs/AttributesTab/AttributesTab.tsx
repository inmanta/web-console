import React from "react";

interface Props {
  id: string;
}

export const AttributesTab: React.FC<Props> = ({ id }) => (
  <div>desired state tab: {id}</div>
);
