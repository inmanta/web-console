/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  ContinuousQueryManager,
  QueryManagerKind,
  StateHelper,
  Scheduler,
  ApiHelper,
} from "@/Core";

type GetUnique<Kind extends Query.Kind> = (
  query: Query.SubQuery<Kind>,
  environment: string | undefined
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  query: Query.SubQuery<Kind>,
  environment: string | undefined
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class PrimaryContinuousQueryManager<Kind extends Query.Kind>
  implements ContinuousQueryManager<Kind>
{
  private readonly useEnvironment: () => string | undefined;

  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUnique<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (
      query: Query.SubQuery<Kind>,
      environment: string | undefined
    ) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>,
    useEnvironment?: () => string
  ) {
    this.useEnvironment = useEnvironment || (() => undefined);
  }

  private async update(
    query: Query.SubQuery<Kind>,
    url: string,
    environment?: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(
        environment
          ? await this.apiHelper.get(url, environment)
          : await this.apiHelper.getWithoutEnvironment(url)
      ),
      query
    );
  }

  useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const environment = this.useEnvironment();
    const [url, setUrl] = useState(this.getUrl(query, environment));

    useEffect(() => {
      setUrl(this.getUrl(query, environment));
    }, this.getDependencies(query, environment));

    const task = {
      effect: async () =>
        RemoteData.fromEither(
          environment
            ? await this.apiHelper.get(url, environment)
            : await this.apiHelper.getWithoutEnvironment(url)
        ),
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
