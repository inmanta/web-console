import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";
import { getId } from "./id";

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
      this.dataManager.initialize(getId(query));
      this.subscriptionController.subscribeTo(getId(query), handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(getId(query));
      };
    }, [query.qualifier.name]);
  }

  useData(query: Query.ServiceQuery): Data {
    return this.dataManager.get(getId(query));
  }

  trigger(query: Query.ServiceQuery): void {
    this.subscriptionController.trigger(getId(query));
  }

  matches(query: Query.ServiceQuery): boolean {
    return query.kind === "Service";
  }
}
