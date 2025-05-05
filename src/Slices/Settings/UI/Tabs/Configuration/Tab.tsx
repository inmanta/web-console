import React from "react";
import { useGetEnvironmentSettings } from "@/Data/Managers/V2/Environment/GetEnvironmentSettings";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Provider } from "./Provider";
interface Props {
  environmentId: string;
}

/**
 * Configuration tab for the Settings page
 *
 * @returns {React.FC} The Configuration tab
 */
export const Tab: React.FC<Props> = () => {
  const { data, isSuccess, isError, error, refetch } = useGetEnvironmentSettings().useOneTime();

  if (isError) {
    return (
      <ErrorView message={error.message} retry={refetch} ariaLabel="EnvironmentSettings-Error" />
    );
  }

  if (isSuccess) {
    return <Provider settings={data} />;
  }

  return <LoadingView ariaLabel="EnvironmentSettings-Loading" />;
};
