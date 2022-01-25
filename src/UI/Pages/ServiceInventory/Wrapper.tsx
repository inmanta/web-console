import React from "react";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";

export const Wrapper: React.FC = ({ children, ...props }) => (
  <PageContainer {...props} title={words("inventory.title")}>
    {children}
  </PageContainer>
);
