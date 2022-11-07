import React, { useEffect, useState } from "react";
import { Alert, AlertActionCloseButton } from "@patternfly/react-core";
import { TableComposable, Tbody } from "@patternfly/react-table";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { InputRow } from "./Components";

interface Props {
  infos: EnvironmentSettings.InputInfo[];
  errorMessage: string;
  onErrorClose: () => void;
  className?: string;
}

export const Container: React.FC<Props> = ({
  infos,
  errorMessage,
  onErrorClose,
  className,
}) => {
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    const updateSuccessBanner = () => {
      setShowUpdateBanner(true);
      setTimeout(() => {
        setShowUpdateBanner(false);
      }, 2000);
    };
    document.addEventListener("Settings update", updateSuccessBanner);
    return () => {
      document.removeEventListener("Settings update", updateSuccessBanner);
    };
  }, [setShowUpdateBanner]);
  return (
    <Wrapper className={className}>
      {errorMessage && (
        <StyledAlert
          variant="danger"
          title={errorMessage}
          aria-live="polite"
          actionClose={<AlertActionCloseButton onClose={onErrorClose} />}
          isInline
        />
      )}
      {showUpdateBanner && (
        <StyledAlert
          variant="success"
          title={"Setting Changed"}
          aria-live="polite"
          actionClose={
            <AlertActionCloseButton
              onClose={() => setShowUpdateBanner(false)}
            />
          }
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
