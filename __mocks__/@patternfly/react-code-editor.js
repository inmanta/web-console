/* eslint-disable */
const React = require("react");

// Mock for @patternfly/react-code-editor
module.exports = {
  CodeEditor: ({
    code,
    onChange,
    language,
    height,
    isReadOnly,
    isDownloadEnabled,
    isCopyEnabled,
    isLanguageLabelVisible,
    customControls,
    isDarkTheme,
    ...props
  }) => {
    return (
      <div data-testid="code-editor" style={{ height }}>
        <pre data-testid="code-editor-content" {...props}>
          {code}
        </pre>
        {customControls && <div data-testid="code-editor-custom-controls">{customControls}</div>}
        {onChange && (
          <textarea
            data-testid="code-editor-textarea"
            value={code}
            onChange={(event) => onChange(event.target.value)}
            style={{ display: "none" }}
          />
        )}
      </div>
    );
  },
  CodeEditorControl: ({ onClick, icon, "aria-label": ariaLabel, tooltipProps, ...props }) => (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      data-tooltip={tooltipProps?.content}
      {...props}
    >
      {icon}
    </button>
  ),
  Language: {
    markdown: "markdown",
    json: "json",
    xml: "xml",
    python: "python",
    yaml: "yaml",
    javascript: "javascript",
    typescript: "typescript",
  },
};

/* eslint-enable */
