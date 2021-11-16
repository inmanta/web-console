/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  OneTimeQueryManager,
  QueryManagerKind,
  StateHelper,
  ApiHelper,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { Data, GetDependenciesWithEnv, GetUrlWithEnv, ToUsed } from "./types";

export class PrimaryOneTimeQueryManagerWithEnv<Kind extends Query.Kind>
  implements OneTimeQueryManager<Kind>
{
  constructor(
    protected readonly apiHelper: ApiHelper,
    protected readonly stateHelper: StateHelper<Kind>,
    private readonly getDependencies: GetDependenciesWithEnv<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: GetUrlWithEnv<Kind>,
    private readonly toUsed: ToUsed<Kind>
  ) {}

  async update(
    query: Query.SubQuery<Kind>,
    url: string,
    environment: string
  ): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.get(url, environment)),
      query
    );
  }

  useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const [url, setUrl] = useState(this.getUrl(query, environment));

    useEffect(() => {
      setUrl(this.getUrl(query, environment));
    }, this.getDependencies(query, environment));

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query);
      this.update(query, url, environment);
    }, [url, environment]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.stateHelper.getHooked(query)
      ),
      () => this.update(query, url, environment),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "OneTime";
  }
}
