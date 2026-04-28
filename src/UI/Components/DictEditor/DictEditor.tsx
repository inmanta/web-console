import React from "react";
import { Button, TextInput } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { ParsedNumber } from "@/Core";

export type Dict = Record<string, string | ParsedNumber | boolean>;
export type Entry = [string, string];

interface Props {
  value: Dict;
  setValue: (record: Dict) => void;
  newEntry: Entry;
  setNewEntry: (entry: Entry) => void;
  isDeleteEntryAllowed: (value: Dict, key: string) => boolean;
  isDisabled?: boolean;
}

export const DictEditor: React.FC<Props> = ({
  value,
  setValue,
  newEntry,
  setNewEntry,
  isDeleteEntryAllowed,
  isDisabled = false,
}) => {
  const updateEntry =
    (key: string) =>
    ([k, v]: Entry) =>
      setValue(
        (() => {
          const { [key]: _omitted, ...rest } = value;
          return { ...rest, [k]: v };
        })()
      );
  const clearEntry = (key) => {
    const { [key]: _omitted, ...rest } = value;
    setValue(rest);
  };
  const clearNewEntry = () => {
    setNewEntry(["", ""]);
  };

  return (
    <Table variant="compact" borders={false}>
      <Tbody>
        {getEntries(value).map((entry) => (
          <Row
            key={entry[0]}
            entry={entry}
            update={updateEntry(entry[0])}
            clear={clearEntry}
            isDeleteable={isDeleteEntryAllowed(value, entry[0])}
            aria-label={`Row-${entry[0]}`}
            isDisabled={isDisabled}
          />
        ))}
        <Row
          key="__newEntry"
          entry={newEntry}
          clear={clearNewEntry}
          update={setNewEntry}
          isKeyEditable
          isDeleteable={newEntry[0].length > 0 || newEntry[1].length > 0}
          aria-label="Row-newEntry"
          isDisabled={isDisabled}
        />
      </Tbody>
    </Table>
  );
};

const getEntries = (value: Dict): Entry[] => {
  const entries: Entry[] = Object.entries(value).map(([k, v]) => [k, v.toString()]);

  return entries.sort();
};

interface RowProps {
  entry: Entry;
  update: (entry: Entry) => void;
  clear: (key: string) => void;
  isDeleteable?: boolean;
  isKeyEditable?: boolean;
  isDisabled?: boolean;
}

const Row: React.FC<RowProps> = ({
  entry: [key, value],
  update,
  clear,
  isKeyEditable,
  isDeleteable,
  isDisabled,
  ...props
}) => {
  const onKeyChange = (newKey) => {
    update([newKey, value]);
  };
  const onValueChange = (newValue) => update([key, newValue]);
  const onClear = () => clear(key);

  return (
    <Tr {...props}>
      <Td>
        <StyledTextInput
          value={key}
          onChange={(_event, value) => onKeyChange(value)}
          type="text"
          aria-label="editEntryKey"
          readOnly={!isKeyEditable}
          isDisabled={isDisabled}
        />
      </Td>
      <Td>
        <StyledTextInput
          value={value}
          onChange={(_event, value) => onValueChange(value)}
          type="text"
          aria-label="editEntryValue"
          isDisabled={isDisabled}
        />
      </Td>
      <Td>
        <Button
          icon={<TrashAltIcon />}
          onClick={onClear}
          variant={isDeleteable ? "link" : "plain"}
          isDanger
          size="sm"
          isDisabled={isDisabled || !isDeleteable}
          aria-label="DeleteEntryAction"
        ></Button>
      </Td>
    </Tr>
  );
};

const StyledTextInput = styled(TextInput)`
  &&& {
    text-overflow: initial;
    @media (min-width: 1450px) {
      min-width: 300px;
    }
  }
`;
