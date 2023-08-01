import React, { useState, MouseEvent, useContext } from "react";
import {
  Button,
  Popover,
  Icon,
  Modal,
  Text,
  Spinner,
} from "@patternfly/react-core";
import { TimesIcon, PencilAltIcon } from "@patternfly/react-icons";
import { Td } from "@patternfly/react-table";
import styled from "styled-components";
import { Maybe, ParsedNumber } from "@/Core";
import { AttributeSet } from "@/Core/Domain/ServiceInstanceParams";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ConfirmUserActionForm } from "../../../Components/ConfirmUserActionForm";
import { ToastAlert } from "../../../Components/ToastAlert";
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
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const [wrapWithPopover, setWrapWithPopover] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAttribute, setNewAttribute] = useState<
    string | boolean | number | string[]
  >(value);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isSpinnerVisible, setIsSpinnerVisible] = useState(false);
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
    const newValue = newAttribute;
    //if string[] then we need to convert initial value to the same format to be able to compare
    if (
      newValue === value ||
      (attributeType.includes("string[]") &&
        (newAttribute as string[]).join(", ") === value)
    ) {
      setIsInputOpen(!isInputOpen);
      setIsModalOpen(!isModalOpen);
      return;
    }

    setIsSpinnerVisible(true);
    const result = await trigger(
      (label + "_attributes") as AttributeSet,
      newValue,
      path.split("$").join("."),
    );

    if (Maybe.isSome(result)) {
      setStateErrorMessage(result.value);
      setIsSpinnerVisible(false);
    }
    setIsModalOpen(!isModalOpen);
  };
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
      {environmentModifier.useIsExpertModeEnabled() && value !== "" && (
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
      {isSpinnerVisible && <StyledSpinner isSVG size="sm" />}
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
            newAttribute.toString(),
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

const StyledSpinner = styled(Spinner)`
  --pf-c-spinner--Color: var(--pf-global--Color--100);
  margin-left: 8px;
`;
