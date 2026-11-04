import React from "react";
import { Stack, Title } from "@patternfly/react-core";
import { Tbody, Table, Td, Tr } from "@patternfly/react-table";
import { EnvironmentSettings } from "@inmanta/web-console-core";
import { InputRow } from "./Components";

interface Props {
  infos: EnvironmentSettings.SectionnedInputInfo;
  className?: string;
}

export const Container: React.FC<Props> = ({ infos, className }) => {
  return (
    <Stack hasGutter style={{ maxWidth: "1000px" }} className={className}>
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
