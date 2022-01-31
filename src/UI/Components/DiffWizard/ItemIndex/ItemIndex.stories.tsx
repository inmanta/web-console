import React from "react";
import resources from "@/UI/Pages/DesiredStateCompare/diff.json";
import { ItemIndex } from "./ItemIndex";

export default {
  title: "ItemIndex",
  component: ItemIndex,
};

export const Default: React.FC = () => {
  return (
    <ItemIndex
      items={resources.map((resource) => ({
        id: resource.resource_id,
        status: "added",
      }))}
    />
  );
};
