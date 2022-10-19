import React, { useContext } from "react";
import { PageHeader } from "@patternfly/react-core";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import logo from "@images/logo.svg";
import { Actions } from "./Actions";
import { EnvSelectorWithProvider } from "./EnvSelector";
import { SimpleBackgroundImage } from "./SimpleBackgroundImage";

interface Props {
  noEnv: boolean;
  onNotificationsToggle(): void;
}

export const Header: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <>
      <StyledImage />
      <StyledHeader
        logo={<img src={logo} alt="Inmanta Logo" aria-label="Inmanta Logo" />}
        logoProps={{ href: routeManager.getUrl("Home", undefined) }}
        headerTools={<Actions {...{ noEnv, onNotificationsToggle }} />}
        showNavToggle
        topNav={<EnvSelectorWithProvider />}
      />
    </>
  );
};

const StyledImage = styled(SimpleBackgroundImage)`
  z-index: 0;
`;

const StyledHeader = styled(PageHeader)`
  background-color: transparent;
`;
