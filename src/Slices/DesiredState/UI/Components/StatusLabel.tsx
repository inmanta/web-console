import React from "react";
import { Label } from "@patternfly/react-core";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";

export const StatusLabel: React.FC<{ status: DesiredStateVersionStatus }> = ({
  status,
}) => {
  switch (status) {
    case DesiredStateVersionStatus.active:
      return <Label color="green">{status}</Label>;
    case DesiredStateVersionStatus.skipped_candidate:
      return (
        <Label variant="outline" color="orange">
          {status}
        </Label>
      );
    case DesiredStateVersionStatus.candidate:
      return <Label variant="outline">{status}</Label>;
    case DesiredStateVersionStatus.retired:
      return <Label color="grey">{status}</Label>;
  }
};
