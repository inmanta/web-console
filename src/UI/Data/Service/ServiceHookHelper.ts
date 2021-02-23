import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceHookHelper implements HookHelper<Query.ServiceQuery> {
  constructor(
    private readonly dataManager: DataManager<Data>,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(query: Query.ServiceQuery): void {
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

  useData(query: Query.ServiceQuery): Data {
    return this.dataManager.get(query.qualifier.name);
  }

  trigger(query: Query.ServiceQuery): void {
    this.subscriptionController.trigger(query.qualifier.name);
  }

  matches(query: Query.ServiceQuery): boolean {
    return query.kind === "Service";
  }
}
