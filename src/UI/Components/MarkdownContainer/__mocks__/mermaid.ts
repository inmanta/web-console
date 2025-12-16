/* eslint-disable @typescript-eslint/no-explicit-any */
const mockMermaid = {
  initialize: jest.fn(),
  // In the current implementation we use mermaid.run() (or init as fallback)
  // to process <pre class="mermaid"> blocks. For tests, we don't need actual
  // SVG rendering, just a successful call.
  run: jest.fn().mockImplementation((_config: any) => {
    // no-op
  }),
  init: jest.fn().mockImplementation((_config: any, _nodes: any) => {
    // no-op fallback
  }),
};

export default mockMermaid;
