import React, { useContext, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Label,
  SearchInput,
  Tab,
  Tabs,
  TabTitleText,
} from "@patternfly/react-core";
import {
  AngleDownIcon,
  AngleRightIcon,
  GripVerticalIcon,
  PlusCircleIcon,
} from "@patternfly/react-icons";
import { useReactFlow } from "@xyflow/react";
import styled from "styled-components";
import { EmbeddedEntity, ServiceModel, words } from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ComposerContext, PaletteItem } from "../Data/Context";
import { getUnavailableInventoryItems } from "../Data/Helpers";
import { useAddPaletteItem } from "../Data/Hooks";
import { LEFT_SIDEBAR_WIDTH, SHAPE_WIDTH } from "../config";

interface PaletteRow {
  key: string;
  label: string;
  item: PaletteItem;
  entityType?: "core" | "embedded";
  unavailableReason?: string;
}

interface PaletteGroup {
  name: string;
  rows: PaletteRow[];
}

type PaletteTab = "new" | "inventory";

const getLabel = (serviceModel: ServiceModel | EmbeddedEntity) => {
  const typeName = "type" in serviceModel && serviceModel.type ? serviceModel.type : undefined;

  return typeName && serviceModel.name
    ? `${typeName} - ${serviceModel.name}`
    : typeName || serviceModel.name;
};

/**
 * The embedded entities a user can create below a service or embedded entity, nested ones
 * included. Read-only embedded entities can't be created, so they are left out.
 */
const getEmbeddedRows = (
  serviceModel: ServiceModel | EmbeddedEntity,
  keyPrefix: string
): PaletteRow[] =>
  serviceModel.embedded_entities
    .filter((embeddedEntity) => embeddedEntity.modifier !== "r")
    .flatMap((embeddedEntity) => {
      const key = `${keyPrefix}/${embeddedEntity.name}`;

      return [
        {
          key,
          label: getLabel(embeddedEntity),
          entityType: "embedded" as const,
          item: {
            kind: "new" as const,
            serviceModel: embeddedEntity,
            entityType: "embedded" as const,
          },
        },
        ...getEmbeddedRows(embeddedEntity, key),
      ];
    });

/**
 * One group per service in the catalog: the service itself, then its embedded entities.
 */
const buildNewGroups = (serviceCatalog: ServiceModel[]): PaletteGroup[] =>
  serviceCatalog.map((serviceModel) => ({
    name: serviceModel.name,
    rows: [
      {
        key: serviceModel.name,
        label: serviceModel.name,
        entityType: "core",
        item: { kind: "new", serviceModel, entityType: "core" },
      },
      ...getEmbeddedRows(serviceModel, serviceModel.name),
    ],
  }));

/**
 * One group per service with instances in the inventory.
 */
const buildInventoryGroups = (
  serviceInventories: Inventories | null,
  serviceCatalog: ServiceModel[],
  unavailable: Map<string, "onCanvas" | "markedForDeletion">
): PaletteGroup[] =>
  Object.entries(serviceInventories || {}).flatMap(([serviceName, instances]) => {
    const serviceModel = serviceCatalog.find((model) => model.name === serviceName);

    if (!serviceModel || instances.length === 0) {
      return [];
    }

    return [
      {
        name: serviceName,
        rows: instances.map((instance) => {
          const reason = unavailable.get(instance.id);

          return {
            key: instance.id,
            label: instance.service_identity_attribute_value || instance.id,
            item: { kind: "inventory", instance, serviceModel },
            unavailableReason: reason && words(`instanceComposer.palette.${reason}`),
          };
        }),
      },
    ];
  });

const filterGroups = (groups: PaletteGroup[], query: string): PaletteGroup[] => {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      rows: group.name.toLowerCase().includes(needle)
        ? group.rows
        : group.rows.filter((row) => row.label.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.rows.length > 0);
};

/**
 * The entity palette: new services and embedded entities, and the instances in the
 * inventory, grouped per service. An item is dragged onto the canvas, or added at the
 * centre of the view with its + button. Hidden in view mode.
 */
export const LeftSidebar: React.FC = () => {
  const {
    serviceCatalog,
    serviceInventories,
    editable,
    canvasState,
    initialShapeInfoRef,
    draggedItemRef,
  } = useContext(ComposerContext);
  const addPaletteItem = useAddPaletteItem();
  const { screenToFlowPosition } = useReactFlow();
  const [activeTab, setActiveTab] = useState<PaletteTab>("new");
  const [queries, setQueries] = useState<Record<PaletteTab, string>>({ new: "", inventory: "" });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const newGroups = useMemo(() => buildNewGroups(serviceCatalog), [serviceCatalog]);
  const inventoryGroups = useMemo(
    () =>
      buildInventoryGroups(
        serviceInventories,
        serviceCatalog,
        getUnavailableInventoryItems(canvasState, new Set(initialShapeInfoRef.current.keys()))
      ),
    [serviceInventories, serviceCatalog, canvasState, initialShapeInfoRef]
  );

  const query = queries[activeTab];
  const groups = filterGroups(activeTab === "new" ? newGroups : inventoryGroups, query);
  const resultCount = groups.reduce((count, group) => count + group.rows.length, 0);
  const setQuery = (value: string) => setQueries((prev) => ({ ...prev, [activeTab]: value }));

  const toggleGroup = (name: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      const key = `${activeTab}/${name}`;

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });

  const addAtCentre = (item: PaletteItem) => {
    const bounds = document.querySelector('[data-testid="canvas"]')?.getBoundingClientRect();

    if (!bounds) {
      return;
    }
    const centre = screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });

    addPaletteItem(item, { x: centre.x - SHAPE_WIDTH / 2, y: centre.y - 40 });
  };

  return (
    <Sidebar
      className={`left_sidebar ${!editable && "view_mode"}`}
      data-testid="left_sidebar"
      aria-label={words("instanceComposer.palette")}
    >
      <Tabs
        activeKey={activeTab}
        onSelect={(_event, key) => setActiveTab(key as PaletteTab)}
        aria-label={words("instanceComposer.palette")}
        isFilled
      >
        <Tab
          eventKey="new"
          title={<TabTitleText>{words("instanceComposer.stencil.new")}</TabTitleText>}
        />
        <Tab
          eventKey="inventory"
          title={<TabTitleText>{words("instanceComposer.stencil.inventory")}</TabTitleText>}
        />
      </Tabs>
      <div className="palette-search">
        <SearchInput
          value={query}
          onChange={(_event, value) => setQuery(value)}
          onClear={() => setQuery("")}
          resultsCount={query ? words("instanceComposer.palette.results")(resultCount) : undefined}
          placeholder={
            activeTab === "new"
              ? words("instanceComposer.palette.searchEntities")
              : words("instanceComposer.palette.searchInstances")
          }
          aria-label={
            activeTab === "new"
              ? words("instanceComposer.palette.searchEntities")
              : words("instanceComposer.palette.searchInstances")
          }
        />
        {activeTab === "new" && (
          <Content component="small">{words("instanceComposer.palette.hint")}</Content>
        )}
      </div>
      <div className="palette-groups">
        {groups.length === 0 && (
          <EmptyState
            headingLevel="h3"
            titleText={
              query
                ? words("instanceComposer.palette.noResults.title")(query)
                : words("instanceComposer.palette.noInstances")
            }
            variant="xs"
          >
            {query && (
              <>
                <EmptyStateBody>{words("instanceComposer.palette.noResults.body")}</EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="link" onClick={() => setQuery("")}>
                      {words("instanceComposer.palette.clearSearch")}
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </>
            )}
          </EmptyState>
        )}
        {groups.map((group) => {
          const isOpen = !!query || !collapsedGroups.has(`${activeTab}/${group.name}`);

          return (
            <div className="palette-group" key={group.name}>
              <button
                type="button"
                className="palette-group-toggle"
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.name)}
              >
                {isOpen ? <AngleDownIcon /> : <AngleRightIcon />}
                <span className="palette-group-name">{group.name}</span>
                <Badge isRead>{group.rows.length}</Badge>
              </button>
              {isOpen && (
                <ul>
                  {group.rows.map((row) =>
                    row.unavailableReason ? (
                      <li key={row.key} className="palette-row is-unavailable">
                        <span className="palette-row-label">{row.label}</span>
                        <Label isCompact variant="outline">
                          {row.unavailableReason}
                        </Label>
                      </li>
                    ) : (
                      <li
                        key={row.key}
                        className="palette-row"
                        draggable
                        onDragStart={(event) => {
                          draggedItemRef.current = row.item;
                          event.dataTransfer.setData("text/plain", row.label);
                          event.dataTransfer.effectAllowed = "copy";
                        }}
                        onDragEnd={() => {
                          draggedItemRef.current = null;
                        }}
                      >
                        <GripVerticalIcon className="palette-row-grip" />
                        <span className="palette-row-label" title={row.label}>
                          {row.label}
                        </span>
                        {row.entityType === "core" && (
                          <Label isCompact color="yellow">
                            {words("instanceComposer.label.core")}
                          </Label>
                        )}
                        {row.entityType === "embedded" && (
                          <Label isCompact color="blue">
                            {words("instanceComposer.label.embedded")}
                          </Label>
                        )}
                        <Button
                          variant="plain"
                          size="sm"
                          icon={<PlusCircleIcon />}
                          aria-label={words("instanceComposer.palette.add")(row.label)}
                          onClick={() => addAtCentre(row.item)}
                        />
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </Sidebar>
  );
};

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  flex: none;
  width: ${LEFT_SIDEBAR_WIDTH}px;
  height: 100%;
  background: var(--pf-t--global--background--color--primary--default);
  border-right: 1px solid var(--pf-t--global--border--color--default);
  z-index: 1;

  &.view_mode {
    display: none;
  }

  .palette-search {
    display: flex;
    flex-direction: column;
    gap: var(--pf-t--global--spacer--sm);
    padding: var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--md)
      var(--pf-t--global--spacer--sm);
  }

  .palette-groups {
    flex: 1;
    overflow-y: auto;
    padding: 0 var(--pf-t--global--spacer--sm) var(--pf-t--global--spacer--md);
  }

  .palette-group {
    border-bottom: 1px solid var(--pf-t--global--border--color--default);

    ul {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 0;
      padding: 0 0 var(--pf-t--global--spacer--sm);
      list-style: none;
    }
  }

  .palette-group-toggle {
    display: flex;
    align-items: center;
    gap: var(--pf-t--global--spacer--sm);
    width: 100%;
    padding: var(--pf-t--global--spacer--sm);
    border: 0;
    background: none;
    color: var(--pf-t--global--text--color--regular);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .palette-group-name {
    flex: 1;
    font-weight: var(--pf-t--global--font--weight--body--bold);
  }

  .palette-row {
    display: flex;
    align-items: center;
    gap: var(--pf-t--global--spacer--sm);
    padding: var(--pf-t--global--spacer--xs) var(--pf-t--global--spacer--xs)
      var(--pf-t--global--spacer--xs) var(--pf-t--global--spacer--sm);
    border-radius: var(--pf-t--global--border--radius--small);
    cursor: grab;

    &:hover {
      background: var(--pf-t--global--background--color--primary--hover);
    }

    &.is-unavailable {
      padding-left: var(--pf-t--global--spacer--xl);
      color: var(--pf-t--global--text--color--disabled);
      cursor: not-allowed;

      &:hover {
        background: none;
      }
    }
  }

  .palette-row-grip {
    flex: none;
    color: var(--pf-t--global--icon--color--subtle);
  }

  .palette-row-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
