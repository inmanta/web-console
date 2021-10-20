import { Query } from "@/Core/Query";
import { RemoteData } from "@/Core/Language";

export interface ConfigFinalizer<Kind extends Query.Kind> {
  finalize(
    data: RemoteData.Type<Query.Error<Kind>, Query.Data<Kind>>,
    serviceName: string
  ): RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>>;
}
