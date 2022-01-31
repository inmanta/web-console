import React from "react";
import resources from "@/UI/Pages/DesiredStateCompare/diff.json";
import { DiffGroupInfo } from "./DiffGroup";
import { DiffWizard } from "./DiffWizard";

export default {
  title: "DiffWizard",
  component: DiffWizard,
};

export const Default: React.FC = () => {
  const groups: DiffGroupInfo[] = resources.map((resource) => ({
    id: resource.resource_id,
    status: "added",
    entries: Object.entries(resource.attributes).map(([key, value]) => ({
      title: key,
      source: value.r1_compare === null ? "null" : value.r1_compare,
      target: value.r2_compare === null ? "null" : value.r2_compare,
    })),
  }));

  return <DiffWizard groups={groups.slice(0, 10)} source="123" target="456" />;
};

export const A: React.FC = () => {
  const groups: DiffGroupInfo[] = [
    {
      id: "Test",
      status: "added",
      entries: [
        {
          title: "attr",
          source: "abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc",
          target:
            "abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc",
        },
        {
          title: "attr2",
          source: "abcabcabcabcabcabcabcabc",
          target: "abcdabcdabcdabcdabcdabcdabcdabcd",
        },
      ],
    },
  ];

  return <DiffWizard groups={groups.slice(0, 10)} source="123" target="456" />;
};
