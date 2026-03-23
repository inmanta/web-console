import React from "react";
import { AlertVariant, Stack, Title } from "@patternfly/react-core";
import { Tbody, Table, Td, Tr } from "@patternfly/react-table";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI";
import { AppAlert } from "@/UI/Components";
import { InputRow } from "./Components";

interface Props {
  infos: EnvironmentSettings.SectionnedInputInfo;
  errorMessage: string;
  onErrorClose: () => void;
  showUpdateBanner: boolean;
  setShowUpdateBanner: (showUpdateBanner: boolean) => void;
  className?: string;
}

export const Container: React.FC<Props> = ({
  infos,
  errorMessage,
  showUpdateBanner,
  setShowUpdateBanner,
  onErrorClose,
  className,
}) => {
  return (
    <Stack hasGutter style={{ maxWidth: "1000px" }} className={className}>
      {errorMessage && <AppAlert title={errorMessage} onClose={onErrorClose} isInline />}
      {showUpdateBanner && (
        <AppAlert
          title={words("settings.update")}
          onClose={() => setShowUpdateBanner(false)}
          isInline
          variant={AlertVariant.success}
        />
      )}
      <Table variant="compact" borders={false}>
        <Tbody>
          {Object.entries(infos).map(([section, infos]) => (
            <React.Fragment key={section}>
              <Tr className="titlecase" resetOffset>
                <Td colSpan={3}>
                  <Title className="lined_section" headingLevel="h2" size="md">
                    {section}
                  </Title>
                </Td>
              </Tr>
              {infos.map((info) => (
                <InputRow info={info} key={info.name} />
              ))}
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
};
