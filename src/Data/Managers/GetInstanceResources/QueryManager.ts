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

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

/**
 * @param {number} retryLimit The amount of times the queryManager will retry
 * after the first failed request. So with a retryLimit of 2, there will be
 * an initial request followed by 2 retries. This makes a total of 3 requests.
 */
export class InstanceResourcesQueryManager
  implements ContinuousQueryManager<"GetInstanceResources">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<"GetInstanceResources">,
    private readonly instancesStateHelper: StateHelperWithEnv<"GetServiceInstances">,
    private readonly scheduler: Scheduler,
    private readonly retryLimit: number = 20
  ) {}

  private async getResources(
    query: Query.SubQuery<"GetInstanceResources">,
    environment: string
  ): Promise<
    Either.Either<ErrorWithHTTPCode, Query.ApiResponse<"GetInstanceResources">>
  > {
    return this.apiHelper.getWithHTTPCode<
      Query.ApiResponse<"GetInstanceResources">
    >(this.getUrl(query), environment);
  }

  private async getInstance(
    serviceEntity: string,
    id: string,
    environment: string
  ) {
    return this.apiHelper.get<Query.ApiResponse<"GetServiceInstance">>(
      `/lsm/v1/service_inventory/${serviceEntity}/${id}`,
      environment
    );
  }

  private getUrl({
    service_entity,
    id,
    version,
  }: Query.SubQuery<"GetInstanceResources">) {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`;
  }

  private getUnique({ kind, id }: Query.SubQuery<"GetInstanceResources">) {
    return `${kind}_${id}`;
  }

  private async getEventualData(
    query: Query.SubQuery<"GetInstanceResources">,
    environment: string,
    retries: number,
    instance?: Query.UsedData<"GetServiceInstance">
  ): Promise<ResponseGroup> {
    const resources = await this.getResources(query, environment);

    if (Either.isRight(resources)) {
      return { resources: RemoteData.success(resources.value), instance };
    }

    if (Either.isLeft(resources) && resources.value.status !== 409) {
      return { resources: RemoteData.failed(resources.value.message) };
    }

    if (retries >= this.retryLimit) {
      return { resources: RemoteData.failed("Retry limit reached.") };
    }

    const instanceResult = await this.getInstance(
      query.service_entity,
      query.id,
      environment
    );

    if (Either.isLeft(instanceResult)) {
      return { resources: RemoteData.failed(instanceResult.value) };
    }

    const nextQuery = { ...query, version: instanceResult.value.data.version };

    return this.getEventualData(
      nextQuery,
      environment,
      retries + 1,
      instanceResult.value.data
    );
  }

  useContinuous(query: GetInstanceResources): Data<"GetInstanceResources"> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const task: Task<ResponseGroup> = {
      effect: async () => this.getEventualData(query, environment, 0),
      update: ({ resources, instance }) => {
        this.stateHelper.set(resources, query, environment);
        this.updateInstance(instance, query.service_entity, environment);
      },
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query, environment);
      (async () => {
        const { resources, instance } = await this.getEventualData(
          query,
          environment,
          0
        );
        this.stateHelper.set(resources, query, environment);
        this.updateInstance(instance, query.service_entity, environment);
      })();
      this.scheduler.register(this.getUnique(query), task);

      return () => {
        this.scheduler.unregister(this.getUnique(query));
      };
    }, [environment]);

    return [this.stateHelper.getHooked(query, environment), () => undefined];
  }

  private updateInstance(
    latest: Query.UsedData<"GetServiceInstance"> | undefined,
    serviceEntity: string,
    environment: string
  ) {
    if (latest === undefined) return;

    const currentState = this.instancesStateHelper.getOnce(
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
      this.instancesStateHelper.set(
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

  matches(
    query: Query.SubQuery<"GetInstanceResources">,
    kind: QueryManagerKind
  ): boolean {
    return query.kind === "GetInstanceResources" && kind === "Continuous";
  }
}
