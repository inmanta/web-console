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
  const { compareSelection: selection } = useContext(GetDesiredStatesContext);

  if (isDisabled) return <DisabledAction />;

  if (Maybe.isNone(selection))
    return <InitialCompareAction version={version} />;

  if (version === selection.value) return <ClearSelectionForCompareAction />;

  return (
    <CompareWithSelectedAction
      version={version}
      sourceVersion={selection.value}
    />
  );
};

const DisabledAction: React.FC = () => (
  <DropdownItem icon={<BalanceScaleIcon />} isDisabled>
    {words("desiredState.compare.action.compare")}
  </DropdownItem>
);

const InitialCompareAction: React.FC<{ version: number }> = ({ version }) => {
  const { setCompareSelection } = useContext(GetDesiredStatesContext);

  const onClick = () => {
    setCompareSelection(Maybe.some(version));
  };

  return (
    <DropdownItem onClick={onClick} icon={<BalanceScaleIcon />}>
      {words("desiredState.compare.action.compare")}
    </DropdownItem>
  );
};

const ClearSelectionForCompareAction: React.FC = () => {
  const { setCompareSelection } = useContext(GetDesiredStatesContext);

  const onClick = () => {
    setCompareSelection(Maybe.none());
  };

  return (
    <DropdownItem onClick={onClick} icon={<BalanceScaleIcon />}>
      {words("desiredState.compare.action.clearSelection")}
    </DropdownItem>
  );
};

const CompareWithSelectedAction: React.FC<{
  sourceVersion: number;
  version: number;
}> = ({ sourceVersion, version }) => {
  const navigateTo = useNavigateTo();
  const onClick = () => {
    navigateTo("DesiredStateCompare", {
      targetVersion: version.toString(),
      sourceVersion: sourceVersion.toString(),
    });
  };

  return (
    <DropdownItem onClick={onClick} icon={<BalanceScaleIcon />}>
      {words("desiredState.compare.action.compareWith")(
        sourceVersion.toString(),
        version.toString()
      )}
    </DropdownItem>
  );
};
