import {
  RemoteData,
  ServiceInstanceModel,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

export class ServiceInstancesHookHelper
  implements HookHelper<Query.ServiceInstancesQuery> {
  constructor(
    private readonly dataManager: DataManager<
      RemoteData.Type<string, ServiceInstanceModel[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query.ServiceInstancesQuery): void {
    const handler = async () => {
      this.dataManager.update(query);
    };

    useEffect(() => {
      this.dataManager.initialize(query.qualifier.serviceName);
      this.subscriptionController.subscribeTo(
        query.qualifier.serviceName,
        handler
      );
      return () => {
        this.subscriptionController.unsubscribeFrom(
          query.qualifier.serviceName
        );
      };
    }, [query.qualifier.serviceName]);
  }

  useData(
    query: Query.ServiceInstancesQuery
  ): RemoteData.Type<string, ServiceInstanceModel[]> {
    return this.dataManager.get(query.qualifier.serviceName);
  }

  matches(query: Query.ResourcesQuery): boolean {
    return query.kind === "Resources";
  }
}
