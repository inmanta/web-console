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
} from "@/Core";
import { GetInstanceResources } from "@/Core/Query/GetInstanceResources";
import { Data } from "@/Data/Managers/Helpers/QueryManager/types";
import { DependencyContext } from "@/UI/Dependency";
import { urlEncodeParams } from "../Helpers/QueryManager/utils";

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
    private readonly scheduler: Scheduler,
    private readonly retryLimit: number = 20
  ) {}

  /**
   * @TODO implement this for the retry callback
   */
  private async update(
    query: Query.SubQuery<"GetInstanceResources">,
    url: string,
    environment: string
  ): Promise<void> {
    const response = await this.apiHelper.getWithHTTPCode(url, environment);
    if (Either.isRight(response)) {
      // Return success
    }
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      query,
      environment
    );
  }

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
    retries: number
  ): Promise<
    RemoteData.RemoteData<
      Query.Error<"GetInstanceResources">,
      Query.ApiResponse<"GetInstanceResources">
    >
  > {
    const resources = await this.getResources(query, environment);
    if (Either.isRight(resources)) {
      return RemoteData.success(resources.value);
    }

    if (Either.isLeft(resources) && resources.value.status !== 409) {
      return RemoteData.failed(resources.value.message);
    }

    if (retries >= this.retryLimit) {
      return RemoteData.failed("Retry limit reached.");
    }

    const instance = await this.getInstance(
      query.service_entity,
      query.id,
      environment
    );

    if (Either.isLeft(instance)) {
      return RemoteData.failed(instance.value);
    }

    const nextQuery = { ...query, version: instance.value.data.version };

    return this.getEventualData(nextQuery, environment, retries + 1);
  }

  useContinuous(query: GetInstanceResources): Data<"GetInstanceResources"> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const url = this.getUrl(urlEncodeParams(query));

    const task: Task<
      RemoteData.RemoteData<
        Query.Error<"GetInstanceResources">,
        Query.ApiResponse<"GetInstanceResources">
      >
    > = {
      effect: async () => this.getEventualData(query, environment, 0),
      update: (data) => {
        this.stateHelper.set(data, query, environment);
      },
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query, environment);
      (async () => {
        this.stateHelper.set(
          await this.getEventualData(query, environment, 0),
          query,
          environment
        );
      })();
      this.scheduler.register(this.getUnique(query), task);

      return () => {
        this.scheduler.unregister(this.getUnique(query));
      };
    }, [environment]);

    return [
      this.stateHelper.getHooked(query, environment),
      () => this.update(query, url, environment),
    ];
  }

  matches(
    query: Query.SubQuery<"GetInstanceResources">,
    kind: QueryManagerKind
  ): boolean {
    return query.kind === "GetInstanceResources" && kind === "Continuous";
  }
}
