import React from "react";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  name: string;
}

export const Wrapper: React.FC<React.PropsWithChildren<Props>> = ({ children, name, ...props }) => (
  <PageContainer
    {...props}
    hasOverflowScroll
    aria-label={words("inventory.title")(name)}
    pageTitle={words("inventory.title")(name)}
  >
    {children}
  </PageContainer>
);
