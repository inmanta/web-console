import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Flex,
  FlexItem,
  FormSelect,
  FormSelectOption,
  Content,
  Spinner,
} from "@patternfly/react-core";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { InstanceAttributeModel, ServiceInstanceModel } from "@/Core";
import { ExpertPatchAttributes, usePatchAttributesExpert } from "@/Data/Queries";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { AttributeSets } from "@/Slices/ServiceInstanceDetails/Utils";
import { DependencyContext, words } from "@/UI";
import { JSONEditor } from "@/UI/Components/JSONEditor";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { ToastAlertMessage } from "../ToastAlert";

interface Props {
  dropdownOptions: string[];
  attributeSets: Partial<Record<AttributeSets, InstanceAttributeModel>>;
  service_entity: string;
  selectedVersion: string;
}

/**
 * The AttributesEditor Component.
 * It uses the JSON-Editor from the React Monaco Editor.
 *
 * @Props {Props} - The props of the component
 *  @prop {string[]} dropdownOptions - Dropdown options for the available attribute sets for the active version on the InstanceDetails page
 *  @prop {Partial<Record<AttributeSets, InstanceAttributeModel>>} attributeSets - The available attribute sets for the active version on the InstanceDetails page
 *  @prop {string} service_entity - the service entity name of the instance
 * @returns {React.FC<Props>} A React Component displaying the selected AttributeSet in a JSON-Editor
 */
export const AttributesEditor: React.FC<Props> = ({
  dropdownOptions,
  attributeSets,
  service_entity,
  selectedVersion,
}) => {
  const { triggerModal } = useContext(ModalContext);
  const { instance } = useContext(InstanceDetailsContext);
  const isLatestVersion = String(instance.version) === selectedVersion;

  const [selectedSet, setSelectedSet] = useState(dropdownOptions[0]);
  const [editorDataOriginal, setEditorDataOriginal] = useState<string>("");

  const { environmentHandler } = useContext(DependencyContext);
  const [isEditorValid, setIsEditorValid] = useState<boolean>(true);
  const [editorState, setEditorState] = useState<string>(editorDataOriginal);

  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * Handles the change of the selected attribute Set.
   *
   * @param {React.FormEvent<HTMLSelectElement>} _event
   * @param {string} value
   */
  const onSetSelectionChange = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
    setSelectedSet(value);
  };

  /**
   * useCallback hook onEditorUpdate
   * The method is used in a UseEffect dependency, and would cause too many rerenders if not wrapped in a useCallback hook.
   *
   * Try-catch to set the editorState with the updated data
   *
   * @param {string} value - the JSON editor stringified value
   * @param {boolean} isValid - whether the editor contains known errors or not
   */
  const onEditorUpdate = useCallback(
    (value: string, isValid: boolean) => {
      try {
        const parsed = JSON.parse(value);

        setEditorState(parsed);
        setIsEditorValid(isValid);
      } catch (_error) {
        setIsEditorValid(false);
      }
    },
    [setEditorState, setIsEditorValid]
  );

  useEffect(() => {
    setEditorDataOriginal(JSON.stringify(attributeSets[selectedSet], null, 2));
  }, [attributeSets, selectedSet]);

  useEffect(() => {
    // When the version changes, it can happen that the selectedSet isn't available in the dropdown.
    // In that case, we want to fall back to the first option available.
    if (!dropdownOptions.includes(selectedSet)) {
      setSelectedSet(dropdownOptions[0]);
    }
  }, [dropdownOptions, selectedSet]);

  return (
    <>
      <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
        <FlexItem>
          <StyledSelect
            value={selectedSet}
            onChange={onSetSelectionChange}
            aria-label="Select-AttributeSet"
            ouiaId="Select-AttributeSet"
          >
            {dropdownOptions.map((option, index) => (
              <FormSelectOption value={option} key={index} label={words(option as AttributeSets)} />
            ))}
          </StyledSelect>
        </FlexItem>
        <FlexItem>
          {environmentHandler.useIsExpertModeEnabled() && isLatestVersion && (
            <Button
              isDisabled={!isEditorValid}
              aria-label="Expert-Submit-Button"
              aria-disabled={!isEditorValid}
              variant="danger"
              onClick={() =>
                triggerModal({
                  title: words("instanceDetails.expert.editModal.title"),
                  ariaLabel: "Confirm-Expert-Edit-Modal",
                  dataTestId: "Confirm-Expert-Edit",
                  iconVariant: "danger",
                  content: (
                    <ModalContent
                      instance={instance}
                      selectedSet={selectedSet}
                      editorState={editorState}
                      setErrorMessage={setErrorMessage}
                    />
                  ),
                })
              }
            >
              Force Update
            </Button>
          )}
        </FlexItem>
      </Flex>
      <JSONEditor
        data={editorDataOriginal}
        service_entity={service_entity}
        onChange={onEditorUpdate}
        readOnly={!environmentHandler.useIsExpertModeEnabled()}
      />
      {errorMessage && (
        <ToastAlertMessage
          message={errorMessage}
          id="error-toast-expert-destroy"
          setMessage={setErrorMessage}
          variant="danger"
        />
      )}
    </>
  );
};

const StyledSelect = styled(FormSelect)`
  width: 180px;
`;

interface ModalContentProps {
  instance: ServiceInstanceModel;
  selectedSet: string;
  editorState: string;
  setErrorMessage: (error: string) => void;
}

/**
 * The ModalContent Component
 *
 * @returns {React.FC} A React Component displaying the Modal Content
 */
const ModalContent: React.FC<ModalContentProps> = ({
  instance,
  selectedSet,
  editorState,
  setErrorMessage,
}) => {
  const { authHelper } = useContext(DependencyContext);

  const username = authHelper.getUser();

  const { closeModal } = useContext(ModalContext);
  const { mutate, isPending } = usePatchAttributesExpert(instance.id, instance.service_entity, {
    onError: (error) => setErrorMessage(error.message),
    onSuccess: closeModal,
  });

  /**
   * onConfirm async method sending the patch request to Expert edit the attributes
   */
  const onConfirm = async (): Promise<void> => {
    const message = words("instanceDetails.API.message.update")(username);

    const patchAttributes: ExpertPatchAttributes = {
      comment: message,
      attribute_set_name: selectedSet,
      current_version: instance.version,
      patch_id: uuidv4(),
      edit: [
        {
          edit_id: `${instance.id}_version=${instance.version}`,
          operation: "replace",
          target: ".",
          value: editorState,
        },
      ],
    };

    mutate(patchAttributes);
  };

  return (
    <>
      <Content component="p">
        {words("instanceDetails.expert.editModal.message")(selectedSet)}
      </Content>
      <br />
      <Flex>
        <FlexItem>
          <Button
            key="confirm"
            variant="primary"
            data-testid={"Confirm-Expert-Edit-modal-confirm"}
            onClick={onConfirm}
            isDisabled={isPending}
          >
            {words("yes")}
            {isPending && <Spinner size="sm" />}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button
            key="cancel"
            variant="link"
            data-testid={"Confirm-Expert-Edit-modal-cancel"}
            onClick={closeModal}
          >
            {words("no")}
          </Button>
        </FlexItem>
      </Flex>
    </>
  );
};
