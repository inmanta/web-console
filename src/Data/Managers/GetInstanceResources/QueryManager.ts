import { useContext, useEffect } from "react";
import {
  Scheduler,
  ApiHelper,
  ContinuousQueryManager,
  QueryManagerKind,
  Query,
  RemoteData,
  StateHelperWithEnv,
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

    const task = {
      effect: async () =>
        RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      update: (data) => this.stateHelper.set(data, query, environment),
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query, environment);
      this.update(
        query,
        this.getUrl(urlEncodeParams<"GetInstanceResources">(query)),
        environment
      );
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
