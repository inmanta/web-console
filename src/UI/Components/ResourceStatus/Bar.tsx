import React from "react";
import styled from "styled-components";
import { ParsedNumber, Resource } from "@/Core";
import { words } from "@/UI";
import { LegendBar, LegendItemDetails } from "@/UI/Components/LegendBar";
import { colorConfig } from "./ColorConfig";

interface Props {
  summary: Resource.DeploySummary;
  updateFilter: (updater: (filter: Resource.Filter) => Resource.Filter) => void;
}

export const ResourceStatusBar: React.FC<Props> = ({
  summary,
  updateFilter,
}) => {
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
    <StretchedLegendBar
      items={items}
      total={{
        format: (total) => `${done} / ${total}`,
      }}
      aria-label={words("resources.deploySummary.title")}
    />
  );
};

function getResourcesInDoneState(
  by_state: Record<string, ParsedNumber>,
): number {
  return Object.entries(by_state)
    .filter(([key]) => !Resource.TRANSIENT_STATES.includes(key))
    .map(([, value]) => Number(value))
    .reduce((acc, current) => acc + current, 0);
}

export function infoToLegendItem(
  info: InfoWithTotal,
  onClick: (ids: Resource.Status[]) => void,
): LegendItemDetails {
  return {
    id: info.keys[0],
    value: info.total,
    backgroundColor: info.color,
    label: (info.keys as string[]).reduce((acc, cur) => `${acc} & ${cur}`),
    onClick: () => onClick(info.keys),
  };
}

function addTotal(
  info: Info,
  byState: Record<string, ParsedNumber>,
): InfoWithTotal {
  return {
    ...info,
    total: info.keys
      .map((key) => (byState[key] === undefined ? 0 : Number(byState[key])))
      .reduce((acc, cur) => acc + cur, 0),
  };
}

interface Info {
  keys: Resource.Status[];
  color: string;
}

export interface InfoWithTotal extends Info {
  total: number;
}

const groups: Array<Array<Resource.Status>> = [
  [Resource.Status.deployed],
  [
    Resource.Status.skipped,
    Resource.Status.skipped_for_undefined,
    Resource.Status.cancelled,
  ],
  [Resource.Status.failed],
  [Resource.Status.unavailable, Resource.Status.undefined],
  [Resource.Status.deploying],
  [Resource.Status.available],
];

const infos: Info[] = groups.map((group) => ({
  keys: group,
  color: colorConfig[group[0]],
}));

const StretchedLegendBar = styled(LegendBar)`
  flex-grow: 1;
  margin-right: var(--pf-v5-global--spacer--lg);
`;
