import { ServiceOrder } from "@/Slices/Orders/Core/Query";

export interface Query {
  kind: "GetOrderDetails";
  id: string;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: ServiceOrder;
  };
  data: {
    data: ServiceOrder;
  };
  usedData: {
    data: ServiceOrder;
  };
  query: Query;
}
