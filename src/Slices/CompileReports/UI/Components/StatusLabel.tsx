import React from "react";
import { Label, Spinner } from "@patternfly/react-core";
import styled from "styled-components";
import { CompileStatus } from "@/Core";

export const StatusLabel: React.FC<{ status: CompileStatus }> = ({
  status,
}) => {
  switch (status) {
    case CompileStatus.success:
      return <Label color="green">{status}</Label>;
    case CompileStatus.failed:
      return <Label color="red">{status}</Label>;
    case CompileStatus.inprogress:
      return (
        <Label color="blue">
          <PaddedLabel>{status}</PaddedLabel>
          <Spinner size="sm" />
        </Label>
      );
    case CompileStatus.queued:
      return <Label variant="outline">{status}</Label>;
  }
};

const PaddedLabel = styled.span`
  padding-right: 1ch;
`;
