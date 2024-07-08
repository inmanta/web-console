import React, { useContext, useEffect, useState } from "react";
import { Editor, OnValidate, useMonaco } from "@monaco-editor/react";
import { Alert, Panel, Spinner } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { useGetJSONSchema } from "@/Data/Managers/V2/GetJSONSchema";
import { DependencyContext } from "@/UI";

interface Props {
  service_entity: string;
  data: string;
  onChange: (value: string) => void;
}

/**
 * JSON Editor component.
 *
 * @props {Props} props - The props of the component.
 *  @prop {string} service_entity - The service entity.
 *  @prop {string} data - The data to be displayed in the editor.
 *  @prop {function} onChange - Callback method when the data is changed in the editor.
 *
 * @notes The JSON Editor component uses the Monaco Editor, React version.
 * for more information, see https://www.npmjs.com/package/@monaco-editor/react?activeTab=readme
 * for the monaco editor API, see https://microsoft.github.io/monaco-editor/typedoc/index.html
 *
 * @returns {React.ReactElement} The JSON Editor component.
 */
export const JSONEditor: React.FC<Props> = ({
  service_entity,
  data,
  onChange,
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();

  const [isLoading, setIsLoading] = useState(true);
  const [editorState, setEditorState] = useState<string>(data);
  const [errors, setErrors] = useState<string[]>([]);

  const schema = useGetJSONSchema(service_entity, environment).useOneTime();

  const monaco = useMonaco();

  // local method to update state when the editor content changes
  const handleEditorChange = (value: string | undefined, _event) => {
    value && setEditorState(value);
  };

  /**
   *
   * @param markers - The markers from the monaco editor.
   * It will set the errors state with the error messages.
   * see : https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IMarker.html
   *
   * @return {void}
   */
  const handleOnValidate: OnValidate = (markers) => {
    const errors: string[] = markers.map((marker) => {
      return `${marker.message} at line ${marker.startLineNumber} and column ${marker.startColumn}`;
    });

    setErrors(errors);
  };

  // Whenever the editorState has changed and no errors are found, call the onChange callback.
  // This prevents the string to be invalid based on the provided schema.
  useEffect(() => {
    if (errors?.length === 0) {
      onChange(editorState);
    }
  }, [editorState, errors, onChange]);

  // see https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.json.ModeConfiguration.html
  // and see https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.json.DiagnosticsOptions.html
  useEffect(() => {
    if (monaco) {
      monaco.languages.json.jsonDefaults.setModeConfiguration({
        colors: true,
        completionItems: true,
        diagnostics: true,
        foldingRanges: true,
        hovers: true,
        selectionRanges: true,
        tokens: true,
      });
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemaValidation: "error",
        schemas: [
          {
            schema: schema.data,
            fileMatch: ["*"],
          },
        ],
      });

      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco, schema.data]);

  return isLoading ? (
    <Spinner data-testid="loading-spinner" />
  ) : (
    <EditorWrapper data-testid="JSON-Editor-Wrapper">
      <Editor
        height={"calc(100vh - 500px)"}
        width={"100%"}
        defaultLanguage="json"
        defaultValue={data}
        onChange={handleEditorChange}
        onValidate={handleOnValidate}
      />
      <PanelWrapper variant="bordered" data-testid="Error-container">
        {errors.length > 0 && (
          <Alert
            isInline
            customIcon={<InfoAltIcon />}
            isExpandable
            variant="danger"
            title={`Errors found : ${errors.length}`}
          >
            {errors.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </Alert>
        )}
      </PanelWrapper>
    </EditorWrapper>
  );
};

const EditorWrapper = styled.div`
  border: 1px solid #d2d2d2;
`;

const PanelWrapper = styled(Panel)`
  min-height: 55px;
`;
