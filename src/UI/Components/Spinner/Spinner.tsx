import React from "react";
import { Icon, Spinner as PrimarySpinner } from "@patternfly/react-core";
import styled from "styled-components";

interface Props {
  variant?: "main" | "light" | "small";
}

export const Spinner: React.FC<Props> = ({ variant }) => {
  switch (variant) {
    case "light":
      return (
        <Icon size="lg">
          <SecondarySpinner />
        </Icon>
      );
    case "small":
      return (
        <Icon size="md">
          <PrimarySpinner />
        </Icon>
      );
    case "main":
    default:
      return <PrimarySpinner />;
  }
};

const SecondarySpinner = styled(PrimarySpinner)`
  --pf-v5-c-spinner--Color: white;
`;
