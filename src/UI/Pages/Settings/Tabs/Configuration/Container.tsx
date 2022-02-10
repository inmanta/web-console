import React from "react";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import { TableComposable, Tbody } from "@patternfly/react-table";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { InputRow } from "./InputRow";

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

const StyledAlert = styled(Alert)`
  margin-bottom: 1rem;
`;

const Wrapper = styled.div`
  padding-top: 1rem;
  overflow-x: auto;
`;

const StyledTable = styled(TableComposable)`
  width: auto;
`;
