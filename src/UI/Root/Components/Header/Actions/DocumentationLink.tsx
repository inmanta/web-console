import React, { useContext } from "react";
import { Button, PageHeaderToolsItem } from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";

export const DocumentationLink: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  return (
    <PageHeaderToolsItem>
      <Button
        component="a"
        href={urlManager.getDocumentationLink()}
        target="_blank"
        aria-label="documentation link"
        variant="plain"
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </PageHeaderToolsItem>
  );
};
