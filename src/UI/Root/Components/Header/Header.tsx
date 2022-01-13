import React, { useContext } from "react";
import { PageHeader } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import logo from "@images/logo.svg";
import { Actions } from "./Actions";
import { EnvSelectorWithProvider } from "./EnvSelector";

interface Props {
  noEnv: boolean;
  isNavOpen: boolean;
  onToggle(): void;
}

export const Header: React.FC<Props> = ({ noEnv, isNavOpen, onToggle }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <PageHeader
      logo={<img src={logo} alt="Inmanta Logo" aria-label="Inmanta Logo" />}
      logoProps={{ href: routeManager.getUrl("Home", undefined) }}
      headerTools={<Actions noEnv={noEnv} />}
      showNavToggle
      topNav={<EnvSelectorWithProvider />}
      isNavOpen={isNavOpen}
      onNavToggle={onToggle}
    />
  );
};
