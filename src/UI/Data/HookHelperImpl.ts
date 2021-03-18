import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect, useState } from "react";

type GetUnique<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => (string | number | boolean)[];

type Data<Kind extends Query.Kind> = [
  RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>,
  () => void
];

export class HookHelperImpl<Kind extends Query.Kind>
  implements HookHelper<Kind> {
  constructor(
    private readonly dataManager: DataManager<Kind>,
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

  useOnce(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(qualifier));

    useEffect(() => {
      setUrl(this.getUrl(qualifier));
    }, this.getDependencies(qualifier));

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.dataManager.update(qualifier, url);
    }, [url]);

    return [
      RemoteData.mapSuccess(
        (d) => this.toUsed(d, setUrl),
        this.dataManager.get(qualifier)
      ),
      () => this.dataManager.update(qualifier, url),
    ];
  }

  useSubscription(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    const [url, setUrl] = useState(this.getUrl(qualifier));

    useEffect(() => {
      setUrl(this.getUrl(qualifier));
    }, this.getDependencies(qualifier));

    const handler = async () => {
      this.dataManager.update(qualifier, url);
    };

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(
        this.getUnique(qualifier),
        handler
      );
      return () => {
        this.subscriptionController.unsubscribeFrom(this.getUnique(qualifier));
      };
    }, [url]);

    return [
      RemoteData.mapSuccess(
        (data) => this.toUsed(data, setUrl),
        this.dataManager.get(qualifier)
      ),
      () => this.dataManager.update(qualifier, url),
    ];
  }

  matches(query: Query.SubQuery<Kind>): boolean {
    return query.kind === this.kind;
  }
}
