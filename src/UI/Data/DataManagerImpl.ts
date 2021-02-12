import {
  RemoteData,
  DataManager,
  Query,
  ResourceModel,
  SubscriptionController,
  EntityManager,
} from "@/Core";
import { useEffect } from "react";

export class DataManagerImpl implements DataManager {
  constructor(
    private readonly resourceEntityManager: EntityManager<
      RemoteData.Type<string, ResourceModel[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query): void {
    switch (query.kind) {
      case "Resources":
        const handler = async () => {
          this.resourceEntityManager.update(query);
        };

        useEffect(() => {
          this.resourceEntityManager.initialize(query.qualifier.id);
          this.subscriptionController.subscribeTo(query.qualifier.id, handler);
          return () => {
            this.subscriptionController.unsubscribeFrom(query.qualifier.id);
          };
        }, [query.qualifier.id]);
    }
  }

  useData(query: Query): RemoteData.Type<string, ResourceModel[]> {
    switch (query.kind) {
      case "Resources":
        return this.resourceEntityManager.get(query.qualifier.id);
    }
  }
}
