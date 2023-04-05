import React from "react";
import { useRouteParams } from "@/UI";
import { ServiceProvider } from "@/UI/Components";
import { InstanceComposerPage } from "./InstanceModifierPage";

export const Page = () => {
  const { service: serviceName, instance: instance } =
    useRouteParams<"InstanceModifier">();
  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ service }) => (
        <InstanceComposerPage serviceEntity={service} instanceId={instance} />
      )}
    />
  );
};

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => <div {...props}>{children}</div>;
