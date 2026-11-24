import React, { useMemo, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import { Flex } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { AttributeClassifier } from "@inmanta/web-console-core/Common/AttributeClassifier";
import { CodeEditor } from "@inmanta/web-console-ui/Components/CodeEditor";
import {
  StructuredJsonToggle,
  StructuredJsonView,
} from "@inmanta/web-console-ui/Components/StructuredJsonToggle";
import { ResourceAttributes } from "./ResourceAttributes";

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
  const [view, setView] = useState<StructuredJsonView>("structured");
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
        ...(view === "json" && { flex: "1 1 100vh" }),
      }}
    >
      <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
        <StructuredJsonToggle
          view={view}
          onChange={setView}
          aria-label={words("resources.attributes.view.label")}
        />
      </Flex>
      {view === "json" ? (
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
