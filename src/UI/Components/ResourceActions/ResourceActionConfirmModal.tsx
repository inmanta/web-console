import React, { useState } from "react";
import { Button, Card, CardHeader, CardTitle, Content, Flex } from "@patternfly/react-core";
import { ResourceActionFilter } from "@/Data/Queries";
import { words } from "@/UI/words";

export interface ResourceActionScope {
  id: string;
  title: string;
  filter: ResourceActionFilter;
  detail?: string;
}

interface Props {
  actionLabel: string;
  scopes: ResourceActionScope[];
  onConfirm: (filter: ResourceActionFilter) => void;
  onClose: () => void;
}

interface ScopeCardProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  title: string;
  detail?: string;
}

/**
 * A selectable card acting as one radio option in the scope picker.
 */
const ScopeCard: React.FC<ScopeCardProps> = ({ id, isSelected, onSelect, title, detail }) => (
  <Card id={`resource-action-scope-${id}`} isSelectable isSelected={isSelected}>
    <CardHeader
      selectableActions={{
        variant: "single",
        name: "resource-action-scope",
        selectableActionId: `resource-action-scope-${id}-input`,
        selectableActionAriaLabelledby: `resource-action-scope-${id}-title`,
        isChecked: isSelected,
        onChange: () => onSelect(id),
      }}
    >
      <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
        <CardTitle id={`resource-action-scope-${id}-title`}>{title}</CardTitle>
        {detail && <Content component="small">{detail}</Content>}
      </Flex>
    </CardHeader>
  </Card>
);

/**
 * ResourceActionConfirmModal is the confirm content for a filter-scoped deploy/repair. It is passed
 * to the shared ModalProvider's triggerModal, which supplies the surrounding dialog, title and
 * description.
 *
 * It offers the given scopes as selectable cards (the first is the default), so acting on a wider
 * set never requires changing the filter first. Each card can show a resource count or a short note.
 * The counts come from the calling view, so the dialog makes no extra request.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} actionLabel - The verb being confirmed (Deploy/Repair)
 *  @prop {ResourceActionScope[]} scopes - The selectable scopes; the first one is selected by default
 *  @prop {(filter: ResourceActionFilter) => void} onConfirm - Called with the chosen scope's filter
 *  @prop {() => void} onClose - Called when the dialog is dismissed
 *
 * @returns {React.FC<Props>} The confirmation content
 */
export const ResourceActionConfirmModal: React.FC<Props> = ({
  actionLabel,
  scopes,
  onConfirm,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState(scopes[0]?.id);
  const chosen = scopes.find((scope) => scope.id === selectedId) ?? scopes[0];

  return (
    <Flex direction={{ default: "column" }} gap={{ default: "gapMd" }}>
      <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
        {scopes.map((scope) => (
          <ScopeCard
            key={scope.id}
            id={scope.id}
            isSelected={scope.id === selectedId}
            onSelect={setSelectedId}
            title={scope.title}
            detail={scope.detail}
          />
        ))}
        <Content component="small">{words("resources.resourceActions.confirm.orphanNote")}</Content>
      </Flex>
      <Flex gap={{ default: "gapSm" }}>
        <Button key="confirm" variant="primary" autoFocus onClick={() => onConfirm(chosen.filter)}>
          {actionLabel}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          {words("cancel")}
        </Button>
      </Flex>
    </Flex>
  );
};
