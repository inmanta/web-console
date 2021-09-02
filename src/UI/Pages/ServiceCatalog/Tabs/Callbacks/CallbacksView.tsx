import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { ErrorView, LoadingView } from "@/UI/Components";
import { CallbacksTable } from "./CallbacksTable";

interface Props {
  service_entity: string;
}

export const CallbacksView: React.FC<Props> = ({ service_entity }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"Callbacks">({
    kind: "Callbacks",
    service_entity,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="Callbacks-Loading" />,
      failed: (error) => (
        <ErrorView
          aria-label="Callbacks-Failed"
          message={error}
          retry={retry}
        />
      ),
      success: (callbacks) => (
        <CallbacksTable callbacks={callbacks} service_entity={service_entity} />
      ),
    },
    data
  );
};
