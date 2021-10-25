import React from "react";
import { Button, TextInput } from "@patternfly/react-core";
import styled from "styled-components";
import { TableComposable, Tbody, Td, Tr } from "@patternfly/react-table";
import { TrashAltIcon } from "@patternfly/react-icons";
import { deleteKey } from "@/Core";

type Dict = Record<string, string | number | boolean>;
type Entry = [string, string];

interface Props {
  value: Dict;
  setValue: (record: Dict) => void;
  newKey: string;
  setNewKey: (k: string) => void;
}

export const DictEditor: React.FC<Props> = ({
  value,
  setValue,
  newKey,
  setNewKey,
}) => {
  const updateExistingEntry =
    (key: string) =>
    ([k, v]: Entry) =>
      setValue({ ...deleteKey(key, value), [k]: v });
  const clearExistingEntry = (key) => setValue(deleteKey(key, value));
  const updateNewEntry = ([k, v]: Entry) =>
    setValue({ ...deleteKey(newKey, value), [k]: v });
  const clearNewEntry = () => {
    setValue(deleteKey(newKey, value));
    setNewKey("");
  };

  const newEntry: Entry = [
    newKey,
    value[newKey] ? value[newKey].toString() : "",
  ];

  return (
    <TableComposable variant="compact" borders={false}>
      <Tbody>
        {getEntries(value, newKey).map((entry) => (
          <Row
            key={entry[0]}
            entry={entry}
            update={updateExistingEntry(entry[0])}
            clear={clearExistingEntry}
          />
        ))}
        <Row
          key="pendingEntry"
          entry={newEntry}
          clear={clearNewEntry}
          update={updateNewEntry}
          setKey={setNewKey}
        />
      </Tbody>
    </TableComposable>
  );
};

const getEntries = (value: Dict, excludedKey: string): Entry[] => {
  const entries: Entry[] = Object.entries(value).map(([k, v]) => [
    k,
    v.toString(),
  ]);
  return entries.filter(([k]) => k !== excludedKey).sort();
};

interface RowProps {
  entry: Entry;
  update: (entry: Entry) => void;
  clear: (key: string) => void;
  setKey?: (key: string) => void;
}

const Row: React.FC<RowProps> = ({
  entry: [key, value],
  update,
  clear,
  setKey,
}) => {
  const onKeyChange = (newKey) => {
    if (setKey) setKey(newKey);
    update([newKey, value]);
  };
  const onValueChange = (newValue) => update([key, newValue]);
  const onClear = () => clear(key);

  return (
    <Tr>
      <SlimTd>
        <TextInput
          value={key}
          onChange={onKeyChange}
          type="text"
          aria-label="editEntryKey"
          isDisabled={typeof setKey === "undefined"}
        />
      </SlimTd>
      <SlimTd>
        <TextInput
          value={value}
          onChange={onValueChange}
          type="text"
          aria-label="editEntryValue"
        />
      </SlimTd>
      <SlimTd>
        <Button onClick={onClear} variant="link" isDanger isSmall>
          <TrashAltIcon />
        </Button>
      </SlimTd>
    </Tr>
  );
};

const SlimTd = styled(Td)`
  &&& {
    padding: 0;
  }
`;
