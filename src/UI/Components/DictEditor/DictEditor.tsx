import React from "react";
import { Button, TextInput } from "@patternfly/react-core";
import styled from "styled-components";
import { TableComposable, Tbody, Td, Tr } from "@patternfly/react-table";
import { TrashAltIcon } from "@patternfly/react-icons";

interface Props {
  value: Record<string, string | number | boolean>;
  setValue: (record: Record<string, string | number | boolean>) => void;
}

export const DictEditor: React.FC<Props> = ({ value, setValue }) => {
  console.log("DictEditor", { value });
  return (
    <TableComposable variant="compact" borders={false}>
      <Tbody>
        {Object.entries(value)
          .filter(([, val]) => typeof val !== "undefined")
          .map((entry) => (
            <Row
              key={entry[0]}
              entry={[entry[0], entry[1].toString()]}
              update={([k, v]) =>
                setValue({ ...deleteKey(entry[0], value), [k]: v })
              }
              clear={(key) => setValue(deleteKey(key, value))}
            />
          ))}
      </Tbody>
    </TableComposable>
  );
};

interface RowProps {
  entry: [string, string];
  update: (entry: [string, string]) => void;
  clear: (key: string) => void;
}

const Row: React.FC<RowProps> = ({ entry: [key, value], update, clear }) => {
  return (
    <Tr>
      <SlimTd>
        <TextInput
          value={key}
          onChange={(val) => update([val, value])}
          type="text"
          aria-label="text input example"
          isDisabled
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
