import React from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";

export const LoadingFiller: React.FC = () => (
  <Bullseye>
    <Spinner size="xl" />
  </Bullseye>
);
