import React, { useContext } from "react";
import { ServiceModel } from "@/Core";
import {
  Description,
  EmptyView,
  RemoteDataView,
  Spacer,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DiagnoseCardLayout } from "./DiagnoseCardLayout";

interface Props {
  service: ServiceModel;
  instanceId: string;
}

export const Diagnose: React.FC<Props> = ({ service, instanceId }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"GetDiagnostics">({
    kind: "GetDiagnostics",
    id: instanceId,
    service_entity: service.name,
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
              <Description>
                {words("diagnose.main.subtitle")(instanceId)}
              </Description>
              <EmptyView message={words("diagnose.empty")(instanceId)} />
            </div>
          );
        }

        return (
          <div aria-label="Diagnostics-Success">
            <Description>
              {words("diagnose.main.subtitle")(instanceId)}
            </Description>
            <Spacer />
            <DiagnoseCardLayout diagnostics={diagnostics} />
          </div>
        );
      }}
    />
  );
};
