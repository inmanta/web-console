import React, { useEffect, useMemo, useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import {
  Content,
  Divider,
  Flex,
  FlexItem,
  FormSelect,
  FormSelectOption,
  SelectOptionProps,
} from "@patternfly/react-core";
import { InstanceAttributeModel } from "@/Core";
import { InstanceLog } from "@/Core/Domain/HistoryLog";
import {
  AttributeSets,
  getAvailableAttributesSets,
  getAvailableVersions,
} from "@/Slices/ServiceInstanceDetails/Utils";
import { words } from "@/UI";
import { SearchSelect } from "@/UI/Components";
import { useTheme } from "@/UI/Components/DarkmodeOption";
import { MomentDatePresenter } from "@/UI/Utils";

interface Props {
  instanceLogs: InstanceLog[];
  selectedVersion: string;
}

const datePresenter = new MomentDatePresenter();

/**
 * The AttributesCompare Component.
 *
 * This component allows the user to compare two different attributeSets from different versions.
 * It uses the DiffEditor from the React Monaco Editor.
 *
 * @Props {Props} - The props of the component
 *  @prop {InstanceLog[]} instanceLogs - The instanceLogs containing the versions with the attributesSets
 *  @prop {string} selectedVersion - the selected version of the InstanceDetails Page.
 * @returns {React.FC<Props>} A React Component displaying the AttributeSets in a DiffEditor
 *
 * @note See https://github.com/microsoft/vscode/pull/230713
 * The DiffEditor doesn't make correct use of the cleanup lyfecycles. It doesn't dispose of the model as it should, creating a memory leak.
 * There's a PR in progress on the Monaco library side.
 */
export const AttributesCompare: React.FC<Props> = ({ instanceLogs, selectedVersion }) => {
  const [leftVersion, setLeftVersion] = useState<string>(selectedVersion);
  const [rightVersion, setRightVersion] = useState<string>(selectedVersion);
  const [leftAttributesSets, setLeftAttributesSets] = useState<
    Partial<Record<AttributeSets, InstanceAttributeModel>>
  >({});
  const [rightAttributesSets, setRightAttributesSets] = useState<
    Partial<Record<AttributeSets, InstanceAttributeModel>>
  >({});
  const [leftSelectedSet, setLeftSelectedSet] = useState<AttributeSets>("active_attributes");
  const [rightSelectedSet, setRightSelectedSet] = useState<AttributeSets>("candidate_attributes");

  const { theme: preferredTheme } = useTheme();

  const availableVersions: SelectOptionProps[] = useMemo(
    () =>
      getAvailableVersions(instanceLogs).map(({ version, timestamp }) => ({
        value: version,
        children: (
          <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
            {version}
            <Content style={{ color: "var(--pf-t--global--text--color--subtle)" }}>
              ({datePresenter.getFull(timestamp)})
            </Content>
          </Flex>
        ),
      })),
    [instanceLogs]
  );

  useEffect(() => {
    if (rightVersion) {
      const availableSets = getAvailableAttributesSets(instanceLogs, rightVersion);

      setRightAttributesSets(availableSets);

      // When the version changes, it can happen that the selectedSet isn't available in the dropdown.
      // In that case, we want to fall back to the first option available.
      const setKeys = Object.keys(availableSets) as AttributeSets[];

      if (!setKeys.includes(rightSelectedSet)) {
        setRightSelectedSet(setKeys[0]);
      }
    }
  }, [rightVersion, instanceLogs, rightSelectedSet]);

  useEffect(() => {
    if (leftVersion) {
      const availableSets = getAvailableAttributesSets(instanceLogs, leftVersion);

      setLeftAttributesSets(availableSets);

      // When the version changes, it can happen that the selectedSet isn't available in the dropdown.
      // In that case, we want to fall back to the first option available.
      const setKeys = Object.keys(availableSets) as AttributeSets[];

      if (!setKeys.includes(leftSelectedSet)) {
        setLeftSelectedSet(setKeys[0]);
      }
    }
  }, [leftVersion, instanceLogs, leftSelectedSet]);

  return (
    <>
      <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
        <FlexItem flex={{ default: "flex_1" }}>
          <Flex flexWrap={{ default: "nowrap" }}>
            <FlexItem flex={{ default: "flex_1" }}>
              <SearchSelect
                value={leftVersion}
                onChange={setLeftVersion}
                options={availableVersions}
              />
            </FlexItem>
            <FlexItem flex={{ default: "flex_1" }}>
              <FormSelect
                value={leftSelectedSet}
                aria-label="left-side-attribute-set-select"
                ouiaId="left-side-attribute-set-select"
                onChange={(_event: React.FormEvent<HTMLSelectElement>, value: string) => {
                  setLeftSelectedSet(value as AttributeSets);
                }}
              >
                {Object.keys(leftAttributesSets).map((option, index) => (
                  <FormSelectOption
                    value={option}
                    key={index}
                    label={words(option as AttributeSets)}
                  />
                ))}
              </FormSelect>
            </FlexItem>
          </Flex>
        </FlexItem>

        <Divider
          orientation={{
            default: "vertical",
          }}
        />

        <FlexItem flex={{ default: "flex_1" }}>
          <Flex flexWrap={{ default: "nowrap" }}>
            <FlexItem flex={{ default: "flex_1" }}>
              <SearchSelect
                value={rightVersion}
                onChange={setRightVersion}
                options={availableVersions}
              />
            </FlexItem>
            <FlexItem flex={{ default: "flex_1" }}>
              <FormSelect
                value={rightSelectedSet}
                aria-label="right-side-attribute-set-select"
                ouiaId="right-side-attribute-set-select"
                onChange={(_event: React.FormEvent<HTMLSelectElement>, value: string) => {
                  setRightSelectedSet(value as AttributeSets);
                }}
              >
                {Object.keys(rightAttributesSets).map((option, index) => (
                  <FormSelectOption
                    value={option}
                    key={index}
                    label={words(option as AttributeSets)}
                  />
                ))}
              </FormSelect>
            </FlexItem>
          </Flex>
        </FlexItem>
      </Flex>
      <DiffEditor
        height={"calc(100vh - 525px)"}
        options={{
          readOnly: true,
          renderSideBySide: true,
        }}
        theme={`vs-${preferredTheme}`}
        language="json"
        original={JSON.stringify(leftAttributesSets[leftSelectedSet], null, 2)}
        modified={JSON.stringify(rightAttributesSets[rightSelectedSet], null, 2)}
      />
    </>
  );
};
