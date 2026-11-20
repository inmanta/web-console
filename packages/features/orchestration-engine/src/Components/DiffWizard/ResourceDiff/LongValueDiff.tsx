import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DiffEditor, DiffOnMount } from "@monaco-editor/react";
import styled from "styled-components";
import { words } from "@inmanta/web-console-core";
import { DiffSideLabels } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { useTheme } from "@inmanta/web-console-ui/Components/DarkmodeOption";
import {
  DIFF_EDITOR_OPTIONS,
  INITIAL_DIFF_EDITOR_HEIGHT,
  MonacoDiffEditor,
  SIDE_BY_SIDE_MIN_WIDTH,
  SideLabelsLayout,
} from "./types";

interface Props extends DiffSideLabels {
  attributeName: string;
  fromValue: string;
  toValue: string;
  onDiffReady?: () => void;
}

/**
 * The line diff of a long value, like a config, JSON or file content, in Monaco's diff editor.
 * The editor is as high as its content and is read only. From SIDE_BY_SIDE_MIN_WIDTH the sides
 * sit next to each other, with a strip above that names each side, lined up with its code; below
 * it they are stacked. The diff stays hidden until Monaco has computed it and folded the unchanged
 * lines, so it shows at its final size at once.
 *
 * @props {Props} props - The component props
 *  @prop {string} attributeName - The name of the attribute, which labels the diff
 *  @prop {string} fromValue - The value the diff starts from
 *  @prop {string} toValue - The value the diff goes to
 *  @prop {string} fromLabel - The header of the side the diff starts from
 *  @prop {string} toLabel - The header of the side the diff goes to
 *  @prop {() => void} [onDiffReady] - Called when the diff shows, to show its surroundings with it
 *
 * @returns {React.FC<Props>} The line diff
 *
 * @note The DiffEditor disposes its models before the diff widget lets go of them, which throws,
 * or leaks them when kept (https://github.com/microsoft/vscode/pull/230713). So the models are
 * kept and disposed here, after the editor.
 * Monaco's own switch (useInlineViewWhenSpaceIsLimited) stays stacked after the editor grows
 * past the breakpoint during a resize or while its row opens, so the width is watched here, and
 * measured before the editor is created so it starts in the right layout.
 */
export const LongValueDiff: React.FC<Props> = ({
  attributeName,
  fromValue,
  toValue,
  fromLabel,
  toLabel,
  onDiffReady,
}) => {
  const [isSideBySide, setIsSideBySide] = useState<boolean | undefined>(undefined);
  const [isDiffReady, setIsDiffReady] = useState(false);
  const [contentHeight, setContentHeight] = useState(INITIAL_DIFF_EDITOR_HEIGHT);
  const [sideLabelsLayout, setSideLabelsLayout] = useState<SideLabelsLayout | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoDiffEditor>(undefined);
  const { theme } = useTheme();

  const options = useMemo(
    () => ({ ...DIFF_EDITOR_OPTIONS, renderSideBySide: isSideBySide }),
    [isSideBySide]
  );

  useLayoutEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const updateIsSideBySide = () => setIsSideBySide(frame.clientWidth >= SIDE_BY_SIDE_MIN_WIDTH);
    const resizeObserver = new ResizeObserver(updateIsSideBySide);

    updateIsSideBySide();
    resizeObserver.observe(frame);

    return () => resizeObserver.disconnect();
  }, []);

  const handleMount: DiffOnMount = (editor) => {
    editorRef.current = editor;
    const originalEditor = editor.getOriginalEditor();
    const modifiedEditor = editor.getModifiedEditor();
    const updateContentHeight = () =>
      setContentHeight(
        Math.max(originalEditor.getContentHeight(), modifiedEditor.getContentHeight())
      );
    const updateSideLabelsLayout = () => {
      const fromLayout = originalEditor.getLayoutInfo();
      const toLayout = modifiedEditor.getLayoutInfo();

      // Stacked, the editor of the from side shrinks to its line numbers.
      if (fromLayout.width <= fromLayout.contentLeft) {
        setSideLabelsLayout(null);

        return;
      }

      setSideLabelsLayout({
        fromWidth: editor.getContainerDomNode().clientWidth - toLayout.width,
        fromCodeStart: fromLayout.contentLeft,
        toCodeStart: toLayout.contentLeft,
      });
    };

    const showDiff = () => {
      updateContentHeight();
      setIsDiffReady(true);
      onDiffReady?.();
    };

    updateContentHeight();
    updateSideLabelsLayout();
    originalEditor.onDidContentSizeChange(updateContentHeight);
    modifiedEditor.onDidContentSizeChange(updateContentHeight);
    originalEditor.onDidLayoutChange(updateSideLabelsLayout);
    modifiedEditor.onDidLayoutChange(updateSideLabelsLayout);
    editor.onDidUpdateDiff(showDiff);

    // The first diff can be done before this callback runs, then its event has already passed.
    if (editor.getLineChanges() !== null) {
      showDiff();
    }
  };

  useEffect(
    () => () => {
      const editor = editorRef.current;

      if (!editor) {
        return;
      }

      const models = editor.getModel();

      editor.dispose();
      models?.original.dispose();
      models?.modified.dispose();
    },
    []
  );

  return (
    <DiffFrame ref={frameRef} $isDiffReady={isDiffReady}>
      {sideLabelsLayout && (
        <SideLabels $fromWidth={sideLabelsLayout.fromWidth}>
          <SideLabel $codeStart={sideLabelsLayout.fromCodeStart}>{fromLabel}</SideLabel>
          <SideLabel $codeStart={sideLabelsLayout.toCodeStart}>{toLabel}</SideLabel>
        </SideLabels>
      )}
      {isSideBySide !== undefined && (
        <DiffEditor
          height={`${isDiffReady ? contentHeight : INITIAL_DIFF_EDITOR_HEIGHT}px`}
          original={fromValue}
          modified={toValue}
          options={options}
          theme={`vs-${theme}`}
          loading={null}
          keepCurrentOriginalModel
          keepCurrentModifiedModel
          wrapperProps={{
            "aria-label": words("desiredState.compare.attributeChanges")(attributeName),
          }}
          onMount={handleMount}
        />
      )}
    </DiffFrame>
  );
};

/**
 * A thin rounded border around the side labels and the editor. Until the diff is ready it takes
 * no space and stays hidden, so the page below only moves once.
 */
const DiffFrame = styled.div<{ $isDiffReady: boolean }>`
  border: var(--pf-t--global--border--width--box--default) solid
    var(--pf-t--global--border--color--default);
  border-radius: var(--pf-t--global--border--radius--small);
  overflow: hidden;

  ${({ $isDiffReady }) =>
    !$isDiffReady &&
    `
    height: 0;
    border-width: 0;
    visibility: hidden;
  `}
`;

/** The strip above the editor that names each side, split where the editor splits. */
const SideLabels = styled.div<{ $fromWidth: number }>`
  display: grid;
  grid-template-columns: ${({ $fromWidth }) => `${$fromWidth}px`} 1fr;
  background-color: var(--pf-t--global--background--color--secondary--default);
  border-block-end: var(--pf-t--global--border--width--divider--default) solid
    var(--pf-t--global--border--color--default);
`;

/** The name of one side, starting where its code starts. */
const SideLabel = styled.div<{ $codeStart: number }>`
  padding-block: var(--pf-t--global--spacer--xs);
  padding-inline-start: ${({ $codeStart }) => `${$codeStart}px`};
  font-size: var(--pf-t--global--font--size--body--sm);
  font-weight: var(--pf-t--global--font--weight--body--bold);
  color: var(--pf-t--global--text--color--subtle);

  & + & {
    border-inline-start: var(--pf-t--global--border--width--divider--default) solid
      var(--pf-t--global--border--color--default);
  }
`;
