import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { BalanceScaleIcon } from "@patternfly/react-icons";
import { Maybe } from "@/Core";
import { useNavigateTo } from "@/UI/Routing";
import { GetDesiredStatesContext } from "../GetDesiredStatesContext";

interface Props {
  version: number;
}

export const CompareAction: React.FC<Props> = ({ version }) => {
  const { compareSelection: selection } = useContext(GetDesiredStatesContext);

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

const SelectForCompareAction: React.FC<Props> = ({ version }) => {
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

const UnselectForCompareAction: React.FC<Props> = ({ version }) => {
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
