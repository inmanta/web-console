import React from "react";

interface Props {
  serviceName: string;
}

export const Config: React.FC<Props> = ({ serviceName }) => (
  <div aria-label="ServiceConfig">{serviceName}</div>
);
