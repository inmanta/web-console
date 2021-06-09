import React from "react";
import { useParams } from "react-router-dom";
import {
  ServiceProvider,
  PageSectionWithHorizontalScroll,
} from "@/UI/Components";
import { Diagnose } from "./Diagnose";
import { PageParams } from "@/UI/Routing/Page";

const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithHorizontalScroll {...props}>
    {children}
  </PageSectionWithHorizontalScroll>
);

export const Provider: React.FC = () => {
  const { service: serviceName, instance } =
    useParams<PageParams<"Diagnose">>();

  return (
    <ServiceProvider
      serviceName={serviceName}
      Wrapper={Wrapper}
      Dependant={({ service }) => (
        <Wrapper>
          <Diagnose service={service} instanceId={instance} />
        </Wrapper>
      )}
    />
  );
};
