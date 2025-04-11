import React from "react";
import { useGetCallbacks } from "@/Data/Managers/V2/Callback/GetCallbacks";
import { ErrorView, LoadingView } from "@/UI/Components";
import { CallbacksTable } from "./CallbacksTable";

interface Props {
  service_entity: string;
}

export const CallbacksView: React.FC<Props> = ({ service_entity }) => {
  const { data, isSuccess, isError, error, refetch } = useGetCallbacks().useOneTime();

  if (isError) {
    return <ErrorView ariaLabel="Callbacks-Error" message={error.message} retry={refetch} />;
  }

  if (isSuccess) {
    return <CallbacksTable callbacks={data} service_entity={service_entity} />;
  }

  return <LoadingView ariaLabel="Callbacks-Loading" />;
};
