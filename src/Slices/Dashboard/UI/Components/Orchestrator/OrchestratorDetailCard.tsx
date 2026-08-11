import React, { useContext } from "react";
import { Link } from "react-router";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Flex,
  FlexItem,
  Label,
} from "@patternfly/react-core";
import { CheckIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from "@patternfly/react-icons";
import { ServerStatus, StatusLicense } from "@/Core";
import { useGetServerStatus } from "@/Data/Queries";
import { DependencyContext } from "@/UI/Dependency";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { deriveOrchestratorHealth } from "../../orchestratorHealth";
import { IconBadge } from "../IconBadge";

const datePresenter = new CustomDatePresenter();

interface LicenseValidity {
  expiry?: string;
  // undefined when no expiry data is present at all (e.g. non-licensed editions) - only a
  // known-false value counts as an actual problem for severity purposes.
  isValid?: boolean;
}

/**
 * Reads the `license.license` slice's status (same slice/fields `LicenseBanner` reads for its
 * expiry warning) for the license's expiry date and current validity.
 */
const getLicenseValidity = (serverStatus: ServerStatus): LicenseValidity => {
  const { entitlement_valid_until, cert_valid_until } =
    (serverStatus.slices.find((slice) => slice.name === "license.license")?.status as
      StatusLicense | undefined) ?? {};

  const expiry = entitlement_valid_until ?? cert_valid_until;

  return expiry ? { expiry, isValid: new Date(expiry).getTime() > Date.now() } : {};
};

/**
 * The License detail row's value: "Valid"/"Expired · exp <date>", falling back to the raw
 * `ServerStatus.license` string (e.g. "Inmanta EULA") when no expiry data is present.
 */
const formatLicenseValue = (serverStatus: ServerStatus): string => {
  const { expiry, isValid } = getLicenseValidity(serverStatus);

  return expiry && isValid !== undefined
    ? words("dashboard.orchestrator.licenseSummary")(
        isValid,
        datePresenter.format(expiry, "YYYY-MM-DD")
      )
    : serverStatus.license;
};

type Severity = "success" | "warning" | "danger";

const SEVERITY_ICON: Record<Severity, React.ReactNode> = {
  success: <CheckIcon />,
  warning: <ExclamationTriangleIcon />,
  danger: <ExclamationCircleIcon />,
};

const SEVERITY_LABEL_COLOR: Record<Severity, "green" | "orange" | "red"> = {
  success: "green",
  warning: "orange",
  danger: "red",
};

const SEVERITY_LABEL_TEXT: Record<Severity, string> = {
  success: words("dashboard.environmentHealth.operational"),
  warning: words("dashboard.environmentHealth.status.attention"),
  danger: words("dashboard.environmentHealth.status.danger"),
};

/**
 * Card-level severity: "danger" if any of the server/database/scheduler checks (the same
 * checklist EnvironmentHealthRow's Orchestrator health card shows) are failing, "warning" if
 * those are fine but the license has expired, "success" otherwise. Data not yet loaded is
 * treated as "danger" (fail-closed), matching EnvironmentHealthRow's own loading fallback.
 */
const deriveSeverity = (serverStatus: ServerStatus | undefined): Severity => {
  if (!serverStatus) {
    return "danger";
  }

  const coreHealthy = deriveOrchestratorHealth(serverStatus).checklist.every((item) => item.ok);

  if (!coreHealthy) {
    return "danger";
  }

  return getLicenseValidity(serverStatus).isValid === false ? "warning" : "success";
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
    <FlexItem>
      <Content component="small">{label}</Content>
    </FlexItem>
    <FlexItem>
      <Content component="p" style={{ fontWeight: 700, fontFamily: "monospace" }}>
        {value}
      </Content>
    </FlexItem>
  </Flex>
);

/**
 * Orchestrator detail card: a condensed version of the Status page (edition, version, license
 * validity, Python/PostgreSQL versions, extensions) plus a link to the full Status page.
 * Sourced from the same useGetServerStatus() call as EnvironmentHealthRow's Orchestrator health
 * card, so React Query dedupes the two into a single network request.
 */
export const OrchestratorDetailCard: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const statusUrl = routeManager.useUrl("Status", undefined);

  const { data: serverStatus } = useGetServerStatus().useContinuous();

  const severity = deriveSeverity(serverStatus);

  return (
    <Card isFullHeight>
      <CardHeader
        actions={{
          // Default false applies a negative margin calibrated for a plain-text CardTitle;
          // ours is taller (icon + title + subtitle), so that offset would misalign the action
          // against it.
          hasNoOffset: true,
          actions: (
            <Label color={SEVERITY_LABEL_COLOR[severity]} isCompact>
              {SEVERITY_LABEL_TEXT[severity]}
            </Label>
          ),
        }}
      >
        <CardTitle>
          <Flex
            alignItems={{ default: "alignItemsCenter" }}
            spaceItems={{ default: "spaceItemsSm" }}
          >
            <FlexItem>
              <IconBadge $tone={severity}>{SEVERITY_ICON[severity]}</IconBadge>
            </FlexItem>
            <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
              <FlexItem>
                <Content component="h3">{words("dashboard.orchestrator.title")}</Content>
              </FlexItem>
              <FlexItem>
                <Content component="small">{serverStatus?.product ?? "—"}</Content>
              </FlexItem>
            </Flex>
          </Flex>
        </CardTitle>
      </CardHeader>
      <Divider />
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
          <DetailRow
            label={words("dashboard.orchestrator.edition")}
            value={serverStatus?.edition ?? "—"}
          />
          <DetailRow
            label={words("dashboard.orchestrator.version")}
            value={serverStatus?.version ?? "—"}
          />
          <DetailRow
            label={words("dashboard.orchestrator.license")}
            value={serverStatus ? formatLicenseValue(serverStatus) : "—"}
          />
          <DetailRow
            label={words("dashboard.orchestrator.pythonVersion")}
            value={serverStatus?.python_version ?? "—"}
          />
          <DetailRow
            label={words("dashboard.orchestrator.postgresqlVersion")}
            value={serverStatus?.postgresql_version ?? "—"}
          />
        </Flex>
      </CardBody>
      <Divider />
      <CardBody>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsSm" }}>
          <FlexItem>
            <Content component="small">{words("dashboard.orchestrator.extensionsLabel")}</Content>
          </FlexItem>
          {(serverStatus?.extensions ?? []).map((extension) => (
            <Flex
              key={extension.name}
              justifyContent={{ default: "justifyContentSpaceBetween" }}
              alignItems={{ default: "alignItemsCenter" }}
            >
              <Flex
                alignItems={{ default: "alignItemsCenter" }}
                spaceItems={{ default: "spaceItemsSm" }}
              >
                <FlexItem>
                  <Content component="p" style={{ fontWeight: 700 }}>
                    {extension.name}
                  </Content>
                </FlexItem>
                <FlexItem>
                  <Label isCompact variant="outline">
                    {words("dashboard.orchestrator.extensionTag")}
                  </Label>
                </FlexItem>
              </Flex>
              <FlexItem>
                <Content component="small" style={{ fontFamily: "monospace" }}>
                  {extension.version}
                </Content>
              </FlexItem>
            </Flex>
          ))}
        </Flex>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link to={statusUrl}>
          <Button variant="link" isInline>
            {words("dashboard.orchestrator.viewFullStatus")} &gt;
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
