import {
  RemoteData,
  DataManager,
  Subject,
  ResourceModel,
  SubscriptionController,
  EntityManager,
} from "@/Core";
import { useEffect } from "react";

export class DataManagerImpl
  implements DataManager<Subject, string, ResourceModel[]> {
  constructor(
    private readonly entityManager: EntityManager<string, ResourceModel[]>,
    private readonly subscriptionController: SubscriptionController
  ) {}

  useSubscription(subject: Subject): void {
    const handler = async () => {
      this.entityManager.update(subject);
    };

    useEffect(() => {
      this.entityManager.initialize(subject.query.id);
      this.subscriptionController.subscribeTo(subject.query.id, handler);
      return () => {
        this.subscriptionController.unsubscribeFrom(subject.query.id);
      };
    }, [subject.query.id]);
  }

  useData(subject: Subject): RemoteData.Type<string, ResourceModel[]> {
    return this.entityManager.get(subject.query.id);
  }
}
