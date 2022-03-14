import React from "react";
import { Label } from "@patternfly/react-core";
import styled from "styled-components";
import { CompileStatus } from "@/Core";
import { Spinner } from "@/UI/Components";

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
          <PaddedLabel>{status}</PaddedLabel> {<Spinner variant="small" />}
        </Label>
      );
    case CompileStatus.queued:
      return <Label variant="outline">{status}</Label>;
  }
};

const PaddedLabel = styled.span`
  padding-right: 1ch;
`;
