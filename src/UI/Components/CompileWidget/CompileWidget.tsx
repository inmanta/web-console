import React, { useState } from "react";
import {
  Dropdown,
  DropdownList,
  MenuToggle,
  Tooltip,
  MenuToggleAction,
  MenuToggleElement,
  DropdownItem,
} from "@patternfly/react-core";
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
    onOpenChange={(value) => onToggle(value)}
    toggle={(toggleref: React.Ref<MenuToggleElement>) => (
      <MenuToggle
        aria-label="Toggle"
        variant="primary"
        ref={toggleref}
        isExpanded={isOpen}
        splitButtonOptions={{
          variant: "action",
          items: [
            <MenuToggleAction
              key="action"
              onClick={onRecompile}
              aria-label="RecompileButton"
              isDisabled={isDisabled}
            >
              {words("common.compileWidget.recompile")}
            </MenuToggleAction>,
          ],
        }}
        onClick={(value) => onToggle(value)}
      />
    )}
    isOpen={isOpen}
  >
    <DropdownList>
      <DropdownItem
        aria-label="UpdateAndRecompileButton"
        key="action"
        component="button"
        onClick={onUpdateAndRecompile}
        isDisabled={isDisabled}
      >
        {words("common.compileWidget.updateAndRecompile")}
      </DropdownItem>
    </DropdownList>
  </Dropdown>
);
