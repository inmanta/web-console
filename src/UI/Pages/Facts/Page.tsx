import React from "react";
import { PageContainer } from "@/UI/Components";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  return (
    <PageContainer title={words("facts.title")}>Empty facts page</PageContainer>
  );
};
