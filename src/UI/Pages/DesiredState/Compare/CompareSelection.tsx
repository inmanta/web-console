import React, { useContext } from "react";
import { Button } from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { useNavigateTo } from "@/UI/Routing";
import { GetDesiredStatesContext } from "../GetDesiredStatesContext";

export const CompareSelectionInput: React.FC = () => {
  const { compareSelection: selection } = useContext(GetDesiredStatesContext);

  if (Maybe.isNone(selection)) return <p>selected: none</p>;
  return <p>selected: {selection.value}</p>;
};

interface Props {
  version: number;
}

export const CompareAction: React.FC<Props> = ({ version }) => {
  const { compareSelection: selection } = useContext(GetDesiredStatesContext);

  if (Maybe.isNone(selection))
    return <SelectForCompareAction version={version} />;
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

  return <Button onClick={onClick}>Select for compare</Button>;
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

  return <Button onClick={onClick}>Compare with {sourceVersion}</Button>;
};
