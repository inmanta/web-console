import { useContext, useEffect } from "react";
import {
  ApiHelper,
  Query,
  Either,
  RemoteData,
  ServiceInstanceModel,
  StateHelperWithEnv,
  OneTimeQueryManager,
} from "@/Core";
import { Type } from "@/Core/Language/Either";
import { DependencyContext } from "@/UI";

type Data = RemoteData.Type<
  Query.Error<"GetInstanceWithRelations">,
  Query.UsedData<"GetInstanceWithRelations">
>;

export function GetInstanceWithRelationsQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetInstanceWithRelations">
): OneTimeQueryManager<"GetInstanceWithRelations"> {
  function getInstanceUrl({
    id,
  }: Query.SubQuery<"GetInstanceWithRelations">): string {
    return `/lsm/v1/service_inventory?service_id=${id}&include_deployment_progress=false&exclude_read_only_attributes=false`;
  }

  function getInstanceWithRelationsUrl({
    service_entity,
    id,
  }: Query.SubQuery<"GetServiceInstance">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}?include_deployment_progress=false&exclude_read_only_attributes=false&include_referenced_by=true`;
  }

  function initialize(
    query: Query.SubQuery<"GetInstanceWithRelations">,
    environment
  ): void {
    const value = stateHelper.getOnce(query, environment);
    if (RemoteData.isNotAsked(value)) {
      stateHelper.set(RemoteData.loading(), query, environment);
    }
  }

  async function update(
    query: Query.SubQuery<"GetInstanceWithRelations">,
    environment: string
  ): Promise<void> {
    const instance = await getInstanceWithRelations(query, environment);
    //stateHelper implementation interfaces want to get direct api response which is transformed,
    //decided to set is a any to avoid having separate implementation just for this call
    stateHelper.set(
      RemoteData.fromEither(
        instance as unknown as Type<string, { data: ServiceInstanceModel }>
      ),
      query,
      environment
    );
  }

  async function getInstanceWithRelations(
    query: Query.SubQuery<"GetInstanceWithRelations">,
    environment: string
  ) {
    const relatedInstances: ServiceInstanceModel[] = [];

    const instance = await apiHelper.get<
      Query.ApiResponse<"GetInstanceWithRelations">
    >(getInstanceUrl(query), environment);

    if (Either.isRight(instance)) {
      const instanceWithReferences = await apiHelper.get<
        Query.ApiResponse<"GetServiceInstance">
      >(
        getInstanceWithRelationsUrl({
          service_entity: instance.value.data.service_entity,
          kind: "GetServiceInstance",
          id: query.id,
        }),
        environment
      );

      if (Either.isRight(instanceWithReferences)) {
        if (instanceWithReferences.value.data.referenced_by !== null) {
          await Promise.all(
            instanceWithReferences.value.data.referenced_by.map(
              async (relatedId) => {
                const nestedInstance = await getInstanceWithRelations(
                  { kind: "GetInstanceWithRelations", id: relatedId },
                  environment
                );

                relatedInstances.push(
                  nestedInstance.value as unknown as ServiceInstanceModel
                );
              }
            )
          );
        }
      }

      return RemoteData.success({
        instance: instance.value,
        relatedInstances,
      });
    }

    return RemoteData.failed({
      instance: instance,
      relatedInstances,
    });
  }

  function useOneTime(
    query: Query.SubQuery<"GetInstanceWithRelations">
  ): [Data, () => void] {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const { id } = query;

    useEffect(() => {
      initialize(query, environment);
      update(query, environment);
    }, [id, environment]); /* eslint-disable-line react-hooks/exhaustive-deps */

    return [
      stateHelper.useGetHooked(query, environment),
      () => update(query, environment),
    ];
  }

  function matches(query: Query.SubQuery<"GetInstanceWithRelations">): boolean {
    return query.kind === "GetInstanceWithRelations";
  }
  return {
    useOneTime,
    matches,
  };
}
