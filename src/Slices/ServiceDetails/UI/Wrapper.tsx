import React from "react";
import { words } from "@inmanta/web-console-core";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";

interface Props {
  name: string;
  children?: React.ReactNode;
}

export const Wrapper: React.FC<Props> = ({ children, name, ...props }) => (
  <PageContainer {...props} pageTitle={words("ServiceDetails.title")(name)}>
    {children}
  </PageContainer>
);
