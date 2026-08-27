export interface CompileError {
  type: string;
  message: string;
  category?: string;
  location?: CompileErrorLocation;
}

export interface CompileErrorLocation {
  uri: string;
  range?: CompileErrorRange;
}

export interface CompileErrorRange {
  start: CompileErrorPosition;
  end: CompileErrorPosition;
}

export interface CompileErrorPosition {
  line: number;
  character: number;
}
