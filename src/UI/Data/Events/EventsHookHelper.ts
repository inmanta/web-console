import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
  InstanceEvent,
} from "@/Core";
import { useEffect } from "react";

export class EventsHookHelper implements HookHelper<Query.InstanceEventsQuery> {
  constructor(
    private readonly dataManager: DataManager<
      RemoteData.Type<string, InstanceEvent[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query.InstanceEventsQuery): void {
    const handler = async () => {
      this.dataManager.update(query);
    };

    useEffect(() => {
      this.dataManager.initialize(query.qualifier.id);
      this.subscriptionController.subscribeTo(query.qualifier.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(query.qualifier.id);
      };
    }, [query.qualifier.id, query.qualifier.service_entity]);
  }

  useData(
    query: Query.InstanceEventsQuery
  ): RemoteData.Type<string, InstanceEvent[]> {
    return this.dataManager.get(query.qualifier.id);
  }

  trigger(query: Query.InstanceEventsQuery): void {
    this.subscriptionController.trigger(query.qualifier.id);
  }

  matches(query: Query.InstanceEventsQuery): boolean {
    return query.kind === "Events";
  }
}
