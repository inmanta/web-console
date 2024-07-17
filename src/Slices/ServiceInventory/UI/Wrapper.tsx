import React from "react";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  name: string;
}

export const Wrapper: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  name,
  ...props
}) => (
  <PageContainer {...props} title={words("inventory.title")(name)}>
    {children}
  </PageContainer>
);
