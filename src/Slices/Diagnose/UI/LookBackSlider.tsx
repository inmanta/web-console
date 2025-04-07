import React, { useState } from "react";
import {
  Button,
  Content,
  Flex,
  FlexItem,
  Slider,
  SliderOnChangeEvent,
} from "@patternfly/react-core";
import { words } from "@/UI/words";

interface Props {
  instanceVersion: number;
  initialLookBehind: number;
  setSelectedVersion: (version: number) => void;
}

/**
 * LookBackSlider component
 *
 * This component renders a slider to select the version of a service instance.
 * The slider shows the latest version first and allows the user to select a version to use as the entry point for diagnosis.
 *
 * @props {Object} props - The properties passed to the LookBackSlider component.
 * @prop {number} instanceVersion - The latest version available for the service instance.
 * @prop {number} initialLookBehind - The initial version to be selected on the slider.
 * @prop {Function} setSelectedVersion - The function to call when the selected version changes.
 *
 * @returns {React.FC} The rendered LookBackSlider component.
 */
export const LookBackSlider: React.FC<Props> = ({
  instanceVersion,
  initialLookBehind,
  setSelectedVersion,
}) => {
  const [valueContinuous, setValueContinuous] = useState(initialLookBehind);
  const [inputValueContinuous, setInputValueContinuous] =
    useState(initialLookBehind);
  const handleChange = (
    _event: SliderOnChangeEvent,
    value: number,
    inputValue?: number,
    setLocalInputValue?: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    let newValue;

    if (inputValue === undefined) {
      newValue = value;
    } else {
      if (inputValue > instanceVersion - 1) {
        newValue = instanceVersion - 1;
        if (setLocalInputValue) {
          setLocalInputValue(instanceVersion - 1);
        }
      } else if (inputValue < 1) {
        newValue = 1;
        if (setLocalInputValue) {
          setLocalInputValue(1);
        }
      } else {
        newValue = inputValue;
      }
    }
    setInputValueContinuous(newValue);
    setValueContinuous(newValue);
  };

  return (
    <Flex gap={{ default: "gapSm" }} direction={{ default: "column" }}>
      <FlexItem>
        <Content component="h2">{words("diagnose.slider.title")}</Content>
        <Content component="small">
          {words("diagnose.slider.description")}
        </Content>
      </FlexItem>
      <FlexItem>
        <Flex alignItems={{ default: "alignItemsCenter" }}>
          <FlexItem
            flex={{ default: "flex_2" }}
            spacer={{ default: "spacerSm" }}
          >
            <Slider
              value={valueContinuous}
              inputValue={inputValueContinuous}
              isInputVisible
              onChange={handleChange}
              min={1}
              max={instanceVersion - 1}
              step={1}
              showTicks
              aria-label="LookBack-Slider"
            />
          </FlexItem>
          <FlexItem flex={{ default: "flex_4" }}></FlexItem>
        </Flex>
      </FlexItem>
      <FlexItem>
        <Button
          variant="primary"
          onClick={() => setSelectedVersion(valueContinuous)}
        >
          {words("diagnose.action")}
        </Button>
      </FlexItem>
    </Flex>
  );
};
