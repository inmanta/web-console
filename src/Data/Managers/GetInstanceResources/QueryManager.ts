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
} from "@/Core";
import { GetInstanceResources } from "@/Core/Query/GetInstanceResources";
import { Data } from "@/Data/Managers/Helpers/QueryManager/types";
import { DependencyContext } from "@/UI/Dependency";
import { urlEncodeParams } from "../Helpers/QueryManager/utils";

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

export class InstanceResourcesQueryManager
  implements ContinuousQueryManager<"GetInstanceResources">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<"GetInstanceResources">,
    private readonly scheduler: Scheduler
  ) {}

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

  useContinuous(query: GetInstanceResources): Data<"GetInstanceResources"> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const url = this.getUrl(urlEncodeParams<"GetInstanceResources">(query));

    // const task = {
    //   effect: async () =>
    //     RemoteData.fromEither(await this.apiHelper.get(url, environment)),
    //   update: (data) => this.stateHelper.set(data, query, environment),
    // };

    // Do the request
    // If successful, do the scheduling
    // If not, fetch instance,
    //         if that fails, show error
    //         else fetch resources with latest data
    //              if that succeeds, show success, start scheduling
    //              else restart loop

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query, environment);
      const whatever = async () => {
        const response = await this.apiHelper.getWithHTTPCode<
          Query.ApiResponse<"GetInstanceResources">
        >(url, environment);
        if (Either.isLeft(response)) {
          if (response.value.status === 409) {
            const instanceResponse = await this.getInstance(
              query.service_entity,
              query.id,
              environment
            );
            if (Either.isLeft(instanceResponse)) {
              this.stateHelper.set(
                RemoteData.failed(instanceResponse.value),
                query,
                environment
              );
            } else {
              const secondRequest = await this.apiHelper.getWithHTTPCode<
                Query.ApiResponse<"GetInstanceResources">
              >(
                this.getUrl({
                  ...query,
                  version: instanceResponse.value.data.version,
                }),
                environment
              );
              if (Either.isRight(secondRequest)) {
                this.stateHelper.set(
                  RemoteData.success(secondRequest.value),
                  query,
                  environment
                );
              }
            }
          }
        }
      };
      whatever();
      // this.scheduler.register(this.getUnique(query), task);
      // return () => {
      //   this.scheduler.unregister(this.getUnique(query));
      // };
    }, [environment]);

    return [
      this.stateHelper.getHooked(query, environment),
      () => this.update(query, url, environment),
    ];
  }

  private async getInitialData(
    query: Query.SubQuery<"GetInstanceResources">,
    environment: string
  ) {
    const response = await this.apiHelper.getWithHTTPCode<
      Query.ApiResponse<"GetInstanceResources">
    >(this.getUrl(query), environment);
    if (Either.isLeft(response) && response.value.status === 409) {
      const instanceResponse = await this.getInstance(
        query.service_entity,
        query.id,
        environment
      );
      if (Either.isLeft(instanceResponse)) {
        this.stateHelper.set(
          RemoteData.failed(instanceResponse.value),
          query,
          environment
        );
      } else {
        const secondRequest = await this.apiHelper.getWithHTTPCode<
          Query.ApiResponse<"GetInstanceResources">
        >(
          this.getUrl({
            ...query,
            version: instanceResponse.value.data.version,
          }),
          environment
        );
        if (Either.isRight(secondRequest)) {
          this.stateHelper.set(
            RemoteData.success(secondRequest.value),
            query,
            environment
          );
        }
      }
    } else {
      this.stateHelper.set(
        RemoteData.fromEither(
          Either.mapLeft((error) => error.message, response)
        ),
        query,
        environment
      );
    }
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

  matches(
    query: Query.SubQuery<"GetInstanceResources">,
    kind: QueryManagerKind
  ): boolean {
    return query.kind === "GetInstanceResources" && kind === "Continuous";
  }

  getUrl({
    service_entity,
    id,
    version,
  }: Query.SubQuery<"GetInstanceResources">) {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/resources?current_version=${version}`;
  }

  getUnique({ kind, id }: Query.SubQuery<"GetInstanceResources">) {
    return `${kind}_${id}`;
  }
}
