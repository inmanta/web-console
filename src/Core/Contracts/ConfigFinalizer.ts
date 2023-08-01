import { RemoteData } from "@/Core/Language";
import { Query } from "@/Core/Query";

export interface ConfigFinalizer<Kind extends Query.Kind> {
  finalize(
    data: RemoteData.Type<Query.Error<Kind>, Query.Data<Kind>>,
    serviceName: string,
    environment: string,
  ): RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>;
}
