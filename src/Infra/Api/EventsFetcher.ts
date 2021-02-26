import { Fetcher, Either, Query, InstanceEvent } from "@/Core";
import { BaseApiHelper } from "./BaseApiHelper";

export class EventsFetcher implements Fetcher<"Events"> {
  constructor(private readonly baseApiHelper: BaseApiHelper) {}

  private getUrl(entity: string, id: string) {
    return `${this.baseApiHelper.getBaseUrl()}/lsm/v1/service_inventory/${entity}/${id}/events`;
  }

  async getData({
    id,
    environment,
    service_entity,
  }: Query.Qualifier<"Events">): Promise<Either.Type<string, InstanceEvent[]>> {
    return this.baseApiHelper.get(this.getUrl(service_entity, id), environment);
  }
}
