import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import React from "react";

export const ResourcesView: React.FC = () => (
  <PageSectionWithTitle
    title={words("inventory.tabs.resources")}
  ></PageSectionWithTitle>
);
