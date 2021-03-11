import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import React from "react";
import { words } from "@/UI/words";

interface Props {
  compileReportId: string | null;
  environmentId: string;
}
export const CompileReportLink: React.FC<Props> = ({
  compileReportId,
  environmentId,
}) => {
  if (compileReportId) {
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
    const href = `${baseUrl}/dashboard/#!/environment/${environmentId}/compilereport`;
    return (
      <Button
        component="a"
        variant="link"
        isInline={true}
        icon={<ExternalLinkAltIcon />}
        href={href}
        target="_blank"
      >
        {words("events.details.compileReport")}
      </Button>
    );
  } else {
    return <></>;
  }
};
