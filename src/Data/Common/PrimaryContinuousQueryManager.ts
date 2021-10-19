/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import {
  RemoteData,
  Query,
  ContinuousQueryManager,
  QueryManagerKind,
  StateHelper,
  Scheduler,
  ApiHelper,
} from "@/Core";
import { useEffect, useState } from "react";

type GetUnique<Kind extends Query.Kind> = (
  query: Query.SubQuery<Kind>
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  query: Query.SubQuery<Kind>
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class PrimaryContinuousQueryManager<Kind extends Query.Kind>
  implements ContinuousQueryManager<Kind>
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly scheduler: Scheduler,
    private readonly getUnique: GetUnique<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (query: Query.SubQuery<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>,
    private readonly environment: string
  ) {}

  async update(query: Query.SubQuery<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, this.environment)),
      query
    );
  }

  useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(query));

    useEffect(() => {
      setUrl(this.getUrl(query));
    }, this.getDependencies(query));

    const task = {
      effect: async () =>
        RemoteData.fromEither(await this.apiHelper.get(url, this.environment)),
      update: (data) => this.stateHelper.set(data, query),
    };

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query);
      this.update(query, url);
      this.scheduler.register(this.getUnique(query), task);
      return () => {
        this.scheduler.unregister(this.getUnique(query));
      };
    }, [url, this.environment]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.stateHelper.getHooked(query)
      ),
      () => this.update(query, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "Continuous";
  }
}
