import React, { useContext } from "react";
import {
  InstanceWithRelations,
  useGetInstanceWithRelations,
} from "@/Data/Managers/V2/GetInstanceWithRelations";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";

/**
 * Renders the InstanceWithRelationsProviderProvider component.
 * It serves purpose to extract the data fetching logic and provide the required instance data for the Dependent
 *
 * @param {string} instanceId - The ID of the instance.
 * @param {React.FC} Dependant - The Component that depends it's lifecycle on the instance data.
 * @returns {JSX.Element} The rendered InstanceWithRelationsProviderProvider component.
 */
export const InstanceWithRelationsProvider: React.FC<{
  instanceId: string;
  Dependant: React.FC<{
    instance: InstanceWithRelations;
  }>;
}> = ({ instanceId, Dependant }) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const { data, isError, isSuccess, error, refetch } =
    useGetInstanceWithRelations(instanceId, environment).useOneTime();

  if (isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(error.message)}
        aria-label="Instance_Provider-Failed"
        retry={refetch}
      />
    );
  }
  if (isSuccess) {
    return <Dependant instance={data} />;
  }
  return <LoadingView aria-label="Instance_Provider-Loading" />;
};
