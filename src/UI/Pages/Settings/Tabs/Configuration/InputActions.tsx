import React from "react";
import styled from "styled-components";
import {
  CheckIcon,
  UndoIcon,
  ClipboardCheckIcon,
} from "@patternfly/react-icons";
import {
  ActionList,
  ActionListItem,
  Button,
  InputGroupText,
  Tooltip,
} from "@patternfly/react-core";
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
      <InputDefaultStatus info={info} />
    </ActionListItem>
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
      variant={info.value === info.initial ? "plain" : "link"}
      aria-label="Save"
      onClick={() => info.update(info.value as never)}
      isDisabled={info.value === info.initial}
    >
      <CheckIcon />
    </Button>
  </Tooltip>
);

const InputResetAction: React.FC<{
  info: Info<"reset">;
}> = ({ info }) => (
  <Tooltip content={words("settings.tabs.configuration.reset")}>
    <Button variant="plain" aria-label="Reset" onClick={() => info.reset()}>
      <UndoIcon />
    </Button>
  </Tooltip>
);

const InputDefaultStatus: React.FC<{
  info: Info<"value" | "default">;
}> = ({ info }) => (
  <PaddedInputGroupText aria-label="default" variant="plain">
    <Tooltip
      content={words("settings.tabs.configuration.default")(
        typeof info.default === "object" ? "object" : info.default.toString()
      )}
    >
      <DefaultIcon $isDisabled={info.value !== info.default} />
    </Tooltip>
  </PaddedInputGroupText>
);

const PaddedInputGroupText = styled(InputGroupText)`
  padding: 6px 16px;
`;

const DefaultIcon = styled(ClipboardCheckIcon)<{
  $isDisabled?: boolean;
}>`
  opacity: ${(p) => (p.$isDisabled ? "0.2" : "1")};
`;
