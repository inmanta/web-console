import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import { useGetAllServiceModels } from "@/Data/Managers/V2/GetAllServiceModels";
import {} from "@/Data/Managers/V2/GetRelatedInventories";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";

interface Props {
  serviceName: string;
  Dependant: React.FC<{ services: ServiceModel[]; mainService: ServiceModel }>;
}

/**
 * Renders the ServicesWithMainProvider component.
 * It serves purpose to extract the data fetching logic and provide the required service model data for the Dependent
 *
 * @param {string} serviceName - The service model name.
 * @param {React.FC} Dependant - The Component that depends it's lifecycle on the service model data.
 * @returns {JSX.Element} The rendered ServicesWithMainProvider component.
 */
export const ServicesWithMainProvider: React.FC<Props> = ({
  serviceName,
  Dependant,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const { data, isError, isSuccess, error, refetch } =
    useGetAllServiceModels(environment).useOneTime();

  if (isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(error.message)}
        aria-label="ServicesWithMainProvider-failed"
        retry={refetch}
      />
    );
  }

  if (isSuccess) {
    const mainService = data.find((service) => service.name === serviceName);

    return mainService ? (
      <Dependant services={data} mainService={mainService} />
    ) : (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("provider.noMainService")(serviceName)}
        aria-label="ServicesWithMainProvider-NoMAinService"
        retry={refetch}
      />
    );
  }

  return <LoadingView aria-label="ServicesWithMainProvider-loading" />;
};
