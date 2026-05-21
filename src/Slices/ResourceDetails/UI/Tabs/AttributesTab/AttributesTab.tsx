import React, { useMemo } from "react";
import {
  Card,
  CardBody,
  DescriptionList,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import { Details } from "@/Core/Domain/Resource/Resource";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList } from "@/UI/Components";
import { buildMutatorSubstitutions, extractMutators } from "@S/ResourceDetails/Core/Mutator";
import { extractReferences } from "@S/ResourceDetails/Core/Reference";
import {
  deepCloneJson,
  setAtPath,
  parseJsonPath,
  sentinelFor,
} from "../ReferencesTab/sentinel";
import { MutatedAttributeRow } from "./MutatedAttributeRow";

interface Props {
  details: Details;
  onNavigateToReference: (id: string) => void;
}

/** Keys we never want to surface in the Desired State tab. */
const HIDDEN_KEYS = new Set(["mutators", "references"]);

/**
 * Applies the mutator substitutions on top of `attributes`. Returns the
 * substituted attributes together with the set of top-level keys touched by
 * at least one mutator — those keys are rendered by `MutatedAttributeRow`
 * instead of going through the default `AttributeList`.
 */
const applyMutatorSubstitutions = (
  attributes: Record<string, unknown>,
  substitutions: Record<string, string>
): { substituted: Record<string, unknown>; mutatedKeys: Set<string> } => {
  const clone = deepCloneJson(attributes);
  const mutatedKeys = new Set<string>();

  for (const [path, refId] of Object.entries(substitutions)) {
    const tokens = parseJsonPath(path);

    if (tokens.length === 0) {
      continue;
    }
    const topKey = tokens[0];

    if (typeof topKey !== "string") {
      continue;
    }
    mutatedKeys.add(topKey);

    if (tokens.length === 1) {
      clone[topKey] = sentinelFor(refId);
    } else {
      setAtPath(clone, path, sentinelFor(refId));
    }
  }

  return { substituted: clone, mutatedKeys };
};

export const AttributesTab: React.FC<Props> = ({ details, onNavigateToReference }) => {
  const { substituted, mutatedKeys, getReferenceType } = useMemo(() => {
    const mutators = extractMutators(details.attributes);
    const substitutions = buildMutatorSubstitutions(mutators);
    const applied = applyMutatorSubstitutions(details.attributes, substitutions);

    const references = extractReferences(details.attributes);
    const typeById = new Map<string, string>();

    for (const reference of references) {
      typeById.set(reference.id, reference.type);
    }

    return {
      substituted: applied.substituted,
      mutatedKeys: applied.mutatedKeys,
      getReferenceType: (id: string) => typeById.get(id),
    };
  }, [details.attributes]);

  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter(),
    (key: string, value: string) => ({ kind: "Code", key, value }),
    (key: string) =>
      key === "version" || key === "requires" || HIDDEN_KEYS.has(key) || mutatedKeys.has(key)
  );
  const classifiedAttributes = classifier.classify(substituted);

  const mutatedEntries = Array.from(mutatedKeys)
    .filter((key) => !HIDDEN_KEYS.has(key))
    .sort()
    .map((key) => ({ key, value: substituted[key] }));

  return (
    <Card isCompact>
      <CardBody>
        <Stack hasGutter>
          {mutatedEntries.length > 0 && (
            <StackItem>
              <DescriptionList isHorizontal>
                {mutatedEntries.map(({ key, value }) => (
                  <MutatedAttributeRow
                    key={key}
                    attributeKey={key}
                    value={value}
                    onNavigateToReference={onNavigateToReference}
                    getReferenceType={getReferenceType}
                  />
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
