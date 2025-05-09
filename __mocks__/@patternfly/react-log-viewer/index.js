/* eslint-disable */

const React = require("react");

module.exports = {
  LogViewer: ({ data, toolbar, onScroll, hasLineNumbers = false, scrollToRow }) => {
    const handleScroll = (event) => {
      // Use the custom event detail if available, otherwise use default value
      const scrollOffsetToBottom = event?.detail?.scrollOffsetToBottom ?? 100;
      onScroll?.({ scrollOffsetToBottom });
    };

    return React.createElement(
      "div",
      {
        role: "log",
        "data-testid": "log-viewer",
        onScroll: handleScroll,
      },
      toolbar,
      React.createElement("pre", null, data)
    );
  },
  LogViewerSearch: ({ placeholder }) =>
    React.createElement("input", {
      type: "text",
      placeholder: placeholder,
    }),
};

/* eslint-enable */
