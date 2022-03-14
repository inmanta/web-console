import React from "react";
import { Label } from "@patternfly/react-core";

import { CompileStatus } from "@/Core";

export const StatusLabel: React.FC<{ status: CompileStatus }> = ({
  status,
}) => {
  switch (status) {
    case CompileStatus.Success:
      return <Label color="green">{status}</Label>;
    case CompileStatus.Failed:
      return <Label color="red">{status}</Label>;
    case CompileStatus.InProgress:
      return <Label color="blue">{status}</Label>;
    case CompileStatus.Queued:
      return <Label variant="outline">{status}</Label>;
  }
};
