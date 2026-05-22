import React, { ComponentProps, useState } from "react";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { FormGroup, FormHelperText, HelperText, HelperTextItem } from "@patternfly/react-core";
import { DictField } from "@/Core";
import { words } from "@/UI";
import { DictValue, toDict, toText } from "./helpers";

interface Props {
  field: DictField;
  value: unknown;
  onChange: (value: DictValue) => void;
  readOnly?: boolean;
}

/**
 * DictFieldInput
 *
 * A JSON editor for dictionary-type service instance fields, backed by the
 * PatternFly CodeEditor (Monaco). It auto-resizes line-by-line as content
 * grows (capped at 400 px), validates JSON in real time, and surfaces parse
 * errors through a helper-text row below the editor.
 *
 * @prop {DictField} field - Field metadata: name, description, isOptional.
 * @prop {unknown} value - Initial value; non-objects are treated as an empty object.
 * @prop {(value: DictValue) => void} onChange - Called with the parsed object on every valid edit.
 * @prop {boolean} [readOnly=false] - Disables editing and marks the editor with aria-disabled.
 *
 * @returns {React.ReactElement} The rendered JSON dictionary editor field.
 */
export const DictFieldInput: React.FC<Props> = ({ field, value, onChange, readOnly = false }) => {
  const [text, setText] = useState<string>(() => toText(value));
  const [isInvalid, setIsInvalid] = useState(false);
  const [height, setHeight] = useState(100);

  const handleEditorDidMount: ComponentProps<typeof CodeEditor>["onEditorDidMount"] = (
    editor,
    monaco
  ) => {
    // Disable schema validation — without this Monaco rejects all
    // properties because it has no schema to validate against.
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: "ignore",
    });

    // Initial height
    setHeight(Math.min(editor.getContentHeight(), 400));

    // Resize height accordingly
    editor.onDidContentSizeChange((e) => {
      setHeight(Math.min(e.contentHeight, 400));
    });

    // Set errors whenever invalid json
    monaco.editor.onDidChangeMarkers(() => {
      const model = editor.getModel();
      if (model) {
        const markers = monaco.editor.getModelMarkers({ resource: model.uri });
        setIsInvalid(markers.some((m) => m.severity === monaco.MarkerSeverity.Error));
      }
    });
  };

  const handleChange = (val: string) => {
    setText(val);
    const parsed = toDict(val);
    if (parsed !== null) {
      onChange(parsed);
    }
  };

  return (
    <FormGroup isRequired={!field.isOptional} fieldId={field.name} label={field.name}>
      <FormHelperText>
        <HelperText>
          <HelperTextItem>{field.description}</HelperTextItem>
        </HelperText>
      </FormHelperText>
      <CodeEditor
        data-testid={`DictInput-${field.name}`}
        aria-disabled={readOnly || undefined}
        code={text}
        language={Language.json}
        height={`${height}px`}
        isReadOnly={readOnly}
        isLanguageLabelVisible
        isLineNumbersVisible={false}
        isHeaderPlain
        options={{ scrollBeyondLastLine: false, folding: false }}
        onEditorDidMount={handleEditorDidMount}
        onChange={readOnly ? undefined : handleChange}
      />
      <FormHelperText>
        <HelperText>
          <HelperTextItem variant={isInvalid ? "error" : "indeterminate"}>
            {isInvalid ? words("validation.empty") : words("inventory.form.typeHint.dict")}
          </HelperTextItem>
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
