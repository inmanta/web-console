import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { BalanceScaleIcon } from "@patternfly/react-icons";
import { Maybe } from "@/Core";
import { useNavigateTo } from "@/UI/Routing";
import { GetDesiredStatesContext } from "../GetDesiredStatesContext";

interface Props {
  version: number;
  isDisabled?: boolean;
}

export const CompareAction: React.FC<Props> = ({ version, isDisabled }) => {
  const { compareSelection: selection } = useContext(GetDesiredStatesContext);

  if (isDisabled) return <DisabledAction version={version} />;

  if (Maybe.isNone(selection))
    return <SelectForCompareAction version={version} />;

  if (version === selection.value)
    return <UnselectForCompareAction version={version} />;

  return (
    <CompareWithSelectedAction
      version={version}
      sourceVersion={selection.value}
    />
  );
};

const DisabledAction: React.FC<{ version: number }> = ({ version }) => (
  <DropdownItem icon={<BalanceScaleIcon />} isDisabled>
    Select {version} for compare
  </DropdownItem>
);

const SelectForCompareAction: React.FC<{ version: number }> = ({ version }) => {
  const { setCompareSelection } = useContext(GetDesiredStatesContext);

  const onClick = () => {
    setCompareSelection(Maybe.some(version));
  };

  return (
    <DropdownItem onClick={onClick} icon={<BalanceScaleIcon />}>
      Select {version} for compare
    </DropdownItem>
  );
};

const UnselectForCompareAction: React.FC<{ version: number }> = ({
  version,
}) => {
  const { setCompareSelection } = useContext(GetDesiredStatesContext);

  const onClick = () => {
    setCompareSelection(Maybe.none());
  };

  return (
    <DropdownItem onClick={onClick} icon={<BalanceScaleIcon />}>
      Unselect {version} for compare
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
      Compare {version} against {sourceVersion}
    </DropdownItem>
  );
};
