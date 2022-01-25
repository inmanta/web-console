import React, { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownToggleAction,
  DropdownItem,
  Spinner,
} from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData } from "@/Core";

const recompile = "Recompile";
const updateAndRecompile = "Update project & recompile";

interface Props {
  compiling: RemoteData.RemoteData<undefined, boolean>;
  onRecompile(): void;
  onUpdateAndRecompile(): void;
}

export const CompileWidget: React.FC<Props> = ({
  compiling,
  onRecompile,
  onUpdateAndRecompile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const onToggle = (open: boolean) => setIsOpen(open);
  const onSelect = () => setIsOpen(false);
  const isDisabled = !RemoteData.isSuccess(compiling) || compiling.value;
  return (
    <Dropdown
      aria-label="CompileWidget"
      onSelect={onSelect}
      toggle={
        <DropdownToggle
          aria-label="Toggle"
          splitButtonItems={[
            <DropdownToggleAction
              key="action"
              onClick={onRecompile}
              aria-label="RecompileButton"
              isDisabled={isDisabled}
            >
              {RemoteData.isLoading(compiling) ? (
                <>
                  Compiling <StyledSpinner isSVG size="sm" />
                </>
              ) : (
                recompile
              )}
            </DropdownToggleAction>,
          ]}
          splitButtonVariant="action"
          onToggle={onToggle}
          isDisabled={isDisabled}
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
          {updateAndRecompile}
        </DropdownItem>,
      ]}
    />
  );
};

const StyledSpinner = styled(Spinner)`
  --pf-c-spinner--Color: var(--pf-global--Color--100);
  margin-left: 8px;
`;
