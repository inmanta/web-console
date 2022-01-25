import React, { ReactElement, useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownToggleAction,
  DropdownItem,
  Spinner,
} from "@patternfly/react-core";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { words } from "@/UI/words";

interface Data {
  data: RemoteData.RemoteData<undefined, boolean>;
}

interface Props extends Data {
  onRecompile(): void;
  onUpdateAndRecompile(): void;
}

export const CompileWidget: React.FC<Props> = ({
  data,
  onRecompile,
  onUpdateAndRecompile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Widget
      label={<Label data={data} />}
      isDisabled={!RemoteData.isSuccess(data) || data.value}
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onToggle={(open: boolean) => setIsOpen(open)}
      onRecompile={onRecompile}
      onUpdateAndRecompile={onUpdateAndRecompile}
    />
  );
};

const Label: React.FC<Data> = ({ data }) =>
  RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <>
          {words("loading")} <StyledSpinner isSVG size="sm" />
        </>
      ),
      failed: () => null,
      success: (isCompiling) =>
        isCompiling ? (
          <>
            {words("common.compileWidget.compiling")}
            <StyledSpinner isSVG size="sm" />
          </>
        ) : (
          <>{words("common.compileWidget.recompile")}</>
        ),
    },
    data
  );

const StyledSpinner = styled(Spinner)`
  --pf-c-spinner--Color: var(--pf-global--Color--100);
  margin-left: 8px;
`;

interface WidgetProps {
  label: ReactElement;
  isDisabled: boolean;
  isOpen: boolean;
  onSelect(): void;
  onToggle(open: boolean): void;
  onRecompile(): void;
  onUpdateAndRecompile(): void;
}

export const Widget: React.FC<WidgetProps> = ({
  label,
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
          <DropdownToggleAction
            key="action"
            onClick={onRecompile}
            aria-label="RecompileButton"
            isDisabled={isDisabled}
          >
            {label}
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
        {words("common.compileWidget.updateAndRecompile")}
      </DropdownItem>,
    ]}
  />
);
