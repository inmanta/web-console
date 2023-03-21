import React, { useState, MouseEvent, useContext, useEffect } from "react";
import {
  Button,
  Flex,
  FlexItem,
  Popover,
  Icon,
  Modal,
  Text,
} from "@patternfly/react-core";
import { TimesIcon, PencilAltIcon } from "@patternfly/react-icons";
import { Td } from "@patternfly/react-table";
import styled from "styled-components";
import { Environment, Maybe, ParsedNumber } from "@/Core";
import { AttributeSet } from "@/Core/Domain/ServiceInstanceParams";
import { ConfirmUserActionForm, ToastAlert } from "@/UI/Components";
import { ClipboardCopyButton } from "@/UI/Components/ClipboardCopyButton";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CustomEvent } from "../../ExpertBanner";
import { TreeTableCellContext } from "../RowReferenceContext";
import InlineInput from "./InlineInput";
import { InstanceCellButton } from "./InstanceCellButton";

interface Props {
  className: string;
  label: string;
  value: string;
  hasOnClick?: boolean;
  serviceName?: string;
  path: string;
  instanceId: string;
  version: ParsedNumber;
  serviceEntity: string;
  attributeType: string;
}

export const CellWithCopy: React.FC<Props> = ({
  label,
  value,
  className,
  hasOnClick,
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
      newValue = +newAttribute;
    } else {
      newValue = newAttribute;
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
      setIsExpertMode(evt.detail ? true : false);
    });
    return () =>
      document.removeEventListener("expert-mode-check", (evt: CustomEvent) => {
        setIsExpertMode(evt.detail ? true : false);
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
      {isInputOpen ? (
        <InlineInput
          label={label}
          value={newAttribute}
          type={attributeType}
          onChange={(value) => setNewAttribute(value)}
          toggleModal={() => setIsModalOpen(!isModalOpen)}
        />
      ) : shouldRenderLink(value, hasOnClick) ? (
        <MultiLinkCell
          value={value}
          serviceName={serviceName}
          onClick={onClick}
        />
      ) : (
        value
      )}

      {isExpertMode && value !== "" && (
        <Button
          variant="link"
          isDanger
          onClick={() => {
            setIsInputOpen(!isInputOpen);
          }}
        >
          <Icon status="danger">
            {isInputOpen ? <TimesIcon /> : <PencilAltIcon />}
          </Icon>
        </Button>
      )}
      <Modal
        variant={"small"}
        isOpen={isModalOpen}
        title={words("inventory.destroyInstance.title")}
        onClose={() => setIsModalOpen(!isModalOpen)}
        titleIconVariant="danger"
      >
        <Text>{words("inventory.editAttribute.header")}</Text>
        <br />
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

const StyledPopoverBody = styled.div`
  padding-right: var(--pf-c-popover--c-button--sibling--PaddingRight);
  overflow-y: auto;
  max-height: 50vh;
  white-space: pre-wrap;
`;

const StyledButton = styled(ClipboardCopyButton)`
  position: absolute;
  top: var(--pf-c-popover--c-button--Top);
  right: calc(var(--pf-c-popover--c-button--Right) + 0.5rem);
`;

function formatValue(value: string): string {
  return isJson(value) ? JSON.stringify(JSON.parse(value), null, 2) : value;
}

function isJson(value: string): boolean {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}

function shouldRenderLink(value: string, hasOnClick?: boolean): boolean {
  return !!(hasOnClick && value.length > 0 && value !== "{}");
}

function splitValue(value: string): string[] {
  const parts = value.split(",").map((val) => val.trim());
  return parts;
}
function isValueOfMultipleIds(value: string): boolean {
  return splitValue(value).length > 0;
}

interface LinkCellProps {
  value: string;
  serviceName?: string;
  onClick: (cellValue: string, serviceName?: string | undefined) => void;
}

const MultiLinkCell: React.FC<LinkCellProps> = ({
  value,
  serviceName,
  onClick,
}) => {
  if (isValueOfMultipleIds(value)) {
    const ids = splitValue(value);
    return (
      <Flex
        direction={{ default: "column" }}
        spaceItems={{ default: "spaceItemsNone" }}
        display={{ default: "inlineFlex" }}
      >
        {ids.map((id) => (
          <FlexItem key={id}>
            <LinkCell value={id} serviceName={serviceName} onClick={onClick} />
          </FlexItem>
        ))}
      </Flex>
    );
  }
  return <LinkCell value={value} serviceName={serviceName} onClick={onClick} />;
};

const LinkCell: React.FC<LinkCellProps> = ({ value, serviceName, onClick }) =>
  serviceName && value.length > 0 ? (
    <InstanceCellButton
      id={value}
      serviceName={serviceName}
      onClick={onClick}
    />
  ) : (
    <Button
      variant="link"
      isInline
      onClick={
        serviceName ? () => onClick(value, serviceName) : () => onClick(value)
      }
    >
      {value}
    </Button>
  );
