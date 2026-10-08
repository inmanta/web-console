import React, { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  Content,
  Flex,
  Form,
  FormGroup,
} from "@patternfly/react-core";
import { NonEmptyArray } from "@/Core/Language";
import {
  ResourceActionFilter,
  VersionLock,
  VersionPin,
  getVersionLock,
  pinVersion,
  useGetInstanceModelVersion,
  withLatestVersion,
} from "@/Data/Queries";
import { words } from "@/UI/words";
import { DryRunVersionField, ResourceActionInstance } from "./DryRunVersionField";

/**
 * The message under the version field when the chosen scope can't be pinned to another version.
 *
 * @example lockMessage("owned") // "Owned services can only be previewed against the active version."
 */
const lockMessage = (lock: VersionLock): string => {
  switch (lock) {
    case "owned":
      return words("resources.resourceActions.confirm.version.owned.locked");
    case "status":
      return words("resources.resourceActions.confirm.version.locked");
  }
};

/**
 * One selectable scope in the resource action confirm dialog.
 *
 * @prop {string} id - Identifies the scope within the dialog; also used for the card's DOM ids
 * @prop {string} title - The card's label
 * @prop {ResourceActionFilter} filter - The complete filter this scope acts on. It replaces the
 *   ResourceActions filter rather than being merged with it, so every scope carries its own full scope.
 * @prop {string} [detail] - Short note under the title for a genuine caveat (e.g. the owned-services
 *   note, or "ignores the active filter"). The resource count is rendered separately from `count`.
 * @prop {number} [count] - Resources this scope matches. Drives the count line and gates confirming
 *   (0 disables it). Omit when the count is unknown.
 */
export interface ResourceActionScope {
  id: string;
  title: string;
  filter: ResourceActionFilter;
  detail?: string;
  count?: number;
}

interface Props {
  actionLabel: string;
  scopes: NonEmptyArray<ResourceActionScope>;
  showScopes: boolean;
  showVersion: boolean;
  instance: ResourceActionInstance | undefined;
  onConfirm: (filter: ResourceActionFilter) => void;
  onClose: () => void;
}

interface ScopeCardProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  title: string;
  detail?: string;
  count?: number;
}

/**
 * A selectable card acting as one radio option in the scope picker. The subtext line is derived from
 * `count` (the resource count) and `detail` (a caveat note), so a scope never carries the count twice.
 */
const ScopeCard: React.FC<ScopeCardProps> = ({
  id,
  isSelected,
  onSelect,
  title,
  detail,
  count,
}) => {
  const subtext = [
    count === undefined ? null : words("resources.resourceActions.confirm.scope.count")(count),
    detail,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card id={`resource-action-scope-${id}`} isSelectable isSelected={isSelected}>
      <CardHeader
        selectableActions={{
          variant: "single",
          name: "resource-action-scope",
          selectableActionId: `resource-action-scope-${id}-input`,
          selectableActionAriaLabelledby: subtext
            ? `resource-action-scope-${id}-title resource-action-scope-${id}-detail`
            : `resource-action-scope-${id}-title`,
          isChecked: isSelected,
          onChange: () => onSelect(id),
        }}
      >
        <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
          <CardTitle id={`resource-action-scope-${id}-title`}>{title}</CardTitle>
          {subtext && (
            <Content component="small" id={`resource-action-scope-${id}-detail`}>
              {subtext}
            </Content>
          )}
        </Flex>
      </CardHeader>
    </Card>
  );
};

/**
 * The confirm content for a filter-scoped deploy, repair or dry run, passed to ModalProvider's
 * triggerModal. It shows the given scopes as selectable cards and confirms the action against the
 * chosen one.
 * With the version field, the chosen scope's filter is pinned to the picked version, or to the
 * latest released one when none is picked.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} actionLabel - The verb being confirmed (Deploy/Repair/Dry run)
 *  @prop {NonEmptyArray<ResourceActionScope>} scopes - The selectable scopes
 *  @prop {boolean} showScopes - Shows the scope cards; when false the first scope is used as is
 *  @prop {boolean} showVersion - Shows the version picker, for dry run
 *  @prop {ResourceActionInstance | undefined} instance - The service instance, to offer its own versions
 *  @prop {(filter: ResourceActionFilter) => void} onConfirm - Called with the filter to act on
 *  @prop {() => void} onClose - Called when the dialog is dismissed
 *
 * @returns {React.FC<Props>} The confirmation content
 */
export const ResourceActionConfirmModal: React.FC<Props> = ({
  actionLabel,
  scopes,
  showScopes,
  showVersion,
  instance,
  onConfirm,
  onClose,
}) => {
  const defaultScope = scopes.find((scope) => scope.count !== 0) ?? scopes[0];
  const [selectedId, setSelectedId] = useState(defaultScope.id);
  const [pin, setPin] = useState<VersionPin>();
  const chosen = scopes.find((scope) => scope.id === selectedId) ?? defaultScope;

  // A locked scope ignores the pick and runs on the latest version.
  const lock = getVersionLock(chosen.filter);
  const lockReason = lock && lockMessage(lock);
  const activePin = lock ? undefined : pin;

  // A dry run without a picked version runs on the latest released version.
  const unpinnedFilter = showVersion ? withLatestVersion(chosen.filter) : chosen.filter;
  const filter = activePin ? pinVersion(chosen.filter, activePin) : unpinnedFilter;

  // A picked instance version whose desired state was never released has nothing to dry-run, so
  // confirming waits until that is known.
  const pinnedModelVersion = useGetInstanceModelVersion(
    instance?.id,
    activePin?.field === "instanceVersion" ? activePin.version : undefined
  );
  const isPinUnusable = pinnedModelVersion.isLoading || pinnedModelVersion.data === null;

  const scopeCards = (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
      {scopes.map((scope) => (
        <ScopeCard
          key={scope.id}
          id={scope.id}
          isSelected={scope.id === selectedId}
          onSelect={setSelectedId}
          title={scope.title}
          detail={scope.detail}
          count={scope.count}
        />
      ))}
      {chosen.filter.isOrphan !== false && (
        <Content component="small">{words("resources.resourceActions.confirm.orphanNote")}</Content>
      )}
    </Flex>
  );

  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      {showScopes &&
        (showVersion ? (
          // Next to the version picker, the scope gets a label of its own.
          <FormGroup
            label={words("resources.resourceActions.confirm.scope.title")}
            role="radiogroup"
            fieldId="resource-action-scope"
          >
            {scopeCards}
          </FormGroup>
        ) : (
          scopeCards
        ))}
      {showVersion && (
        <DryRunVersionField instance={instance} onSelect={setPin} lockReason={lockReason} />
      )}
      <Flex gap={{ default: "gapSm" }}>
        <Button
          key="confirm"
          variant="primary"
          autoFocus
          isDisabled={chosen.count === 0 || isPinUnusable}
          onClick={() => onConfirm(filter)}
        >
          {actionLabel}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          {words("cancel")}
        </Button>
      </Flex>
    </Form>
  );
};
