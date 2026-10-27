import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { GetDesiredStatesContext } from "@S/DesiredState/UI/GetDesiredStatesContext";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { Link } from "@inmanta/web-console-ui/Components/Link";
import { sanitizeFromTo } from "./fromTo";

interface Props {
  version: number;
  isDisabled?: boolean;
}

export const CompareAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { compareSelection, setCompareSelection } = useContext(GetDesiredStatesContext);

  return (
    <>
      <DropdownItem
        onClick={isDisabled ? undefined : () => setCompareSelection(version)}
        isDisabled={isDisabled}
      >
        {words("desiredState.compare.action.compare")}
      </DropdownItem>
      <CompareWithSelected selection={compareSelection} version={version} isDisabled={isDisabled} />
      <CompareWithCurrentState version={version.toString()} />
    </>
  );
};

interface CompareWithSelectedProps {
  version: number;
  selection: number | undefined;
  isDisabled?: boolean;
}

const CompareWithSelected: React.FC<CompareWithSelectedProps> = ({
  selection,
  version,
  isDisabled,
}) => {
  const { routeManager } = useContext(DependencyContext);

  if (isDisabled || selection === undefined || selection === version) {
    return (
      <DropdownItem isDisabled>
        {words("desiredState.compare.action.compareWithSelected")}
      </DropdownItem>
    );
  }

  return (
    <DropdownItem>
      <Link
        pathname={routeManager.getUrl("DesiredStateCompare", sanitizeFromTo(selection, version))}
      >
        {words("desiredState.compare.action.compareWithSelected")}
      </Link>
    </DropdownItem>
  );
};

const CompareWithCurrentState: React.FC<{ version: string }> = ({ version }) => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <DropdownItem>
      <Link
        pathname={routeManager.getUrl("ComplianceCheck", {
          version,
        })}
      >
        {words("desiredState.compare.action.compareWithCurrentState")}
      </Link>
    </DropdownItem>
  );
};
