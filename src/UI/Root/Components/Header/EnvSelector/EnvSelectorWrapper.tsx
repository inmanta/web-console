import React, { useContext, useEffect, useState } from "react";
import { EnvSelector } from "./EnvSelector";
import { EnvSelectorOpenContext } from "./EnvSelectorOpenContext";

interface Props {
  selectorItems: EnvironmentSelectorItem[];
  onSelectEnvironment: (selectedProjectAndEnvironment: EnvironmentSelectorItem) => void;
  defaultToggleText: string;
}

export interface EnvironmentSelectorItem {
  displayName: string;
  projectId: string;
  environmentId: string;
  icon?: string;
}

export const EnvSelectorWrapper: React.FC<Props> = ({
  selectorItems,
  onSelectEnvironment,
  defaultToggleText,
}) => {
  const { isOpen, setIsOpen } = useContext(EnvSelectorOpenContext);
  const [toggleText, setToggleText] = useState(defaultToggleText);

  useEffect(() => {
    setToggleText(defaultToggleText);
  }, [defaultToggleText]);

  const onSelect = (value: string) => {
    setIsOpen(false);

    const matchingEnvItem = selectorItems.find((envItem) => envItem.displayName === value);

    if (matchingEnvItem) {
      setToggleText(value);
      onSelectEnvironment(matchingEnvItem);
    }
  };

  return (
    <EnvSelector
      items={selectorItems}
      onSelect={onSelect}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      toggleText={toggleText}
    />
  );
};
