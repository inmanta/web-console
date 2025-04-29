import React from "react";
import { useGetEnvironmentSettings } from "@/Data/Managers/V2/Environment";

export const SettingsProvider: React.FC = () => {
  useGetEnvironmentSettings().useOneTime();

  return <></>;
};
