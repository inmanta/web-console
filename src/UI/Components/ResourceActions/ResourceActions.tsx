import React, { useContext, useState } from "react";
import {
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
  ModalVariant,
  Tooltip,
} from "@patternfly/react-core";
import { EyeIcon, WrenchIcon, PlayIcon } from "@patternfly/react-icons";
import { ResourceActionFilter, words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import { NonEmptyArray } from "@inmanta/web-console-core/Language";
import { DeployAgentsAction } from "@inmanta/web-console-core/Queries/Slices/Agents";
import {
  createDryRunContext,
  useDeployFiltered,
  useDryRunFiltered,
} from "@inmanta/web-console-core/Queries/Slices/Resource";
import { ActionDisabledTooltip } from "@inmanta/web-console-ui/Components/ActionDisabledTooltip";
import { useNotifyDryRunStarted } from "@inmanta/web-console-ui/Components/DryRunNotification";
import { Spinner } from "@inmanta/web-console-ui/Components/Spinner";
import { ResourceActionConfirmModal, ResourceActionScope } from "./ResourceActionConfirmModal";
import { ResourceActionInstance } from "./types";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

type DeployKey = keyof typeof DeployAgentsAction;

type ActionKey = DeployKey | "dryRun";

/**
 * The tooltip text per action, so each page can describe what the action does in its own context.
 */
type ResourceActionTooltips = Record<ActionKey, string>;

interface ActionConfig {
  // PatternFly icons all share one component type.
  IconComponent: typeof PlayIcon;
  label: string;
  hint: string;
  tooltip: string;
}

interface BaseProps {
  tooltips: ResourceActionTooltips;
  disabledReason?: string;
  instance?: ResourceActionInstance;
  instanceLabels?: Record<string, string>;
}

type Props =
  | (BaseProps & { filter: ResourceActionFilter; scopes?: never })
  | (BaseProps & { scopes: NonEmptyArray<ResourceActionScope>; filter?: never });

/**
 * ResourceActions is the shared split button for running an action on a set of resources.
 *
 * Deploy is the default action; the caret adds Repair and Dry run. Deploy and Repair hit the
 * deploy_filtered endpoint and Dry run hits dryrun_filtered, so one control serves a single resource,
 * the active filter, a whole environment or a service instance. Dry run always opens the dialog, to
 * select the version to preview against, and its toast links to the dry run's report when the app
 * has the Compliance Check page. A dry run
 * stores the labels of the service instances its filter names, so its report shows them. It
 * disables itself while the environment is halted, and while an action is starting, when the Deploy
 * button shows a spinner in place of its icon.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionFilter} filter - Deploy and Repair run immediately against this filter (mutually exclusive with scopes)
 *  @prop {NonEmptyArray<ResourceActionScope>} scopes - Opens a confirm dialog offering these scopes (first is the default)
 *  @prop {ResourceActionTooltips} tooltips - The tooltip text for each action on this page
 *  @prop {string} [disabledReason] - When set, disables the control and shows this as its tooltip
 *  @prop {ResourceActionInstance} [instance] - The service instance the scopes belong to; the dialog names
 *    it and a dry run can select one of its own versions
 *  @prop {Record<string, string>} [instanceLabels] - The labels of the service instances the filters
 *    may name, keyed by instance id, to store with a dry run
 *
 * @returns {React.FC<Props>} The rendered split button
 */
export const ResourceActions: React.FC<Props> = (props) => {
  const { disabledReason, tooltips, instance, instanceLabels } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifySuccess, notifyError } = useAppAlert();
  const notifyDryRunStarted = useNotifyDryRunStarted();

  const deploy = useDeployFiltered();
  const dryRun = useDryRunFiltered();

  const tooltip = isHalted ? words("environment.halt.tooltip") : disabledReason;
  const isDisabled = deploy.isPending || dryRun.isPending || Boolean(tooltip);

  const getPendingActionKey = (): ActionKey | undefined => {
    if (dryRun.isPending) {
      return "dryRun";
    }
    if (!deploy.isPending) {
      return undefined;
    }

    return deploy.variables.method === DeployAgentsAction.repair ? "repair" : "deploy";
  };
  const pendingActionKey = getPendingActionKey();

  const actions: Record<ActionKey, ActionConfig> = {
    deploy: {
      IconComponent: PlayIcon,
      label: words("resources.compoundStateSummary.deploy"),
      hint: words("resources.resourceActions.deploy.hint"),
      tooltip: tooltips.deploy,
    },
    repair: {
      IconComponent: WrenchIcon,
      label: words("resources.compoundStateSummary.repair"),
      hint: words("resources.resourceActions.repair.hint"),
      tooltip: tooltips.repair,
    },
    dryRun: {
      IconComponent: EyeIcon,
      label: words("resources.resourceActions.dryRun"),
      hint: words("resources.resourceActions.dryRun.hint"),
      tooltip: tooltips.dryRun,
    },
  };

  const run = (key: ActionKey, scopeFilter: ResourceActionFilter) => {
    const { label: actionLabel } = actions[key];
    const onError = (error: Error) =>
      notifyError({
        title: words("resources.resourceActions.failed")(actionLabel),
        message: error.message,
      });

    if (key === "dryRun") {
      dryRun.mutate(
        { filter: scopeFilter, context: createDryRunContext(scopeFilter, instanceLabels ?? {}) },
        {
          onSuccess: notifyDryRunStarted,
          onError,
        }
      );

      return;
    }

    deploy.mutate(
      { method: DeployAgentsAction[key], filter: scopeFilter },
      {
        onSuccess: () =>
          notifySuccess({ title: words("resources.resourceActions.triggered")(actionLabel) }),
        onError,
      }
    );
  };

  const onAction = (key: ActionKey) => {
    setIsOpen(false);

    const isDryRun = key === "dryRun";

    if (!props.scopes && !isDryRun) {
      run(key, props.filter);

      return;
    }

    const { IconComponent, label: actionLabel } = actions[key];
    const scopes: NonEmptyArray<ResourceActionScope> = props.scopes
      ? props.scopes
      : [{ id: "resource", title: actionLabel, filter: props.filter }];

    const title = () => {
      if (instance) {
        return words("resources.resourceActions.confirm.titleFor")(actionLabel, instance.label);
      }
      if (props.scopes) {
        return words("resources.resourceActions.confirm.title")(actionLabel);
      }

      return words("resources.resourceActions.confirm.single.title")(actionLabel);
    };

    const description = () => {
      if (!isDryRun) {
        return words("resources.resourceActions.confirm.description");
      }
      if (instance) {
        return words("resources.resourceActions.confirm.dryRun.instance.description");
      }

      return words("resources.resourceActions.confirm.dryRun.description");
    };

    triggerModal({
      title: title(),
      description: description(),
      // A dry run's version select toggle holds a status, two long version numbers and a date,
      // which only fit on one line in the wider dialog.
      variant: isDryRun ? ModalVariant.medium : ModalVariant.small,
      iconVariant: IconComponent,
      content: (
        <ResourceActionConfirmModal
          actionLabel={actionLabel}
          scopes={scopes}
          showScopes={Boolean(props.scopes)}
          showVersionField={isDryRun}
          instance={instance}
          onConfirm={(scopeFilter) => {
            closeModal();
            run(key, scopeFilter);
          }}
          onClose={closeModal}
        />
      ),
    });
  };

  const toggle = (ref: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={ref}
      variant="secondary"
      isExpanded={isOpen}
      isDisabled={isDisabled}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={words("resources.resourceActions.toggle")}
      splitButtonItems={[
        <MenuToggleAction
          key="deploy-action"
          isDisabled={isDisabled}
          onClick={() => onAction("deploy")}
        >
          <Tooltip content={actions.deploy.tooltip}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--pf-t--global--spacer--sm)",
              }}
            >
              <Icon
                isInline
                size="sm"
                isInProgress={pendingActionKey !== undefined}
                progressIcon={
                  pendingActionKey && (
                    <Spinner
                      aria-label={words("resources.resourceActions.triggered")(
                        actions[pendingActionKey].label
                      )}
                    />
                  )
                }
              >
                <PlayIcon />
              </Icon>
              {actions.deploy.label}
            </span>
          </Tooltip>
        </MenuToggleAction>,
      ]}
    />
  );

  const dropdown = (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={toggle}
      popperProps={{ position: "right" }}
    >
      <DropdownList>
        {(Object.keys(actions) as ActionKey[]).map((key) => {
          const { IconComponent, label, hint, tooltip: itemTooltip } = actions[key];

          return (
            <DropdownItem
              key={key}
              icon={
                <Icon size="sm">
                  <IconComponent style={iconStyle} />
                </Icon>
              }
              onClick={() => onAction(key)}
              tooltipProps={{ content: itemTooltip }}
            >
              <Flex
                justifyContent={{ default: "justifyContentSpaceBetween" }}
                alignItems={{ default: "alignItemsCenter" }}
                columnGap={{ default: "columnGapMd" }}
              >
                <FlexItem>{label}</FlexItem>
                <FlexItem>
                  <Content component="small">{hint}</Content>
                </FlexItem>
              </Flex>
            </DropdownItem>
          );
        })}
      </DropdownList>
    </Dropdown>
  );

  return tooltip ? (
    <ActionDisabledTooltip testingId="ResourceActions" tooltipContent={tooltip} isDisabled>
      {dropdown}
    </ActionDisabledTooltip>
  ) : (
    dropdown
  );
};
