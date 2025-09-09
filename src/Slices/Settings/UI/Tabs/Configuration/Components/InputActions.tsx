import React from "react";
import { ActionList, ActionListItem, Button } from "@patternfly/react-core";
import { SaveIcon, UndoIcon } from "@patternfly/react-icons";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI";

interface Props {
  info: EnvironmentSettings.InputInfo;
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
  info: EnvironmentSettings.InputInfo;
}> = ({ info }) => (
  <Button
    variant="secondary"
    isDisabled={info.protected}
    aria-label="SaveAction"
    onClick={() => info.update(info.value as never)}
    icon={<SaveIcon />}
  >
    {words("save")}
  </Button>
);

const InputResetAction: React.FC<{
  info: EnvironmentSettings.InputInfo;
}> = ({ info }) => (
  <Button
    isDisabled={info.protected}
    icon={<UndoIcon />}
    variant="tertiary"
    aria-label="ResetAction"
    onClick={() => info.reset()}
  >
    {words("reset")}
  </Button>
);
