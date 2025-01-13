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
 * @returns {JSX.Element} The rendered LookBackSlider component.
 */
export const LookBackSlider: React.FC<Props> = ({
  instanceVersion,
  initialLookBehind,
  setSelectedVersion,
}) => {
  const [sliderValue, setSliderValue] = useState(initialLookBehind);

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
              value={sliderValue}
              onChange={(_event: SliderOnChangeEvent, value: number) => {
                setSliderValue(value);
              }}
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
          onClick={() => setSelectedVersion(sliderValue)}
        >
          {words("diagnose.action")}
        </Button>
      </FlexItem>
    </Flex>
  );
};
