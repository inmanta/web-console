import {
  Modal,
  Button,
  Spinner,
  Text,
  TextVariants,
  TextContent,
  Alert,
  ExpandableSection,
  ModalVariant,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@patternfly/react-core";
import { useState, Fragment, useEffect } from "react";
import React from "react";
import { ToolsIcon, CheckIcon, TimesIcon } from "@patternfly/react-icons";
import { InventoryContext } from "./InventoryContext";
import { ServiceInstanceModel } from "@/Core";
import {
  fetchInmantaApi,
  IRequestParams,
} from "@/UI/App/utils/fetchInmantaApi";

type PickedInstance = Pick<ServiceInstanceModel, "id" | "version">;

export const DiagnosticsModal: React.FunctionComponent<{
  serviceName: string;
  instance: PickedInstance;
  keycloak?: Keycloak.KeycloakInstance;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const ModalButton = () => (
    <Button variant="tertiary" onClick={handleModalToggle} id="rca-button">
      <ToolsIcon /> Diagnose
    </Button>
  );
  return (
    <React.Fragment>
      <ModalButton />
      <Modal
        variant={ModalVariant.small}
        isOpen={isOpen}
        title="Diagnose service instance"
        onClose={handleModalToggle}
      >
        <InventoryContext.Consumer>
          {({ environmentId, inventoryUrl }) => {
            return (
              <div>
                <InstanceStatus
                  index={1}
                  instance={props.instance}
                  inventoryUrl={inventoryUrl}
                  environmentId={environmentId}
                  keycloak={props.keycloak}
                  errorCheckingFunction={getDeploymentFailureMessage}
                  errorType="Deployment-status"
                />
                <br />
                <InstanceStatus
                  index={2}
                  instance={props.instance}
                  inventoryUrl={inventoryUrl}
                  environmentId={environmentId}
                  keycloak={props.keycloak}
                  errorCheckingFunction={getValidationFailureMessage}
                  errorType="Validation-status"
                />
              </div>
            );
          }}
        </InventoryContext.Consumer>
      </Modal>
    </React.Fragment>
  );
};

export async function getValidationFailureMessage(
  instance: ServiceInstanceModel,
  inventoryUrl: string,
  environmentId: string | undefined,
  setErrorMessage: React.Dispatch<string>,
  keycloak: Keycloak.KeycloakInstance | undefined
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
): Promise<any> {
  const logUrl = `${inventoryUrl}/${instance.id}/log`;
  const requestParams: IRequestParams = {
    environmentId,
    urlEndpoint: logUrl,
    isEnvironmentIdRequired: true,
    setErrorMessage,
    keycloak,
    dispatch: () => {
      return;
    },
  };
  const logs = await fetchInmantaApi(requestParams);
  // Find matching report for the version
  const latestLogRecord = logs?.data.find(
    (report) => report.version === instance.version
  );
  const messageWithCompileReport = latestLogRecord?.events
    .sort(
      (messageA, messageB) =>
        new Date(messageB.timestamp).getTime() -
        new Date(messageA.timestamp).getTime()
    )
    .find((message) => !!message.id_compile_report);

  if (!messageWithCompileReport) {
    return;
  }
  const compileId = messageWithCompileReport.id_compile_report;
  const compileReportUrl = `/api/v1/compilereport/${compileId}`;
  requestParams.urlEndpoint = compileReportUrl;
  const compileReport = await fetchInmantaApi(requestParams);
  if (compileReport) {
    // Try to find the report with the error
    const trace = compileReport.report.reports.find(
      (report) => report.returncode !== 0
    )?.errstream;
    if (!trace) {
      return;
    }
    const errorMessage = JSON.stringify(compileReport.report.compile_data);

    return { errorMessage, trace };
  }
  return;
}

async function getDeploymentFailureMessage(
  instance: ServiceInstanceModel,
  inventoryUrl: string,
  environmentId,
  setErrorMessage,
  keycloak
) {
  const resourceUrl = `${inventoryUrl}/${instance.id}/resources?current_version=${instance.version}`;
  const requestParams = {
    environmentId,
    urlEndpoint: resourceUrl,
    isEnvironmentIdRequired: true,
    setErrorMessage,
    keycloak,
    dispatch: () => {
      return;
    },
  };
  const resources = await fetchInmantaApi(requestParams);
  // Get failed resources
  const failedResources = resources?.data.filter(
    (resource) => resource.resource_state === "failed"
  );
  if (failedResources) {
    for (const failedResource of failedResources) {
      // Get the log messages
      const resourceLogUrl = `/api/v1/resource/${failedResource.resource_id}?logs=True&log_action=deploy`;
      requestParams.urlEndpoint = resourceLogUrl;
      const resourceActionLogs = await fetchInmantaApi(requestParams);
      if (resourceActionLogs) {
        for (const logMessage of resourceActionLogs.logs) {
          const errorMessage = logMessage.messages.find(
            (message) => message.level === "ERROR"
          );
          if (errorMessage) {
            const errorMessageWithId = errorMessage.msg.includes(
              failedResource.resource_id
            )
              ? errorMessage.msg
              : `${failedResource.resource_id}: ${errorMessage.msg}`;
            return {
              errorMessage: errorMessageWithId,
              trace: errorMessage.kwargs.traceback,
            };
          }
        }
      }
    }
  }
  return;
}

const InstanceStatus: React.FunctionComponent<{
  instance: PickedInstance;
  inventoryUrl: string;
  environmentId?: string;
  keycloak?: Keycloak.KeycloakInstance;
  errorCheckingFunction;
  errorType: string;
  index: number;
}> = (props) => {
  const [errorMessageDetails, setErrorMessageDetails] = useState("");
  const [noProblemsFound, setNoProblemsFound] = useState(false);
  const [stackTrace, setStackTrace] = useState("");
  const [fetchErrorMessage, setFetchErrorMessage] = useState("");
  useEffect(() => {
    props
      .errorCheckingFunction(
        props.instance,
        props.inventoryUrl,
        props.environmentId,
        setFetchErrorMessage,
        props.keycloak
      )
      .then((errorDetails) => {
        if (errorDetails) {
          setErrorMessageDetails(errorDetails.errorMessage);
          setStackTrace(errorDetails.trace);
          setNoProblemsFound(false);
        } else if (!fetchErrorMessage) {
          setNoProblemsFound(true);
        }
      });
  }, [props.instance, props.errorType]);

  if (!errorMessageDetails && !noProblemsFound && !fetchErrorMessage) {
    return <Spinner size="md" />;
  }

  return (
    <StatusCard
      errorType={props.errorType}
      errorMessageDetails={errorMessageDetails}
      noProblemsFound={noProblemsFound}
      stackTrace={stackTrace}
      fetchErrorMessage={fetchErrorMessage}
      index={props.index}
    />
  );
};

const StatusCard: React.FunctionComponent<{
  errorType: string;
  errorMessageDetails: string;
  noProblemsFound: boolean;
  stackTrace: string;
  fetchErrorMessage: string;
  index: number;
}> = (props) => {
  let formattedErrorMessageDetails = <Fragment />;
  if (props.errorMessageDetails && isValidJson(props.errorMessageDetails)) {
    const parsedErrorMessageDetails = JSON.parse(props.errorMessageDetails);
    if (parsedErrorMessageDetails.errors) {
      formattedErrorMessageDetails = parsedErrorMessageDetails.errors.map(
        (errorEntry) => {
          return (
            <div key={`${props.errorType}-details`}>
              <Text component={TextVariants.small}>
                The following error occured:
              </Text>
              <TextContent key={"message"}>
                <Text component={TextVariants.h4}>
                  {" "}
                  {errorEntry.message} <TimesIcon color="red" />{" "}
                </Text>
                <Text>{errorEntry.type}</Text>
              </TextContent>
            </div>
          );
        }
      );
    }
  } else {
    formattedErrorMessageDetails = (
      <TextContent>
        {" "}
        <Text component={TextVariants.h4}>
          {" "}
          {props.errorMessageDetails} <TimesIcon color="red" />
        </Text>
      </TextContent>
    );
  }

  return (
    <div id={props.errorType + "-div"}>
      <Card>
        <CardHeader>
          <TextContent>
            <Text component={TextVariants.h2}>{`${
              props.index
            }. ${props.errorType.split("-").join(" ")}`}</Text>
          </TextContent>
        </CardHeader>
        <CardBody>
          {props.fetchErrorMessage && (
            <Alert
              id={`${props.errorType}-fetch-error`}
              variant="danger"
              title={props.fetchErrorMessage}
            />
          )}
          {!!props.errorMessageDetails && (
            <div id={`${props.errorType}-error-message-details`}>
              {formattedErrorMessageDetails}
            </div>
          )}
          {props.noProblemsFound && !props.fetchErrorMessage && (
            <Text
              id={`${props.errorType}-ok-message`}
              component={TextVariants.p}
            >
              No Problems found <CheckIcon color="green" />{" "}
            </Text>
          )}
        </CardBody>

        {!!props.stackTrace && (
          <CardFooter>
            <ExpandableSection toggleText={"Show Stacktrace"}>
              <TextContent id={`${props.errorType}-stacktrace`}>
                <Text component={TextVariants.blockquote}>
                  {props.stackTrace.split("\n").map((line, idx) => (
                    <Fragment key={`line-${idx}`}>
                      {line}
                      <br />
                    </Fragment>
                  ))}
                </Text>
              </TextContent>
            </ExpandableSection>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

function isValidJson(value: string) {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}
