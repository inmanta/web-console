import React from "react";
import { TextContent } from "@patternfly/react-core";
import { useKeycloak } from "@react-keycloak/web";
import styled from "styled-components";

export const Profile: React.FC = () => {
  const { keycloak } = useKeycloak();

  return (
    <StyledText>
      {(keycloak && keycloak.profile && keycloak.profile.username) ||
        "Unknown user"}
    </StyledText>
  );
};

const StyledText = styled(TextContent)`
  font-weight: bold;
  text-align: start;
`;
