import React, { useContext, useEffect, useState } from "react";
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
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { CubesIcon } from "@patternfly/react-icons/dist/esm/icons/cubes-icon";
import { useReactFlow } from "@xyflow/react";
import styled from "styled-components";
import { InstanceAttributeModel, words } from "@inmanta/web-console-core";
import { InstanceStateLabel } from "@inmanta/web-console-ui/Components/InstanceState";
import { ComposerContext } from "../Data/Context";
import { AttributeSetName, ServiceEntityShape } from "../Data/ServiceEntityShape";
import { RIGHT_SIDEBAR_WIDTH } from "../config";
import { EntityForm } from "./EntityForm";

const labelColors = { core: "yellow", embedded: "blue", relation: "purple" } as const;

/**
 * The details of the selected shape: its name, kind, state and description, and its attributes.
 * In the editor they are a form; in the viewer a read-only list, where a relation links to
 * the related entity on the canvas. An existing instance with a candidate and an active set
 * offers both: the form only works on the editable one (the candidate set), the other can
 * only be viewed.
 */
export const RightSidebar: React.FC = () => {
  const { mainService, activeCell, editable } = useContext(ComposerContext);
  // The set being viewed; null means the editable one, the default.
  const [viewedSet, setViewedSet] = useState<AttributeSetName | null>(null);

  // A new selection starts back on its editable set.
  useEffect(() => setViewedSet(null), [activeCell]);

  const description = activeCell
    ? activeCell.serviceModel.description || null
    : mainService?.description || null;

  const editableSet = activeCell?.getEditableSet() ?? null;
  const hasBothSets = !!(activeCell?.attributeSets?.candidate && activeCell.attributeSets.active);
  const selectedSet = (hasBothSets && viewedSet) || editableSet;
  const showsEditableSet = selectedSet === null || selectedSet === editableSet;

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
          {activeCell.instanceState && <InstanceStateLabel {...activeCell.instanceState} />}
        </Flex>
      ) : (
        <Title headingLevel="h2" size="xl">
          {words("details")}
        </Title>
      )}
      {description && <Content aria-label="service-description">{description}</Content>}
      {activeCell && hasBothSets && (
        <ToggleGroup aria-label={words("instanceComposer.sets.label")} isCompact>
          <ToggleGroupItem
            text={words("instanceComposer.sets.candidate")}
            buttonId="attribute-set-candidate"
            isSelected={selectedSet === "candidate"}
            onChange={() => setViewedSet("candidate")}
          />
          <ToggleGroupItem
            text={words("instanceComposer.sets.active")}
            buttonId="attribute-set-active"
            isSelected={selectedSet === "active"}
            onChange={() => setViewedSet("active")}
          />
        </ToggleGroup>
      )}
      {activeCell && editable && showsEditableSet && (
        <EntityForm
          activeCell={activeCell}
          isDisabled={activeCell.entityType === "relation" && !activeCell.isNew}
        />
      )}
      {activeCell && editable && !showsEditableSet && selectedSet && (
        <>
          <Content component="small">{words("instanceComposer.sets.readOnly")}</Content>
          <EntityDetails shape={activeCell} attributes={activeCell.attributeSets?.[selectedSet]} />
        </>
      )}
      {activeCell && !editable && (
        <EntityDetails
          shape={activeCell}
          attributes={selectedSet ? activeCell.attributeSets?.[selectedSet] : undefined}
        />
      )}
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
 * The attributes of a shape as a read-only list: the ones it works on, or a given set of them,
 * like the attribute set that can only be viewed. Embedded entities are shapes of their own,
 * so they are left out; a relation to a shape on the canvas selects it and moves the view to it.
 */
const EntityDetails: React.FC<{
  shape: ServiceEntityShape;
  attributes?: InstanceAttributeModel;
}> = ({ shape, attributes: attributesSource }) => {
  const { canvasState, setActiveCell } = useContext(ComposerContext);
  const { setCenter } = useReactFlow();
  const relationNames = new Set(
    (shape.serviceModel.inter_service_relations || []).map((relation) => relation.name)
  );
  const embeddedNames = new Set(
    (shape.serviceModel.embedded_entities || []).map((entity) => entity.name)
  );
  const attributes = Object.entries(attributesSource ?? shape.instanceAttributes).filter(
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
