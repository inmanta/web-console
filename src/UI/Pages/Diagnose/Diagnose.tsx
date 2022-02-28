import React, { useContext } from "react";
import { EmptyView, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DiagnoseCardLayout } from "./DiagnoseCardLayout";

interface Props {
  serviceName: string;
  instanceId: string;
  instanceIdentity: string;
}

export const Diagnose: React.FC<Props> = ({
  serviceName,
  instanceId,
  instanceIdentity,
}) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetDiagnostics">({
    kind: "GetDiagnostics",
    id: instanceId,
    service_entity: serviceName,
  });

  return (
    <RemoteDataView
      data={data}
      label="Diagnostics"
      SuccessView={(diagnostics) => {
        if (
          diagnostics.failures.length <= 0 &&
          diagnostics.rejections.length === 0
        ) {
          return (
            <div aria-label="Diagnostics-Empty">
              <EmptyView message={words("diagnose.empty")(instanceIdentity)} />
            </div>
          );
        }

        return (
          <div aria-label="Diagnostics-Success">
            <DiagnoseCardLayout diagnostics={diagnostics} />
          </div>
        );
      }}
    />
  );
};
