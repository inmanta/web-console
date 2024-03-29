import React, { useState, useEffect } from "react";
import { TextContent } from "@patternfly/react-core";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";

export const KeycloakName: React.FC = () => {
  const [name, setName] = useState("Unknown user");
  const { keycloak } = useKeycloak();

  useEffect(() => {
    if (keycloak && keycloak.profile && keycloak.profile.username) {
      setName(keycloak.profile.username);
    }
  }, [keycloak, keycloak.profile, keycloak.profile?.username]);

  return <StyledText>{name}</StyledText>;
};

const StyledText = styled(TextContent)`
  font-weight: bold;
  text-align: start;
`;
