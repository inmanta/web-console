import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
  InstanceEvent,
} from "@/Core";
import { useEffect } from "react";

export class EventsHookHelper implements HookHelper<"Events"> {
  constructor(
    private readonly dataManager: DataManager<"Events">,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(qualifier: Query.Qualifier<"Events">): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
    };

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(qualifier.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(qualifier.id);
      };
    }, [qualifier.id, qualifier.service_entity]);
  }

  useData(
    qualifier: Query.Qualifier<"Events">
  ): RemoteData.Type<string, InstanceEvent[]> {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<"Events">): void {
    this.subscriptionController.trigger(qualifier.id);
  }

  matches(query: Query.SubQuery<"Events">): boolean {
    return query.kind === "Events";
  }
}
