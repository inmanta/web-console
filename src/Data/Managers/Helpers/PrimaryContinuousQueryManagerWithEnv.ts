/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  ContinuousQueryManager,
  QueryManagerKind,
  StateHelper,
  Scheduler,
  ApiHelper,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { GetDependencies, Data, GetUnique } from "./types";

export class PrimaryContinuousQueryManagerWithEnv<Kind extends Query.Kind>
  implements ContinuousQueryManager<Kind>
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUnique<Kind, true>,
    private readonly getDependencies: GetDependencies<Kind, true>,
    private readonly kind: Kind,
    private readonly getUrl: (
      query: Query.SubQuery<Kind>,
      environment: string
    ) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>
  ) {}

  private async update(
    query: Query.SubQuery<Kind>,
    url: string,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      query
    );
  }

  useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const [url, setUrl] = useState(this.getUrl(query, environment));

    useEffect(() => {
      setUrl(this.getUrl(query, environment));
    }, this.getDependencies(query, environment));

    const task = {
      effect: async () =>
        RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      update: (data) => this.stateHelper.set(data, query),
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query);
      this.update(query, url, environment);
      this.scheduler.register(this.getUnique(query, environment), task);
      return () => {
        this.scheduler.unregister(this.getUnique(query, environment));
      };
    }, [url, environment]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.stateHelper.getHooked(query)
      ),
      () => this.update(query, url, environment),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "Continuous";
  }
}
