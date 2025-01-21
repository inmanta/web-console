import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Button,
    Tooltip,
    Toolbar,
    ToolbarContent,
    ToolbarGroup,
    ToolbarItem,
    ToolbarToggleGroup,    
} from '@patternfly/react-core';
import { ArrowDownIcon, DownloadIcon, EllipsisVIcon } from '@patternfly/react-icons';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

interface LogViewerProps {
    data: string;
}

/**
 * Splits a string into an array by splitting it every time there's a newline (\n).
 *
 * @param {string} input - The input string to be split.
 * @returns {string[]} - The resulting array of strings.
 */
const splitStringByNewline = (input: string): string[] => {
    return input.split('\n');
  };

export const LogViewerComponent: React.FC<LogViewerProps> = ({ data }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [currentItemCount, setCurrentItemCount] = useState(0);
    const [renderData, setRenderData] = useState('');
    const [buffer, setBuffer] = useState<string[]>([]);
    const [linesBehind, setLinesBehind] = useState(0);
    const logViewerRef = useRef<any>();

    useEffect(() => {
        setBuffer(splitStringByNewline(data));
    }, [data]);

    useEffect(() => {
        if (!isPaused && buffer.length > 0) {
            setCurrentItemCount(buffer.length);
            setRenderData(buffer.join('\n'));
            if (logViewerRef && logViewerRef.current) {
                logViewerRef.current.scrollToBottom();
            }
        } else if (buffer.length !== currentItemCount) {
            setLinesBehind(buffer.length - currentItemCount);
        } else {
            setLinesBehind(0);
        }
    }, [isPaused, buffer]);

    const onDownloadClick = useCallback(() => {
        const element = document.createElement('a');
        const dataToDownload = splitStringByNewline(data);
        const file = new Blob(dataToDownload, { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `logs.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }, [data]);

    const onScroll = useCallback(({
        scrollDirection,
        scrollOffset,
        scrollOffsetToBottom,
        scrollUpdateWasRequested,
    }: {
        scrollDirection: "forward" | "backward";
        scrollOffset: number;
        scrollOffsetToBottom: number;
        scrollUpdateWasRequested: boolean;
    }) => {
        if (!scrollUpdateWasRequested) {
            if (scrollOffsetToBottom > 0) {
                setIsPaused(true);
            } else {
                setIsPaused(false);
            }
        }
    }, []);

    const ControlButton = () => (
        <Button
            variant="link"
            onClick={() => {
                setIsPaused(!isPaused);
            }}
            icon={<ArrowDownIcon/>}
        >
            Scroll to bottom
        </Button>
    );

    const leftAlignedToolbarGroup = (
        <React.Fragment>
            <ToolbarToggleGroup toggleIcon={<EllipsisVIcon />} breakpoint="md">
                <ToolbarItem>
                    <LogViewerSearch onFocus={(_e) => setIsPaused(true)} minSearchChars={3} placeholder="Search" />
                </ToolbarItem>
            </ToolbarToggleGroup>
            <ToolbarItem>
                <ControlButton />
            </ToolbarItem>
        </React.Fragment>
    );

    const rightAlignedToolbarGroup = (
        <React.Fragment>
            <ToolbarGroup variant="action-group">
                <ToolbarItem>
                    <Tooltip position="top" content={<div>Download</div>}>
                        <Button onClick={onDownloadClick} variant="plain" aria-label="Download current logs">
                            <DownloadIcon />
                        </Button>
                    </Tooltip>
                </ToolbarItem>
            </ToolbarGroup>
        </React.Fragment>
    );

    return (
        <LogViewer
            data={renderData}
            scrollToRow={currentItemCount}
            hasLineNumbers={false}
            ref={logViewerRef}
            height={600}
            useAnsiClasses
            toolbar={
                <Toolbar>
                    <ToolbarContent>
                        <ToolbarGroup align={{ default: 'alignStart' }}>{leftAlignedToolbarGroup}</ToolbarGroup>
                        <ToolbarGroup align={{ default: 'alignEnd' }}>{rightAlignedToolbarGroup}</ToolbarGroup>
                    </ToolbarContent>
                </Toolbar>
            }
            onScroll={onScroll}
        />
    );
};