import { createCookie, getCookie, removeCookie } from "./CookieHelper";

describe("createCookie", () => {
  test("creates a new cookie with the specified name, value, and expiration time", () => {
    createCookie("testCookie", "testValue", 1);

    // Retrieve created cookie
    const cookieArray = document.cookie.split(";");
    const createdCookie = cookieArray.find((cookie) =>
      cookie.includes("testCookie"),
    );

    // Expectations
    expect(createdCookie).toBeDefined();
    expect(createdCookie!.trim()).toEqual("testCookie=testValue");
  });
});

// Test cases for getCookie function
describe("getCookie", () => {
  test("retrieves the value of the specified cookie", () => {
    document.cookie = "testCookie=testValue";

    // Retrieve cookie value
    const cookieValue = getCookie("testCookie");

    // Expectations
    expect(cookieValue).toEqual("testValue");
  });

  test("returns null if the specified cookie is not found", () => {
    document.cookie = "";

    // Retrieve cookie value
    const cookieValue = getCookie("nonExistingCookie");

    // Expectations
    expect(cookieValue).toBeNull();
  });
});

// Test cases for removeCookie function
describe("removeCookie", () => {
  test("removes the specified cookie", () => {
    // Add a cookie first
    document.cookie = "testCookie=testValue";

    // Remove the cookie
    removeCookie("testCookie");

    // Retrieve cookie value
    const cookieValue = getCookie("testCookie");

    // Expectations
    expect(cookieValue).toBeNull();
  });
});
