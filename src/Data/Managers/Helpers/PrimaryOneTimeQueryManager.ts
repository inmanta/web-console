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

type GetDependencies<Kind extends Query.Kind> = (
  query: Query.SubQuery<Kind>
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class PrimaryOneTimeQueryManager<Kind extends Query.Kind>
  implements OneTimeQueryManager<Kind>
{
  constructor(
    protected readonly apiHelper: ApiHelper,
    protected readonly stateHelper: StateHelper<Kind>,
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

  useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environment } = this;
    const [url, setUrl] = useState(this.getUrl(query));

    useEffect(() => {
      setUrl(this.getUrl(query));
    }, this.getDependencies(query));

    useEffect(() => {
      this.stateHelper.set(RemoteData.loading(), query);
      this.update(query, url);
    }, [url, environment]);

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
