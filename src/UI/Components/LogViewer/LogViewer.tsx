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
import { DownloadIcon, EllipsisVIcon, ExpandIcon, OutlinedPlayCircleIcon, PauseIcon, PlayIcon } from '@patternfly/react-icons';
import { LogViewer, LogViewerSearch } from '@patternfly/react-log-viewer';

interface LogViewerProps {
    data: string[];
}

export const LogViewerComponent: React.FC<LogViewerProps> = ({ data }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [itemCount, setItemCount] = useState(1);
    const [currentItemCount, setCurrentItemCount] = useState(0);
    const [renderData, setRenderData] = useState('');
    const [buffer, setBuffer] = useState<string[]>([]);
    const [linesBehind, setLinesBehind] = useState(0);
    const [timer, setTimer] = useState<number | null>(null);
    const logViewerRef = useRef<any>();

    useEffect(() => {
        setTimer(
            window.setInterval(() => {
                setItemCount((itemCount) => itemCount + 1);
            }, 500)
        );
        return () => {
            if (timer) {
                window.clearInterval(timer);
            }
        };
    }, []);

    useEffect(() => {
        if (itemCount > data.length) {
            if (timer) {
                window.clearInterval(timer);
            }
        } else {
            setBuffer(data.slice(0, itemCount));
        }
    }, [itemCount]);

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

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen =
                document.fullscreenElement

            setIsFullScreen(!!isFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const onExpandClick = useCallback(() => {
        const element = document.querySelector('#complex-toolbar-demo');

        if (!isFullScreen) {
            if (element?.requestFullscreen) {
                element.requestFullscreen();
            }
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullScreen(false);
        }
    }, [isFullScreen]);

    const onDownloadClick = useCallback(() => {
        const element = document.createElement('a');
        const dataToDownload = data;
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
            icon={isPaused ? <PlayIcon /> : <PauseIcon />}
        >
            {isPaused ? ` Resume Log` : ` Pause Log`}
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
                <ToolbarItem>
                    <Tooltip position="top" content={<div>Expand</div>}>
                        <Button onClick={onExpandClick} variant="plain" aria-label="View log viewer in full screen">
                            <ExpandIcon />
                        </Button>
                    </Tooltip>
                </ToolbarItem>
            </ToolbarGroup>
        </React.Fragment>
    );

    const FooterButton = () => {
        const handleClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
            setIsPaused(false);
        };
        return (
            <Button onClick={handleClick} isBlock>
                <OutlinedPlayCircleIcon />
                resume {linesBehind === 0 ? null : `and show ${linesBehind} lines`}
            </Button>
        );
    };

    return (
        <LogViewer
            data={renderData}
            scrollToRow={currentItemCount}
            innerRef={logViewerRef}
            height={isFullScreen ? '100%' : 600}
            toolbar={
                <Toolbar>
                    <ToolbarContent>
                        <ToolbarGroup align={{ default: 'alignStart' }}>{leftAlignedToolbarGroup}</ToolbarGroup>
                        <ToolbarGroup align={{ default: 'alignEnd' }}>{rightAlignedToolbarGroup}</ToolbarGroup>
                    </ToolbarContent>
                </Toolbar>
            }
            overScanCount={10}
            footer={isPaused && <FooterButton />}
            onScroll={onScroll}
        />
    );
};