import {
  RemoteData,
  ResourceModel,
  SubscriptionController,
  EntityManager,
  ResourcesQuery,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

type Data = RemoteData.Type<string, ResourceModel[]>;

export class ResourcesHookHelper implements HookHelper<ResourcesQuery, Data> {
  constructor(
    private readonly entityManager: EntityManager<
      RemoteData.Type<string, ResourceModel[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: ResourcesQuery): void {
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

  useData(query: ResourcesQuery): Data {
    return this.entityManager.get(query.qualifier.id);
  }

  matches(query: ResourcesQuery): boolean {
    return query.kind === "Resources";
  }
}
