import {
  RemoteData,
  DataManager,
  SubscriptionHelper,
  Subject,
  StateHelper,
  ResourceModel,
} from "@/Core";
import { useEffect } from "react";

export class DataManagerImpl
  implements DataManager<Subject, string, ResourceModel[]> {
  constructor(
    private readonly stateHelper: StateHelper<string, ResourceModel[]>,
    private readonly subscriptionHelper: SubscriptionHelper<
      Subject,
      string,
      ResourceModel[]
    >
  ) {}

  useSubscription(subject: Subject): void {
    useEffect(() => {
      const value = this.stateHelper.get(subject.query.id);
      if (RemoteData.isNotAsked(value)) {
        this.stateHelper.set(subject.query.id, RemoteData.loading());
      }
      this.subscriptionHelper.subscribeTo(subject, (data) => {
        this.stateHelper.set(subject.query.id, RemoteData.fromEither(data));
      });
      return () => {
        this.subscriptionHelper.unsubscribeFrom(subject);
      };
    }, [subject.query.id]);
  }

  useData(subject: Subject): RemoteData.Type<string, ResourceModel[]> {
    return this.stateHelper.getViaHook(subject.query.id);
  }
}
