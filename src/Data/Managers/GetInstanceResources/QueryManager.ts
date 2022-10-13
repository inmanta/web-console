import { useContext, useEffect } from "react";
import {
  Scheduler,
  ApiHelper,
  ContinuousQueryManager,
  QueryManagerKind,
  Query,
  RemoteData,
  StateHelperWithEnv,
  Either,
  ErrorWithHTTPCode,
  Task,
  PageSize,
} from "@/Core";
import { GetInstanceResources } from "@/Core/Query/GetInstanceResources";
import { Data } from "@/Data/Managers/Helpers/QueryManager/types";
import { DependencyContext } from "@/UI/Dependency";

interface ResponseGroup {
  resources: RemoteData.RemoteData<
    Query.Error<"GetInstanceResources">,
    Query.ApiResponse<"GetInstanceResources">
  >;
  instance?: Query.UsedData<"GetServiceInstance">;
}

/* eslint-disable react-hooks/exhaustive-deps */

/**
 * @param {number} retryLimit The amount of times the queryManager will retry
 * after the first failed request. So with a retryLimit of 2, there will be
 * an initial request followed by 2 retries. This makes a total of 3 requests.
 */
export function InstanceResourcesQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<"GetInstanceResources">,
  instancesStateHelper: StateHelperWithEnv<"GetServiceInstances">,
  scheduler: Scheduler,
  retryLimit = 20
): ContinuousQueryManager<"GetInstanceResources"> {
  async function getResources(
    query: Query.SubQuery<"GetInstanceResources">,
    environment: string
  ): Promise<
    Either.Either<ErrorWithHTTPCode, Query.ApiResponse<"GetInstanceResources">>
  > {
    return apiHelper.getWithHTTPCode<Query.ApiResponse<"GetInstanceResources">>(
      getUrl(query),
      environment
    );
  }

  async function getInstance(
    serviceEntity: string,
    id: string,
    environment: string
  ) {
    return apiHelper.get<Query.ApiResponse<"GetServiceInstance">>(
      `/lsm/v1/service_inventory/${serviceEntity}/${id}`,
      environment
    );
  }

  function getUrl({
    service_entity,
    id,
    version,
  }: Query.SubQuery<"GetInstanceResources">) {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`;
  }

  function getUnique({ kind, id }: Query.SubQuery<"GetInstanceResources">) {
    return `${kind}_${id}`;
  }

  async function getEventualData(
    query: Query.SubQuery<"GetInstanceResources">,
    environment: string,
    retries: number,
    instance?: Query.UsedData<"GetServiceInstance">
  ): Promise<ResponseGroup> {
    const resources = await getResources(query, environment);

    if (Either.isRight(resources)) {
      return { resources: RemoteData.success(resources.value), instance };
    }

    if (Either.isLeft(resources) && resources.value.status !== 409) {
      return { resources: RemoteData.failed(resources.value.message) };
    }

    if (retries >= retryLimit) {
      return { resources: RemoteData.failed("Retry limit reached.") };
    }

    const instanceResult = await getInstance(
      query.service_entity,
      query.id,
      environment
    );

    if (Either.isLeft(instanceResult)) {
      return { resources: RemoteData.failed(instanceResult.value) };
    }

    const nextQuery = { ...query, version: instanceResult.value.data.version };

    return getEventualData(
      nextQuery,
      environment,
      retries + 1,
      instanceResult.value.data
    );
  }

  function useContinuous(
    query: GetInstanceResources
  ): Data<"GetInstanceResources"> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const task: Task<ResponseGroup> = {
      effect: async () => getEventualData(query, environment, 0),
      update: ({ resources, instance }) => {
        stateHelper.set(resources, query, environment);
        updateInstance(instance, query.service_entity, environment);
      },
    };

    useEffect(() => {
      stateHelper.set(RemoteData.loading(), query, environment);
      (async () => {
        const { resources, instance } = await getEventualData(
          query,
          environment,
          0
        );
        stateHelper.set(resources, query, environment);
        updateInstance(instance, query.service_entity, environment);
      })();
      scheduler.register(getUnique(query), task);

      return () => {
        scheduler.unregister(getUnique(query));
      };
    }, [environment]);

    return [stateHelper.getHooked(query, environment), () => undefined];
  }

  function updateInstance(
    latest: Query.UsedData<"GetServiceInstance"> | undefined,
    serviceEntity: string,
    environment: string
  ) {
    if (latest === undefined) return;

    const currentState = instancesStateHelper.getOnce(
      {
        kind: "GetServiceInstances",
        name: serviceEntity,
        pageSize: PageSize.initial,
      },
      environment
    );
    if (RemoteData.isSuccess(currentState)) {
      const updatedState = currentState.value.data.map((instance) =>
        instance.id === latest.id ? latest : instance
      );
      instancesStateHelper.set(
        {
          value: { ...currentState.value, data: updatedState },
          kind: "Success",
        },
        {
          kind: "GetServiceInstances",
          name: serviceEntity,
          pageSize: PageSize.initial,
        },
        environment
      );
    }
  }

  function matches(
    query: Query.SubQuery<"GetInstanceResources">,
    kind: QueryManagerKind
  ): boolean {
    return query.kind === "GetInstanceResources" && kind === "Continuous";
  }
  return {
    useContinuous,
    matches,
  };
}
