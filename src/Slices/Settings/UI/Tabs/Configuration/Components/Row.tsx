import React from "react";
import { Tooltip } from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import { Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { InputActions } from "./InputActions";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const Row: React.FC<React.PropsWithChildren<Props>> = ({
  info,
  children,
}) => (
  <Tr aria-label={`Row-${info.name}`}>
    <Td>
      {info.name}{" "}
      <StyledTooltip content={getDescription(info)}>
        <OutlinedQuestionCircleIcon />
      </StyledTooltip>
    </Td>
    <Td style={{ verticalAlign: "middle" }}>{children}</Td>
    <Td>
      <InputActions info={info} />
    </Td>
  </Tr>
);

const getDescription = (
  info: Pick<EnvironmentSettings.InputInfo, "default" | "doc">,
): string => {
  if (typeof info.default === "object") {
    return `${info.doc}\ndefault: ${JSON.stringify(info.default)}`;
  }
  return `${info.doc}\ndefault: ${info.default}`;
};

const StyledTooltip = styled(Tooltip)`
  white-space: pre-line;
`;
