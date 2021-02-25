import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";
import { getKey } from "./getKey";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceHookHelper implements HookHelper<"Service"> {
  constructor(
    private readonly dataManager: DataManager<"Service">,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(qualifier: Query.Qualifier<"Service">): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
    };

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(getKey(qualifier), handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(getKey(qualifier));
      };
    }, [qualifier.name]);
  }

  useData(qualifier: Query.Qualifier<"Service">): Data {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<"Service">): void {
    this.subscriptionController.trigger(getKey(qualifier));
  }

  matches(query: Query.ServiceQuery): boolean {
    return query.kind === "Service";
  }
}
