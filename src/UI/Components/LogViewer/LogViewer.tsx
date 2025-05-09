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

export interface LogViewerData {
    data: string[];
    id: string;
    name: string;
    duration: number;
    failed: boolean;
}

interface LogViewerProps {
    logs: LogViewerData[];
}

/**
 * LogViewer component displays logs with a dropdown to select log parts and a download button.
 * Uses PatternFly's LogViewer for rendering logs.
 * @param logs Array of log objects, each with data, id, name, duration, and failed status.
 */
export const LogViewerComponent: React.FC<LogViewerProps> = ({ logs }) => {
    const [selectedLogId, setSelectedLogId] = useState(logs[0]?.id || "");
    const [selectOpen, setSelectOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const logViewerRef = useRef<HTMLDivElement>(null);
    const isManualResume = useRef(false);

    // Find the selected log
    const selectedLog = logs.find((log) => log.id === selectedLogId) || logs[0];
    const logText = selectedLog?.data?.join("\n") || "";

    // Download handler
    const handleDownload = () => {
        const blob = new Blob([logText], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedLog?.name || "log"}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Select dropdown toggle
    const toggle = (toggleRef) => (
        <MenuToggle
            ref={toggleRef}
            onClick={() => setSelectOpen((open) => !open)}
            isExpanded={selectOpen}
        >
            {selectedLog?.name || "Select log"}
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

    const ControlButton = () => (
        <Button
            variant="link"
            onClick={handlePauseResume}
            icon={isPaused ? <PlayIcon /> : <PauseIcon />}
        >
            {isPaused ? " Resume Autoscroll" : " Pause Autoscroll"}
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
                                <LogViewerSearch placeholder="Search" minSearchChars={0} />
                            </ToolbarItem>
                            <ToolbarItem>
                                <Label>Duration: {selectedLog?.duration} ms</Label>
                            </ToolbarItem>
                        </ToolbarGroup>
                        <ToolbarGroup align={{ default: 'alignEnd' }}>
                            <ToolbarItem>
                                <ControlButton />
                            </ToolbarItem>
                            <ToolbarItem>
                                <Tooltip content={<div>Download</div>} position="top">
                                    <Button
                                        onClick={handleDownload}
                                        variant="plain"
                                        aria-label="Download current logs"
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
