import React from "react";
import { Label } from "@patternfly/react-core";
import styled from "styled-components";
import { CompileStatus } from "@/Core";
import { Spinner } from "@/UI/Components";

export const StatusLabel: React.FC<{ status: CompileStatus }> = ({
  status,
}) => {
  switch (status) {
    case CompileStatus.Success:
      return <Label color="green">{status}</Label>;
    case CompileStatus.Failed:
      return <Label color="red">{status}</Label>;
    case CompileStatus.InProgress:
      return (
        <Label color="blue">
          <PaddedLabel>{status}</PaddedLabel> {<Spinner variant="small" />}
        </Label>
      );
    case CompileStatus.Queued:
      return <Label variant="outline">{status}</Label>;
  }
};

const PaddedLabel = styled.span`
  padding-right: 1ch;
`;
