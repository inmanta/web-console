import {
  RemoteData,
  ResourceModel,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

export class ResourcesHookHelper implements HookHelper<Query.ResourcesQuery> {
  constructor(
    private readonly dataManager: DataManager<
      RemoteData.Type<string, ResourceModel[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query.ResourcesQuery): void {
    const handler = async () => {
      this.dataManager.update(query);
    };

    useEffect(() => {
      this.dataManager.initialize(query.qualifier.id);
      this.subscriptionController.subscribeTo(query.qualifier.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(query.qualifier.id);
      };
    }, [query.qualifier.id]);
  }

  useData(
    query: Query.ResourcesQuery
  ): RemoteData.Type<string, ResourceModel[]> {
    return this.dataManager.get(query.qualifier.id);
  }

  trigger(query: Query.ResourcesQuery): void {
    this.subscriptionController.trigger(query.qualifier.id);
  }

  matches(query: Query.ResourcesQuery): boolean {
    return query.kind === "Resources";
  }
}
