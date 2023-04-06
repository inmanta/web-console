import React from "react";
import { useRouteParams } from "@/UI";
import { ServiceProvider } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const Page = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ service }) => <Canvas service={service} />}
    />
  );
};

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};
