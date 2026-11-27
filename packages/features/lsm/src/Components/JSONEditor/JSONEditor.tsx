import React, { useEffect, useState } from "react";
import { useMonaco } from "@monaco-editor/react";
import { Language } from "@patternfly/react-code-editor";
import { words } from "@inmanta/web-console-core";
import { useGetJSONSchema } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { CodeEditor } from "@inmanta/web-console-ui/Components/CodeEditor";
import { Spinner } from "@inmanta/web-console-ui/Components/Spinner";
import { ErrorMessageContainer } from "../ErrorMessageContainer";
import { getJSONEditorErrors } from "./helpers";
import type { editor } from "monaco-editor";

interface Props {
  service_entity: string;
  data: string;
  onChange: (value: string, isValid: boolean) => void;
  readOnly?: boolean;
}

/**
 * The CodeEditor for the JSON of a service instance, validated against the JSON schema of its
 * service entity. Below the editor it lists the errors, unless it is read only.
 *
 * @prop {string} service_entity - The service entity whose JSON schema validates the value.
 * @prop {string} data - The JSON to show. The editor resets to it when it changes.
 * @prop {function} onChange - Called with the value and whether it has no errors, on each change.
 * @prop {boolean} [readOnly] - Whether the value can't be edited. Defaults to false.
 */
export const JSONEditor: React.FC<Props> = ({
  service_entity,
  data,
  onChange,
  readOnly = false,
}) => {
  const [value, setValue] = useState(data);
  const [markers, setMarkers] = useState<editor.IMarker[]>([]);
  const schema = useGetJSONSchema(service_entity).useOneTime();
  const monaco = useMonaco();

  const errors = getJSONEditorErrors(value, markers);
  const isValid = errors.length === 0;

  useEffect(() => {
    setValue(data);
  }, [data]);

  useEffect(() => {
    onChange(value, isValid);
  }, [value, isValid, onChange]);

  useEffect(() => {
    monaco?.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: "error",
      schemas: [{ schema: schema.data, fileMatch: ["*"], uri: "" }],
    });
  }, [monaco, schema.data]);

  return (
    <>
      <CodeEditor
        code={value}
        language={Language.json}
        height="calc(100vh - 550px)"
        isReadOnly={readOnly}
        isMinimapVisible
        loading={<Spinner />}
        onChange={(newValue) => setValue(newValue)}
        options={{ domReadOnly: readOnly }}
        editorProps={{ onValidate: setMarkers }}
      />
      {!readOnly && errors.length > 0 && (
        <ErrorMessageContainer title={words("validation.title")(errors.length)}>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </ErrorMessageContainer>
      )}
    </>
  );
};
