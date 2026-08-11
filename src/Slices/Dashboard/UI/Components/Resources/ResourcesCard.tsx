import React, { useContext } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Flex,
  FlexItem,
  Label,
} from "@patternfly/react-core";
import { CubeIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { isObject, Resource } from "@/Core";
import { useGetResources } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { SearchHelper } from "@/UI/Routing/SearchHelper";
import { words } from "@/UI/words";
import { MINIMAL_PAGE } from "../../EnvironmentHealthRow";
import { IconBadge } from "../IconBadge";
import { ResourceStatusBar } from "./ResourceStatusBar";

const searchHelper = new SearchHelper();

const STAT_TONE_COLOR = {
  brand: "var(--pf-t--global--text--color--brand--default)",
  success: "var(--pf-t--global--text--color--status--success--default)",
  danger: "var(--pf-t--global--text--color--status--danger--default)",
  warning: "var(--pf-t--global--text--color--status--warning--default)",
} as const;

/**
 * Builds a Resources-page URL pre-filtered by a single compound state, preserving the current
 * `env` (and any other) query params. There's no existing cross-page "navigate with filter"
 * helper - the Resources page's own bar-segment clicks only ever update its own local URL state
 * (see CompoundResourceStatus) - so this mirrors useUrlStateWithFilter's `state.<route>.filter`
 * shape by hand. Also keeps the Resources page's own default `!orphaned` filter, which otherwise
 * only applies when `filter.status` is unset (see Page.tsx's `filterWithDefaults`) - since we're
 * setting `status` explicitly, that default wouldn't kick in on its own.
 */
const buildFilteredResourcesUrl = (
  resourcesUrl: string,
  status: Resource.CompoundStateKey
): string => {
  const [path, search = ""] = resourcesUrl.split("?");
  const parsedSearch = searchHelper.parse(search);
  const state = isObject(parsedSearch.state) ? parsedSearch.state : {};
  const resourcesState = isObject(state.Resources) ? state.Resources : {};

  const newSearch = searchHelper.stringify({
    ...parsedSearch,
    state: {
      ...state,
      Resources: { ...resourcesState, filter: { status: [status, "!orphaned"] } },
    },
  });

  return `${path}${newSearch}`;
};

/**
 * Resource Manager card: Compliance / Deploy result / Blocked stacked bars plus a 4-tile
 * deployment summary. Sourced from the same `useGetResources` call/params as the Environment
 * Health row's Resources column, so React Query dedupes the two into a single network request.
 * Clicking a bar segment navigates to the Resources page, pre-filtered by that status.
 */
export const ResourcesCard: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const navigate = useNavigate();
  const resourcesUrl = routeManager.useUrl("Resources", undefined);

  const { data } = useGetResources({ ...MINIMAL_PAGE, filter: {}, sort: [] }).useContinuous();
  const summary = data?.resourceSummary;
  const totalCount = summary?.totalCount ?? 0;

  const onSegmentClick = (status: Resource.CompoundStateKey): void => {
    navigate(buildFilteredResourcesUrl(resourcesUrl, status));
  };

  const statTiles: { label: string; value: number; tone: keyof typeof STAT_TONE_COLOR }[] = [
    {
      label: words("dashboard.resourceManager.deployingNow"),
      value: summary?.isDeploying.true ?? 0,
      tone: "brand",
    },
    {
      label: words("dashboard.resourceManager.deployedOk"),
      value: summary?.lastHandlerRun.successful ?? 0,
      tone: "success",
    },
    {
      label: words("dashboard.resourceManager.failed"),
      value: summary?.lastHandlerRun.failed ?? 0,
      tone: "danger",
    },
    {
      label: words("dashboard.resourceManager.nonCompliant"),
      value: summary?.compliance.non_compliant ?? 0,
      tone: "warning",
    },
  ];

  return (
    <Card isFullHeight>
      <CardHeader>
        <CardTitle>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsSm" }}
          >
            <FlexItem>
              <IconBadge $tone="danger">
                <CubeIcon />
              </IconBadge>
            </FlexItem>
            <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
              <FlexItem>
                <Content component="h3">{words("dashboard.resourceManager.title")}</Content>
              </FlexItem>
              <FlexItem>
                <Content component="small">{words("dashboard.resourceManager.subtitle")}</Content>
              </FlexItem>
            </Flex>
          </Flex>
        </CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
          <FlexItem>
            <ResourceStatusBar
              title={words("dashboard.resourceManager.compliance.title")}
              counts={summary?.compliance}
              totalCount={totalCount}
              onSegmentClick={onSegmentClick}
            />
          </FlexItem>
          <FlexItem>
            <ResourceStatusBar
              title={words("dashboard.resourceManager.deployResult.title")}
              counts={summary?.lastHandlerRun}
              totalCount={totalCount}
              onSegmentClick={onSegmentClick}
            />
          </FlexItem>
          <FlexItem>
            <ResourceStatusBar
              title={words("dashboard.resourceManager.blocked.title")}
              counts={summary?.blocked}
              totalCount={totalCount}
              onSegmentClick={onSegmentClick}
            />
          </FlexItem>
        </Flex>
      </CardBody>
      <Divider />
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsSm" }}
          >
            <FlexItem>
              <Content component="p" style={{ fontWeight: 700 }}>
                {words("dashboard.resourceManager.summary")}
              </Content>
            </FlexItem>
            <FlexItem>
              <Label isCompact>{words("dashboard.resourceManager.summaryCount")(totalCount)}</Label>
            </FlexItem>
          </Flex>
          <Flex
            spaceItems={{ default: "spaceItemsLg" }}
            alignItems={{ default: "alignItemsStretch" }}
          >
            {statTiles.map((tile) => (
              <FlexItem key={tile.label} flex={{ default: "flex_1" }}>
                <StatTile data-testid={`stat-tile-${tile.tone}`}>
                  <Content component="h2" style={{ color: STAT_TONE_COLOR[tile.tone], margin: 0 }}>
                    {tile.value.toLocaleString()}
                  </Content>
                  <Content component="small" style={{ margin: 0 }}>
                    {tile.label}
                  </Content>
                </StatTile>
              </FlexItem>
            ))}
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

// min-height (not aspect-ratio) keeps the tile roughly square at typical widths while
// guaranteeing it grows taller instead of clipping its number+label - aspect-ratio ties height
// strictly to width, so a tile narrowed by a wide sibling card could end up shorter than its own
// content needs. height: 100% then fills the row's alignItemsStretch-computed height, so a tile
// with a longer, wrapping label (e.g. "Non-compliant") doesn't leave its one-line siblings
// shorter and misaligned.
const StatTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--pf-t--global--spacer--xs);
  height: 100%;
  min-height: 8rem;
  border: 1px solid var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  padding: var(--pf-t--global--spacer--md);
  text-align: center;
`;
