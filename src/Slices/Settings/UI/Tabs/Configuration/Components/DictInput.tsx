import React, { useState } from "react";
import styled from "styled-components";
import { EnvironmentSettings, Maybe } from "@/Core";
import { DictEditor, Entry, Dict } from "@/UI/Components";
import { Row } from "./Row";
import { Warning } from "./Warning";

interface Props {
  info: EnvironmentSettings.DictInputInfo;
}

export const DictInputWithRow: React.FC<Props> = ({ info }) => {
  const [newEntry, setNewEntry] = useState<Entry>(["", ""]);
  const customInfo = {
    ...info,
    update: async (value: EnvironmentSettings.DictInputInfo["value"]) => {
      const error = await info.update({
        ...value,
        ...getSanitizedNewEntry(newEntry),
      });
      if (Maybe.isNone(error)) setNewEntry(["", ""]);
      return error;
    },
    reset: async () => {
      const error = await info.reset();
      if (Maybe.isNone(error)) setNewEntry(["", ""]);
      return error;
    },
    isUpdateable: () => info.isUpdateable(info) || newEntry[0].length > 0,
  };
  const isDeleteEntryAllowed = (value: Dict, key: string) =>
    !Object.keys(info.default).includes(key);

  return (
    <Row info={customInfo}>
      <Container hasWarning={customInfo.isUpdateable()}>
        <DictEditor
          value={info.value}
          setValue={info.set}
          newEntry={newEntry}
          setNewEntry={setNewEntry}
          isDeleteEntryAllowed={isDeleteEntryAllowed}
        />
        {customInfo.isUpdateable() && <StyledWarning />}
      </Container>
    </Row>
  );
};

const StyledWarning = styled(Warning)`
  height: 36px;
`;

const Container = styled.div<{ hasWarning: boolean }>`
  display: flex;
  margin-right: ${(p) => (p.hasWarning ? "0" : "16px")};
`;

const getSanitizedNewEntry = ([key, value]: Entry) => {
  if (key.length <= 0) return {};
  return { [key]: value };
};
