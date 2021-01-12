import React from "react";

interface Props {
  serviceName: string;
}

export const View: React.FC<Props> = ({ serviceName }) => {
  return (
    <div data-testid="InventoryViewContainer">service name: {serviceName}</div>
  );
};
