import React, { useMemo, useState } from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Card,
  CardBody,
  DescriptionList,
  Flex,
  FlexItem,
  Stack,
  StackItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
import { Details } from "@/Core/Domain/Resource/Resource";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { AttributeClassifier, AttributeList } from "@/UI/Components";
import {
  CodeEditorCopyControl,
  CodeEditorHeightToggleControl,
} from "@/UI/Components/CodeEditorControls";
import { getThemePreference } from "@/UI/Components/DarkmodeOption";
import { words } from "@/UI/words";
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

const HIDDEN_KEYS = new Set(["mutators", "references"]);

type ViewMode = "structured" | "json";

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
  const [viewMode, setViewMode] = useState<ViewMode>("structured");
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

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

  const rawJson = useMemo(
    () => JSON.stringify(details.attributes, null, 2),
    [details.attributes]
  );

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

  const editorHeight = isEditorExpanded
    ? "calc(100vh - 300px)"
    : rawJson.split("\n").length > 15
      ? "400px"
      : "sizeToFit";

  return (
    <Card isCompact>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
              <FlexItem>
                <ToggleGroup aria-label="Desired State view toggle" isCompact>
                  <ToggleGroupItem
                    text={words("resources.attributes.view.structured")}
                    buttonId="desired-state-view-structured"
                    isSelected={viewMode === "structured"}
                    onChange={() => setViewMode("structured")}
                  />
                  <ToggleGroupItem
                    text={words("resources.attributes.view.json")}
                    buttonId="desired-state-view-json"
                    isSelected={viewMode === "json"}
                    onChange={() => setViewMode("json")}
                  />
                </ToggleGroup>
              </FlexItem>
            </Flex>
          </StackItem>
          {viewMode === "json" ? (
            <StackItem>
              <CodeEditor
                isReadOnly
                isDarkTheme={getThemePreference() === "dark"}
                code={rawJson}
                isLanguageLabelVisible
                language={Language.json}
                isDownloadEnabled
                customControls={
                  <>
                    <CodeEditorCopyControl code={rawJson} />
                    <CodeEditorHeightToggleControl
                      code={rawJson}
                      isExpanded={isEditorExpanded}
                      onToggle={() => setIsEditorExpanded(!isEditorExpanded)}
                    />
                  </>
                }
                height={editorHeight}
              />
            </StackItem>
          ) : (
            <>
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
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};
