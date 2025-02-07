import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Flex,
  FlexItem,
  FormSelect,
  FormSelectOption,
  Content,
} from "@patternfly/react-core";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { InstanceAttributeModel } from "@/Core";
import {
  ExpertPatchAttributes,
  usePatchAttributesExpert,
} from "@/Data/Managers/V2/ServiceInstance";
import { InstanceDetailsContext } from "@/Slices/ServiceInstanceDetails/Core/Context";
import { AttributeSets } from "@/Slices/ServiceInstanceDetails/Utils";
import { DependencyContext, words } from "@/UI";
import { JSONEditor } from "@/UI/Components/JSONEditor";
import { ConfirmationModal } from "../ConfirmModal";
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
  const { authHelper } = useContext(DependencyContext);
  const { instance } = useContext(InstanceDetailsContext);
  const isLatestVersion = String(instance.version) === selectedVersion;

  const username = authHelper.getUser();

  const [selectedSet, setSelectedSet] = useState(dropdownOptions[0]);
  const [editorDataOriginal, setEditorDataOriginal] = useState<string>("");

  const { environmentModifier } = useContext(DependencyContext);
  const [isEditorValid, setIsEditorValid] = useState<boolean>(true);
  const [editorState, setEditorState] = useState<string>(editorDataOriginal);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { mutate, isPending } = usePatchAttributesExpert(
    instance.id,
    instance.service_entity,
    {
      onError: (error) => setErrorMessage(error.message),
      onSuccess: () => setIsModalOpen(false),
    },
  );

  /**
   * Handles the change of the selected attribute Set.
   *
   * @param {React.FormEvent<HTMLSelectElement>} _event
   * @param {string} value
   */
  const onSetSelectionChange = (
    _event: React.FormEvent<HTMLSelectElement>,
    value: string,
  ) => {
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
    [setEditorState, setIsEditorValid],
  );

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
              <FormSelectOption
                value={option}
                key={index}
                label={words(option as AttributeSets)}
              />
            ))}
          </StyledSelect>
        </FlexItem>
        <FlexItem>
          {environmentModifier.useIsExpertModeEnabled() && isLatestVersion && (
            <Button
              isDisabled={!isEditorValid}
              aria-label="Expert-Submit-Button"
              variant="danger"
              onClick={() => setIsModalOpen(true)}
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
        readOnly={!environmentModifier.useIsExpertModeEnabled()}
      />
      <ConfirmationModal
        title={words("instanceDetails.expert.editModal.title")}
        onConfirm={onConfirm}
        id="Confirm-Expert-Edit"
        isModalOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        isPending={isPending}
      >
        <Content component="p">
          {words("instanceDetails.expert.editModal.message")(selectedSet)}
        </Content>
      </ConfirmationModal>
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
