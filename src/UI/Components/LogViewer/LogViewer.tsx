import React, { useState, useRef } from "react";
import {
  Button,
  Icon,
  Label,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { DownloadIcon, ExclamationCircleIcon, PauseIcon, PlayIcon } from "@patternfly/react-icons";
import { LogViewerSearch, LogViewer as PFLogViewer } from "@patternfly/react-log-viewer";
import { words } from "@/UI/words";

export interface LogViewerData {
  data: string[];
  id: string;
  name: string;
  duration: string;
  failed: boolean;
}

interface LogViewerProps {
  logs: LogViewerData[];
  defaultSelected?: string;
}

/**
 * LogViewer component displays logs with a dropdown to select log parts and a download button.
 * Uses PatternFly's LogViewer for rendering logs.
 *
 * @prop {LogViewerData[]} logs - Array of log objects, each with data, id, name, duration, and failed status.
 * @prop {string} defaultSelected - The id of the log to select by default.
 *
 * @note If the defaultSelected log is not found in the logs array, the last log will be selected.
 *
 * @returns {React.FC<LogViewerProps>} LogViewer component
 */
export const LogViewerComponent: React.FC<LogViewerProps> = ({ logs, defaultSelected }) => {
  const [selectedLogId, setSelectedLogId] = useState(
    defaultSelected || logs[logs.length - 1]?.id || ""
  );
  const [selectOpen, setSelectOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const logViewerRef = useRef<HTMLDivElement>(null);
  const isManualResume = useRef(false);

  // Find the selected log
  const selectedLog = logs.find((log) => log.id === selectedLogId) || logs[0];
  const logText = selectedLog?.data?.join("\n") || "";

  /**
   * Handles downloading the current log content as a text file.
   * Creates a blob from the log text and triggers a download with the log name.
   */
  const handleDownload = () => {
    const blob = new Blob([logText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedLog?.name || "log"}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /**
   * Renders the toggle button for the log selection dropdown.
   * @param toggleRef - Reference to the toggle button element
   * @returns MenuToggle component with current log name
   */
  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setSelectOpen((open) => !open)}
      isExpanded={selectOpen}
    >
      {selectedLog?.failed && (
        <Icon status="danger">
          <ExclamationCircleIcon />
        </Icon>
      )}
      {selectedLog?.name || words("logViewer.selectLog")}
    </MenuToggle>
  );

  // Select dropdown options
  const selectOptions = logs.map((log) => (
    <SelectOption key={log.id} value={log.id} isSelected={selectedLogId === log.id}>
      <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsSm" }}>
        {log.failed && (
          <FlexItem>
            <Icon status="danger">
              <ExclamationCircleIcon />
            </Icon>
          </FlexItem>
        )}
        <FlexItem>{log.name}</FlexItem>
      </Flex>
    </SelectOption>
  ));

  /**
   * Handles toggling between paused and resumed states for auto-scrolling.
   * Sets a flag to prevent scroll events from re-pausing immediately after manual resume.
   */
  const handlePauseResume = () => {
    if (isPaused) {
      // Set the flag to prevent scroll event from re-pausing
      isManualResume.current = true;
      // Clear the flag after a short delay
      setTimeout(() => {
        isManualResume.current = false;
      }, 100);
    }
    setIsPaused(!isPaused);
  };

  /**
   * Renders the pause/resume control button component.
   * Shows either pause or resume icon and text based on current state.
   * @returns Button component for controlling auto-scroll
   */
  const ControlButton = () => (
    <Button
      variant="link"
      onClick={handlePauseResume}
      icon={isPaused ? <PlayIcon /> : <PauseIcon />}
    >
      {isPaused ? words("logViewer.autoscroll.resume") : words("logViewer.autoscroll.pause")}
    </Button>
  );

  return (
    <PFLogViewer
      data={logText}
      hasLineNumbers
      innerRef={logViewerRef}
      height={500}
      isTextWrapped
      scrollToRow={isPaused ? undefined : logText.split("\n").length}
      onScroll={({ scrollOffsetToBottom }) => {
        // Don't pause if this is a manual resume action,
        // this is to prevent the double update of the pause flag
        if (!isManualResume.current && scrollOffsetToBottom > 1 && !isPaused) {
          setIsPaused(true);
        }
        // Resume auto-scroll if manually scrolled to bottom
        else if (scrollOffsetToBottom <= 1 && isPaused) {
          setIsPaused(false);
        }
      }}
      toolbar={
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup>
              <ToolbarItem>
                <Select
                  toggle={toggle}
                  onOpenChange={setSelectOpen}
                  onSelect={(_event, selection) => {
                    setSelectedLogId(selection as string);
                    setSelectOpen(false);
                  }}
                  selected={selectedLogId}
                  isOpen={selectOpen}
                >
                  <SelectList>{selectOptions}</SelectList>
                </Select>
              </ToolbarItem>
              <ToolbarItem>
                <LogViewerSearch placeholder={words("logViewer.search")} minSearchChars={0} />
              </ToolbarItem>
              <ToolbarItem>
                <Label>{words("logViewer.duration")(selectedLog?.duration)}</Label>
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarGroup align={{ default: "alignEnd" }}>
              <ToolbarItem>
                <ControlButton />
              </ToolbarItem>
              <ToolbarItem>
                <Tooltip content={<div>{words("logViewer.download")}</div>} position="top">
                  <Button
                    onClick={handleDownload}
                    variant="plain"
                    aria-label={words("logViewer.download.aria")}
                  >
                    <DownloadIcon />
                  </Button>
                </Tooltip>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      }
    />
  );
};
