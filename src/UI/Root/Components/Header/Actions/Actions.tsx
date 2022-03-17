import React, { useContext } from "react";
import { PageHeaderTools, PageHeaderToolsGroup } from "@patternfly/react-core";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { DependencyContext } from "@/UI/Dependency";
import { DocumentationLink } from "./DocumentationLink";
import { Profile } from "./Profile";
import { SettingsButton } from "./SettingsButton";
import { StatusButton } from "./StatusButton";

interface Props {
  onNotificationsToggle(): void;
  noEnv: boolean;
}

export const Actions: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  const { keycloakController } = useContext(DependencyContext);
  return (
    <PageHeaderTools>
      <PageHeaderToolsGroup>
        {!noEnv && <Badge onClick={onNotificationsToggle} />}
        {!noEnv && <SettingsButton />}
        <StatusButton />
        <DocumentationLink />
      </PageHeaderToolsGroup>
      {keycloakController.isEnabled() && (
        <Profile keycloak={keycloakController.getInstance()} />
      )}
    </PageHeaderTools>
  );
};
