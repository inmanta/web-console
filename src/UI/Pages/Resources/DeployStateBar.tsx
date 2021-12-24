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
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

export const DeployStateBar: React.FC<Props> = ({ summary, updateFilter }) => {
  const done = getResourcesInDoneState(summary.by_state || {});

  const onClick = (ids: Resource.Status[]) =>
    updateFilter((filter) => ({
      ...filter,
      status: ids,
    }));

  const items = infos
    .map((info) => addTotal(info, summary.by_state))
    .filter((info) => info.total > 0)
    .map((info) => infoToLegendItem(info, onClick));

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

function infoToLegendItem(
  info: InfoWithTotal,
  onClick: (ids: Resource.Status[]) => void
): LegendItemDetails {
  return {
    id: info.keys[0],
    value: info.total,
    backgroundColor: info.color,
    label: (info.keys as string[]).reduce((acc, cur) => `${acc} & ${cur}`),
    onClick: () => onClick(info.keys),
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
  keys: Resource.Status[];
  color: string;
}

interface InfoWithTotal extends Info {
  total: number;
}

const infos: Info[] = [
  { keys: [Resource.Status.deployed], color: global_success_color_100.value },
  {
    keys: [
      Resource.Status.skipped,
      Resource.Status.skipped_for_undefined,
      Resource.Status.cancelled,
    ],
    color: global_palette_cyan_200.value,
  },
  {
    keys: [Resource.Status.failed],
    color: global_danger_color_100.value,
  },
  {
    keys: [Resource.Status.unavailable, Resource.Status.undefined],
    color: global_warning_color_100.value,
  },
  {
    keys: [Resource.Status.deploying],
    color: global_primary_color_100.value,
  },
  {
    keys: [Resource.Status.available, Resource.Status.processing_events],
    color: global_palette_black_400.value,
  },
];
