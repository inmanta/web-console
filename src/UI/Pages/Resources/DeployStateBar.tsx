import React from "react";
import {
  global_danger_color_100,
  global_palette_black_400,
  global_palette_cyan_200,
  global_primary_color_100,
  global_success_color_100,
  global_warning_color_100,
} from "@patternfly/react-tokens";
import { Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar, LegendItemDetails } from "@/UI/Components";

interface Props {
  summary: Resource.DeploySummary;
}

export const DeployStateBar: React.FC<Props> = ({ summary }) => {
  const done = getResourcesInDoneState(summary.by_state || {});
  const items = infos
    .map((info) => addTotal(info, summary.by_state))
    .filter((info) => info.total > 0)
    .map(infoToLegendItem);
  return (
    <LegendBar
      items={items}
      total={{
        format: (total) => `${done} / ${total}`,
      }}
      aria-label={words("resources.deploySummary.title")}
    />
  );
};

function getResourcesInDoneState(by_state: Record<string, number>): number {
  return Object.entries(by_state)
    .filter(([key]) => !Resource.TRANSIENT_STATES.includes(key))
    .map(([, value]) => value)
    .reduce((acc, current) => acc + current, 0);
}

function infoToLegendItem(info: InfoWithTotal): LegendItemDetails {
  return {
    id: info.keys[0],
    value: info.total,
    backgroundColor: info.color,
    label: info.keys.reduce((acc, cur) => `${acc} & ${cur}`),
  };
}

function addTotal(info: Info, byState: Record<string, number>): InfoWithTotal {
  return {
    ...info,
    total: info.keys
      .map((key) => (byState[key] === undefined ? 0 : byState[key]))
      .reduce((acc, cur) => acc + cur, 0),
  };
}

interface Info {
  keys: string[];
  color: string;
}

interface InfoWithTotal extends Info {
  total: number;
}

const infos: Info[] = [
  { keys: ["deployed"], color: global_success_color_100.value },
  {
    keys: ["skipped", "skipped_for_undefined", "cancelled"],
    color: global_palette_cyan_200.value,
  },
  {
    keys: ["failed"],
    color: global_danger_color_100.value,
  },
  {
    keys: ["unavailable", "undefined"],
    color: global_warning_color_100.value,
  },
  {
    keys: ["deploying"],
    color: global_primary_color_100.value,
  },
  {
    keys: ["available", "processing_events"],
    color: global_palette_black_400.value,
  },
];
