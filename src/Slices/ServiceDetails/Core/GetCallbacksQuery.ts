import { Callback } from "./Callback";

export interface Query {
  kind: "GetCallbacks";
  service_entity: string;
}

export interface Manifest {
  error: string;
  apiResponse: { data: Callback[] };
  data: Callback[];
  usedData: Callback[];
  query: Query;
}
