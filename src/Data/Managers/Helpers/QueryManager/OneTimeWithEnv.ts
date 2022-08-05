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
  ApiHelper,
  StateHelperWithEnv,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { Data, GetDependenciesWithEnv, GetUrlWithEnv, ToUsed } from "./types";
import { usePrevious } from "./usePrevious";
import { urlEncodeParams } from "./utils";

export class OneTimeWithEnv<Kind extends Query.Kind>
  implements OneTimeQueryManager<Kind>
{
  constructor(
    protected readonly apiHelper: ApiHelper,
    protected readonly stateHelper: StateHelperWithEnv<Kind>,
    private readonly getDependencies: GetDependenciesWithEnv<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: GetUrlWithEnv<Kind>,
    private readonly toUsed: ToUsed<Kind>,
    private readonly strategy: "MERGE" | "RELOAD" = "RELOAD"
  ) {}

  async update(
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

  useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const [url, setUrl] = useState(
      this.getUrl(urlEncodeParams(query), environment)
    );
    const previousEnvironment = usePrevious(environment);

    useEffect(() => {
      setUrl(this.getUrl(urlEncodeParams(query), environment));
    }, this.getDependencies(query, environment));

    useEffect(() => {
      if (
        this.strategy === "RELOAD" ||
        RemoteData.isNotAsked(this.stateHelper.getOnce(query, environment))
      ) {
        this.stateHelper.set(RemoteData.loading(), query, environment);
      }
      // If the environment changed, use the url derived from the query
      // Otherwise the url has changed, use it to not lose e.g. paging state
      const urlToUse =
        environment !== previousEnvironment
          ? this.getUrl(urlEncodeParams(query), environment)
          : url;
      this.update(query, urlToUse, environment);
    }, [url, environment]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.stateHelper.getHooked(query, environment)
      ),
      () => this.update(query, url, environment),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "OneTime";
  }
}
