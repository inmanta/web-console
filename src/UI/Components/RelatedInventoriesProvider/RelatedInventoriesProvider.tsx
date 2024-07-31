import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import {
  Inventories,
  useGetRelatedInventories,
} from "@/Data/Managers/V2/GetRelatedInventories";
import { DependencyContext, words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { findInterServiceRelations } from "../Diagram/helpers";

interface Props {
  serviceModels: ServiceModel[];
  mainService: ServiceModel;
  Dependant: React.FC<{
    services: ServiceModel[];
    mainService: ServiceModel;
    relatedInventories: Inventories;
  }>;
}

/**
 * Renders the RelatedInventoriesProvider component.
 * It serves purpose to extract the data fetching logic and provide the required service inventories data for the Dependent
 *
 * @param {ServiceModel[]} ServiceModels - The Array of all Service Models.
 * @param {ServiceModel} mainService - The main service model used by Dependant.
 * @param {React.FC} Dependant - The Component that depends it's lifecycle on the instance data.
 * @returns {JSX.Element} The rendered RelatedInventoriesProvider component.
 */
export const RelatedInventoriesProvider: React.FC<Props> = ({
  serviceModels,
  mainService,
  Dependant,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const relatedCatalogsNames = findInterServiceRelations(mainService);
  const relatedServiceModels = serviceModels.filter((service) =>
    relatedCatalogsNames?.includes(service.name),
  );

  const { data, isError, isSuccess, error, refetch } = useGetRelatedInventories(
    relatedCatalogsNames || [],
    environment,
  ).useOneTime();

  if (isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(error.message)}
        aria-label="RelatedInventoriesProvider-failed"
        retry={refetch}
      />
    );
  }

  if (isSuccess) {
    return (
      <Dependant
        services={relatedServiceModels.concat(mainService)}
        mainService={mainService}
        relatedInventories={data}
      />
    );
  }

  return <LoadingView aria-label="RelatedInventoriesProvider-loading" />;
};
