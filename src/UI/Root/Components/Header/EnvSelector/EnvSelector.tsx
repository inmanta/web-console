import React, { useContext } from "react";
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownSeparator,
  DropdownToggle,
  Tooltip,
} from "@patternfly/react-core";
import styled from "styled-components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  searchValue: string;
  onSearchInputChange: (value: string) => void;
  items: string[];
  onSelect: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleText: string;
}

export const EnvSelector: React.FC<Props> = ({
  items,
  onSelect,
  isOpen,
  setIsOpen,
  toggleText,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const envs = [
    <DropdownGroup label={words("home.environment.selector")} key="envs-group">
      {items.map((item, index) => (
        <StyledItem onClick={() => onSelect(item)} key={`env-${index}-${item}`}>
          {item.split(" ")[0].length > 22
            ? item.split(" ")[0].slice(18) + "..."
            : item.split(" ")[0]}
        </StyledItem>
      ))}
    </DropdownGroup>,
  ];
  //add footer at the end
  envs.push(
    <div key="overview-link">
      <StyledSeparator />
      <Tooltip content={words("home.navigation.tooltip")}>
        <StyledItem href={routeManager.getUrl("Home", undefined)}>
          {words("home.navigation.button")}
        </StyledItem>
      </Tooltip>
    </div>
  );
  return (
    <StyledDropdown
      isOpen={isOpen}
      toggle={
        <StyledToggle id="toggle-button" onToggle={() => setIsOpen(!isOpen)}>
          Environment: {toggleText.split(" ")[0] + "..."}
        </StyledToggle>
      }
      dropdownItems={envs}
    />
  );
};

const StyledDropdown = styled(Dropdown)`
  height: 100%;
  --pf-c-dropdown--m-expanded__toggle--before--BorderBottomWidth: 4px;
  --pf-c-dropdown__toggle--before--BorderRightColor: #666768;
  --pf-c-dropdown__toggle--before--BorderLeftColor: #666768;
  --pf-c-dropdown__toggle--PaddingRight: 1rem;
  --pf-c-dropdown__toggle--PaddingLeft: 1rem;
`;
const StyledToggle = styled(DropdownToggle)`
  height: 100%;
  max-width: 260px;
  min-width: 260px;
  &::before {
    border-top: 0;
  }
`;
const StyledItem = styled(DropdownItem)`
  max-width: 260px;
  min-width: 260px;
`;
const StyledSeparator = styled(DropdownSeparator)`
  padding: 0 15px;
  margin: 10px 0 5px !important;
`;
