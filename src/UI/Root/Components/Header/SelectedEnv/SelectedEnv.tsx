import React, { useContext } from "react";
import { Text } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";

export const SelectedEnv: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const selected = environmentHandler.useSelected();
  return selected !== undefined ? (
    <Text>Current env: {selected?.name}</Text>
  ) : null;
};
