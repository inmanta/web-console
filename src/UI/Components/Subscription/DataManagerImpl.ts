import {
  DataManager,
  RemoteData,
  StateHelper,
  SubscriptionHelper,
} from "@/Core";
import { useEffect } from "react";
import { Subject, DataModel } from "./DataModel";

/**
 * This class is responsible for keeping data up to date.
 * - Setting up a subscription
 * - Updating state
 */
export class DataManagerImpl
  implements DataManager<Subject, string, DataModel> {
  constructor(
    private readonly stateHelper: StateHelper<string, DataModel>,
    private readonly subscriptionHelper: SubscriptionHelper<
      Subject,
      string,
      DataModel
    >
  ) {}

  useSubscription(subject: Subject): void {
    useEffect(() => {
      const value = this.stateHelper.get(subject.id);
      if (RemoteData.isNotAsked(value)) {
        this.stateHelper.set(subject.id, RemoteData.loading());
      }
      this.subscriptionHelper.subscribeTo(subject, (data) => {
        this.stateHelper.set(subject.id, RemoteData.fromEither(data));
      });
      return () => {
        this.subscriptionHelper.unsubscribeFrom(subject);
      };
    }, [subject.id]);
  }

  useData(subject: Subject): RemoteData.Type<string, DataModel> {
    return this.stateHelper.getViaHook(subject.id);
  }
}
