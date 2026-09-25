import React, { useMemo, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import { Flex, ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import { AttributeClassifier } from "@/Data/Common/AttributeClassifier";
import { CodeEditor } from "@/UI/Components/CodeEditor";
import { words } from "@/UI/words";
import { ResourceAttributes } from "./ResourceAttributes";

type ViewMode = "structured" | "json";

interface Props {
  attributes: Record<string, unknown>;
  classifier: AttributeClassifier;
  isExpanded: (key: string) => boolean;
  onToggle: (key: string) => () => void;
}

/**
 * A resource's attributes with a Structured / JSON toggle. Structured is the
 * reference-aware view; JSON shows the attributes verbatim and fills the height
 * left in its scroll section.
 *
 * @prop {Record<string, unknown>} attributes - The raw attributes of the resource.
 * @prop {AttributeClassifier} classifier - Classifies the attributes in the structured view.
 * @prop {(key: string) => boolean} isExpanded - Whether the node at a path is expanded.
 * @prop {(key: string) => () => void} onToggle - Returns the toggle handler for a path.
 */
export const ResourceAttributesView: React.FC<Props> = ({
  attributes,
  classifier,
  isExpanded,
  onToggle,
}) => {
  const [mode, setMode] = useState<ViewMode>("structured");
  const json = useMemo(() => JSON.stringify(attributes, null, 2), [attributes]);

  // In JSON mode the view grows to fill the scroll section. The bottom spacer keeps
  // the last element off its edge.
  return (
    <Flex
      direction={{ default: "column" }}
      flexWrap={{ default: "nowrap" }}
      gap={{ default: "gapMd" }}
      style={{
        paddingBottom: "var(--pf-t--global--spacer--md)",
        ...(mode === "json" && { flex: "1 1 100vh" }),
      }}
    >
      <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
        <ToggleGroup aria-label={words("resources.attributes.view.label")}>
          <ToggleGroupItem
            text={words("resources.attributes.view.structured")}
            buttonId="structured"
            isSelected={mode === "structured"}
            onChange={() => setMode("structured")}
          />
          <ToggleGroupItem
            text={words("resources.attributes.view.json")}
            buttonId="json"
            isSelected={mode === "json"}
            onChange={() => setMode("json")}
          />
        </ToggleGroup>
      </Flex>
      {mode === "json" ? (
        <CodeEditor code={json} language={Language.json} height="100%" />
      ) : (
        <ResourceAttributes
          attributes={attributes}
          classifier={classifier}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      )}
    </Flex>
  );
};
