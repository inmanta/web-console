import React from "react";
import { Spinner as PrimarySpinner } from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  variant?: "main" | "light" | "small";
}

export const Spinner: React.FC<Props> = ({ variant }) => {
  switch (variant) {
    case "light":
      return <SecondarySpinner isSVG size="lg" />;
    case "small":
      return <PrimarySpinner isSVG size="md" />;
    case "main":
    default:
      return <PrimarySpinner isSVG />;
  }
};

const SecondarySpinner = styled(PrimarySpinner)`
  --pf-c-spinner--Color: white;
`;
