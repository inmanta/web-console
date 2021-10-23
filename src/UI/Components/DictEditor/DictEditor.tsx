import React from "react";
import { Button, TextInput } from "@patternfly/react-core";
import styled from "styled-components";
import { TableComposable, Tbody, Td, Tr } from "@patternfly/react-table";
import { TrashAltIcon } from "@patternfly/react-icons";

interface Props {
  value: Record<string, string | number | boolean>;
  setValue: (record: Record<string, string | number | boolean>) => void;
  newKey: string;
  setNewKey: (k: string) => void;
}

export const DictEditor: React.FC<Props> = ({
  value,
  setValue,
  newKey,
  setNewKey,
}) => {
  const entries = Object.entries(value).filter(([k]) => k !== newKey);
  return (
    <TableComposable variant="compact" borders={false}>
      <Tbody>
        {entries.map((entry) => (
          <Row
            key={entry[0]}
            entry={[entry[0], entry[1].toString()]}
            update={([k, v]) =>
              setValue({ ...deleteKey(entry[0], value), [k]: v })
            }
            clear={(key) => setValue(deleteKey(key, value))}
          />
        ))}
        <Row
          clear={() => {
            setValue(deleteKey(newKey, value));
            setNewKey("");
          }}
          key="newItem"
          entry={[newKey, value[newKey] ? value[newKey].toString() : ""]}
          update={([k, v]) => setValue({ ...deleteKey(newKey, value), [k]: v })}
          setKey={setNewKey}
        />
      </Tbody>
    </TableComposable>
  );
};

interface RowProps {
  entry: [string, string];
  update: (entry: [string, string]) => void;
  clear: (key: string) => void;
  setKey?: (key: string) => void;
}

const Row: React.FC<RowProps> = ({
  entry: [key, value],
  update,
  clear,
  setKey,
}) => {
  const onKeyChange = (val) => {
    if (setKey) {
      setKey(val);
    }
    update([val, value]);
  };
  return (
    <Tr>
      <SlimTd>
        <TextInput
          value={key}
          onChange={onKeyChange}
          type="text"
          aria-label="text input example"
          isDisabled={typeof setKey === "undefined"}
        />
      </SlimTd>
      <SlimTd>
        <TextInput
          value={value}
          onChange={(val) => update([key, val])}
          type="text"
          aria-label="text input example"
        />
      </SlimTd>
      <SlimTd>
        <Button variant="link" isDanger isSmall onClick={() => clear(key)}>
          <TrashAltIcon />
        </Button>
      </SlimTd>
    </Tr>
  );
};

const deleteKey = (key: string, obj: Record<string, unknown>) => {
  const clone = JSON.parse(JSON.stringify(obj));
  delete clone[key];
  return clone;
};

const SlimTd = styled(Td)`
  &&& {
    padding: 0;
  }
`;
