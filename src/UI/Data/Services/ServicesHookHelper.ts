import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
} from "@/Core";
import { useEffect } from "react";

type Data = RemoteData.Type<Query.Error<"Services">, Query.Data<"Services">>;

export class ServicesHookHelper implements HookHelper<"Services"> {
  constructor(
    private readonly dataManager: DataManager<"Services">,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(qualifier: Query.Qualifier<"Services">): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
    };

    useEffect(() => {
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(qualifier.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(qualifier.id);
      };
    }, [qualifier.id]);
  }

  useData(qualifier: Query.Qualifier<"Services">): Data {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<"Services">): void {
    this.subscriptionController.trigger(qualifier.id);
  }

  matches(query: Query.ServiceQuery): boolean {
    return query.kind === "Service";
  }
}
