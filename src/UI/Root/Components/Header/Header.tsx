import React, { useContext } from "react";
import { PageHeader } from "@patternfly/react-core/deprecated";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import logo from "@images/logo.svg";
import { Actions } from "./Actions";

interface Props {
  noEnv: boolean;
  onNotificationsToggle(): void;
}

export const Header: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  const { routeManager, environmentHandler } = useContext(DependencyContext);
  return (
    <>
      <StyledHeader
        logo={<img src={logo} alt="Inmanta Logo" aria-label="Inmanta Logo" />}
        logoProps={{
          href: noEnv
            ? routeManager.getUrl("Home", undefined)
            : routeManager.getUrl("Dashboard", undefined) +
              `?env=${environmentHandler.useId()}`,
        }}
        headerTools={<Actions {...{ noEnv, onNotificationsToggle }} />}
        showNavToggle
      />
    </>
  );
};

const StyledHeader = styled(PageHeader)`
  @media (min-width: 768px) {
    grid-template-columns: auto 1fr auto;
  }
  .pf-v5-c-page__header-brand {
    @media (min-width: 768px) {
      padding-right: 2rem;
    }
  }
  .pf-v5-c-page__header-nav {
    @media (min-width: 768px) {
      grid-column: 2/3;
      grid-row: 1/2;
    }
  }
  .pf-v5-c-page__header-tools {
    @media (min-width: 768px) {
      height: 100%;
      grid-column: 3/3;
    }
  }
`;
