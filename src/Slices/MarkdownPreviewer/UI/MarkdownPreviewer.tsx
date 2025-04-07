import React, { useState } from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import {
  Flex,
  FlexItem,
  Hint,
  HintTitle,
  HintBody,
  Button,
} from "@patternfly/react-core";
import { CloseIcon } from "@patternfly/react-icons";
import { MarkdownCard } from "@/Slices/ServiceInventory/UI/Tabs/MarkdownCard";
import { PageContainer } from "@/UI/Components";
import { getThemePreference } from "@/UI/Components/DarkmodeOption";
import { words } from "@/UI/words";
import { CodeEditorControls, useDocumentationContent } from ".";

interface Props {
  service: string;
  instance: string;
  instanceId: string;
}

/**
 * The MarkdownPreviewer Component
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} service - the name of the service_entity
 *  @prop {string} instance - the displayName of the instance
 *  @prop {string} instanceId - the uuid of the instance
 * @returns {React.FC<Props>}  A React Component that provides the context for the Markdown Previewer.
 */
export const MarkdownPreviewer: React.FC<Props> = ({
  service,
  instance,
  instanceId,
}) => {
  const { code, pageTitle } = useDocumentationContent({ service, instanceId });
  const [showHint, setShowHint] = useState(true);

  return (
    <PageContainer
      aria-label="Markdown-Previewer-Success"
      pageTitle={pageTitle}
    >
      {showHint && (
        <Hint
          actions={
            <Button
              variant="plain"
              onClick={() => setShowHint(false)}
              aria-label="Close hint"
            >
              <CloseIcon />
            </Button>
          }
        >
          <HintTitle>{words("markdownPreviewer.hint.title")}</HintTitle>
          <HintBody>{words("markdownPreviewer.hint.body")}</HintBody>
        </Hint>
      )}
      <Flex>
        <FlexItem flex={{ default: "flex_1" }}>
          <CodeEditor
            isDarkTheme={getThemePreference() === "dark"}
            isLineNumbersVisible
            isReadOnly
            isMinimapVisible
            isLanguageLabelVisible
            code={code}
            language={Language.markdown}
            isFullHeight
            height="calc(100vh - 550px)"
            customControls={
              <CodeEditorControls
                code={code}
                service={service}
                instance={instance}
              />
            }
          />
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <MarkdownCard
            attributeValue={code}
            web_title={`${service}-${instance}-documentation-preview`}
          />
        </FlexItem>
      </Flex>
    </PageContainer>
  );
};
