import { EnvironmentHandlerContext, words } from "@/UI";
import { ErrorView } from "@/UI/Components";
import React, { useContext } from "react";
import { EnvironmentSettings } from "./EnvironmentSettings";

export const Tab: React.FC = () => {
  const { environmentHandler } = useContext(EnvironmentHandlerContext);
  const selected = environmentHandler.useSelected();
  return !selected ? (
    <ErrorView
      aria-label="Environment-Failed"
      message={words("error.environment.missing")}
    />
  ) : (
    <EnvironmentSettings
      aria-label="Environment-Success"
      environment={selected}
    />
  );
};
