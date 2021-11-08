import { FlatEnvironment } from "@/Core";
import React from "react";
import { EnvironmentSettings } from "./EnvironmentSettings";

interface Props {
  environment: FlatEnvironment;
}

export const Tab: React.FC<Props> = ({ environment }) => (
  <EnvironmentSettings
    aria-label="Environment-Success"
    environment={environment}
  />
);
