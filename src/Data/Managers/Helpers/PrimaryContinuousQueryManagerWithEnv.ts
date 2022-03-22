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
  StateHelperWithEnv,
} from "@/Core";
import { DependencyContext } from "@/UI";
import {
  Data,
  GetUniqueWithEnv,
  GetDependenciesWithEnv,
  GetUrlWithEnv,
  ToUsed,
} from "./types";
import { usePrevious } from "./usePrevious";
import { urlEncodeParams } from "./utils";

export class PrimaryContinuousQueryManagerWithEnv<Kind extends Query.Kind>
  implements ContinuousQueryManager<Kind>
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUniqueWithEnv<Kind>,
    private readonly getDependencies: GetDependenciesWithEnv<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: GetUrlWithEnv<Kind>,
    private readonly toUsed: ToUsed<Kind>
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
    const [url, setUrl] = useState(
      this.getUrl(urlEncodeParams(query), environment)
    );
    const previousEnvironment = usePrevious(environment);

    useEffect(() => {
      setUrl(this.getUrl(urlEncodeParams(query), environment));
    }, this.getDependencies(query, environment));

    const task = {
      effect: async () =>
        RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      update: (data) => this.stateHelper.set(data, query),
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query);
      // If the environment changed, use the url derived from the query
      // Otherwise the url has changed, use it to not lose e.g. paging state
      const urlToUse =
        environment !== previousEnvironment
          ? this.getUrl(urlEncodeParams(query), environment)
          : url;
      this.update(query, urlToUse, environment);
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

export class PrimaryContinuousQueryManagerWithEnvWithStateHelperWithEnv<
  Kind extends Query.Kind
> implements ContinuousQueryManager<Kind>
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelperWithEnv<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUniqueWithEnv<Kind>,
    private readonly getDependencies: GetDependenciesWithEnv<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: GetUrlWithEnv<Kind>,
    private readonly toUsed: ToUsed<Kind>
  ) {}

  private async update(
    query: Query.SubQuery<Kind>,
    url: string,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      query,
      environment
    );
  }

  useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const [url, setUrl] = useState(
      this.getUrl(urlEncodeParams(query), environment)
    );
    const previousEnvironment = usePrevious(environment);

    useEffect(() => {
      setUrl(this.getUrl(urlEncodeParams(query), environment));
    }, this.getDependencies(query, environment));

    const task = {
      effect: async () =>
        RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      update: (data) => this.stateHelper.set(data, query, environment),
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query, environment);
      // If the environment changed, use the url derived from the query
      // Otherwise the url has changed, use it to not lose e.g. paging state
      const urlToUse =
        environment !== previousEnvironment
          ? this.getUrl(urlEncodeParams(query), environment)
          : url;
      this.update(query, urlToUse, environment);
      this.scheduler.register(this.getUnique(query, environment), task);
      return () => {
        this.scheduler.unregister(this.getUnique(query, environment));
      };
    }, [url, environment]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.stateHelper.getHooked(query, environment)
      ),
      () => this.update(query, url, environment),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "Continuous";
  }
}
