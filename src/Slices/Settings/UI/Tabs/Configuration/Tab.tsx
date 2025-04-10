import React from "react";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Provider } from "./Provider";
import { useGetEnvironmentSettings } from "@/Data/Managers/V2/Environment/GetEnvironmentSettings";

interface Props {
  environmentId: string;
}

export const Tab: React.FC<Props> = ({ environmentId }) => {
  const {
    data: settings,
    isError,
    error,
    refetch,
    isSuccess,
  } = useGetEnvironmentSettings().useOneTime(environmentId);

  if (isError) {
    return (
      <ErrorView ariaLabel="EnvironmentSettings-Failed" message={error.message} retry={refetch} />
    );
  }

  if (isSuccess) {
    return <Provider settings={settings} />;
  }

  return <LoadingView ariaLabel="EnvironmentSettings-Loading" />;
};
