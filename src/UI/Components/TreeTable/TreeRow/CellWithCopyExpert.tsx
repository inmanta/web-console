import React, { useState, MouseEvent, useContext, useEffect } from "react";
import { Button, Popover, Icon, Modal, Text } from "@patternfly/react-core";
import { TimesIcon, PencilAltIcon } from "@patternfly/react-icons";
import { Td } from "@patternfly/react-table";
import { Environment, Maybe, ParsedNumber } from "@/Core";
import { AttributeSet } from "@/Core/Domain/ServiceInstanceParams";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ConfirmUserActionForm } from "../../../Components/ConfirmUserActionForm";
import { ToastAlert } from "../../../Components/ToastAlert";
import { CustomEvent } from "../../ExpertBanner";
import { TreeTableCellContext } from "../RowReferenceContext";
import {
  formatValue,
  MultiLinkCell,
  shouldRenderLink,
  StyledButton,
  StyledPopoverBody,
} from "./CellWithCopy";
import InlineInput from "./InlineInput";

interface Props {
  className: string;
  label: string;
  value: string;
  hasRelation?: boolean;
  serviceName?: string;
  path: string;
  instanceId: string;
  version: ParsedNumber;
  serviceEntity: string;
  attributeType: string;
}

export const CellWithCopyExpert: React.FC<Props> = ({
  label,
  value,
  className,
  hasRelation,
  serviceName,
  path,
  instanceId,
  version,
  serviceEntity,
  attributeType,
}) => {
  const { commandResolver, environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useSelected() as
    | Environment
    | undefined;
  const [isExpertMode, setIsExpertMode] = useState(
    environment?.settings.enable_lsm_expert_mode ? true : false
  );
  const [wrapWithPopover, setWrapWithPopover] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<string | boolean | number>(
    value
  );
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [stateErrorMessage, setStateErrorMessage] = useState<string>("");
  const { onClick } = useContext(TreeTableCellContext);
  const trigger = commandResolver.useGetTrigger<"UpdateInstanceAttribute">({
    kind: "UpdateInstanceAttribute",
    service_entity: serviceEntity,
    id: instanceId,
    version,
  });

  const onMouseEnter = (event: MouseEvent<HTMLTableCellElement>) => {
    // Check if overflown
    if (isInputOpen) return;
    if (event.currentTarget.offsetWidth < event.currentTarget.scrollWidth) {
      setWrapWithPopover(true);
    } else {
      setWrapWithPopover(false);
    }
  };
  const onSubmit = async () => {
    let newValue: string | string[] | number | boolean;
    if (attributeType.includes("string[]")) {
      newValue = (newAttribute as string).replace(/\s/g, "").split(",");
    } else if (attributeType.includes("int")) {
      newValue = newAttribute;
    } else {
      newValue = newAttribute;
    }
    if (newValue === value) {
      setIsInputOpen(!isInputOpen);
      setIsModalOpen(!isModalOpen);
      return;
    }
    const result = await trigger(
      (label + "_attributes") as AttributeSet,
      newValue,
      path.split("$").join(".")
    );
    setIsModalOpen(!isModalOpen);
    if (Maybe.isSome(result)) {
      setStateErrorMessage(result.value);
    }
  };
  useEffect(() => {
    document.addEventListener("expert-mode-check", (evt: CustomEvent) => {
      setIsExpertMode(evt.detail === true);
    });
    return () =>
      document.removeEventListener("expert-mode-check", (evt: CustomEvent) => {
        setIsExpertMode(evt.detail === true);
      });
  }, []);
  const cell = (
    <Td
      className={className}
      key={label}
      dataLabel={label}
      onMouseEnter={onMouseEnter}
    >
      {stateErrorMessage && (
        <ToastAlert
          title={words("inventory.editAttribute.failed")}
          message={stateErrorMessage}
          setMessage={setStateErrorMessage}
        />
      )}
      {isExpertMode && value !== "" && (
        <Button
          variant="link"
          isDanger
          onClick={() => {
            setNewAttribute(value);
            setIsInputOpen(!isInputOpen);
          }}
        >
          <Icon status="danger">
            {isInputOpen ? <TimesIcon /> : <PencilAltIcon />}
          </Icon>
        </Button>
      )}
      {isInputOpen ? (
        <InlineInput
          label={label}
          value={newAttribute}
          type={attributeType}
          onChange={(value) => setNewAttribute(value)}
          toggleModal={() => {
            setIsModalOpen(!isModalOpen);
          }}
        />
      ) : shouldRenderLink(value, hasRelation) ? (
        <MultiLinkCell
          value={value}
          serviceName={serviceName}
          onClick={onClick}
        />
      ) : (
        value
      )}
      <Modal
        variant={"small"}
        isOpen={isModalOpen}
        title={words("inventory.editAttribute.header")}
        onClose={() => setIsModalOpen(!isModalOpen)}
        titleIconVariant="danger"
      >
        <Text>
          {words("inventory.editAttribute.text")(
            value,
            newAttribute.toString()
          )}
        </Text>
        <ConfirmUserActionForm
          onSubmit={onSubmit}
          onCancel={() => setIsModalOpen(!isModalOpen)}
        />
      </Modal>
    </Td>
  );

  return wrapWithPopover ? (
    <Popover
      bodyContent={
        <>
          <StyledPopoverBody>{formatValue(value)}</StyledPopoverBody>
          <StyledButton
            value={value}
            tooltipContent={words("attribute.value.copy")}
          />
        </>
      }
      showClose={false}
    >
      {cell}
    </Popover>
  ) : (
    cell
  );
};
