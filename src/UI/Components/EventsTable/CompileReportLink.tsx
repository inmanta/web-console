import React from "react";
import { Button } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { Link } from "react-router-dom";
import { getUrl } from "@/UI/Routing";

interface Props {
  compileId;
}

export const CompileReportLink: React.FC<Props> = ({ compileId }) => (
  <Link
    to={{
      pathname: getUrl("CompileDetails", {
        id: compileId,
      }),
      search: location.search,
    }}
  >
    <Button variant="link" isInline>
      {words("events.details.compileReport")}
    </Button>
  </Link>
);
