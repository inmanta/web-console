import React from "react";
import { TextContent } from "@patternfly/react-core";
import Keycloak from "keycloak-js";
import styled from "styled-components";

interface Props {
  keycloak: Keycloak | undefined;
}

export const Profile: React.FC<Props> = ({ keycloak }) => {
  const [name, setName] = React.useState("unknown user");
  if (keycloak && keycloak.profile && keycloak.profile.username !== name) {
    setName(keycloak.profile.username as string);
  }

  return <StyledText>{name}</StyledText>;
};

const StyledText = styled(TextContent)`
  font-weight: bold;
  text-align: start;
`;
