import React from "react";

interface Props {
  serviceName: string;
}

export const CallbacksTable: React.FC<Props> = ({ serviceName }) => {
  return <div>{serviceName}</div>;
};
