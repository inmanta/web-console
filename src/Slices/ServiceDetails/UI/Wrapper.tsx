import React from "react";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  name: string;
}

export const Wrapper: React.FC<Props> = ({ children, name, ...props }) => (
  <PageContainer {...props} title={words("ServiceDetails.title")(name)}>
    {children}
  </PageContainer>
);
