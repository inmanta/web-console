import React, { useContext } from "react";
import { useGetDiagnostics } from "@/Data/Managers/V2/GETTERS/GetDiagnostics";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DiagnoseCardLayout } from "./DiagnoseCardLayout";

interface Props {
  serviceName: string;
  instanceId: string;
  lookBehind: string;
  instanceIdentity: string;
}

export const Diagnose: React.FC<Props> = ({
  serviceName,
  instanceId,
  lookBehind,
  instanceIdentity,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const { data, error, isError, isSuccess } = useGetDiagnostics(
    serviceName,
    instanceId,
    env,
  ).useOneTime(lookBehind);

  if (isError) {
    return <ErrorView ariaLabel="Diagnostics-Error" message={error.message} />;
  }

  if (isSuccess) {
    if (data.failures.length <= 0 && data.rejections.length === 0) {
      return (
        <div aria-label="Diagnostics-Empty">
          <EmptyView message={words("diagnose.empty")(instanceIdentity)} />
        </div>
      );
    }

    return (
      <div aria-label="Diagnostics-Success">
        <DiagnoseCardLayout diagnostics={data} />
      </div>
    );
  }

  return <LoadingView ariaLabel="Diagnostics-Loading" />;
};
