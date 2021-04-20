import {
  RemoteData,
  SubscriptionController,
  Query,
  OneTimeHookHelper,
  ContinuousHookHelper,
  HelperKind,
  Fetcher,
  StateHelper,
} from "@/Core";
import { useEffect, useState } from "react";

type GetUnique<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => (string | number | boolean | undefined)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class OneTimeHookHelperImpl<Kind extends Query.Kind>
  implements OneTimeHookHelper<Kind> {
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (qualifier: Query.Qualifier<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>
  ) {}

  initialize(qualifier: Query.Qualifier<Kind>): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(
        await this.fetcher.getData(qualifier.environment, url)
      )
    );
  }

  useOneTime(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(qualifier));

    useEffect(() => {
      setUrl(this.getUrl(qualifier));
    }, this.getDependencies(qualifier));

    useEffect(() => {
      this.initialize(qualifier);
      this.update(qualifier, url);
    }, [url, qualifier.environment]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.stateHelper.getHooked(qualifier)
      ),
      () => this.update(qualifier, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>, helperKind: HelperKind): boolean {
    return query.kind === this.kind && helperKind === "OneTime";
  }
}

export class ContinuousHookHelperImpl<Kind extends Query.Kind>
  implements ContinuousHookHelper<Kind> {
  constructor(
    private readonly fetcher: Fetcher<Kind>,
    private readonly stateHelper: StateHelper<Kind>,
    private readonly subscriptionController: SubscriptionController,
    private readonly getUnique: GetUnique<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind,
    private readonly getUrl: (qualifier: Query.Qualifier<Kind>) => string,
    private readonly toUsed: (
      data: Query.Data<Kind>,
      setUrl: (url: string) => void
    ) => Query.UsedData<Kind>
  ) {}

  initialize(qualifier: Query.Qualifier<Kind>): void {
    const value = this.stateHelper.getOnce(qualifier);
    if (RemoteData.isNotAsked(value)) {
      this.stateHelper.set(qualifier, RemoteData.loading());
    }
  }

  async update(qualifier: Query.Qualifier<Kind>, url: string): Promise<void> {
    this.stateHelper.set(
      qualifier,
      RemoteData.fromEither(
        await this.fetcher.getData(qualifier.environment, url)
      )
    );
  }

  useContinuous(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(qualifier));

    useEffect(() => {
      setUrl(this.getUrl(qualifier));
    }, this.getDependencies(qualifier));

    const handler = async () => {
      this.update(qualifier, url);
    };

    useEffect(() => {
      this.initialize(qualifier);
      this.subscriptionController.subscribeTo(
        this.getUnique(qualifier),
        handler
      );
      return () => {
        this.subscriptionController.unsubscribeFrom(this.getUnique(qualifier));
      };
    }, [url, qualifier.environment]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.stateHelper.getHooked(qualifier)
      ),
      () => this.subscriptionController.refresh(this.getUnique(qualifier)),
    ];
  }

  matches(query: Query.SubQuery<Kind>, helperKind: HelperKind): boolean {
    return query.kind === this.kind && helperKind === "Continuous";
  }
}
