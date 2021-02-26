import React from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";
import { Delayed } from "@/UI/Utils";

interface Props {
  delay?: number;
}

export const LoadingFiller: React.FC<Props> = ({ delay }) => (
  <Delayed delay={delay}>
    <Bullseye>
      <Spinner size="xl" />
    </Bullseye>
  </Delayed>
);
