import React from "react";
import { PageSectionWithTitle } from "@/UI/Components";
import { words } from "@/UI/words";
import { DiffWizard, Item } from "./DiffWizard";
import json from "./diff.json";

export const Page: React.FC = () => {
  const items: Item[] = json.map((resource) => ({
    id: resource.resource_id,
    status: "Added",
  }));

  return (
    <PageSectionWithTitle title={words("desiredState.compare.title")}>
      <DiffWizard items={items} />
    </PageSectionWithTitle>
  );
};
