import React from "react";
import {
  Button,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";
import { CogIcon } from "@patternfly/react-icons";
import { getUrl } from "@/UI/Routing";
import { Link } from "@/UI/Components";

interface Props {
  isDisabled?: boolean;
}

export const SettingsButton: React.FC<Props> = ({ isDisabled }) => (
  <PageHeaderToolsGroup>
    <PageHeaderToolsItem>
      <Link
        pathname={getUrl("Settings", undefined)}
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
