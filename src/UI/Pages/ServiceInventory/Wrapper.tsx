import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";

export const Wrapper: React.FC = ({ children, ...props }) => (
  <PageSectionWithTitle {...props} title={words("inventory.title")}>
    {children}
  </PageSectionWithTitle>
);
