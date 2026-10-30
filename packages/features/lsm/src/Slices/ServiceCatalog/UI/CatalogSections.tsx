import React, { useMemo } from "react";
import { Content, ContentVariants, Flex, Stack, StackItem, Title } from "@patternfly/react-core";
import { Table, Tbody, Td, Tr } from "@patternfly/react-table";
import styled from "styled-components";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { ServiceRow } from "./ServiceRow";
import { createCatalogSections, getSectionInstanceCount, getSectionTitle } from "./helpers";
import { CatalogSection, serviceRowColumnCount } from "./types";

interface Props {
  serviceModels: ServiceModel[];
}

/**
 * The service catalog: one table per section, each under a heading with its service and
 * instance count. A section is a `web_group`, or "Other services" for the services without one.
 * Without any group, the catalog is a single table without heading, and without any `web_icon`,
 * the rows have no icon tile.
 *
 * @props {Props} props - The props of the component.
 *  @prop {ServiceModel[]} serviceModels - The services in the catalog.
 *
 * @returns {React.FC<Props>} The service catalog sections.
 */
export const CatalogSections: React.FC<Props> = ({ serviceModels }) => {
  const sections = useMemo(() => createCatalogSections(serviceModels), [serviceModels]);
  const hasGroups = sections.some((section) => section.kind === "Group");
  const hasIconTile = sections.some((section) =>
    section.services.some(({ resolvedAnnotations }) => resolvedAnnotations.web_icon !== undefined)
  );

  return (
    <Stack hasGutter>
      {sections.map((section) => (
        <StackItem key={`${section.kind}-${getSectionTitle(section)}`}>
          <Table
            variant="compact"
            aria-label={hasGroups ? getSectionTitle(section) : words("catalog.title")}
          >
            <Tbody>
              {hasGroups && (
                <SectionHeadingRow>
                  <Td colSpan={serviceRowColumnCount}>{renderSectionHeading(section)}</Td>
                </SectionHeadingRow>
              )}
              {section.services.map((service) => (
                <ServiceRow
                  key={service.serviceModel.name}
                  service={service}
                  titleHeadingLevel={hasGroups ? "h3" : "h2"}
                  hasIconTile={hasIconTile}
                />
              ))}
            </Tbody>
          </Table>
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

const SectionHeadingRow = styled(Tr)`
  && {
    border-block-end: var(--pf-t--global--border--width--strong) solid
      var(--pf-t--global--text--color--regular);
  }
`;
