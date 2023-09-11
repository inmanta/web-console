import React from "react";
import { Button, TextInput } from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import {
  Table /* data-codemods */,
  Tbody,
  Td,
  Tr,
} from "@patternfly/react-table";
import { omit } from "lodash-es";
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
      setValue({ ...omit(value, key), [k]: v });
  const clearEntry = (key) => setValue(omit(value, key));
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
        />
      </Tbody>
    </Table>
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
  ...props
}) => {
  const onKeyChange = (newKey) => {
    update([newKey, value]);
  };
  const onValueChange = (newValue) => update([key, newValue]);
  const onClear = () => clear(key);

  return (
    <Tr {...props}>
      <SlimTd>
        <StyledTextInput
          value={key}
          onChange={onKeyChange}
          type="text"
          aria-label="editEntryKey"
          readOnly={!isKeyEditable}
        />
      </SlimTd>
      <SlimTd>
        <StyledTextInput
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
          size="sm"
          isDisabled={!isDeleteable}
          aria-label="DeleteEntryAction"
        >
          <TrashAltIcon />
        </Button>
      </SlimTd>
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

const SlimTd = styled(Td)`
  &&& {
    padding: 0;
  }
`;
