import React, { useState, useEffect } from "react";
import { TextContent } from "@patternfly/react-core";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";

export const Profile: React.FC = () => {
  const { keycloak } = useKeycloak();
  const [name, setName] = useState("Unknown user");

  useEffect(() => {
    if (keycloak && keycloak.profile && keycloak.profile.username) {
      setName(keycloak.profile.username);
    }
  }, [keycloak, keycloak.profile]);

  return <StyledText>{name}</StyledText>;
};

const StyledText = styled(TextContent)`
  font-weight: bold;
  text-align: start;
`;
