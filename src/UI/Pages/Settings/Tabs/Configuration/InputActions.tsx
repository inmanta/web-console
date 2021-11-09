import React from "react";
import {
  ActionList,
  ActionListItem,
  Button,
  InputGroupText,
  Tooltip,
} from "@patternfly/react-core";
import {
  CheckIcon,
  UndoIcon,
  ClipboardCheckIcon,
} from "@patternfly/react-icons";
import { isEqual } from "lodash";
import styled from "styled-components";
import { EnvironmentSettings } from "@/Core";
import { words } from "@/UI/words";

type Info<Properties extends keyof EnvironmentSettings.InputInfo> = Pick<
  EnvironmentSettings.InputInfo,
  Properties
>;

interface Props {
  info: Info<
    "value" | "initial" | "update" | "reset" | "default" | "isUpdateable"
  >;
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
  info: Info<"value" | "initial" | "update" | "isUpdateable">;
}> = ({ info }) => (
  <Tooltip content={words("settings.tabs.configuration.save")}>
    <Button
      variant={!info.isUpdateable(info) ? "plain" : "link"}
      aria-label="SaveAction"
      onClick={() => info.update(info.value as never)}
      isDisabled={!info.isUpdateable(info)}
    >
      <CheckIcon />
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
      <UndoIcon />
    </Button>
  </Tooltip>
);

const InputDefaultStatus: React.FC<{
  info: Info<"value" | "default">;
}> = ({ info }) => (
  <PaddedInputGroupText aria-label="DefaultStatus" variant="plain">
    <Tooltip
      content={words("settings.tabs.configuration.default")(
        typeof info.default === "object" ? "object" : info.default.toString()
      )}
    >
      <DefaultIcon $isDisabled={!isEqual(info.value, info.default)} />
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
