import React, { useState } from "react";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { Alert, AlertActionCloseButton, Tooltip } from "@patternfly/react-core";
import { Input } from "./Input";
import { TableComposable, Tbody, Td, Tr } from "@patternfly/react-table";
import { InputActions } from "./InputActions";

interface Props {
  infos: EnvironmentSettings.InputInfo[];
  errorMessage: string;
  onErrorClose: () => void;
}

export const Container: React.FC<Props> = ({
  infos,
  errorMessage,
  onErrorClose,
}) => {
  return (
    <Wrapper>
      {errorMessage && (
        <StyledAlert
          variant="danger"
          title={errorMessage}
          aria-live="polite"
          actionClose={<AlertActionCloseButton onClose={onErrorClose} />}
          isInline
        />
      )}
      <StyledTable variant="compact" borders={false}>
        <Tbody>
          {infos.map((info) => (
            <InputRow info={info} key={info.name} />
          ))}
        </Tbody>
      </StyledTable>
    </Wrapper>
  );
};

const InputRow: React.FC<{ info: EnvironmentSettings.InputInfo }> = ({
  info,
}) => {
  const [newKey, setNewKey] = useState("");
  return (
    <Tr>
      <Td>
        <Tooltip content={info.doc}>
          <span>{info.name}</span>
        </Tooltip>
      </Td>
      <Td>
        <Input info={info} newKey={newKey} setNewKey={setNewKey} />
      </Td>
      <Td>
        <InputActions info={info} clearKey={() => setNewKey("")} />
      </Td>
    </Tr>
  );
};
const StyledAlert = styled(Alert)`
  margin-bottom: 1rem;
`;

const Wrapper = styled.div`
  padding-top: 1rem;
`;

const StyledTable = styled(TableComposable)`
  width: auto;
`;
