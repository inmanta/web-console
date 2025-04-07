import React, { useContext } from "react";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { CallbacksTable } from "./CallbacksTable";

interface Props {
  service_entity: string;
}

export const CallbacksView: React.FC<Props> = ({ service_entity }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useOneTime<"GetCallbacks">({
    kind: "GetCallbacks",
    service_entity,
  });

  return (
    <RemoteDataView
      data={data}
      label="Callbacks"
      retry={retry}
      SuccessView={(callbacks) => (
        <CallbacksTable callbacks={callbacks} service_entity={service_entity} />
      )}
    />
  );
};
