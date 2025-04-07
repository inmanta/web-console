const mockMermaid = {
  initialize: jest.fn(),
  render: jest.fn().mockImplementation((_id: string, _text: string) => {
    return Promise.resolve({
      svg: '<svg>Mock Mermaid Diagram</svg>',
      bindFunctions: jest.fn(),
    });
  }),
};

export default mockMermaid;
