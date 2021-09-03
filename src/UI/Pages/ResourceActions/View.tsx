import React from "react";

interface Props {
  resourceId: string;
}

export const View: React.FC<Props> = ({ resourceId }) => {
  return <>test: {resourceId}</>;
};
