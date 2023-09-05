import React, { useState } from "react";
import { Tooltip } from "@patternfly/react-core";
import {
  Dropdown,
  DropdownToggle,
  DropdownToggleAction,
  DropdownItem,
} from "@patternfly/react-core/deprecated";
import styled from "styled-components";
import { words } from "@/UI/words";

interface Props {
  onRecompile(): void;
  onUpdateAndRecompile(): void;
  isDisabled?: boolean;
  hint?: string;
}

export const CompileWidget: React.FC<Props> = ({
  onRecompile,
  onUpdateAndRecompile,
  isDisabled,
  hint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const widget = (
    <Widget
      isDisabled={isDisabled}
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onToggle={(open: boolean) => setIsOpen(open)}
      onRecompile={onRecompile}
      onUpdateAndRecompile={onUpdateAndRecompile}
    />
  );

  return hint ? <Tooltip content={hint}>{widget}</Tooltip> : widget;
};

interface WidgetProps {
  isDisabled?: boolean;
  isOpen: boolean;
  onSelect(): void;
  onToggle(open: boolean): void;
  onRecompile(): void;
  onUpdateAndRecompile(): void;
}

const Widget: React.FC<WidgetProps> = ({
  isDisabled,
  isOpen,
  onSelect,
  onToggle,
  onRecompile,
  onUpdateAndRecompile,
}) => (
  <Dropdown
    aria-label="CompileWidget"
    onSelect={onSelect}
    toggle={
      <DropdownToggle
        aria-label="Toggle"
        splitButtonItems={[
          <StyledDropdownToggleAction
            key="action"
            onClick={onRecompile}
            aria-label="RecompileButton"
            isDisabled={isDisabled}
          >
            {words("common.compileWidget.recompile")}
          </StyledDropdownToggleAction>,
        ]}
        splitButtonVariant="action"
        onToggle={onToggle}
        toggleVariant="primary"
      />
    }
    isOpen={isOpen}
    dropdownItems={[
      <DropdownItem
        aria-label="UpdateAndRecompileButton"
        key="action"
        component="button"
        onClick={onUpdateAndRecompile}
        isDisabled={isDisabled}
      >
        {words("common.compileWidget.updateAndRecompile")}
      </DropdownItem>,
    ]}
  />
);

const StyledDropdownToggleAction = styled(DropdownToggleAction)`
  width: 120px;
`;
