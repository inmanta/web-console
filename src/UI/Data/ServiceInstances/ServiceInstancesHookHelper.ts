import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
  ServiceInstanceModelWithTargetStates,
} from "@/Core";
import { useEffect } from "react";

export class ServiceInstancesHookHelper
  implements HookHelper<Query.ServiceInstancesQuery> {
  constructor(
    private readonly dataManager: DataManager<
      RemoteData.Type<string, ServiceInstanceModelWithTargetStates[]>
    >,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query.ServiceInstancesQuery): void {
    const handler = async () => {
      this.dataManager.update(query);
    };

    useEffect(() => {
      this.dataManager.initialize(query.qualifier.name);
      this.subscriptionController.subscribeTo(query.qualifier.name, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(query.qualifier.name);
      };
    }, [query.qualifier.name]);
  }

  useData(
    query: Query.ServiceInstancesQuery
  ): RemoteData.Type<string, ServiceInstanceModelWithTargetStates[]> {
    return this.dataManager.get(query.qualifier.name);
  }

  trigger(query: Query.ServiceInstancesQuery): void {
    this.subscriptionController.trigger(query.qualifier.name);
  }

  matches(query: Query.ServiceInstancesQuery): boolean {
    return query.kind === "ServiceInstances";
  }
}
