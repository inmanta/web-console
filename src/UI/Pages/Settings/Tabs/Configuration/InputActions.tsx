import React from "react";
import { EnvironmentSettings } from "@/Core";
import { Button, InputGroupText, Tooltip } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { CheckIcon, RedoIcon } from "@patternfly/react-icons";
import { DefaultIcon } from "./DefaultIcon";

type Info<Properties extends keyof EnvironmentSettings.InputInfo> = Pick<
  EnvironmentSettings.InputInfo,
  Properties
>;

export const InputUpdateAction: React.FC<{
  info: Info<"value" | "initial" | "update">;
}> = ({ info }) => (
  <Tooltip content={words("settings.tabs.configuration.save")}>
    <Button
      variant={info.value === info.initial ? "plain" : "link"}
      aria-label="Save"
      onClick={() => info.update(info.value as never)}
      isDisabled={info.value === info.initial}
    >
      <CheckIcon />
    </Button>
  </Tooltip>
);

export const InputResetAction: React.FC<{
  info: Info<"value" | "default" | "reset">;
}> = ({ info }) => (
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
);

export const InputDefaultStatus: React.FC<{
  info: Info<"value" | "default">;
}> = ({ info }) => (
  <InputGroupText aria-label="default" variant="plain">
    <Tooltip
      content={words("settings.tabs.configuration.default")(
        info.default.toString()
      )}
    >
      <DefaultIcon $isDisabled={info.value !== info.default} />
    </Tooltip>
  </InputGroupText>
);
