const mockMermaid = {
  initialize: vi.fn(),
  render: vi.fn().mockImplementation((_id: string, _text: string) => {
    return Promise.resolve({
      svg: "<svg>Mock Mermaid Diagram</svg>",
      bindFunctions: vi.fn(),
    });
  }),
};

export default mockMermaid;
