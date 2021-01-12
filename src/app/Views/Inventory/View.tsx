import React from "react";

interface Props {
  id: string;
}

export const View: React.FC<Props> = ({ id }) => {
  return <div data-testid="InventoryViewContainer">id: {id}</div>;
};
