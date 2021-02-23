import { Fetcher, Either, Query, InstanceEvent } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class EventsFetcher implements Fetcher<"Events"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(entity: string, id: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/events`;
  }

  async getData(
    query: Query.InstanceEventsQuery
  ): Promise<Either.Type<string, InstanceEvent[]>> {
    const { id, environment, service_entity } = query.qualifier;
    return this.baseApiHelper.get(this.getUrl(service_entity, id), environment);
  }
}
