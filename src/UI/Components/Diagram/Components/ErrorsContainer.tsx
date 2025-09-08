import React, { useContext } from "react";
import { Content } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { ErrorMessageContainer } from "../../ErrorMessageContainer";
import { CanvasContext } from "../Context";
import { RelationCounterForCell } from "../interfaces";

/**
 * Validation component that currently checks for missing inter-service relations on the canvas and displays an alert if any are found.
 *
 * This component uses the CanvasContext to get the current state of the canvas, including whether it is dirty and the inter-service relations.
 * It filters the relations to find those that are missing (i.e., current count is less than the minimum required) and displays an alert with the details.
 *
 * @returns {React.FC | null} The rendered validation component or null if no missing relations are found or the canvas is not edited/dirty.
 */
export const ErrorsContainer: React.FC = () => {
  const { isDirty, interServiceRelationsOnCanvas } = useContext(CanvasContext);

  const interServiceRelationsThatAreMissing = Array.from(interServiceRelationsOnCanvas).filter(
    ([_key, value]) =>
      value.relations.filter((relation) => relation.currentAmount < relation.min).length > 0
  );

  //dirty flag is set to false on initial load for edited instances, that solves issue of flickering as we are starting canvas from empty state and populate it from ground up
  if (interServiceRelationsThatAreMissing.length === 0 || !isDirty) {
    return null;
  }

  //map the interServiceRelationsThatAreMissing to a get a list of relations that are missing
  const errorsToMap = interServiceRelationsThatAreMissing
    .map(([_id, value]) => value)
    .map((entity) => entity.relations.filter((r) => r.currentAmount < r.min))
    .flat();

  return (
    <ErrorMessageContainer title={words("validation.title")(errorsToMap.length)}>
      {interServiceRelationsThatAreMissing.map(([id, value]) => (
        <MissingRelationsForGivenCell key={id} entity={value} />
      ))}
    </ErrorMessageContainer>
  );
};

interface Props {
  entity: RelationCounterForCell;
}

/**
 * Renders a text content component that displays missing relations for a given entity.
 *
 * This component filters the relations of the entity to find those that are below the minimum required count and displays their names.
 *
 * @param {Object} props - The properties for the component.
 * @param {RelationCounterForCell} entity - The entity object containing name and relations.
 * @param {string} entity.name - The name of the entity.
 * @param {InterServiceRelationOnCanvasWithMin} .entity.relations - The relations of the entity, each with a name, current count, and minimum required count.
 * @returns {React.FC<Props>} The rendered text content component displaying the missing relations.
 */
const MissingRelationsForGivenCell: React.FC<Props> = ({ entity }) => {
  const { name, relations } = entity;

  return relations
    .filter((r) => r.currentAmount < r.min)
    .map((relation, index) => (
      <Content
        key={`missingRelationsParagraph-${name}_${relation.name}_${index}`}
        aria-label={`missingRelationsParagraph-${name}_${relation.name}_${index}`}
      >
        {words("instanceComposer.missingRelations")(name, Number(relation.min), relation.name)}
      </Content>
    ));
};
