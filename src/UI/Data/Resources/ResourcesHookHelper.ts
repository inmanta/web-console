import {
  RemoteData,
  ResourceModel,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

export class ResourcesHookHelper implements HookHelper<"Resources"> {
  constructor(
    private readonly dataManager: DataManager<"Resources">,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(qualifier: Query.Qualifier<"Resources">): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
    };

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(qualifier.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(qualifier.id);
      };
    }, [qualifier.id, qualifier.version]);
  }

  useData(
    qualifier: Query.Qualifier<"Resources">
  ): RemoteData.Type<string, ResourceModel[]> {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<"Resources">): void {
    this.subscriptionController.trigger(qualifier.id);
  }

  matches(query: Query.SubQuery<"Resources">): boolean {
    return query.kind === "Resources";
  }
}
