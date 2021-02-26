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
  implements HookHelper<"ServiceInstances"> {
  constructor(
    private readonly dataManager: DataManager<"ServiceInstances">,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(qualifier: Query.Qualifier<"ServiceInstances">): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
    };

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(qualifier.name, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(qualifier.name);
      };
    }, [qualifier.name]);
  }

  useData(
    qualifier: Query.Qualifier<"ServiceInstances">
  ): RemoteData.Type<string, ServiceInstanceModelWithTargetStates[]> {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<"ServiceInstances">): void {
    this.subscriptionController.trigger(qualifier.name);
  }

  matches(query: Query.SubQuery<"ServiceInstances">): boolean {
    return query.kind === "ServiceInstances";
  }
}
