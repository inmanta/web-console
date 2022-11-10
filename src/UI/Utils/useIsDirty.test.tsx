import React, { useState } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, ServiceInstance } from "@/Test";
import useIsDirty from "./useIsDirty";

// Test case setup checks indirectly boolean value by conditional rendering of a span tag
const setup = (baseObject, testCompareObject, newValue, overrideValue?) => {
  const Component: React.FC = () => {
    const [testObject, setTestObject] = useState(baseObject);
    const { isDirty, overrideState } = useIsDirty(
      testObject,
      testCompareObject
    );
    return (
      <div>
        <button onClick={() => setTestObject(newValue)}>Change Data</button>
        <button onClick={() => overrideState(overrideValue)}>
          override Data
        </button>
        {isDirty && <span role="isDirtyValue">true</span>}
      </div>
    );
  };
  const component = <Component />;
  return { component };
};

afterEach(() => {
  cleanup;
});
test("GIVEN useIsDirty WHEN hook's parameter that is being checked isn't changed from it's default THEN isDirty value is falsy and span isn't visible in any moment of lifecycle", async () => {
  Field.nestedEditable, ServiceInstance.nestedEditable.candidate_attributes;
  const { component } = setup(
    {
      property: "",
    },
    undefined,
    {
      property: "",
    }
  );
  render(component);
  expect(screen.queryByText("true")).not.toBeInTheDocument();
  const button = screen.getByText("Change Data");

  await act(async () => {
    await userEvent.click(button);
  });

  expect(screen.queryByText("true")).not.toBeInTheDocument();
});
test("GIVEN useIsDirty WHEN hook's parameter that is being checked is changed from different than default THEN isDirty value is truthy and span is visible", async () => {
  Field.nestedEditable, ServiceInstance.nestedEditable.candidate_attributes;
  const { component } = setup(
    {
      property: "",
    },
    undefined,
    {
      property: "changed",
    }
  );
  render(component);
  const button = screen.getByText("Change Data");

  await act(async () => {
    await userEvent.click(button);
  });

  expect(screen.getByText("true")).toBeVisible();
});

test("GIVEN useIsDirty WHEN hook's parameter that is being checked is changed from empty value to the same that hook's baseObject has THEN isDirty value is falsy and span isn't visible", async () => {
  Field.nestedEditable, ServiceInstance.nestedEditable.candidate_attributes;
  const { component } = setup(
    {
      property: "",
    },
    {
      property: "baseValue",
    },
    {
      property: "baseValue",
    }
  );
  render(component);
  expect(screen.getByText("true")).toBeVisible();

  const button = screen.getByText("Change Data");

  await act(async () => {
    await userEvent.click(button);
  });

  expect(screen.queryByText("true")).not.toBeInTheDocument();
});
test("GIVEN useIsDirty WHEN hook's parameter that is being checked is changed from one different value to another different than hook's baseObject THEN isDirty value is truthy and span always visible", async () => {
  Field.nestedEditable, ServiceInstance.nestedEditable.candidate_attributes;
  const { component } = setup(
    {
      property: "",
    },
    {
      property: "baseValue",
    },
    {
      property: "changed",
    }
  );
  render(component);
  expect(screen.getByText("true")).toBeVisible();

  const button = screen.getByText("Change Data");

  await act(async () => {
    await userEvent.click(button);
  });

  expect(screen.getByText("true")).toBeVisible();
});

test("GIVEN useIsDirty WHEN hook's parameter that is being checked is changed to be different than hook's baseObject THEN isDirty value is truthy and span is visible", async () => {
  Field.nestedEditable, ServiceInstance.nestedEditable.candidate_attributes;
  const { component } = setup(
    {
      property: "baseValue",
    },
    {
      property: "baseValue",
    },
    {
      property: "changed",
    }
  );
  render(component);
  expect(screen.queryByText("true")).not.toBeInTheDocument();

  const button = screen.getByText("Change Data");

  await act(async () => {
    await userEvent.click(button);
  });

  expect(screen.getByText("true")).toBeVisible();
});

test("GIVEN useIsDirty WHEN hook's parameter that is being checked is changed to be different than default but override function is called with false value THEN isDirty value is falsy and span isn't visible", async () => {
  Field.nestedEditable, ServiceInstance.nestedEditable.candidate_attributes;
  const { component } = setup(
    {
      property: "",
    },
    undefined,
    {
      property: "changed",
    },
    false
  );
  render(component);
  expect(screen.queryByText("true")).not.toBeInTheDocument();

  const button = screen.getByText("Change Data");
  const overrideButton = screen.getByText("override Data");

  await act(async () => {
    await userEvent.click(button);
  });
  expect(screen.getByText("true")).toBeVisible();

  await act(async () => {
    await userEvent.click(overrideButton);
  });
  expect(screen.queryByText("true")).not.toBeInTheDocument();
});
