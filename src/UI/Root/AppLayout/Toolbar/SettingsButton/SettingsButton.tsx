import { getUrl } from "@/UI/Routing";
import {
  Button,
  PageHeaderToolsGroup,
  PageHeaderToolsItem,
} from "@patternfly/react-core";
import { CogIcon } from "@patternfly/react-icons";
import React from "react";
import { Link } from "react-router-dom";

export const SettingsButton: React.FC = () => (
  <PageHeaderToolsGroup>
    <PageHeaderToolsItem>
      <Link to={getUrl("Settings", undefined)}>
        <Button aria-label="Settings actions" variant="plain">
          <CogIcon />
        </Button>
      </Link>
    </PageHeaderToolsItem>
  </PageHeaderToolsGroup>
);
