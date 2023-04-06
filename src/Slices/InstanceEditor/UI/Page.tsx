import React from "react";
import { useRouteParams } from "@/UI";
import { ServiceProvider } from "@/UI/Components";
import { InstanceProvider } from "./InstanceProvider";

export const Page = () => {
  const { service: serviceName, instance: instance } =
    useRouteParams<"InstanceEditor">();
  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ service }) => (
        <InstanceProvider serviceEntity={service} instanceId={instance} />
      )}
    />
  );
};

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};
