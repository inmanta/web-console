import React from "react";
import { ServiceModel } from "@/Core";
import { useGetInstance } from "@/Data/Managers/V2/ServiceInstance";
import { Description, PageContainer, ServiceProvider } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Events } from "./Events";

const Wrapper: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
  ...props
}) => (
  <PageContainer {...props} pageTitle={words("events.title")}>
    {children}
  </PageContainer>
);

/**
 * Wrapped component that fetches and displays event details for a specific service instance.
 *
 * @prop  {ServiceModel} service - The service model containing details about the service.
 *
 * @returns {React.FC<Props>} - A React component that wraps the event details in a page container.
 */
const Wrapped: React.FC<{ service: ServiceModel }> = ({ service }) => {
  const { instance } = useRouteParams<"Events">();
  const { data } = useGetInstance(service.name, instance).useOneTime();
  const id = data?.service_identity_attribute_value || instance;

  return (
    <Wrapper>
      <Description withSpace>{words("events.caption")(id)}</Description>
      <Events service={service} instanceId={instance} />
    </Wrapper>
  );
};

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"Events">();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={Wrapped}
    />
  );
};
