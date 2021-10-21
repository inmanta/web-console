import React from "react";
import { words } from "@/UI/words";
import { PageSectionWithTitle } from "@/UI/Components";

export const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("inventory.title")}>
    {children}
  </PageSectionWithTitle>
);
