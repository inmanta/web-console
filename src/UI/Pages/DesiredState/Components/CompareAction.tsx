import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { BalanceScaleIcon } from "@patternfly/react-icons";
import { Maybe } from "@/Core";
import { GetDesiredStatesContext } from "@/UI/Pages/DesiredState/GetDesiredStatesContext";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";

interface Props {
  version: number;
  isDisabled?: boolean;
}

export const CompareAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { compareSelection, setCompareSelection } = useContext(
    GetDesiredStatesContext
  );

  return (
    <>
      <DropdownItem
        onClick={
          isDisabled
            ? undefined
            : () => setCompareSelection(Maybe.some(version))
        }
        icon={<BalanceScaleIcon />}
        isDisabled={isDisabled}
      >
        {words("desiredState.compare.action.compare")}
      </DropdownItem>
      <CompareWithSelected
        selection={compareSelection}
        version={version}
        isDisabled={isDisabled}
      />
    </>
  );
};

interface CompareWithSelectedProps {
  version: number;
  selection: Maybe.Maybe<number>;
  isDisabled?: boolean;
}

const CompareWithSelected: React.FC<CompareWithSelectedProps> = ({
  selection,
  version,
  isDisabled,
}) => {
  const navigateTo = useNavigateTo();

  if (
    isDisabled ||
    Maybe.isNone(selection) ||
    (Maybe.isSome(selection) && selection.value === version)
  ) {
    return (
      <DropdownItem isDisabled icon={<BalanceScaleIcon />}>
        {words("desiredState.compare.action.compareWith")}
      </DropdownItem>
    );
  }

  return (
    <DropdownItem
      onClick={() =>
        navigateTo("DesiredStateCompare", {
          targetVersion: version.toString(),
          sourceVersion: selection.value.toString(),
        })
      }
      icon={<BalanceScaleIcon />}
    >
      {words("desiredState.compare.action.compareWith")}
    </DropdownItem>
  );
};
