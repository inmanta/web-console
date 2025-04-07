import { LogLevelString } from "@/Core";
import { ResourceLog } from "@S/ResourceDetails/Core/ResourceLog";

const a: ResourceLog = {
  level: LogLevelString.ERROR,
  msg: "Failed to load handler code or install handler code dependencies. Check the agent log for details.",
  args: [],
  kwargs: {},
  timestamp: "2021-09-29T09:09:52.915172",
  action_id: "6eaedb6e-1a5a-4716-824e-ce3195ddaf81",
  action: "getfact",
};

const b: ResourceLog = {
  level: LogLevelString.DEBUG,
  msg: "Start run for resource aws_dc::HostedConnection[aws,hcid=dxcon-fgpup6qd_4088],v=494 because Periodic deploy started at 2021-09-29 09:08:54+0000",
  args: [],
  kwargs: {
    agent: "aws",
    reason: "Periodic deploy started at 2021-09-29 09:08:54+0000",
    resource: "aws_dc::HostedConnection[aws,hcid=dxcon-fgpup6qd_4088],v=494",
    deploy_id: "e1c60a06-60fd-459f-aa0b-583b52a05a07",
  },
  timestamp: "2021-09-29T09:08:55.507303",
  action_id: "d6f7cc57-66a9-4951-9e94-9afba6bf1a1e",
  action: "deploy",
};

const c: ResourceLog = {
  level: LogLevelString.WARNING,
  msg: "End run for resource aws_dc::HostedConnection[aws,hcid=dxcon-fgpup6qd_4088],v=494 in deploy e1c60a06-60fd-459f-aa0b-583b52a05a07",
  args: [],
  kwargs: {
    resource: "aws_dc::HostedConnection[aws,hcid=dxcon-fgpup6qd_4088],v=494",
    deploy_id: "e1c60a06-60fd-459f-aa0b-583b52a05a07",
  },
  timestamp: "2021-09-29T09:08:55.507550",
  action_id: "d6f7cc57-66a9-4951-9e94-9afba6bf1a1e",
  action: "deploy",
};

export const response = {
  data: [a, b, c],
  links: {
    next: "/api/v2/resource/aws_dc%3A%3AHostedConnection%5Baws%2Chcid%3Ddxcon-fgpup6qd_4088%5D/logs?limit=1&sort=timestamp.DESC&filter.message=failed&end=2021-09-29+09%3A09%3A52.915172%2B00%3A00",
    last: "/api/v2/resource/aws_dc%3A%3AHostedConnection%5Baws%2Chcid%3Ddxcon-fgpup6qd_4088%5D/logs?limit=1&sort=timestamp.DESC&filter.message=failed&start=0001-01-01+00%3A00%3A00%2B00%3A00",
    self: "/api/v2/resource/aws_dc%3A%3AHostedConnection%5Baws%2Chcid%3Ddxcon-fgpup6qd_4088%5D/logs?limit=1&sort=timestamp.DESC&filter.message=failed",
  },
  metadata: {
    total: 3,
    before: 0,
    after: 0,
    page_size: 20,
  },
};
