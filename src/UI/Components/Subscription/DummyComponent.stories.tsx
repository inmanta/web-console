import React from "react";
import { StoreProvider } from "easy-peasy";
import { DummyComponent } from "./DummyComponent";
import { storeInstance } from "./Store";

export default {
  title: "DummyComponent",
  component: DummyComponent,
};

export const Default: React.FC = () => (
  <StoreProvider store={storeInstance}>
    <DummyComponent id="a1b2c3" />
  </StoreProvider>
);
