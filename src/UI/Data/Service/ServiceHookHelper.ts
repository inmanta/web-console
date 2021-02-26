import {
  RemoteData,
  SubscriptionController,
  DataManager,
  Query,
  HookHelper,
  KeyMaker,
} from "@/Core";
import { useEffect } from "react";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceHookHelper implements HookHelper<"Service"> {
  constructor(
    private readonly dataManager: DataManager<"Service">,
    private readonly subscriptionController: SubscriptionController,
    private readonly keyMaker: KeyMaker<Query.Qualifier<"Service">>
  ) {}

  useSubscription(qualifier: Query.Qualifier<"Service">): void {
    const handler = async () => {
      this.dataManager.update(qualifier);
    };

    useEffect(() => {
      const key = this.keyMaker.make(qualifier);
      this.dataManager.initialize(qualifier);
      this.subscriptionController.subscribeTo(key, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(key);
      };
    }, [qualifier.name, qualifier.environment]);
  }

  useData(qualifier: Query.Qualifier<"Service">): Data {
    return this.dataManager.get(qualifier);
  }

  trigger(qualifier: Query.Qualifier<"Service">): void {
    this.subscriptionController.trigger(this.keyMaker.make(qualifier));
  }

  matches(query: Query.ServiceQuery): boolean {
    return query.kind === "Service";
  }
}
