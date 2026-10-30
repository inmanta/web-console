import React, { useMemo, useState } from "react";
import {
  Button,
  Content,
  ContentVariants,
  Flex,
  Stack,
  StackItem,
  Title,
} from "@patternfly/react-core";
import { RhMicronsDoubleCaretDownIcon, RhMicronsDoubleCaretUpIcon } from "@patternfly/react-icons";
import { Table, Tbody, Td, TdProps, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { ServiceRow } from "./ServiceRow";
import {
  createCatalogSections,
  getAllCatalogServices,
  getSectionInstanceCount,
  getSectionTitle,
} from "./helpers";
import { CatalogSection, CatalogService, serviceRowColumnCount } from "./types";

interface Props {
  serviceModels: ServiceModel[];
}

/**
 * The service catalog: one table per section, each under a heading with its service and
 * instance count. A section is a `web_group`, or "Other services" for the services without one.
 * Owned services are nested under their owner, collapsed by default, with one button above the
 * tables that expands every owner, or collapses them once all are expanded. Without any group,
 * the catalog is a single table without heading, and without any owned service, there is no
 * expand column and no such button. When any service has a `web_icon`, every row shows an icon, with a fallback
 * for the services without one; otherwise the rows have no icon.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ServiceModel[]} serviceModels - The services in the catalog.
 *
 * @returns {React.FC<Props>} The service catalog sections.
 */
export const CatalogSections: React.FC<Props> = ({ serviceModels }) => {
  const sections = useMemo(() => createCatalogSections(serviceModels), [serviceModels]);
  const allServices = useMemo(() => getAllCatalogServices(sections), [sections]);
  const [expandedServiceNames, setExpandedServiceNames] = useState<Set<string>>(new Set());
  const ownerServiceNames = allServices
    .filter((service) => service.ownedServices.length > 0)
    .map((service) => service.serviceModel.name);
  const hasGroups = sections.some((section) => section.kind === "Group");
  const hasOwnedServices = ownerServiceNames.length > 0;
  const isEveryOwnerExpanded = ownerServiceNames.every((name) => expandedServiceNames.has(name));
  const hasServiceIcons = allServices.some(
    ({ resolvedAnnotations }) => resolvedAnnotations.web_icon !== undefined
  );

  /**
   * Expands the owned services of a service when they are collapsed, and collapses them otherwise.
   */
  const toggleOwnedServices = (serviceName: string): void => {
    setExpandedServiceNames((previous) => {
      const next = new Set(previous);

      if (next.has(serviceName)) {
        next.delete(serviceName);
      } else {
        next.add(serviceName);
      }

      return next;
    });
  };

  /**
   * Renders the row of a service and, when its owned services are expanded, their rows below
   * it, one level deeper.
   */
  const renderServiceRows = (
    service: CatalogService,
    level: number,
    positionInSet: number
  ): React.ReactNode[] => {
    const serviceName = service.serviceModel.name;
    const isExpanded = expandedServiceNames.has(serviceName);
    const treeRow: TdProps["treeRow"] = {
      onCollapse: () => toggleOwnedServices(serviceName),
      props: {
        isExpanded,
        "aria-level": level,
        "aria-posinset": positionInSet,
        "aria-setsize": service.ownedServices.length,
        toggleAriaLabel: words(
          isExpanded ? "catalog.ownedServices.collapse" : "catalog.ownedServices.expand"
        )(service.resolvedAnnotations.web_title),
      },
    };
    const row = (
      <ServiceRow
        key={serviceName}
        service={service}
        hasServiceIcons={hasServiceIcons}
        treeRow={hasOwnedServices ? treeRow : undefined}
      />
    );

    if (!isExpanded) {
      return [row];
    }

    return [
      row,
      ...service.ownedServices.flatMap((ownedService, index) =>
        renderServiceRows(ownedService, level + 1, index + 1)
      ),
    ];
  };

  return (
    <Stack hasGutter>
      {hasOwnedServices && (
        <StackItem>
          {isEveryOwnerExpanded ? (
            <Button
              variant="plain"
              size="sm"
              icon={<RhMicronsDoubleCaretUpIcon />}
              onClick={() => setExpandedServiceNames(new Set())}
            >
              {words("catalog.ownedServices.collapseAll")}
            </Button>
          ) : (
            <Button
              variant="plain"
              size="sm"
              icon={<RhMicronsDoubleCaretDownIcon />}
              onClick={() => setExpandedServiceNames(new Set(ownerServiceNames))}
            >
              {words("catalog.ownedServices.expandAll")}
            </Button>
          )}
        </StackItem>
      )}
      {sections.map((section) => (
        <StackItem key={`${section.kind}-${getSectionTitle(section)}`}>
          <CatalogTable
            variant="compact"
            isTreeTable={hasOwnedServices}
            aria-label={hasGroups ? getSectionTitle(section) : words("catalog.title")}
          >
            <Tbody>
              {hasGroups && (
                <Tr>
                  <Td colSpan={serviceRowColumnCount}>{renderSectionHeading(section)}</Td>
                </Tr>
              )}
              {section.services.flatMap((service, index) =>
                renderServiceRows(service, 1, index + 1)
              )}
            </Tbody>
          </CatalogTable>
        </StackItem>
      ))}
    </Stack>
  );
};

/**
 * Renders the heading of a catalog section with its service and instance count.
 */
const renderSectionHeading = (section: CatalogSection): React.ReactNode => (
  <Flex alignItems={{ default: "alignItemsBaseline" }} columnGap={{ default: "columnGapSm" }}>
    <Title headingLevel="h2" size="md">
      {getSectionTitle(section)}
    </Title>
    <Content component={ContentVariants.small}>
      {words("catalog.section.count")(section.services.length, getSectionInstanceCount(section))}
    </Content>
  </Flex>
);

/**
 * Adjusts the PatternFly tree table, which has no props for this. A catalog row is two lines
 * with an icon, so the toggle is centered on the row instead of on the first text line, and it
 * uses the small plain button padding and a small-text chevron. Only the toggle expands a row,
 * so the cell drops PatternFly's pointer cursor. This overrides PF-internal
 * `pf-v6-c-table__tree-view-main`, `pf-v6-c-table__toggle` and `pf-v6-c-button` classes and
 * variables, so check it after a PatternFly upgrade.
 */
const CatalogTable = styled(Table)`
  .pf-v6-c-table__tree-view-main {
    align-items: center;
    cursor: auto;
  }

  .pf-v6-c-table__tree-view-main > .pf-v6-c-table__toggle .pf-v6-c-button {
    --pf-v6-c-button--PaddingBlockStart: var(--pf-v6-c-button--m-small--PaddingBlockStart);
    --pf-v6-c-button--PaddingBlockEnd: var(--pf-v6-c-button--m-small--PaddingBlockEnd);
    --pf-v6-c-button--m-plain--PaddingInlineStart: var(
      --pf-v6-c-button--m-plain--m-small--PaddingInlineStart
    );
    --pf-v6-c-button--m-plain--PaddingInlineEnd: var(
      --pf-v6-c-button--m-plain--m-small--PaddingInlineEnd
    );
    --pf-v6-c-button--FontSize: var(--pf-t--global--font--size--body--sm);
    --pf-v6-c-button--LineHeight: 1;
  }
`;
