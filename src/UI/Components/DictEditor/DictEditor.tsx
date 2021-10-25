import React from "react";
import { Button, TextInput } from "@patternfly/react-core";
import styled from "styled-components";
import { TableComposable, Tbody, Td, Tr } from "@patternfly/react-table";
import { TrashAltIcon } from "@patternfly/react-icons";
import { deleteKey } from "@/Core";

export type Dict = Record<string, string | number | boolean>;
export type Entry = [string, string];

interface Props {
  value: Dict;
  setValue: (record: Dict) => void;
  newEntry: Entry;
  setNewEntry: (entry: Entry) => void;
  isDeleteEntryAllowed: (value: Dict, key: string) => boolean;
}

export const DictEditor: React.FC<Props> = ({
  value,
  setValue,
  newEntry,
  setNewEntry,
  isDeleteEntryAllowed,
}) => {
  const updateEntry =
    (key: string) =>
    ([k, v]: Entry) =>
      setValue({ ...deleteKey(key, value), [k]: v });
  const clearEntry = (key) => setValue(deleteKey(key, value));
  const clearNewEntry = () => {
    setNewEntry(["", ""]);
  };

  return (
    <TableComposable variant="compact" borders={false}>
      <Tbody>
        {getEntries(value).map((entry) => (
          <Row
            key={entry[0]}
            entry={entry}
            update={updateEntry(entry[0])}
            clear={clearEntry}
            isDeleteable={isDeleteEntryAllowed(value, entry[0])}
          />
        ))}
        <Row
          key="pendingEntry"
          entry={newEntry}
          clear={clearNewEntry}
          update={setNewEntry}
          isKeyEditable
          isDeleteable={newEntry[0].length > 0 || newEntry[1].length > 0}
        />
      </Tbody>
    </TableComposable>
  );
};

const getEntries = (value: Dict): Entry[] => {
  const entries: Entry[] = Object.entries(value).map(([k, v]) => [
    k,
    v.toString(),
  ]);
  return entries.sort();
};

interface RowProps {
  entry: Entry;
  update: (entry: Entry) => void;
  clear: (key: string) => void;
  isDeleteable?: boolean;
  isKeyEditable?: boolean;
}

const Row: React.FC<RowProps> = ({
  entry: [key, value],
  update,
  clear,
  isKeyEditable,
  isDeleteable,
}) => {
  const onKeyChange = (newKey) => {
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
          isDisabled={!isKeyEditable}
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
        <Button
          onClick={onClear}
          variant={isDeleteable ? "link" : "plain"}
          isDanger
          isSmall
          isDisabled={!isDeleteable}
        >
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
