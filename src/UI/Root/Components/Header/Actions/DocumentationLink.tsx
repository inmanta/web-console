import React, { useContext } from "react";
import { Button, ToolbarItem } from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";

export const DocumentationLink: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  return (
    <ToolbarItem>
      <Button
        component="a"
        href={urlManager.getDocumentationLink()}
        target="_blank"
        aria-label="documentation link"
        variant="plain"
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </ToolbarItem>
  );
};
