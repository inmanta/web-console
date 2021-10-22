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
  info: EnvironmentSettings.IntInputInfo;
}

export const IntInput: React.FC<Props> = ({ info }) => {
  const onChange = (event) => {
    info.set(Number(event.target.value));
  };
  const onMinus = () => info.set(info.value - 1);
  const onPlus = () => info.set(info.value + 1);

  console.log(info.name, info.value, info.initial);

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
            variant={info.value === info.initial ? "plain" : "link"}
            aria-label="Save"
            onClick={() => info.update(info.value)}
            isDisabled={info.value === info.initial}
          >
            <CheckIcon />
          </Button>
        </Tooltip>
        <Tooltip content={words("settings.tabs.configuration.reset")}>
          <Button
            variant="plain"
            aria-label="Reset"
            onClick={() => info.reset()}
            isDisabled={info.value === info.default}
          >
            <RedoIcon />
          </Button>
        </Tooltip>
      </InputGroup>
    </>
  );
};
