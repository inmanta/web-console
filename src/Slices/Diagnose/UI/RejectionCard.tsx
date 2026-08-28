import React, { useContext, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockCode,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  ExpandableSection,
  Flex,
  FlexItem,
  Label,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { CompileError, CompileErrorLocation } from "@/Core";
import { Link } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Rejection } from "@S/Diagnose/Core/Domain";
import { Traceback } from "./Traceback";

interface Props {
  rejection: Rejection;
}

/**
 * Formats a compile error's location as `uri:line:character`, falling back to just the
 * uri when no range is available.
 *
 * @param location {CompileErrorLocation} - The location to format.
 * @returns {string} The formatted location.
 */
export const formatLocation = (location: CompileErrorLocation): string =>
  location.range
    ? `${location.uri}:${location.range.start.line}:${location.range.start.character}`
    : location.uri;

/**
 * A single compile error: its message, always visible, and its type/category/location
 * behind a "Show details" toggle.
 *
 * @prop {CompileError} error - The compile error to display.
 * @prop {number} index - The error's position among its rejection's other errors, used
 *   to give its details toggle a unique accessible name.
 * @returns {React.FC} A component that displays a single compile error.
 */
const ErrorBlock: React.FC<{ error: CompileError; index: number }> = ({ error, index }) => (
  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
    <FlexItem>
      <DescriptionList isCompact>
        <DescriptionListGroup>
          <DescriptionListTerm>{words("diagnose.rejection.errorMessage")}</DescriptionListTerm>
          <DescriptionListDescription>
            <CodeBlock>
              <CodeBlockCode>{error.message}</CodeBlockCode>
            </CodeBlock>
          </DescriptionListDescription>
        </DescriptionListGroup>
      </DescriptionList>
    </FlexItem>
    <FlexItem>
      <ExpandableSection
        toggleText={words("diagnose.rejection.showDetailsAriaLabel")(index + 1)}
        isIndented
      >
        <DescriptionList isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{words("diagnose.rejection.errorType")}</DescriptionListTerm>
            <DescriptionListDescription>{error.type}</DescriptionListDescription>
          </DescriptionListGroup>
          {error.category && (
            <DescriptionListGroup>
              <DescriptionListTerm>{words("diagnose.rejection.errorCategory")}</DescriptionListTerm>
              <DescriptionListDescription>{error.category}</DescriptionListDescription>
            </DescriptionListGroup>
          )}
          {error.location && (
            <DescriptionListGroup>
              <DescriptionListTerm>{words("diagnose.rejection.errorLocation")}</DescriptionListTerm>
              <DescriptionListDescription>
                {formatLocation(error.location)}
              </DescriptionListDescription>
            </DescriptionListGroup>
          )}
        </DescriptionList>
      </ExpandableSection>
    </FlexItem>
  </Flex>
);

/**
 * A card showing a single rejection: the instance version it applies to, every compile
 * error it carries, and the full traceback in the footer.
 *
 * @prop {Rejection} rejection - The rejection to display.
 * @returns {React.FC} A component that displays a rejection.
 */
export const RejectionCard: React.FC<Props> = ({
  rejection: { instance_version, model_version, compile_id, trace, errors },
}) => {
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownItems: React.ReactNode = (
    <DropdownList>
      <DropdownItem key="compileReportLink">
        <Link
          pathname={routeManager.getUrl("CompileDetails", {
            id: compile_id,
          })}
        >
          {words("diagnose.links.compileReport")}
        </Link>
      </DropdownItem>
      {model_version ? (
        <DropdownItem key="modelVersionLink">
          <Link
            pathname={routeManager.getUrl("DesiredStateDetails", {
              version: model_version.toString(),
            })}
          >
            {words("diagnose.links.modelVersionDetails")}
          </Link>
        </DropdownItem>
      ) : null}
    </DropdownList>
  );

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card>
      <CardHeader
        actions={{
          actions: (
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              spaceItems={{ default: "spaceItemsSm" }}
            >
              {errors && errors.length > 1 && (
                <FlexItem>
                  <Label isCompact color="red">
                    {words("diagnose.rejection.errorsCount")(errors.length)}
                  </Label>
                </FlexItem>
              )}
              <FlexItem>
                <Dropdown
                  onSelect={() => setIsOpen((value) => !value)}
                  toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      aria-label="repair-deploy-dropdown"
                      variant="plain"
                      onClick={onToggleClick}
                      isExpanded={isOpen}
                      icon={<EllipsisVIcon />}
                    />
                  )}
                  isOpen={isOpen}
                  isPlain
                  onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
                  popperProps={{ position: "center" }}
                >
                  {dropdownItems}
                </Dropdown>
              </FlexItem>
            </Flex>
          ),
          // Default false applies a negative margin calibrated for a plain-text CardTitle;
          // ours is taller (title + subtitle), so that offset would misalign the actions.
          hasNoOffset: true,
          className: undefined,
        }}
      >
        <CardTitle>
          <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
            <FlexItem>
              <Content component="h3">{words("diagnose.rejection.title")}</Content>
            </FlexItem>
            <FlexItem>
              <Content component="small">
                {words("diagnose.rejection.instanceVersion")(instance_version)}
              </Content>
            </FlexItem>
          </Flex>
        </CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsLg" }}>
          {errors?.map((error, idx) => (
            <FlexItem key={`error-${idx}`}>
              <ErrorBlock error={error} index={idx} />
            </FlexItem>
          ))}
        </Flex>
      </CardBody>
      {trace && (
        <>
          <Divider />
          <CardFooter>
            <ExpandableSection toggleText={words("diagnose.rejection.traceback")}>
              <Traceback trace={trace} />
            </ExpandableSection>
          </CardFooter>
        </>
      )}
    </Card>
  );
};
