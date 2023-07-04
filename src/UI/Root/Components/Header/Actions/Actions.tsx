import React from "react";
import { PageHeaderTools, PageHeaderToolsGroup } from "@patternfly/react-core";
import { Badge } from "@/Slices/Notification/UI/Badge";
import { EnvSelectorWithProvider } from "../EnvSelector";
import { DocumentationLink } from "./DocumentationLink";
import { StatusButton } from "./StatusButton";

interface Props {
  onNotificationsToggle(): void;
  noEnv: boolean;
}

export const Actions: React.FC<Props> = ({ noEnv, onNotificationsToggle }) => {
  return (
    <PageHeaderTools>
      <PageHeaderToolsGroup>
        {!noEnv && <Badge onClick={onNotificationsToggle} />}
        <StatusButton />
        <DocumentationLink />
      </PageHeaderToolsGroup>
      <EnvSelectorWithProvider />
    </PageHeaderTools>
  );
};
