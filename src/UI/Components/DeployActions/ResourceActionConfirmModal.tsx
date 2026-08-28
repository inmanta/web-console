import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Spinner,
} from "@patternfly/react-core";
import { ResourceActionFilter, useGetResourceCount } from "@/Data/Queries";
import { words } from "@/UI/words";

interface Props {
  actionLabel: string;
  filter: ResourceActionFilter;
  onConfirm: (filter: ResourceActionFilter) => void;
  onClose: () => void;
}

type Scope = "filtered" | "environment";

/** The whole-environment scope: every resource, orphans excluded. */
const ENVIRONMENT_FILTER: ResourceActionFilter = { isOrphan: false };

/**
 * Renders a resource count for a scope, or a spinner while it resolves.
 */
const Count: React.FC<{ filter: ResourceActionFilter; format: (count: number) => string }> = ({
  filter,
  format,
}) => {
  const { data, isSuccess } = useGetResourceCount(filter);

  return isSuccess ? <>{format(data)}</> : <Spinner size="sm" />;
};

interface ScopeCardProps {
  scope: Scope;
  isSelected: boolean;
  onSelect: (scope: Scope) => void;
  title: string;
  filter: ResourceActionFilter;
  format: (count: number) => string;
}

/**
 * A selectable card acting as one radio option in the scope picker.
 */
const ScopeCard: React.FC<ScopeCardProps> = ({
  scope,
  isSelected,
  onSelect,
  title,
  filter,
  format,
}) => (
  <Card id={`deploy-scope-${scope}`} isSelectable isSelected={isSelected}>
    <CardHeader
      selectableActions={{
        variant: "single",
        name: "deploy-scope",
        selectableActionId: `deploy-scope-${scope}-input`,
        selectableActionAriaLabelledby: `deploy-scope-${scope}-title`,
        isChecked: isSelected,
        onChange: () => onSelect(scope),
      }}
    >
      <CardTitle id={`deploy-scope-${scope}-title`}>{title}</CardTitle>
    </CardHeader>
    <CardBody>
      <Content component="small">
        <Count filter={filter} format={format} />
      </Content>
    </CardBody>
  </Card>
);

/**
 * ResourceActionConfirmModal confirms a filter-scoped deploy/repair before it runs.
 *
 * It offers two selectable cards - the current filter or the whole environment - each showing how
 * many resources it matches, so acting on everything never requires clearing the filter first. The
 * primary button is focused (Enter confirms, Esc cancels).
 *
 * @Props {Props} - The props of the component
 *  @prop {string} actionLabel - The verb being confirmed (Deploy/Repair)
 *  @prop {ResourceActionFilter} filter - The current filter scope
 *  @prop {(filter: ResourceActionFilter) => void} onConfirm - Called with the chosen scope's filter
 *  @prop {() => void} onClose - Called when the dialog is dismissed
 *
 * @returns {React.FC<Props>} The confirmation dialog
 */
export const ResourceActionConfirmModal: React.FC<Props> = ({
  actionLabel,
  filter,
  onConfirm,
  onClose,
}) => {
  const [scope, setScope] = useState<Scope>("filtered");
  const chosenFilter = scope === "environment" ? ENVIRONMENT_FILTER : filter;

  return (
    <Modal isOpen variant={ModalVariant.small} onClose={onClose} aria-label="DeployActionsConfirm">
      <ModalHeader title={words("resources.deployActions.confirm.title")(actionLabel)} />
      <ModalBody>
        <Content component="p">{words("resources.deployActions.confirm.description")}</Content>
        <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
          <ScopeCard
            scope="filtered"
            isSelected={scope === "filtered"}
            onSelect={setScope}
            title={words("resources.deployActions.confirm.filtered.title")}
            filter={filter}
            format={words("resources.deployActions.confirm.filtered.count")}
          />
          <ScopeCard
            scope="environment"
            isSelected={scope === "environment"}
            onSelect={setScope}
            title={words("resources.deployActions.confirm.environment.title")}
            filter={ENVIRONMENT_FILTER}
            format={words("resources.deployActions.confirm.environment.count")}
          />
        </Flex>
        <Content component="small">{words("resources.deployActions.confirm.orphanNote")}</Content>
      </ModalBody>
      <ModalFooter>
        <Button key="cancel" variant="link" onClick={onClose}>
          {words("cancel")}
        </Button>
        <Button key="confirm" variant="primary" autoFocus onClick={() => onConfirm(chosenFilter)}>
          {actionLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
