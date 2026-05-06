import React, { useState } from "react";
import { Editor, OnChange, OnMount, OnValidate, BeforeMount } from "@monaco-editor/react";
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Panel,
  PanelHeader,
  PanelMain,
  PanelMainBody,
  Label,
} from "@patternfly/react-core";
import { DictField } from "@/Core";
import { words } from "@/UI";
import { DictValue, EDITOR_OPTIONS, toDict, toText } from "./helpers";

interface Props {
  field: DictField;
  value: unknown;
  onChange: (value: DictValue) => void;
  readOnly?: boolean;
}

/**
 * The DictFieldInput component.
 *
 * Provides a JSON editor input backed by Monaco Editor for editing dictionary-like objects.
 * Automatically validates JSON input, formats it, and converts it to a typed dictionary value.
 *
 * @Props {Props} - Component props.
 *  @prop {DictField} field - Field metadata containing name, description, and optional flag.
 *  @prop {unknown} value - Initial value to be displayed in the editor.
 *  @prop {(value: DictValue) => void} onChange - Callback triggered when a valid JSON object is parsed.
 *  @prop {boolean} [readOnly=false] - Whether the editor is disabled and thus read-only.
 *
 * @returns {React.ReactElement} The rendered JSON dictionary editor field.
 */

export const DictFieldInput: React.FC<Props> = ({ field, value, onChange, readOnly = false }) => {
  console.log("field", field);
  const [text, setText] = useState<string>(() => toText(value));
  const [isInvalid, setIsInvalid] = useState(false);
  const [height, setHeight] = useState(100);

  const handleValidate: OnValidate = (markers) => {
    setIsInvalid(markers.some((m) => m.severity === 8));
  };

  const handleBeforeMount: BeforeMount = (monaco) => {
    // Disable schema validation — without this Monaco rejects all
    // properties because it has no schema to validate against.
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: "ignore",
    });
  };

  const handleMount: OnMount = (editor) => {
    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setHeight(Math.min(contentHeight, 400));
      editor.layout();
    };

    updateHeight();
    editor.onDidContentSizeChange(updateHeight);
  };

  const handleChange: OnChange = (val) => {
    const next = val ?? "";
    setText(next);

    const parsed = toDict(next);
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
      <Panel variant="bordered">
        <PanelHeader>
          <Label color="blue" isCompact>
            {words("inventory.editor.button")}
          </Label>
        </PanelHeader>
        <PanelMain>
          <PanelMainBody>
            <>
              {/* We need this because the editor's value is not directly accessible */}
              <input
                type="hidden"
                data-testid={`DictInput-${field.name}`}
                value={text}
                readOnly
                disabled={readOnly}
                onChange={() => {}}
              />
              <Editor
                height={`${height}px`}
                language="json"
                value={text}
                beforeMount={handleBeforeMount}
                onMount={handleMount}
                onChange={handleChange}
                onValidate={handleValidate}
                options={{ ...EDITOR_OPTIONS, readOnly }}
              />
            </>
          </PanelMainBody>
        </PanelMain>
      </Panel>

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
