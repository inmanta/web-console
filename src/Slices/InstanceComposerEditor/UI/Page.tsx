import React from "react";
import { useRouteParams } from "@/UI";
import { ServicesProvider } from "@/UI/Components";
import { InstanceProvider } from "./InstanceProvider";

export const Page = () => {
  const { service: serviceName, instance: instance } =
    useRouteParams<"InstanceComposerEditor">();
  return (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainServiceName }) => (
        <InstanceProvider
          services={services}
          mainServiceName={mainServiceName}
          instanceId={instance}
        />
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
