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

  const handleEditorChange = (value: string | undefined, _event) => {
    value && setEditorState(value);
  };

  const HandleOnValidate: OnValidate = (markers) => {
    if (markers.length === 0) {
      setErrors([]);
    }

    const error: string[] = markers.map((marker) => {
      return `${marker.message} at line ${marker.startLineNumber} and column ${marker.startColumn}`;
    });

    setErrors(error);
  };

  useEffect(() => {
    if (errors?.length === 0) {
      onChange(editorState);
    }
  }, [editorState, errors, onChange]);

  useEffect(() => {
    if (monaco) {
      monaco.languages.json.jsonDefaults.setModeConfiguration({
        colors: true,
        completionItems: true,
        diagnostics: true,
        documentFormattingEdits: true,
        documentRangeFormattingEdits: true,
        documentSymbols: true,
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
        height={"50vh"}
        width={"100%"}
        defaultLanguage="json"
        defaultValue={data}
        onChange={handleEditorChange}
        onValidate={HandleOnValidate}
      />
      <PanelWrapper variant="bordered">
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
