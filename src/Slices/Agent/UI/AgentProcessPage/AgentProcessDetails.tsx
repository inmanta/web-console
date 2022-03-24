import React from "react";
import { JsonFormatter, XmlFormatter } from "@/Data";
import { MomentDatePresenter, words } from "@/UI";
import {
  AttributeClassifier,
  AttributeList,
  PagePadder,
  PageTitle,
} from "@/UI/Components";
import { AgentProcess } from "@S/Agent/Core/Model";

interface Props {
  agentProcess: AgentProcess;
}

export const AgentProcessDetails: React.FC<Props> = ({
  agentProcess,
  ...props
}) => {
  const classifier = new AttributeClassifier(
    new JsonFormatter(),
    new XmlFormatter()
  );

  const classifiedReport = classifier.classify(
    agentProcess.state ? agentProcess.state : {}
  );
  // Add the dates to the top
  classifiedReport.unshift(
    {
      kind: "SingleLine",
      key: words("agentProcess.firstSeen"),
      value: getFormattedDate(agentProcess.first_seen),
    },
    {
      kind: "SingleLine",
      key: words("agentProcess.lastSeen"),
      value: getFormattedDate(agentProcess.last_seen),
    },
    {
      kind: "SingleLine",
      key: words("agentProcess.expired"),
      value: getFormattedDate(agentProcess.expired),
    }
  );

  return (
    <PagePadder {...props}>
      <PageTitle>{`${words("agentProcess.title")} ${
        agentProcess.hostname
      }`}</PageTitle>
      <AttributeList attributes={classifiedReport} />
    </PagePadder>
  );
};

function getFormattedDate(date?: string): string {
  const datePresenter = new MomentDatePresenter();
  return date ? datePresenter.getFull(date) : "";
}
