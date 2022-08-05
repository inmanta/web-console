import { CompileDetails } from "./Domain";

export const data: CompileDetails = {
  id: "4878c413-be74-49cb-9519-8c1d55897e73",
  remote_id: "4267e18a-696a-4dd6-8840-e55794a29f84",
  environment: "d1a21678-1368-433c-8db8-d35f88c25255",
  requested: "2021-09-10T09:00:00.000000",
  started: "2021-09-10T09:00:20.000000",
  do_export: true,
  force_update: false,
  metadata: { type: "api", message: "Recompile trigger through API call" },
  environment_variables: {},
  completed: "2021-09-10T09:00:40.000000",
  success: true,
  version: 1,
  compile_data: null,
  reports: [
    {
      id: "ccb626ce-44e5-4f71-aa07-5b5a6ceee70b",
      started: "2021-09-10T09:05:25.000000",
      completed: "2021-09-10T09:05:30.000000",
      command:
        "/opt/inmanta/bin/python3 -m inmanta.app -vvv export -X -e f7e84432-855c-4d04-b422-50c3ab925a4a",
      name: "Recompiling configuration model",
      errstream: "error",
      outstream: "success",
      returncode: 1,
    },
    {
      id: "2dac423a-97da-40d9-abf5-b31b1ff2cd5e",
      started: "2021-09-10T09:05:30.000000",
      completed: "2021-09-10T09:05:40.000000",
      command:
        '/opt/inmanta/bin/python3 -m inmanta.app -vvv export -X -e f7e84432-855c-4d04-b422-50c3ab925a4a --server_address localhost --server_port 8888 --metadata {"message": "Recompile model because state transition", "type": "lsm_export", "event_type": "RESOURCE_TRANSITION", "event_correlation_id": "01d857cc-adf8-4f9b-beb7-ccdc0519a5ae"} --export-compile-data --export-compile-data-file /tmp/tmps4cy92q4',
      name: "Recompiling configuration model",
      errstream: "error",
      outstream: "success",
      returncode: null,
    },
  ],
};
