import { Modal, Button, Spinner, Text, TextVariants, Expandable, TextContent, Alert, Divider, Label } from "@patternfly/react-core"
import { useState, Fragment } from "react";
import React from "react";
import { ToolsIcon, CheckIcon } from "@patternfly/react-icons";
import { InventoryContext } from "./ServiceInventory";
import { IServiceInstanceModel } from "@app/Models/LsmModels";
import { fetchInmantaApi } from "@app/utils/fetchInmantaApi";

const DiagnosticsModal: React.FunctionComponent<{ serviceName: string, instance: IServiceInstanceModel, keycloak?: Keycloak.KeycloakInstance }> = props => {
  const [isOpen, setIsOpen] = useState(false);
  const handleModalToggle = () => {
    setIsOpen(!isOpen);
  };
  const ModalButton = () => <Button variant="tertiary" onClick={handleModalToggle} id="rca-button" ><ToolsIcon /> Diagnose</Button>;
  return (
    <React.Fragment>
      <ModalButton />
      <Modal isSmall={true} isOpen={isOpen}
        title='Diagnose service instance' onClose={handleModalToggle}>
        <InventoryContext.Consumer>
          {({ environmentId, inventoryUrl }) => {
            return <div>
              <InstanceStatus instance={props.instance}
                inventoryUrl={inventoryUrl}
                environmentId={environmentId}
                keycloak={props.keycloak}
                errorCheckingFunction={getDeploymentFailureMessage}
                errorType="Deployment-status" />
              <Divider />
              <br />
              <InstanceStatus instance={props.instance}
                inventoryUrl={inventoryUrl}
                environmentId={environmentId}
                keycloak={props.keycloak}
                errorCheckingFunction={getValidationFailureMessage}
                errorType="Validation-status" />
            </div>
          }}
        </InventoryContext.Consumer>
      </Modal>
    </React.Fragment>);
}

async function getValidationFailureMessage(instance: IServiceInstanceModel, inventoryUrl: string, environmentId, setErrorMessage, keycloak) {
  const logUrl = `${inventoryUrl}/${instance.id}/log`;
  const requestParams = { environmentId, urlEndpoint: logUrl, isEnvironmentIdRequired: true, setErrorMessage, keycloak, dispatch: () => { return; } };
  const logs = await fetchInmantaApi(requestParams);
  // Find matching report for the version
  const latestLogRecord = logs?.data.find((report) => report.version === instance.version);
  const messageWithCompileReport = latestLogRecord?.events.find((message) => message.id_compile_report!!);
  if (!messageWithCompileReport) {
    return;
  }
  const compileId = messageWithCompileReport.id_compile_report;
  const compileReportUrl = `/api/v1/compilereport/${compileId}`;
  requestParams.urlEndpoint = compileReportUrl;
  const compileReport = await fetchInmantaApi(requestParams);
  if (compileReport) {
    // Try to find the report with the error
    const trace = compileReport.report.reports.find((report => report.returncode !== 0))?.errstream;
    if (!trace) {
      return;
    }
    const errorMessage = JSON.stringify(compileReport.report.compile_data);

    return { errorMessage, trace };
  }
  return;
}

async function getDeploymentFailureMessage(instance: IServiceInstanceModel, inventoryUrl: string, environmentId, setErrorMessage, keycloak) {
  const resourceUrl = `${inventoryUrl}/${instance.id}/resources?current_version=${instance.version}`;
  const requestParams = { environmentId, urlEndpoint: resourceUrl, isEnvironmentIdRequired: true, setErrorMessage, keycloak, dispatch: () => { return; } };
  const resources = await fetchInmantaApi(requestParams);
  // Get failed resources
  const failedResources = resources?.data.filter((resource) => resource.resource_state === "failed");
  if (failedResources) {
    for (const failedResource of failedResources) {
      // Get the log messages
      const resourceLogUrl = `/api/v1/resource/${failedResource.resource_id}?logs=True&log_action=deploy`;
      requestParams.urlEndpoint = resourceLogUrl;
      const resourceActionLogs = await fetchInmantaApi(requestParams);
      if (resourceActionLogs) {
        for (const logMessage of resourceActionLogs.logs) {
          const errorMessage = logMessage.messages.find((message) => message.level === "ERROR");
          if (errorMessage) {
            return { errorMessage: errorMessage.msg, trace: errorMessage.kwargs.traceback };
          }
        }
      }
    }
  }
  return;
}

const InstanceStatus: React.FunctionComponent<{ instance: IServiceInstanceModel, inventoryUrl: string, environmentId?: string, keycloak?: Keycloak.KeycloakInstance, errorCheckingFunction, errorType: string }> = props => {
  const [errorMessageDetails, setErrorMessageDetails] = useState('');
  const [noProblemsFound, setNoProblemsFound] = useState(false);
  const [stackTrace, setStackTrace] = useState('');
  const [fetchErrorMessage, setFetchErrorMessage] = useState('');

  if (!fetchErrorMessage) {
    props.errorCheckingFunction(props.instance, props.inventoryUrl, props.environmentId, setFetchErrorMessage, props.keycloak).then((errorDetails) => {
      if (errorDetails) {
        setErrorMessageDetails(errorDetails.errorMessage);
        setStackTrace(errorDetails.trace);
        setNoProblemsFound(false);
      } else if (!fetchErrorMessage) {
        setNoProblemsFound(true);
      }
    });
  }
  if (!errorMessageDetails && !noProblemsFound && !fetchErrorMessage) {
    return <Spinner size="md" />;
  }
  let formattedErrorMessageDetails = '';
  if (errorMessageDetails && isValidJson(errorMessageDetails)) {
    const parsedErrorMessageDetails = JSON.parse(errorMessageDetails);
    if (parsedErrorMessageDetails.errors) {
      formattedErrorMessageDetails = parsedErrorMessageDetails.errors
        .map((errorEntry) => {
          return <div key={`${props.errorType}-details`}> <Text component={TextVariants.h4}>The following error occured:</Text> {Object.keys(errorEntry)
            .map((key, idx) => {
              return <TextContent key={idx}>
                <Text component={TextVariants.h6}> {key} </Text> {typeof errorEntry[key] === "object" ? JSON.stringify(errorEntry[key]) : errorEntry[key]}
              </TextContent>
            })}
          </div>
        });
    }
  } else {
    formattedErrorMessageDetails = errorMessageDetails;
  }


  return <div id={props.errorType + "-div"}>
    <Fragment>
      <Text component={TextVariants.h2}>{props.errorType.split("-").join(" ")}</Text>
      {fetchErrorMessage && <Alert id={`${props.errorType}-fetch-error`} variant='danger' title={fetchErrorMessage} />}
      {!!errorMessageDetails && <div id={`${props.errorType}-error-message-details`} >{formattedErrorMessageDetails}</div>}
      {(noProblemsFound && !fetchErrorMessage) && <Text id={`${props.errorType}-ok-message`} component={TextVariants.p}>No Problems found <CheckIcon color="green" /> </Text>}
    </Fragment>
    {!!stackTrace &&
      <Expandable toggleText={"Show Stacktrace"}>
        <TextContent id={`${props.errorType}-stacktrace`}>
          <Text component={TextVariants.blockquote}>
            {stackTrace.split('\n').map((line, idx) => <Fragment key={`line-${idx}`}>{line}<br /></Fragment>)}
          </Text>
        </TextContent>
      </Expandable>
    }
  </div>;
}

function isValidJson(value: string) {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return true;
}

export { DiagnosticsModal };