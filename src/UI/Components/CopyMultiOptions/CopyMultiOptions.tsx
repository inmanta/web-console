import React, { useState } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from "@patternfly/react-core";
import { CopyIcon } from "@patternfly/react-icons";
import copy from "copy-to-clipboard";
import styled from "styled-components";
import { words } from "@/UI";

interface Props {
  text?: string;
  options: string[];
  tooltipContent?: string;
  isDisabled?: boolean;
}

/**
 * Component that allows to copy one of the provided options to clipboard.
 *
 * @param {Props} props - The props for the CopyMultiOptions component.
 *  @prop {string} text - The text to display on the button.
 *  @prop {string[]} options - The list of options to copy.
 *  @prop {string} [tooltipContent] - The tooltip content. Default is "Copy".
 *  @prop {boolean} [isDisabled] - Whether the button is disabled. Default is false.
 *
 * @returns {React.ReactElement} The CopyMultiOptions component.
 */
export const CopyMultiOptions: React.FC<Props> = ({
  options,
  tooltipContent,
  isDisabled,
  text = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const tooltipText = copied
    ? words("copy.feedback")
    : tooltipContent || words("copy");

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Handles the selection of an option and copies it to the clipboard.
   */
  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    // copy value to clipboard
    copy(String(value));
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1000);
  };

  /**
   * Renders the toggle button.
   *
   * @param {React.Ref<MenuToggleElement>} toggleRef - The reference to the toggle button.
   * @returns {React.ReactElement} The rendered toggle button.
   */
  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      onClick={onToggleClick}
      isDisabled={isDisabled}
      ref={toggleRef}
      variant="plain"
      isExpanded={isOpen}
      aria-label="Copy to clipboard"
    >
      {text}
      <CopyIcon />
    </MenuToggle>
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      toggle={toggle}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
    >
      <DropdownList>
        {options.map((value, index) => (
          <WidthLimitedTooltip
            key={index}
            content={<div>{tooltipText}</div>}
            entryDelay={200}
            position="right"
          >
            <DropdownItem value={value}>{value}</DropdownItem>
          </WidthLimitedTooltip>
        ))}
      </DropdownList>
    </Dropdown>
  );
};

const WidthLimitedTooltip = styled(Tooltip)`
  width: 150px;
`;
