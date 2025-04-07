import React, { useContext, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionToggle,
  Button,
} from "@patternfly/react-core";
import { InstanceAttributeModel, ServiceInstanceModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import { MarkdownCard } from "@/Slices/ServiceInventory/UI/Tabs/MarkdownCard";
import { words } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DynamicFAIcon } from "@/UI/Components/FaIcon";
import { useNavigateTo } from "@/UI/Routing";
import { InstanceDetailsContext } from "../../Core/Context";
import { TabContentWrapper } from ".";

// Interface representing the needed properties to display the documentation sections.
export interface DocAttributeDescriptors {
  title: string;
  iconName: string;
  attributeName: string;
}

// Interface representing the attributes needed for the markdownCards
interface MarkdownAttributes {
  title: string;
  value: unknown;
  iconName: string;
}

interface Props {
  docAttributeDescriptors: DocAttributeDescriptors[];
  selectedVersion: string;
}

/**
 * The DocumentationTabContent Component
 *
 * @props {Props} - The component props
 *  @prop {DocAttributeDescriptors} docAttributeDescriptors -  array of Objects containing the needed info for each sections
 *  @prop {string} selectedVersion - The active version of the details page, which is found in the url of the page.
 *
 * @returns {React.FC} A React Component that displays the markdown documentations in collapsibles.
 */
export const DocumentationTabContent: React.FC<Props> = ({
  docAttributeDescriptors,
  selectedVersion,
}) => {
  const { logsQuery, instance } = useContext(InstanceDetailsContext);
  const [expanded, setExpanded] = useState(0);
  const navigateTo = useNavigateTo();

  const isLatest = selectedVersion === String(instance.version);
  let selectedSet: InstanceAttributeModel | void;

  if (!isLatest) {
    if (logsQuery.isLoading) {
      return (
        <TabContentWrapper id="documentation">
          <LoadingView />
        </TabContentWrapper>
      );
    }

    if (!logsQuery.data) {
      return (
        <TabContentWrapper id="documentation">
          <ErrorView
            message={words("instanceDetails.tabs.documentation.noData")}
          />
        </TabContentWrapper>
      );
    }

    selectedSet = getSelectedAttributeSet(logsQuery.data, selectedVersion);
  } else {
    selectedSet = getSelectedAttributeSetFromInstance(instance);
  }

  const sections = selectedSet
    ? getDocumentationSections(docAttributeDescriptors, selectedSet)
    : [];

  const onToggle = (index: number) => {
    if (index === expanded) {
      setExpanded(-1);
    } else {
      setExpanded(index);
    }
  };

  const MarkdownPreviewerButton = () => {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <Button
          variant="secondary"
          onClick={() => {
            navigateTo("MarkdownPreviewer", {
              service: instance.service_entity,
              instance: instance.service_identity_attribute_value || instance.id,
              instanceId: instance.id,
            });
          }}
        >
          Open in Previewer
        </Button>
      </div>
    );
  };

  if (sections.length === 1) {
    return (
      <TabContentWrapper id="documentation">
        <MarkdownPreviewerButton />
        <MarkdownCard
          attributeValue={sections[0].value}
          web_title={sections[0].title}
        />
      </TabContentWrapper>
    );
  }

  return (
    <TabContentWrapper id="documentation">
      <Accordion asDefinitionList togglePosition="start">
        {sections.map((section, index) => (
          <AccordionItem isExpanded={expanded === index} key={section.title}>
            <AccordionToggle
              onClick={() => {
                onToggle(index);
              }}
              id={`${section.title}-accordion-toggle`}
            >
              <DynamicFAIcon icon={section.iconName} /> {section.title}
            </AccordionToggle>
            <AccordionContent id={`${section.title}-accordion-toggle`}>
              <MarkdownCard
                attributeValue={section.value}
                web_title={section.title}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
        {sections.length === 0 && (
          <ErrorView
            message={words("instanceDetails.tabs.documentation.noData")}
          />
        )}
      </Accordion>
    </TabContentWrapper>
  );
};

/**
 * Method mapping the needed properties from the attributeSet and docAttributesDescriptors.
 *
 * It could happen that for an older version, the attribute doesn't exist yet, but is present in the ServiceModel.
 * ServiceModels are versioned too, but this is not something we can/are handling at the moment.
 * We only rely on the InstanceVersion for now.
 *
 * @param docAttributeDescriptors
 * @param attributeSet
 * @returns MarkdownAttributes[] - An array of MarkdownAttributes required for the MarkdownCards
 */
const getDocumentationSections = (
  docAttributeDescriptors: DocAttributeDescriptors[],
  attributeSet: InstanceAttributeModel,
): MarkdownAttributes[] => {
  return docAttributeDescriptors.map(({ title, iconName, attributeName }) => {
    return {
      title: title,
      iconName: iconName,
      value:
        attributeSet[attributeName] ||
        words("instanceDetails.documentation.noAttributeForVersion")(
          attributeName,
        ),
    };
  });
};

/**
 * Retrieves the first attribute set that contains data
 * for a specific version in the log history.
 * Prioritizing the candidate-attributes. This is only the case for the documentation tab.
 *
 * @param {InstanceLog[]} logs - The logs that contain the attributeSet history.
 * @param {string} version - The version for which you need the attributeSet
 * @returns {InstanceAttributeModel | void}
 */
const getSelectedAttributeSet = (
  logs: InstanceLog[],
  version: string,
): InstanceAttributeModel | void => {
  const selectedLog: InstanceLog | undefined = logs.find(
    (log: InstanceLog) => String(log.version) === version,
  );

  if (!selectedLog) return; // Return void if no matching log is found

  if (selectedLog.candidate_attributes) {
    return selectedLog.candidate_attributes;
  }

  if (selectedLog.active_attributes) {
    return selectedLog.active_attributes;
  }

  if (selectedLog.rollback_attributes) {
    return selectedLog.rollback_attributes;
  }

  return;
};

/**
 * Retrieves the first attribute set that contains data
 * Prioritizing the candidate-attributes. This is only the case for the documentation tab.
 *
 * @param {ServiceInstanceModel} instance - the instance that contains the attributeSets.
 * @returns {InstanceAttributeModel | void}
 */
const getSelectedAttributeSetFromInstance = (
  instance: ServiceInstanceModel,
): InstanceAttributeModel | void => {
  if (instance.candidate_attributes) {
    return instance.candidate_attributes;
  }

  if (instance.active_attributes) {
    return instance.active_attributes;
  }

  if (instance.rollback_attributes) {
    return instance.rollback_attributes;
  }

  return;
};
