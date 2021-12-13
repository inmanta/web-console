import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";

export const Page: React.FC = () => (
  <PageSectionWithTitle title={words("desiredState.title")} />
);
