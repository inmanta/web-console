import { RemoteData } from "@/Core";
import { useEffect } from "react";
import {
  StateHelper,
  Subject,
  DataModel,
  SubscriptionHelper,
  HookedDataManager,
} from "./Interfaces";

/**
 * This class is responsible for keeping data up to date.
 * - Setting up a subscription
 * - Updating state
 */
export class HookedDataManagerImpl implements HookedDataManager {
  constructor(
    private readonly stateHelper: StateHelper,
    private readonly subscriptionHelper: SubscriptionHelper
  ) {}

  useSubscription(subject: Subject): void {
    useEffect(() => {
      const value = this.stateHelper.getDirect(subject.id);
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
    return this.stateHelper.get(subject.id);
  }
}
