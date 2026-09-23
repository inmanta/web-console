import React, { ComponentProps, useEffect, useRef, useState } from "react";
import { Language } from "@patternfly/react-code-editor";
import { FormGroup, FormHelperText, HelperText, HelperTextItem } from "@patternfly/react-core";
import { DictField } from "@/Core";
import { words } from "@/UI";
import { CodeEditor } from "@/UI/Components/CodeEditor";
import { ResizeHandle } from "@/UI/Components/ResizeHandle";
import { DictValue, toDict, toText } from "./helpers";

const MAX_AUTO_HEIGHT = 350;

interface Props {
  field: DictField;
  value: unknown;
  onChange: (value: DictValue | null) => void;
  readOnly?: boolean;
}

/**
 * DictFieldInput
 *
 * A JSON editor for dictionary-type service instance fields, backed by the
 * PatternFly CodeEditor (Monaco). It auto-resizes line-by-line as content
 * grows (capped at 350 px) until the user drags the resize handle, after which
 * the user's height sticks. The handle can't go below one line of the editor.
 * It validates JSON in real time and surfaces parse errors below the editor.
 *
 * @prop {DictField} field - Field metadata: name, description, isOptional.
 * @prop {unknown} value - Current value; synced into the editor when changed externally (e.g. form reset).
 * @prop {(value: DictValue | null) => void} onChange - Called with the parsed object on every valid edit.
 * @prop {boolean} [readOnly=false] - Disables editing and marks the editor with aria-disabled.
 *
 * @returns {React.ReactElement} The rendered JSON dictionary editor field.
 */
export const DictFieldInput: React.FC<Props> = ({ field, value, onChange, readOnly = false }) => {
  const [text, setText] = useState<string>(() => toText(value));
  const [isInvalid, setIsInvalid] = useState(false);
  const [height, setHeight] = useState(100);
  // One line of the editor, read from Monaco on mount.
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);
  // Once the user resizes the editor by hand, stop auto-sizing it to its content.
  const isManuallyResizedRef = useRef(false);

  // Tracks the serialized form of the last value we emitted via onChange so we
  // can distinguish a parent re-render carrying our own round-tripped value from
  // a genuine external change (e.g. a form reset) that should update the editor.
  const lastEmittedRef = useRef(toText(value));

  useEffect(() => {
    const incoming = toText(value);

    if (incoming !== lastEmittedRef.current) {
      lastEmittedRef.current = incoming;
      setText(incoming);
      setIsInvalid(false);
    }
  }, [value]);

  const handleEditorDidMount: ComponentProps<typeof CodeEditor>["onEditorDidMount"] = (
    editor,
    monaco
  ) => {
    setMinHeight(editor.getOption(monaco.editor.EditorOption.lineHeight));
    setHeight(Math.min(editor.getContentHeight(), MAX_AUTO_HEIGHT));

    editor.onDidContentSizeChange((e) => {
      if (!isManuallyResizedRef.current) {
        setHeight(Math.min(e.contentHeight, MAX_AUTO_HEIGHT));
      }
    });
  };

  const handleResize = (newHeight: number) => {
    isManuallyResizedRef.current = true;
    setHeight(newHeight);
  };

  const handleChange = (val: string) => {
    setText(val);
    const parsed = toDict(val);
    setIsInvalid(parsed === undefined);

    if (parsed !== undefined) {
      lastEmittedRef.current = toText(parsed);
      onChange(parsed);
    }
  };

  return (
    <FormGroup isRequired={!field.isOptional} fieldId={field.name} label={field.name}>
      <CodeEditor
        data-testid={`DictInput-${field.name}`}
        aria-disabled={readOnly || undefined}
        code={text}
        language={Language.json}
        height={`${height}px`}
        isReadOnly={readOnly}
        isCopyEnabled={false}
        isDownloadEnabled={false}
        isLineNumbersVisible={false}
        isLanguageLabelVisible={false}
        isHeaderPlain
        options={{ scrollBeyondLastLine: false, folding: false }}
        onEditorDidMount={handleEditorDidMount}
        onChange={readOnly ? undefined : handleChange}
      />
      <ResizeHandle height={height} onResize={handleResize} minHeight={minHeight} />
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{field.description}</HelperTextItem>
          <HelperTextItem variant={isInvalid ? "error" : "indeterminate"}>
            {isInvalid ? words("validation.empty") : words("inventory.form.typeHint.dict")}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
