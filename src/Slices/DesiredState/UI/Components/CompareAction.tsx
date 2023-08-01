import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "@S/DesiredState/UI/GetDesiredStatesContext";
import { sanitizeFromTo } from "./fromTo";

interface Props {
  version: number;
  isDisabled?: boolean;
}

export const CompareAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { compareSelection, setCompareSelection } = useContext(
    GetDesiredStatesContext,
  );

  return (
    <>
      <DropdownItem
        onClick={
          isDisabled
            ? undefined
            : () => setCompareSelection(Maybe.some(version))
        }
        isDisabled={isDisabled}
      >
        {words("desiredState.compare.action.compare")}
      </DropdownItem>
      <CompareWithSelected
        selection={compareSelection}
        version={version}
        isDisabled={isDisabled}
      />
      <CompareWithCurrentState version={version.toString()} />
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
  const { routeManager } = useContext(DependencyContext);

  if (
    isDisabled ||
    Maybe.isNone(selection) ||
    (Maybe.isSome(selection) && selection.value === version)
  ) {
    return (
      <DropdownItem isDisabled>
        {words("desiredState.compare.action.compareWithSelected")}
      </DropdownItem>
    );
  }

  return (
    <DropdownItem
      component={
        <Link
          pathname={routeManager.getUrl(
            "DesiredStateCompare",
            sanitizeFromTo(selection.value, version),
          )}
        >
          {words("desiredState.compare.action.compareWithSelected")}
        </Link>
      }
    />
  );
};

const CompareWithCurrentState: React.FC<{ version: string }> = ({
  version,
}) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <DropdownItem
      component={
        <Link
          pathname={routeManager.getUrl("ComplianceCheck", {
            version,
          })}
        >
          {words("desiredState.compare.action.compareWithCurrentState")}
        </Link>
      }
    />
  );
};
