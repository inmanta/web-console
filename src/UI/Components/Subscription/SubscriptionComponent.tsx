import { RemoteData } from "@/Core";
import React, { useContext } from "react";
import { DataModel } from "./DataModel";
import { ServicesContext } from "./ServicesContext";

interface Props {
  id: string;
}

export const SubscriptionComponent: React.FC<Props> = ({ id }) => {
  const { dataManager } = useContext(ServicesContext);

  // This is an effect that will subscribe and unsubscribe automatially.
  dataManager.useSubscription({ kind: "Data", id });
  const data = dataManager.useData({ kind: "Data", id });

  return RemoteData.fold<string, DataModel, JSX.Element | null>({
    notAsked: () => <p>not asked</p>,
    loading: () => <p>loading</p>,
    failed: (error) => <p>failed: {error}</p>,
    success: (value) => <p>success, value: {value.value}</p>,
  })(data);
};
