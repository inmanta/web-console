import React from "react";

import { useUrlStateWithString } from "@/Data";
import { useGetInstance } from "@/Data/Managers/V2/ServiceInstance";
import {
  Description,
  ErrorView,
  LoadingView,
  PageContainer,
} from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Diagnose } from "./Diagnose";
import { LookBackSlider } from "./LookBackSlider";

export const Page: React.FC = () => {
  const { service, instance } = useRouteParams<"Diagnose">();

  const [amountOfVersionToLookBehind, setAmountOfVersionToLookBehind] =
    useUrlStateWithString<string>({
      default: "1",
      key: "lookBehind",
      route: "Diagnose",
    });
  const { data, error, isError, isSuccess } = useGetInstance(
    service,
    instance,
  ).useContinuous();

  const handleSliding = (value: number) => {
    setAmountOfVersionToLookBehind(value.toString());
  };

  if (isError) {
    return <ErrorView ariaLabel="DiagnosePage-Error" message={error.message} />;
  }

  if (isSuccess) {
    const id = data.service_identity_attribute_value || instance;
    const versionAsNumber = Number(data.version);

    return (
      <PageContainer pageTitle={words("diagnose.title")}>
        <LookBackSlider
          instanceVersion={versionAsNumber}
          initialLookBehind={Number(amountOfVersionToLookBehind)}
          setSelectedVersion={handleSliding}
        />
        <Description withSpace>
          {words("diagnose.main.subtitle")(id)}
        </Description>
        <Diagnose
          serviceName={service}
          instanceId={instance}
          lookBehind={amountOfVersionToLookBehind}
          instanceIdentity={data.service_identity_attribute_value || data.id}
        />
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="DiagnosePage-Loading" />;
};
