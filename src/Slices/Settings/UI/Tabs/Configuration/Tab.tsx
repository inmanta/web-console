import React from "react";
import { useGetEnvironmentSettings } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { Provider } from "./Provider";

interface Props {
  environmentId: string;
}

/**
 * Configuration tab for the Settings page
 *
 * @returns {React.FC} The Configuration tab
 */
export const Tab: React.FC<Props> = ({ environmentId }) => {
  const { data, isSuccess, isError, error, refetch } =
    useGetEnvironmentSettings(environmentId).useOneTime();

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
