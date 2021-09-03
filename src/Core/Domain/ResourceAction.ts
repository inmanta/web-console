export interface ResourceAction {
  environment: string;
  version: number;
  resource_version_ids: string[];
  action_id: string;
  action: string;
  started: string; // timestamp
  finished: string; // timestamp
  messages: Message[];
  status: string;
  changes: null;
  change: string | null;
  send_event: boolean;
}

interface Message {
  msg: string;
  args: [];
  level: string;
  kwargs: Record<string, string>;
  timestamp: string; // timestamp
}
