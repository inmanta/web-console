import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

export const CompileReportLink: React.FC = () => {
  const { urlManager } = useContext(DependencyContext);
  return (
    <Button
      component="a"
      variant="link"
      isInline={true}
      icon={<ExternalLinkAltIcon />}
      href={urlManager.getCompileReportUrl()}
      target="_blank"
    >
      {words("events.details.compileReport")}
    </Button>
  );
};
