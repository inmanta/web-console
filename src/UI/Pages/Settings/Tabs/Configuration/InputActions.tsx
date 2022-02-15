import React from "react";
import {
  ActionList,
  ActionListItem,
  Button,
  Tooltip,
} from "@patternfly/react-core";
import { SaveIcon, UndoIcon } from "@patternfly/react-icons";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI/words";

type Info<Properties extends keyof EnvironmentSettings.InputInfo> = Pick<
  EnvironmentSettings.InputInfo,
  Properties
>;

interface Props {
  info: Info<"value" | "initial" | "update" | "reset" | "default">;
}

export const InputActions: React.FC<Props> = ({ info }) => (
  <ActionList isIconList>
    <ActionListItem>
      <InputUpdateAction info={info} />
    </ActionListItem>
    <ActionListItem>
      <InputResetAction info={info} />
    </ActionListItem>
  </ActionList>
);

const InputUpdateAction: React.FC<{
  info: Info<"value" | "initial" | "update">;
}> = ({ info }) => (
  <Tooltip content={words("settings.tabs.configuration.save")}>
    <Button
      variant="link"
      aria-label="SaveAction"
      onClick={() => info.update(info.value as never)}
      icon={<SaveIcon />}
    >
      Save
    </Button>
  </Tooltip>
);

const InputResetAction: React.FC<{
  info: Info<"reset">;
}> = ({ info }) => (
  <Tooltip content={words("settings.tabs.configuration.reset")}>
    <Button
      variant="plain"
      aria-label="ResetAction"
      onClick={() => info.reset()}
    >
      <UndoIcon /> Reset
    </Button>
  </Tooltip>
);
