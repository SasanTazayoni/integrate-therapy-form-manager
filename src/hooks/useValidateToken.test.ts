import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import useValidateToken from "./useValidateToken";
import { validateFormToken } from "../api/formsFrontend";

vi.mock("../api/formsFrontend", () => ({
  validateFormToken: vi.fn(),
}));

describe("useValidateToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("sets modal + invalid when no token is provided", () => {
    const { result } = renderHook(() => useValidateToken(undefined));
    expect(result.current.isValid).toBe(false);
    expect(result.current.showInvalidTokenModal).toBe(true);
  });

  test("sets valid when API resolves with ok=true", async () => {
    vi.mocked(validateFormToken).mockResolvedValueOnce({ ok: true, data: {} });

    const { result } = renderHook(() => useValidateToken("valid-token"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(true);
      expect(result.current.showInvalidTokenModal).toBe(false);
    });
  });

  test("sets invalid + modal when API resolves with ok=false", async () => {
    vi.mocked(validateFormToken).mockResolvedValueOnce({ ok: false, data: {} });

    const { result } = renderHook(() => useValidateToken("bad-token"));

    await waitFor(() => {
      expect(result.current.isValid).toBe(false);
      expect(result.current.showInvalidTokenModal).toBe(true);
    });
  });

  test("does nothing if component unmounts before API resolves", async () => {
    let resolveFn!: (value: { ok: boolean; data: object }) => void;
    vi.mocked(validateFormToken).mockImplementationOnce(
      () => new Promise((resolve) => (resolveFn = resolve))
    );

    const { result, unmount } = renderHook(() =>
      useValidateToken("slow-token")
    );

    unmount();
    act(() => {
      resolveFn({ ok: false, data: {} });
    });

    expect(result.current.isValid).toBe(null);
  });

  test("can toggle showInvalidTokenModal manually", () => {
    const { result } = renderHook(() => useValidateToken(undefined));

    act(() => {
      result.current.setShowInvalidTokenModal(false);
    });

    expect(result.current.showInvalidTokenModal).toBe(false);
  });
});
