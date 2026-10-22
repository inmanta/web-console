import React from "react";
import { words } from "@/Core";
import { PageContainer } from "@/UI/Components/PageContainer";

interface Props {
  name: string;
  children?: React.ReactNode;
}

export const Wrapper: React.FC<Props> = ({ children, name, ...props }) => (
  <PageContainer {...props} pageTitle={words("ServiceDetails.title")(name)}>
    {children}
  </PageContainer>
);
