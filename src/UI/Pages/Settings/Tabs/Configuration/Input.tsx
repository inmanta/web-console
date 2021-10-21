import React from "react";
import { EnvironmentSettings } from "@/Core";
import {
  Button,
  InputGroup,
  InputGroupText,
  NumberInput,
  Tooltip,
} from "@patternfly/react-core";
import { words } from "@/UI/words";
import { DefaultIcon } from "./DefaultIcon";
import { CheckIcon, RedoIcon } from "@patternfly/react-icons";

interface Props {
  info: EnvironmentSettings.InputInfo;
}

export const Input: React.FC<Props> = ({ info }) => {
  switch (info.type) {
    case "bool":
      return <>bool</>;
    case "int":
      return <IntInput info={info} />;
    case "enum":
      return <>enum</>;
    case "dict":
      return <>dict</>;
  }
};

interface IntProps {
  info: EnvironmentSettings.IntInputInfo;
}

const IntInput: React.FC<IntProps> = ({ info }) => {
  const onChange = (event) => {
    info.set(Number(event.target.value));
  };
  const onMinus = () => info.set(info.value - 1);
  const onPlus = () => info.set(info.value + 1);

  return (
    <>
      <InputGroup>
        <NumberInput
          value={info.value}
          onMinus={onMinus}
          onChange={onChange}
          onPlus={onPlus}
          inputName="input"
          inputAriaLabel="number input"
          minusBtnAriaLabel="minus"
          plusBtnAriaLabel="plus"
          widthChars={info.value.toString().length + 3}
        />
        <InputGroupText aria-label="default" variant="plain">
          <Tooltip
            content={words("settings.tabs.configuration.default")(
              info.default.toString()
            )}
          >
            <DefaultIcon $isDisabled={info.value !== info.default} />
          </Tooltip>
        </InputGroupText>
        <Tooltip content={words("settings.tabs.configuration.save")}>
          <Button
            variant="link"
            aria-label="Save"
            onClick={() => info.update(info.value)}
          >
            <CheckIcon />
          </Button>
        </Tooltip>
        <Tooltip content={words("settings.tabs.configuration.reset")}>
          <Button
            variant="plain"
            aria-label="Reset"
            onClick={() => info.reset()}
          >
            <RedoIcon />
          </Button>
        </Tooltip>
      </InputGroup>
    </>
  );
};
