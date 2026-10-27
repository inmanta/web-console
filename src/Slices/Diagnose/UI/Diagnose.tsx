import React from "react";
import { words } from "@/Core";
import { useGetDiagnostics } from "@/Data/Queries/Slices/ServiceInstance";
import { EmptyView } from "@/UI/Components/EmptyView";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
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
  const { data, error, isError, isSuccess } = useGetDiagnostics(serviceName, instanceId).useOneTime(
    lookBehind
  );

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
