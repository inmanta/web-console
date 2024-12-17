import React, { useState } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
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
  const isDeleteEntryAllowed = (_value: Dict, key: string) =>
    !Object.keys(info.default).includes(key);

  return (
    <Row info={customInfo}>
      <Flex direction={{ default: "row" }}>
        <FlexItem grow={{ default: "grow" }}>
          <DictEditor
            value={info.value}
            setValue={info.set}
            newEntry={newEntry}
            setNewEntry={setNewEntry}
            isDeleteEntryAllowed={isDeleteEntryAllowed}
          />
        </FlexItem>

        <FlexItem style={{ minWidth: "20px" }}>
          {info.isUpdateable(info) && <Warning />}
        </FlexItem>
      </Flex>
    </Row>
  );
};

const getSanitizedNewEntry = ([key, value]: Entry) => {
  if (key.length <= 0) return {};

  return { [key]: value };
};
