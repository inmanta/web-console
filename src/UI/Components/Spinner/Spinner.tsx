import React from "react";
import { Spinner as PrimarySpinner } from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  variant?: "main" | "light" | "small";
}

export const Spinner: React.FC<Props> = ({ variant }) => {
  switch (variant) {
    case "light":
      return <SecondarySpinner size="lg" />;
    case "small":
      return <PrimarySpinner size="sm" />;
    case "main":
    default:
      return <PrimarySpinner />;
  }
};

const SecondarySpinner = styled(PrimarySpinner)`
  --pf-v5-c-spinner--Color: white;
`;
