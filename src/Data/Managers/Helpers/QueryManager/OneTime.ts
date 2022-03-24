/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  OneTimeQueryManager,
  QueryManagerKind,
  StateHelper,
  ApiHelper,
} from "@/Core";
import { GetDependencies, Data, GetUrl, ToUsed } from "./types";
import { urlEncodeParams } from "./utils";

export class OneTime<Kind extends Query.Kind>
  implements OneTimeQueryManager<Kind>
{
  constructor(
    protected readonly apiHelper: ApiHelper,
    protected readonly stateHelper: StateHelper<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: GetUrl<Kind>,
    private readonly toUsed: ToUsed<Kind>,
    private readonly strategy: "MERGE" | "RELOAD"
  ) {}

  async update(query: Query.SubQuery<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      RemoteData.fromEither(await this.apiHelper.getWithoutEnvironment(url)),
      query
    );
  }

  useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(urlEncodeParams(query)));

    useEffect(() => {
      setUrl(this.getUrl(urlEncodeParams(query)));
    }, this.getDependencies(query));

    useEffect(() => {
      if (
        this.strategy === "RELOAD" ||
        RemoteData.isNotAsked(this.stateHelper.getOnce(query))
      ) {
        this.stateHelper.set(RemoteData.loading(), query);
      }
      this.update(query, url);
    }, [url]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.stateHelper.getHooked(query)
      ),
      () => this.update(query, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "OneTime";
  }
}
