import React, { useContext } from "react";
import { DependencyContext, useRouteParams, words } from "@/UI";
import { EmptyView, ServicesProvider } from "@/UI/Components";
import Canvas from "@/UI/Components/Diagram/Canvas";

export const Page = () => {
  const { service: serviceName } = useRouteParams<"InstanceComposer">();
  const { featureManager } = useContext(DependencyContext);
  return featureManager.isComposerEnabled() ? (
    <ServicesProvider
      serviceName={serviceName}
      Wrapper={PageWrapper}
      Dependant={({ services, mainServiceName }) => (
        <Canvas services={services} mainServiceName={mainServiceName} />
      )}
    />
  ) : (
    <EmptyView
      message={words("inventory.instanceComposer.disabled")}
      aria-label="OrdersView-Empty"
    />
  );
};

const PageWrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => {
  return <div {...props}>{children}</div>;
};
