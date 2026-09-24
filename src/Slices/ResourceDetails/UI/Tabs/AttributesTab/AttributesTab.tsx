import React, { useMemo, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import { Flex, ToggleGroup, ToggleGroupItem } from "@patternfly/react-core";
import { Details } from "@/Core/Domain/Resource/Resource";
import { AttributeClassifier, useUrlStateWithExpansion } from "@/Data";
import { CodeEditor, ResourceAttributes } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props {
  details: Details;
}

type ViewMode = "structured" | "json";

const classifier = new AttributeClassifier();

/**
 * The Desired State tab. A top-right Structured / JSON toggle switches between the
 * reference-aware attribute view and `details.attributes` verbatim. Reference
 * expansion is kept in the URL.
 *
 * @prop {Details} details - The details of the resource
 */
export const AttributesTab: React.FC<Props> = ({ details }) => {
  const [mode, setMode] = useState<ViewMode>("structured");
  const [isExpanded, onToggle] = useUrlStateWithExpansion({
    key: "references",
    route: "ResourceDetails",
  });
  const json = useMemo(() => JSON.stringify(details.attributes, null, 2), [details.attributes]);

  // The structured view keeps its content height, so the page section owns the scroll.
  // The JSON view starts at 100vh and shrinks to the height left in the page section,
  // so the full-height editor tracks banners and viewport changes without a measured
  // offset. The bottom spacer keeps the last element off the scroll edge.
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
          attributes={details.attributes}
          classifier={classifier}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      )}
    </Flex>
  );
};
