import React from "react";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  name: string;
  children?: React.ReactNode;
}

export const Wrapper: React.FC<Props> = ({ children, name, ...props }) => (
  <PageContainer {...props} title={words("ServiceDetails.title")(name)}>
    {children}
  </PageContainer>
);
