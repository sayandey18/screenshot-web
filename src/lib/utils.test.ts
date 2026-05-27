import { describe, it, expect } from "vitest";
import { cn, getDisplayNameInitials, getErrorMessage } from "../lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
});

describe("getDisplayNameInitials", () => {
  it("returns initials from full name", () => {
    expect(getDisplayNameInitials("John Doe")).toBe("JD");
  });
  it("returns first two chars for single word", () => {
    expect(getDisplayNameInitials("John")).toBe("JO");
  });
  it("returns ? for empty string", () => {
    expect(getDisplayNameInitials("")).toBe("?");
  });
});

describe("getErrorMessage", () => {
  it("returns error message from Error instance", () => {
    expect(getErrorMessage(new Error("test"), "fallback")).toBe("test");
  });
  it("returns fallback for non-Error", () => {
    expect(getErrorMessage("string", "fallback")).toBe("fallback");
  });
});
