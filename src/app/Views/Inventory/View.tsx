import React from "react";

interface Props {
  message: string;
}

export const View: React.FC<Props> = ({ message }) => (
  <div data-testid="InventoryViewContainer">test: {message}</div>
);
