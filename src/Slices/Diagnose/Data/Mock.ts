import { RawDiagnostics } from "@S/Diagnose/Core/Domain";

export const failure: RawDiagnostics = {
  failures: [
    {
      resource_id:
        "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2",
      failures: [
        {
          instance_version: 3,
          model_version: 2,
          resource_id:
            "unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2",
          time: new Date("2021-05-03T13:10:05.978048"),
          message:
            "An error occurred during deployment of unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2 (exception: InvalidOperation()) An error occurred during deployment of unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2 (exception: InvalidOperation()) An error occurred during deployment of unittest::Resource[internal,name=0a5ec450-5f3e-4dab-81cd-60c158ffb66f],v=2 (exception: InvalidOperation())",
        },
      ],
    },
  ],
  rejections: [],
};

export const rejection: RawDiagnostics = {
  failures: [],
  rejections: [
    {
      instance_version: 2,
      model_version: undefined,
      compile_id: "2369b94d-7a3e-4a73-86ef-ef476ca088db",
      errors: [
        {
          // category: "runtime_error",
          type: "inmanta.ast.DoubleSetException",
          message:
            "value set twice:\n\told value: 1\n\t\tset at ./main.cf:30\n\tnew value: 0\n\t\tset at ./main.cf:29\n",
        },
      ],
      trace:
        'Traceback (most recent call last):\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/app.py", line 777, in app\n    options.func(options)\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/app.py", line 563, in export\n    raise exp\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/app.py", line 549, in export\n    (types, scopes) = do_compile()\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/compiler/__init__.py", line 76, in do_compile\n    compiler.handle_exception(e)\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/compiler/__init__.py", line 248, in handle_exception\n    self._handle_exception_export(e)\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/compiler/__init__.py", line 254, in _handle_exception_export\n    raise exception\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/compiler/__init__.py", line 246, in handle_exception\n    self._handle_exception_datatrace(exception)\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/compiler/__init__.py", line 258, in _handle_exception_datatrace\n    raise exception\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/compiler/__init__.py", line 72, in do_compile\n    success = sched.run(compiler, statements, blocks)\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/execute/scheduler.py", line 332, in run\n    next.execute()\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/execute/runtime.py", line 721, in execute\n    raise e\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/execute/runtime.py", line 718, in execute\n    self._unsafe_execute()\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/execute/runtime.py", line 713, in _unsafe_execute\n    self.result.set_value(value, self.expression.location)\n  File "/home/andras/git-repos/lsm/venv/lib/python3.6/site-packages/inmanta/execute/runtime.py", line 129, in set_value\n    raise DoubleSetException(self, None, value, location)\ninmanta.ast.DoubleSetException: value set twice:\n\told value: 1\n\t\tset at ./main.cf:30\n\tnew value: 0\n\t\tset at ./main.cf:29\n (reported in x = 0 (./main.cf:29))\n',
    },
  ],
};

export const failureAndRejection: RawDiagnostics = {
  failures: failure.failures,
  rejections: rejection.rejections,
};
