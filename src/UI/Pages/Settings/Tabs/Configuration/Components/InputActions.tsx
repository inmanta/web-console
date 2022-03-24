import React from "react";
import { ActionList, ActionListItem, Button } from "@patternfly/react-core";
import { SaveIcon, UndoIcon } from "@patternfly/react-icons";
import { EnvironmentSettings } from "@/Core";

type Info<Properties extends keyof EnvironmentSettings.InputInfo> = Pick<
  EnvironmentSettings.InputInfo,
  Properties
>;

interface Props {
  info: Info<"value" | "initial" | "update" | "reset" | "default">;
}

export const InputActions: React.FC<Props> = ({ info }) => (
  <ActionList>
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
  <Button
    variant="secondary"
    aria-label="SaveAction"
    onClick={() => info.update(info.value as never)}
    icon={<SaveIcon />}
  >
    Save
  </Button>
);

const InputResetAction: React.FC<{
  info: Info<"reset">;
}> = ({ info }) => (
  <Button
    variant="tertiary"
    aria-label="ResetAction"
    onClick={() => info.reset()}
  >
    <UndoIcon /> Reset
  </Button>
);
