import React, { useState } from "react";
import { NumberInput, Switch, Tooltip } from "@patternfly/react-core";
import { OutlinedQuestionCircleIcon } from "@patternfly/react-icons";
import { Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { EnvironmentSettings, Maybe } from "@/Core";
import { DictEditor, SingleTextSelect, Entry, Dict } from "@/UI/Components";
import { InputActions } from "./InputActions";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const InputRow: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return (
        <Row info={info}>
          <BooleanInput info={info} />
        </Row>
      );
    case "int":
      return (
        <Row info={info}>
          <IntInput info={info} />
        </Row>
      );
    case "enum":
      return (
        <Row info={info}>
          <EnumInput info={info} />
        </Row>
      );
    case "dict":
      return <DictInputWithRow info={info} />;
  }
};

const Row: React.FC<Props> = ({ info, children }) => (
  <Tr aria-label={`Row-${info.name}`}>
    <Td>
      {info.name}{" "}
      <StyledTooltip content={getDescription(info)}>
        <OutlinedQuestionCircleIcon />
      </StyledTooltip>
    </Td>
    <Td>{children}</Td>
    <Td>
      <InputActions info={info} />
    </Td>
  </Tr>
);

const getDescription = (
  info: Pick<EnvironmentSettings.InputInfo, "default" | "doc">
): string => {
  if (typeof info.default === "object") {
    return `${info.doc}\ndefault: ${JSON.stringify(info.default)}`;
  }
  return `${info.doc}\ndefault: ${info.default}`;
};

const StyledTooltip = styled(Tooltip)`
  white-space: pre-line;
`;

const EnumInput: React.FC<{ info: EnvironmentSettings.EnumInputInfo }> = ({
  info,
}) => {
  const setSelected = (value) => (value !== null ? info.set(value) : undefined);
  return (
    <StyledSingleTextSelect
      selected={info.value}
      setSelected={setSelected}
      options={info.allowed_values}
      toggleAriaLabel={`EnumInput-${info.name}`}
    />
  );
};

const StyledSingleTextSelect = styled(SingleTextSelect)`
  width: 300px;
`;

const IntInput: React.FC<{ info: EnvironmentSettings.IntInputInfo }> = ({
  info,
}) => {
  const onChange = (event) => {
    info.set(Number(event.target.value));
  };
  const onMinus = () => info.set(Number(info.value) - 1);
  const onPlus = () => info.set(Number(info.value) + 1);

  return (
    <NumberInput
      value={Number(info.value)}
      onMinus={onMinus}
      onChange={onChange}
      onPlus={onPlus}
      inputName="input"
      inputAriaLabel="number input"
      minusBtnAriaLabel="minus"
      plusBtnAriaLabel="plus"
      widthChars={10}
    />
  );
};

const BooleanInput: React.FC<{
  info: EnvironmentSettings.BooleanInputInfo;
}> = ({ info }) => (
  <Switch
    isChecked={info.value}
    onChange={info.set}
    aria-label={`Toggle-${info.name}`}
  />
);

const DictInputWithRow: React.FC<{
  info: EnvironmentSettings.DictInputInfo;
}> = ({ info }) => {
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
  };
  const isDeleteEntryAllowed = (value: Dict, key: string) =>
    !Object.keys(info.default).includes(key);

  return (
    <Row info={customInfo}>
      <DictEditor
        value={info.value}
        setValue={info.set}
        newEntry={newEntry}
        setNewEntry={setNewEntry}
        isDeleteEntryAllowed={isDeleteEntryAllowed}
      />
    </Row>
  );
};

const getSanitizedNewEntry = ([key, value]: Entry) => {
  if (key.length <= 0) return {};
  return { [key]: value };
};
