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
  query: Query.SubQuery<Kind>,
  environment: string | undefined
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class PrimaryOneTimeQueryManager<Kind extends Query.Kind>
  implements OneTimeQueryManager<Kind>
{
  private readonly useEnvironment: () => string | undefined;

  constructor(
    protected readonly apiHelper: ApiHelper,
    protected readonly stateHelper: StateHelper<Kind>,
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

  async update(
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

  useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const environment = this.useEnvironment();
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
