import React, { useContext } from "react";
import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  EmptyState,
  EmptyStateBody,
  EmptyStateVariant,
  Flex,
  Label,
  Title,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons";
import { useReactFlow } from "@xyflow/react";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { RIGHT_SIDEBAR_WIDTH } from "../config";
import { EntityForm } from "./EntityForm";

const labelColors = { core: "yellow", embedded: "blue", relation: "purple" } as const;

/**
 * The details of the selected shape: its name, kind and description, and its attributes.
 * In the editor they are a form; in the viewer a read-only list, where a relation links to
 * the related entity on the canvas.
 */
export const RightSidebar: React.FC = () => {
  const { mainService, activeCell, editable } = useContext(ComposerContext);
  const description = activeCell
    ? activeCell.serviceModel.description || null
    : mainService?.description || null;

  return (
    <Wrapper
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
      flexWrap={{ default: "nowrap" }}
      aria-label={words("details")}
    >
      {activeCell ? (
        <Flex spaceItems={{ default: "spaceItemsSm" }} alignItems={{ default: "alignItemsCenter" }}>
          <Title headingLevel="h2" size="xl">
            {activeCell.getDisplayName()}
          </Title>
          <Label isCompact color={labelColors[activeCell.entityType]}>
            {words(`instanceComposer.label.${activeCell.entityType}`)}
          </Label>
          {activeCell.isNew && (
            <Label isCompact variant="outline">
              {words("instanceComposer.label.new")}
            </Label>
          )}
        </Flex>
      ) : (
        <Title headingLevel="h2" size="xl">
          {words("details")}
        </Title>
      )}
      {description && <Content aria-label="service-description">{description}</Content>}
      {activeCell && editable && (
        <EntityForm
          activeCell={activeCell}
          isDisabled={activeCell.entityType === "relation" && !activeCell.isNew}
        />
      )}
      {activeCell && !editable && <EntityDetails shape={activeCell} />}
      {!activeCell && (
        <Flex flex={{ default: "flex_1" }} alignItems={{ default: "alignItemsCenter" }}>
          <EmptyState
            headingLevel="h4"
            variant={EmptyStateVariant.sm}
            icon={CubesIcon}
            titleText={words("instanceComposer.formModal.noElementSelected.title")}
          >
            <EmptyStateBody>{words("instanceComposer.formModal.noElementSelected")}</EmptyStateBody>
          </EmptyState>
        </Flex>
      )}
    </Wrapper>
  );
};

/**
 * The attributes of a shape as a read-only list. Embedded entities are shapes of their own,
 * so they are left out; a relation to a shape on the canvas selects it and moves the view to it.
 */
const EntityDetails: React.FC<{ shape: ServiceEntityShape }> = ({ shape }) => {
  const { canvasState, setActiveCell } = useContext(ComposerContext);
  const { setCenter } = useReactFlow();
  const relationNames = new Set(
    (shape.serviceModel.inter_service_relations || []).map((relation) => relation.name)
  );
  const embeddedNames = new Set(
    (shape.serviceModel.embedded_entities || []).map((entity) => entity.name)
  );
  const attributes = Object.entries(shape.instanceAttributes).filter(
    ([name]) => !embeddedNames.has(name) && name !== "id"
  );

  if (attributes.length === 0) {
    return <Content>{words("instanceComposer.formModal.noAttributes")}</Content>;
  }

  const showShape = (target: ServiceEntityShape) => {
    const { x, y, width, height } = target.getBBox();

    setActiveCell(target);
    setCenter(x + width / 2, y + height / 2, { zoom: 1, duration: 300 });
  };

  const renderValue = (name: string, value: unknown) => {
    const values = Array.isArray(value) ? value : [value];

    if (relationNames.has(name)) {
      return values.map((id) => {
        const target = canvasState.get(String(id));

        return target ? (
          <Button key={String(id)} variant="link" isInline onClick={() => showShape(target)}>
            {target.getDisplayAttributes()[0]?.value || String(id)}
          </Button>
        ) : (
          <span key={String(id)}>{String(id)}</span>
        );
      });
    }
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return typeof value === "object" ? JSON.stringify(value) : String(value);
  };

  return (
    <DescriptionList isCompact isHorizontal data-testid="entity-details">
      {attributes.map(([name, value]) => (
        <DescriptionListGroup key={name}>
          <DescriptionListTerm>{name}</DescriptionListTerm>
          <DescriptionListDescription>{renderValue(name, value)}</DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
};

const Wrapper = styled(Flex)`
  height: 100%;
  width: ${RIGHT_SIDEBAR_WIDTH}px;
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  background: var(--pf-t--global--background--color--primary--default);
  border-left: 1px solid var(--pf-t--global--border--color--default);
  padding: var(--pf-t--global--spacer--lg);
  overflow: auto;
`;
