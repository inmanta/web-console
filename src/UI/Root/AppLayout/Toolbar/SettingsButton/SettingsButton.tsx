import React, { useContext } from "react";
import {
  Button,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";
import { CogIcon } from "@patternfly/react-icons";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  isDisabled?: boolean;
}

export const SettingsButton: React.FC<Props> = ({ isDisabled }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <PageHeaderToolsGroup>
      <PageHeaderToolsItem>
        <Link
          pathname={routeManager.getUrl("Settings", undefined)}
          isDisabled={isDisabled}
          envOnly
        >
          <Button
            aria-label="Settings actions"
            variant="plain"
            isDisabled={isDisabled}
          >
            <CogIcon />
          </Button>
        </Link>
      </PageHeaderToolsItem>
    </PageHeaderToolsGroup>
  );
};
