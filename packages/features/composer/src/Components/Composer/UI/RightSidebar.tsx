import React, { useContext, useState } from "react";
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
import { AttributeClassifier } from "@inmanta/web-console-core/Common";
import { AttributeValue } from "@inmanta/web-console-ui/Components/AttributeList";
import { InstanceStateLabel } from "@inmanta/web-console-ui/Components/InstanceState";
import { ComposerContext } from "../Data/Context";
import { getShapeName, isReadOnlyShape } from "../Data/Helpers";
import { AttributeSetName, ServiceEntityShape } from "../Data/ServiceEntityShape";
import { RIGHT_SIDEBAR_WIDTH } from "../config";
import { EntityForm } from "./EntityForm";
import { entityColors } from "./entityColors";

/**
 * The details of the selected shape: its name, kind, state and description, and its attributes.
 * In the editor they are a form; in the viewer a read-only list, where a relation links to
 * the related entity on the canvas. An existing instance with a candidate and an active set
 * offers both: the form only works on the editable one (the candidate set), the other can
 * only be viewed.
 */
export const RightSidebar: React.FC = () => {
  const { mainService, activeShape, editable } = useContext(ComposerContext);
  // The set being viewed, remembered with whose it is: a new selection starts back on its
  // editable set (null), without a render of the previous card's choice in between.
  const [viewedSetState, setViewedSetState] = useState<{
    shapeId: string | null;
    set: AttributeSetName | null;
  }>({ shapeId: null, set: null });
  const activeShapeId = activeShape?.id ?? null;
  const viewedSet = viewedSetState.shapeId === activeShapeId ? viewedSetState.set : null;
  const setViewedSet = (set: AttributeSetName) =>
    setViewedSetState({ shapeId: activeShapeId, set });

  const description = activeShape
    ? activeShape.serviceModel.description || null
    : mainService?.description || null;

  const editableSet = activeShape?.getEditableSet() ?? null;
  const hasBothSets = !!(activeShape?.attributeSets?.candidate && activeShape.attributeSets.active);
  const selectedSet = (hasBothSets && viewedSet) || editableSet;
  const showsEditableSet = selectedSet === null || selectedSet === editableSet;
  const technicalName = activeShape?.getTechnicalName();

  return (
    <Wrapper
      direction={{ default: "column" }}
      spaceItems={{ default: "spaceItemsSm" }}
      flexWrap={{ default: "nowrap" }}
      role="region"
      aria-label={words("details")}
    >
      {activeShape ? (
        <Flex
          spaceItems={{ default: "spaceItemsSm" }}
          alignItems={{ default: "alignItemsBaseline" }}
        >
          <Title headingLevel="h2" size="xl">
            {activeShape.getDisplayName()}
          </Title>
          {technicalName && <Content component="small">{technicalName}</Content>}
          <Label isCompact color={entityColors[activeShape.entityType]}>
            {words(`instanceComposer.label.${activeShape.entityType}`)}
          </Label>
          {activeShape.isNew && (
            <Label isCompact variant="outline">
              {words("instanceComposer.label.new")}
            </Label>
          )}
          {activeShape.instanceState && <InstanceStateLabel {...activeShape.instanceState} />}
          {activeShape.isMarkedForDeletion && (
            <Label isCompact status="danger" variant="outline">
              {words("instanceComposer.card.markedForDeletion")}
            </Label>
          )}
        </Flex>
      ) : (
        <Title headingLevel="h2" size="xl">
          {words("details")}
        </Title>
      )}
      {description && <Content aria-label="service-description">{description}</Content>}
      {activeShape && hasBothSets && (
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
      {activeShape && editable && showsEditableSet && (
        <EntityForm
          activeShape={activeShape}
          isDisabled={
            isReadOnlyShape(activeShape) ||
            // Editing an instance staged to be deleted would be lost with it
            activeShape.isMarkedForDeletion
          }
        />
      )}
      {activeShape && editable && !showsEditableSet && selectedSet && (
        <>
          <Content component="small">{words("instanceComposer.sets.readOnly")}</Content>
          <EntityDetails
            shape={activeShape}
            attributes={activeShape.attributeSets?.[selectedSet]}
          />
        </>
      )}
      {activeShape && !editable && (
        <EntityDetails
          shape={activeShape}
          attributes={selectedSet ? activeShape.attributeSets?.[selectedSet] : undefined}
        />
      )}
      {!activeShape && (
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

// Every attribute of the model is shown, so none is left out as framework metadata
const classifier = new AttributeClassifier({ includeAllKeys: true });

/**
 * The attributes of a shape as a read-only list: the ones it works on, or a given set of them,
 * like the attribute set that can only be viewed. Embedded entities are shapes of their own,
 * so they are left out; a relation to a shape on the canvas selects it and moves the view to it.
 * The other values show like an instance's attributes elsewhere (AttributeValue): passwords
 * masked, JSON and multi-line text in a code block.
 */
const EntityDetails: React.FC<{
  shape: ServiceEntityShape;
  attributes?: InstanceAttributeModel;
}> = ({ shape, attributes: attributesSource }) => {
  const { canvasState, setActiveShape } = useContext(ComposerContext);
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

    setActiveShape(target);
    setCenter(x + width / 2, y + height / 2, { zoom: 1, duration: 300 });
  };

  const renderValue = (name: string, value: unknown) => {
    const values = Array.isArray(value) ? value : [value];

    if (relationNames.has(name)) {
      return values.map((id) => {
        const target = canvasState.get(String(id));

        return target ? (
          <Button key={String(id)} variant="link" isInline onClick={() => showShape(target)}>
            {getShapeName(target)}
          </Button>
        ) : (
          <span key={String(id)}>{String(id)}</span>
        );
      });
    }
    const [attribute] =
      value === null || value === undefined ? [] : classifier.classify({ [name]: value });

    return attribute ? (
      <AttributeValue attribute={attribute} />
    ) : (
      words("instanceComposer.details.noValue")
    );
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
