import React from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList } from "@/UI/Components";
import {
  MjsonArg,
  Reference,
  ReferenceArg,
  isReferenceArg,
  isResourceArg,
} from "@S/ResourceDetails/Core/Reference";
import { MjsonValueView } from "./MjsonValueView";

interface Props {
  reference: Reference;
  onNavigateToReference: (id: string) => void;
}

const isMjsonArg = (arg: ReferenceArg): arg is MjsonArg => arg.type === "mjson";

/**
 * Renders the arguments of a single reference in a Desired-State-lookalike
 * layout. Literal args go through `AttributeClassifier` so JSON, XML and
 * multi-line formatters are reused. Args of type `reference` / `resource`
 * render as clickable labels. Args of type `mjson` render via
 * `MjsonValueView`, which inlines clickable labels at the JSON paths listed
 * in `arg.references`.
 */
export const ExpandedReferenceView: React.FC<Props> = ({
  reference,
  onNavigateToReference,
}) => {
  const linkedArgs = reference.args.filter(
    (arg): arg is Extract<ReferenceArg, { type: "reference" | "resource" }> =>
      isReferenceArg(arg) || isResourceArg(arg)
  );
  const mjsonArgs = reference.args.filter(isMjsonArg);
  const literalArgs = reference.args.filter(
    (arg) => !isReferenceArg(arg) && !isResourceArg(arg) && !isMjsonArg(arg)
  );

  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
    (key: string, value: string) => ({ kind: "Code", key, value })
  );
  const literalRecord = Object.fromEntries(
    literalArgs.map((arg) => [arg.name, "value" in arg ? arg.value : undefined])
  );
  const classifiedAttributes = classifier.classify(literalRecord);

  return (
    <Card isCompact>
      <CardBody>
        <Stack hasGutter>
          {linkedArgs.length > 0 && (
            <StackItem>
              <DescriptionList isHorizontal>
                {linkedArgs.map((arg) => (
                  <DescriptionListGroup key={arg.name}>
                    <DescriptionListTerm>{arg.name}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {isReferenceArg(arg) ? (
                        <Label color="blue" onClick={() => onNavigateToReference(arg.id)}>
                          → {arg.id}
                        </Label>
                      ) : (
                        <Label color="grey">{arg.id}</Label>
                      )}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                ))}
              </DescriptionList>
            </StackItem>
          )}
          {mjsonArgs.length > 0 && (
            <StackItem>
              <DescriptionList isHorizontal>
                {mjsonArgs.map((arg) => (
                  <DescriptionListGroup key={arg.name}>
                    <DescriptionListTerm>{arg.name}</DescriptionListTerm>
                    <DescriptionListDescription>
                      <MjsonValueView
                        arg={arg}
                        onNavigateToReference={onNavigateToReference}
                      />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                ))}
              </DescriptionList>
            </StackItem>
          )}
          {classifiedAttributes.length > 0 && (
            <StackItem>
              <AttributeList attributes={classifiedAttributes} />
            </StackItem>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};
