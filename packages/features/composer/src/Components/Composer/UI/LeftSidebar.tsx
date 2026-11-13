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
  Truncate,
} from "@patternfly/react-core";
import { AngleDownIcon } from "@patternfly/react-icons/dist/esm/icons/angle-down-icon";
import { AngleRightIcon } from "@patternfly/react-icons/dist/esm/icons/angle-right-icon";
import { GripVerticalIcon } from "@patternfly/react-icons/dist/esm/icons/grip-vertical-icon";
import { PlusCircleIcon } from "@patternfly/react-icons/dist/esm/icons/plus-circle-icon";
import { useReactFlow, useStore } from "@xyflow/react";
import styled from "styled-components";
import { EmbeddedEntity, ServiceModel, words } from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ComposerContext, PaletteItem } from "../Data/Context";
import { getUnavailableInventoryItems } from "../Data/Helpers";
import { useAddPaletteItem } from "../Data/Hooks";
import { EntityShapeType } from "../Data/ServiceEntityShape";
import { LEFT_SIDEBAR_WIDTH, SHAPE_WIDTH } from "../config";
import { EntityIcon } from "./EntityIcon";
import { entityColorVariables } from "./entityColors";

interface PaletteRow {
  key: string;

  /** The full name, which the search matches */
  label: string;

  /** The name the row shows */
  name: string;

  /** What kind of entity it is, in small text under the name */
  detail?: string;
  item: PaletteItem;
  unavailableReason?: string;
}

interface PaletteGroup {
  name: string;
  rows: PaletteRow[];
}

type PaletteTab = "new" | "inventory";

/**
 * The names of an embedded entity's row: its type, and the attribute it is embedded as.
 */
const getEmbeddedNames = (embeddedEntity: EmbeddedEntity) => {
  const typeName = embeddedEntity.type || undefined;
  const embeddedAs = typeName && embeddedEntity.name;

  return {
    label: embeddedAs ? `${typeName} - ${embeddedAs}` : typeName || embeddedEntity.name,
    name: typeName || embeddedEntity.name,
    detail: embeddedAs
      ? `${words("instanceComposer.label.embedded")} · ${embeddedAs}`
      : words("instanceComposer.label.embedded"),
  };
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
          ...getEmbeddedNames(embeddedEntity),
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
        name: serviceModel.name,
        detail: words("instanceComposer.label.core"),
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

          const label = instance.service_identity_attribute_value || instance.id;

          return {
            key: instance.id,
            label,
            name: label,
            item: { kind: "inventory", instance, serviceModel },
            unavailableReason: reason && words(`instanceComposer.palette.${reason}`),
          };
        }),
      },
    ];
  });

/**
 * The kind of card a row adds: an inventory instance comes on the canvas as a read-only relation.
 */
const getRowKind = (row: PaletteRow): EntityShapeType =>
  row.item.kind === "new" ? row.item.entityType : "relation";

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
  const canvasElement = useStore((state) => state.domNode);
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
    const bounds = canvasElement?.getBoundingClientRect();

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
      className={editable ? "left_sidebar" : "left_sidebar view_mode"}
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
            <div
              className="palette-group"
              key={group.name}
              data-testid={`palette-group-${group.name}`}
            >
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
                      <li
                        key={row.key}
                        className="palette-row is-unavailable"
                        style={entityColorVariables(getRowKind(row))}
                        aria-disabled="true"
                        data-testid={`palette-item-${row.label}`}
                      >
                        <span
                          className="palette-row-icon"
                          title={words(`instanceComposer.label.${getRowKind(row)}`)}
                          aria-hidden
                        >
                          <EntityIcon serviceModel={row.item.serviceModel} />
                        </span>
                        <PaletteRowText row={row} />
                        <Label isCompact variant="outline" className="palette-row-reason">
                          {row.unavailableReason}
                        </Label>
                      </li>
                    ) : (
                      <li
                        key={row.key}
                        className="palette-row"
                        style={entityColorVariables(getRowKind(row))}
                        data-testid={`palette-item-${row.label}`}
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
                        {/* The grip takes the icon's place while the row is pointed at */}
                        <span
                          className="palette-row-icon"
                          title={words(`instanceComposer.label.${getRowKind(row)}`)}
                          aria-hidden
                        >
                          <EntityIcon serviceModel={row.item.serviceModel} />
                          <GripVerticalIcon className="palette-row-grip" />
                        </span>
                        <PaletteRowText row={row} />
                        <Button
                          className="palette-row-add"
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

/**
 * The name of a palette row, and what kind of entity it is under it. Only a name that doesn't fit
 * is cut short, with a tooltip.
 */
const PaletteRowText: React.FC<{ row: PaletteRow }> = ({ row }) => (
  <span className="palette-row-text">
    <Truncate className="palette-row-name" content={row.name} />
    {row.detail && (
      <span className="palette-row-detail" title={row.detail}>
        {row.detail}
      </span>
    )}
  </span>
);

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
      color: var(--pf-t--global--text--color--disabled);
      cursor: not-allowed;

      &:hover {
        background: none;
      }
    }
  }

  // The icon tile in the colours of the entity's kind, like on the cards (entityColors)
  .palette-row-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: var(--pf-t--global--spacer--lg);
    height: var(--pf-t--global--spacer--lg);
    border-radius: var(--pf-t--global--border--radius--small);
    background: var(--entity-icon-background);
    color: var(--entity-icon-color);
  }

  .is-unavailable .palette-row-icon {
    opacity: 0.5;
  }

  .palette-row-grip {
    display: none;
  }

  .palette-row:not(.is-unavailable):is(:hover, :focus-within) .palette-row-icon {
    > * {
      display: none;
    }

    > .palette-row-grip {
      display: block;
    }
  }

  .palette-row-reason {
    flex: none;
  }

  // Every row has an add button, so it stays subtle until it is pointed at or focused.
  .palette-row-add {
    --pf-v6-c-button--m-plain__icon--Color: var(--pf-t--global--icon--color--subtle);
    --pf-v6-c-button--hover__icon--Color: var(--pf-t--global--icon--color--regular);
    --pf-v6-c-button--m-clicked__icon--Color: var(--pf-t--global--icon--color--regular);
  }

  .palette-row-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  // As wide as the name, up to the row: Truncate compares the width of its text with the width
  // of the row, so a name that fills the row would always count as cut short.
  .palette-row-name {
    align-self: flex-start;
    max-width: 100%;
  }

  .palette-row-detail {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--pf-t--global--text--color--subtle);
    font-size: var(--pf-t--global--font--size--body--sm);
  }
`;
