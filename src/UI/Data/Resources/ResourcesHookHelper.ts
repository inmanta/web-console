import {
  RemoteData,
  ResourceModel,
  SubscriptionController,
  EntityManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

export class ResourcesHookHelper implements HookHelper<Query.ResourcesQuery> {
  constructor(
    private readonly entityManager: EntityManager<
      RemoteData.Type<string, ResourceModel[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query.ResourcesQuery): void {
    const handler = async () => {
      this.entityManager.update(query);
    };

    useEffect(() => {
      this.entityManager.initialize(query.qualifier.id);
      this.subscriptionController.subscribeTo(query.qualifier.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(query.qualifier.id);
      };
    }, [query.qualifier.id]);
  }

  useData(
    query: Query.ResourcesQuery
  ): RemoteData.Type<string, ResourceModel[]> {
    return this.entityManager.get(query.qualifier.id);
  }

  matches(query: Query.ResourcesQuery): boolean {
    return query.kind === "Resources";
  }
}
