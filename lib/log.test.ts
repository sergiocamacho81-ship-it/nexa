import { afterEach, describe, expect, it, vi } from "vitest";
import { logError } from "./log";

describe("logError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs a single structured JSON line with the given context and error message", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logError("test.context", new Error("boom"), { organizationId: "org-1" });

    expect(spy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.level).toBe("error");
    expect(logged.context).toBe("test.context");
    expect(logged.message).toBe("boom");
    expect(logged.meta).toEqual({ organizationId: "org-1" });
    expect(typeof logged.timestamp).toBe("string");
  });

  it("handles a non-Error thrown value without crashing", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    logError("test.context", "a plain string failure");

    const logged = JSON.parse(spy.mock.calls[0][0] as string);
    expect(logged.message).toBe("a plain string failure");
    expect(logged.stack).toBeUndefined();
  });
});
