import React from "react";
import { ServiceModel, getServiceTitle, words } from "@inmanta/web-console-core";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";

interface Props {
  name: string;
  service?: ServiceModel;
  children?: React.ReactNode;
}

/**
 * The page frame of the Service Details. The title shows the `web_title` of the service once it
 * is loaded.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} name - The name of the service, shown in the title while the service is loading.
 *  @prop {ServiceModel} [service] - The service, undefined while it is loading.
 */
export const Wrapper: React.FC<Props> = ({ children, name, service, ...props }) => (
  <PageContainer
    {...props}
    pageTitle={words("ServiceDetails.title")(getServiceTitle(name, service))}
  >
    {children}
  </PageContainer>
);
