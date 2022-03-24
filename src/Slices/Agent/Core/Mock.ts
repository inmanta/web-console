import { AgentProcess } from "./Model";

export const data: AgentProcess = {
  sid: "b2c8937e-5359-11ec-9c3f-98e743b19755",
  hostname: "hostname1",
  environment: "13963724-e4e8-4818-b019-d130daabfdd9",
  first_seen: "2021-12-02T10:22:05.839054",
  last_seen: "2021-12-02T10:39:09.640165",
  state: {
    environment: "13963724-e4e8-4818-b019-d130daabfdd9",
    platform: "Linux-5.4.0-90-generic-x86_64-with-glibc2.27",
    hostname: "hostname1",
    ips: {
      v4: ["127.0.0.1", "192.168.0.1"],
      v6: ["::1", "2a02:1911:c95:9c00:6456:d690:521d:1c0f"],
    },
    python: "CPython 3.8.0 ('default', 'Feb 25 2021 22:10:10')",
    pid: "4989",
    resources: {
      utime: 15.475143,
      stime: 1.433864,
      maxrss: 2989796,
      ixrss: 0,
      idrss: 0,
      isrss: 0,
      minflt: 63511,
      majflt: 0,
      nswap: 0,
      inblock: 0,
      oublock: 24,
      msgsnd: 0,
      msgrcv: 0,
      nsignals: 0,
      nvcsw: 21305,
      nivcsw: 558,
    },
  },
};
