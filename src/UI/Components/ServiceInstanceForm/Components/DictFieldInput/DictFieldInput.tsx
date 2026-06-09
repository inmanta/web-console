import React, { ComponentProps, useEffect, useRef, useState } from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { FormGroup, FormHelperText, HelperText, HelperTextItem } from "@patternfly/react-core";
import { DictField } from "@/Core";
import { words } from "@/UI";
import { useTheme } from "@/UI/Components/DarkmodeOption";
import { DictValue, toDict, toText } from "./helpers";

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
 * grows (capped at 350 px), validates JSON in real time, and surfaces parse
 * errors through a helper-text row below the editor.
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
  const { isDark } = useTheme();

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

  const handleEditorDidMount: ComponentProps<typeof CodeEditor>["onEditorDidMount"] = (editor) => {
    setHeight(Math.min(editor.getContentHeight(), 350));

    editor.onDidContentSizeChange((e) => {
      setHeight(Math.min(e.contentHeight, 350));
    });
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
        isLineNumbersVisible={false}
        isHeaderPlain
        isDarkTheme={isDark}
        options={{ scrollBeyondLastLine: false, folding: false }}
        onEditorDidMount={handleEditorDidMount}
        onChange={readOnly ? undefined : handleChange}
      />
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
