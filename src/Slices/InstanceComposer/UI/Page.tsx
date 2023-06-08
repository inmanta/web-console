import React from "react";
import { useRouteParams } from "@/UI";
import { ServicesProvider } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const Page = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  return (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainService }) => (
        <Canvas services={services} mainService={mainService} />
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
