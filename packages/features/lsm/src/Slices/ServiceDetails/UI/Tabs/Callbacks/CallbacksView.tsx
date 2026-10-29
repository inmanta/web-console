import React from "react";
import { useGetCallbacks } from "@inmanta/web-console-core/Queries/Slices/Callback";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { CallbacksTable } from "./CallbacksTable";

interface Props {
  service_entity: string;
}

/**
 * CallbacksView Component
 *
 * This component displays callbacks for a specific service entity.
 * It handles loading, error, and success states when fetching callbacks data.
 *
 * @param {Props} props - Component props
 * @param {string} props.service_entity - The service entity identifier to fetch callbacks for
 * @returns {React.FC<Props>} A component that displays callbacks table or loading/error states
 */

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
