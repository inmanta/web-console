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
import { NonEmptyArray } from "@/Core/Language";
import {
  DeployAgentsAction,
  ResourceActionFilter,
  useDeployFiltered,
  useDryRunFiltered,
} from "@/Data/Queries";
import { ActionDisabledTooltip } from "@/UI/Components/ActionDisabledTooltip";
import { DependencyContext } from "@/UI/Dependency";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ResourceActionInstance } from "./DryRunVersionField";
import { ResourceActionConfirmModal, ResourceActionScope } from "./ResourceActionConfirmModal";

const iconStyle = { color: "var(--pf-t--global--icon--color--subtle)" };

type DeployKey = keyof typeof DeployAgentsAction;

type ActionKey = DeployKey | "dryRun";

/**
 * The tooltip text per action, so each page can describe what the action does in its own context.
 */
type ResourceActionTooltips = Record<ActionKey, string>;

interface ActionConfig {
  // PatternFly icons all share one component type.
  Glyph: typeof PlayIcon;
  label: string;
  hint: string;
  tooltip: string;
}

interface BaseProps {
  tooltips: ResourceActionTooltips;
  disabledReason?: string;
  instance?: ResourceActionInstance;
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
 * pick the version to preview against. It disables itself while the environment is halted.
 *
 * @Props {Props} - The props of the component
 *  @prop {ResourceActionFilter} filter - Deploy and Repair run immediately against this filter (mutually exclusive with scopes)
 *  @prop {NonEmptyArray<ResourceActionScope>} scopes - Opens a confirm dialog offering these scopes (first is the default)
 *  @prop {ResourceActionTooltips} tooltips - The tooltip text for each action on this page
 *  @prop {string} [disabledReason] - When set, disables the control and shows this as its tooltip
 *  @prop {ResourceActionInstance} [instance] - The service instance the scopes belong to; the dialog names
 *    it and a dry run can pick one of its own versions
 *
 * @returns {React.FC<Props>} The rendered split button
 */
export const ResourceActions: React.FC<Props> = (props) => {
  const { disabledReason, tooltips, instance } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { environmentHandler } = useContext(DependencyContext);
  const { triggerModal, closeModal } = useContext(ModalContext);
  const isHalted = environmentHandler.useIsHalted();
  const { notifySuccess, notifyError } = useAppAlert();

  const deploy = useDeployFiltered();
  const dryRun = useDryRunFiltered();

  const tooltip = isHalted ? words("environment.halt.tooltip") : disabledReason;
  const isDisabled = deploy.isPending || dryRun.isPending || Boolean(tooltip);

  const actions: Record<ActionKey, ActionConfig> = {
    deploy: {
      Glyph: PlayIcon,
      label: words("resources.compoundStateSummary.deploy"),
      hint: words("resources.resourceActions.deploy.hint"),
      tooltip: tooltips.deploy,
    },
    repair: {
      Glyph: WrenchIcon,
      label: words("resources.compoundStateSummary.repair"),
      hint: words("resources.resourceActions.repair.hint"),
      tooltip: tooltips.repair,
    },
    dryRun: {
      Glyph: EyeIcon,
      label: words("resources.resourceActions.dryRun"),
      hint: words("resources.resourceActions.dryRun.hint"),
      tooltip: tooltips.dryRun,
    },
  };

  const run = (key: ActionKey, scopeFilter: ResourceActionFilter) => {
    const { label } = actions[key];
    const callbacks = {
      onSuccess: () => notifySuccess({ title: words("resources.resourceActions.success")(label) }),
      onError: (error: Error) =>
        notifyError({
          title: words("resources.resourceActions.failed")(label),
          message: error.message,
        }),
    };

    if (key === "dryRun") {
      dryRun.mutate(scopeFilter, callbacks);

      return;
    }

    deploy.mutate({ method: DeployAgentsAction[key], filter: scopeFilter }, callbacks);
  };

  const onAction = (key: ActionKey) => {
    setIsOpen(false);

    const isDryRun = key === "dryRun";

    if (!props.scopes && !isDryRun) {
      run(key, props.filter);

      return;
    }

    const { Glyph, label } = actions[key];
    const scopes: NonEmptyArray<ResourceActionScope> = props.scopes
      ? props.scopes
      : [{ id: "resource", title: label, filter: props.filter }];

    const title = () => {
      if (instance) {
        return words("resources.resourceActions.confirm.titleFor")(label, instance.name);
      }
      if (props.scopes) {
        return words("resources.resourceActions.confirm.title")(label);
      }

      return words("resources.resourceActions.confirm.single.title")(label);
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
      // A dry run's version line holds a status, two long version numbers and a date, which only
      // fit on one line in the wider dialog.
      variant: isDryRun ? ModalVariant.medium : ModalVariant.small,
      icon: (
        <Icon size="xl">
          <Glyph />
        </Icon>
      ),
      content: (
        <ResourceActionConfirmModal
          actionLabel={label}
          scopes={scopes}
          showScopes={Boolean(props.scopes)}
          showVersion={isDryRun}
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
              <Icon isInline size="sm">
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
          const { Glyph, label, hint, tooltip: itemTooltip } = actions[key];

          return (
            <DropdownItem
              key={key}
              icon={
                <Icon size="sm">
                  <Glyph style={iconStyle} />
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
