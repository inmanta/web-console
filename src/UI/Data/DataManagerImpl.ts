import {
  RemoteData,
  DataManager,
  Subject,
  StateHelper,
  ResourceModel,
  ApiHelper,
  SubscriptionController,
} from "@/Core";
import { useEffect } from "react";

export class DataManagerImpl
  implements DataManager<Subject, string, ResourceModel[]> {
  constructor(
    private readonly apiHelper: ApiHelper<Subject, string, ResourceModel[]>,
    private readonly stateHelper: StateHelper<string, ResourceModel[]>,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(subject: Subject): void {
    const handler = async () => {
      this.stateHelper.set(
        subject.query.id,
        RemoteData.fromEither(await this.apiHelper.getData(subject))
      );
    };

    useEffect(() => {
      const value = this.stateHelper.get(subject.query.id);
      if (RemoteData.isNotAsked(value)) {
        this.stateHelper.set(subject.query.id, RemoteData.loading());
      }
      this.subscriptionController.subscribeTo(subject.query.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(subject.query.id);
      };
    }, [subject.query.id]);
  }

  useData(subject: Subject): RemoteData.Type<string, ResourceModel[]> {
    return this.stateHelper.getViaHook(subject.query.id);
  }
}
