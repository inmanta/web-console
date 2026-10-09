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
  DryRunVersion,
  ResourceActionFilter,
  getVersionSelectionBlocker,
  useGetModelVersionForInstanceVersion,
  withActiveModelVersion,
  withDryRunVersion,
} from "@/Data/Queries";
import { words } from "@/UI/words";
import { DryRunVersionField } from "./DryRunVersionField";
import { ResourceActionInstance } from "./types";

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
  showVersionField: boolean;
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
 * selected one.
 * With the version field, a dry run on the selected scope runs against the selected version, or
 * against the active model version when none is selected or selecting one is blocked.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} actionLabel - The verb being confirmed (Deploy/Repair/Dry run)
 *  @prop {NonEmptyArray<ResourceActionScope>} scopes - The selectable scopes
 *  @prop {boolean} showScopes - Shows the scope cards; when false the first scope is used as is
 *  @prop {boolean} showVersionField - Shows the version field, for dry run
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
  showVersionField,
  instance,
  onConfirm,
  onClose,
}) => {
  const defaultScope = scopes.find((scope) => scope.count !== 0) ?? scopes[0];
  const [selectedScopeId, setSelectedScopeId] = useState(defaultScope.id);
  const [selectedVersion, setSelectedVersion] = useState<DryRunVersion>();
  const selectedScope = scopes.find((scope) => scope.id === selectedScopeId) ?? defaultScope;

  // When the selected scope blocks selecting a version, the selected version is ignored and the
  // dry run uses the active model version.
  const versionSelectionBlocker = getVersionSelectionBlocker(selectedScope.filter);
  const blockedMessage =
    versionSelectionBlocker &&
    words(`resources.resourceActions.confirm.version.blockedBy.${versionSelectionBlocker}`);
  const dryRunVersion = versionSelectionBlocker ? undefined : selectedVersion;

  // A dry run without a selected version runs against the active model version.
  const filterWithoutSelectedVersion = showVersionField
    ? withActiveModelVersion(selectedScope.filter)
    : selectedScope.filter;
  const filter = dryRunVersion
    ? withDryRunVersion(selectedScope.filter, dryRunVersion)
    : filterWithoutSelectedVersion;

  // A selected instance version that has no model version has nothing to dry-run, so confirming
  // waits until its model version is known.
  const modelVersionOfSelectedInstanceVersionQuery = useGetModelVersionForInstanceVersion(
    instance?.id,
    dryRunVersion?.type === "instanceVersion" ? dryRunVersion.version : undefined
  );
  const canConfirmSelectedVersion =
    !modelVersionOfSelectedInstanceVersionQuery.isLoading &&
    modelVersionOfSelectedInstanceVersionQuery.data !== null;

  const scopeCards = (
    <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
      {scopes.map((scope) => (
        <ScopeCard
          key={scope.id}
          id={scope.id}
          isSelected={scope.id === selectedScopeId}
          onSelect={setSelectedScopeId}
          title={scope.title}
          detail={scope.detail}
          count={scope.count}
        />
      ))}
      {selectedScope.filter.isOrphan !== false && (
        <Content component="small">{words("resources.resourceActions.confirm.orphanNote")}</Content>
      )}
    </Flex>
  );

  return (
    <Form onSubmit={(event) => event.preventDefault()}>
      {showScopes &&
        (showVersionField ? (
          // Next to the version field, the scope gets a label of its own.
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
      {showVersionField && (
        <DryRunVersionField
          instance={instance}
          onSelect={setSelectedVersion}
          blockedMessage={blockedMessage}
        />
      )}
      <Flex gap={{ default: "gapSm" }}>
        <Button
          key="confirm"
          variant="primary"
          autoFocus
          isDisabled={selectedScope.count === 0 || !canConfirmSelectedVersion}
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
