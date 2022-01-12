import React from "react";
import resources from "@/UI/Pages/DesiredStateCompare/diff.json";
import { DiffWizard } from "./DiffWizard";
import { Item } from "./ItemDiff";

export default {
  title: "DiffWizard",
  component: DiffWizard,
};

export const Default: React.FC = () => {
  const items: Item[] = resources.map((resource) => ({
    id: resource.resource_id,
    status: "Added",
    details: Object.entries(resource.attributes).map(([key, value]) => ({
      title: key,
      source: value.r1_compare === null ? "null" : value.r1_compare,
      target: value.r2_compare === null ? "null" : value.r2_compare,
      diff: addFileName(value.diff),
    })),
  }));

  return <DiffWizard items={items.slice(0, 10)} source="123" target="456" />;
};

const addFileName = (value: string): string => {
  const [, body] = value.split("--- \n+++ \n");
  return `--- a\n+++ a\n${body}`;
};
