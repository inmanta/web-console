import React, { useEffect, useState } from "react";
import { Alert, AlertActionCloseButton, Stack } from "@patternfly/react-core";
import { Tbody, Table } from "@patternfly/react-table";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI";
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

    document.addEventListener("settings-update", updateSuccessBanner);

    return () => {
      document.removeEventListener("settings-update", updateSuccessBanner);
    };
  }, [setShowUpdateBanner]);

  return (
    <Stack hasGutter style={{ maxWidth: "1000px" }} className={className}>
      {errorMessage && (
        <Alert
          variant="danger"
          title={errorMessage}
          aria-live="polite"
          actionClose={<AlertActionCloseButton onClose={onErrorClose} />}
          isInline
        />
      )}
      {showUpdateBanner && (
        <Alert
          variant="success"
          title={words("settings.update")}
          aria-live="polite"
          actionClose={
            <AlertActionCloseButton
              onClose={() => setShowUpdateBanner(false)}
            />
          }
          isInline
        />
      )}
      <Table variant="compact" borders={false}>
        <Tbody>
          {infos.map((info) => (
            <InputRow info={info} key={info.name} />
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
};
