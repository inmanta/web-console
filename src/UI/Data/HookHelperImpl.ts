import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

type GetUnique<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => string;

type GetDependencies<Kind extends Query.Kind> = (
  qualifier: Query.Qualifier<Kind>
) => (string | number | boolean)[];

type Data<Kind extends Query.Kind> = RemoteData.Type<
  Query.Error<Kind>,
  Query.Data<Kind>
>;

export class HookHelperImpl<Kind extends Query.Kind>
  implements HookHelper<Kind> {
  constructor(
    private readonly dataManager: DataManager<Kind>,
    private readonly subscriptionController: SubscriptionController,
    private readonly getUnique: GetUnique<Kind>,
    private readonly getDependencies: GetDependencies<Kind>,
    private readonly kind: Kind
  ) {}

  useSubscription(qualifier: Query.Qualifier<Kind>): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
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
    }, this.getDependencies(qualifier));
  }

  useData(qualifier: Query.Qualifier<Kind>): Data<Kind> {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<Kind>): void {
    this.subscriptionController.trigger(this.getUnique(qualifier));
  }

  matches(query: Query.SubQuery<Kind>): boolean {
    return query.kind === this.kind;
  }
}
