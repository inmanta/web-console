import React from "react";
import { Resource } from "@/Test";
import { DiffWizard, Item, Status } from "./DiffWizard";

export default {
  title: "DiffWizard",
  component: DiffWizard,
};

const items: Item[] = Resource.listOfIds
  .map((id, index) => ({
    id,
    status: (index < 8
      ? "Added"
      : index % 2 === 0
      ? "Deleted"
      : "Modified") as Status,
  }))
  .sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  });

export const Default: React.FC = () => {
  return <DiffWizard items={items} />;
};
