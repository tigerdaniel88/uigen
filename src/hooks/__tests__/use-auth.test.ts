import { describe, test, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

// --- mocks ---

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";

// --- helpers ---

const ANON_WORK = {
  messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "hi" }] }],
  fileSystemData: { "/App.jsx": { type: "file", content: "export default () => null" } },
};

beforeEach(() => {
  vi.clearAllMocks();
  (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(null);
});

// --- signIn ---

describe("signIn", () => {
  test("returns result from server action", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proj-1" });

    const { result } = renderHook(() => useAuth());
    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signIn("a@b.com", "password1");
    });

    expect(returnValue).toEqual({ success: true });
  });

  test("calls signInAction with provided credentials", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proj-1" });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("user@example.com", "secret123");
    });

    expect(signInAction).toHaveBeenCalledWith("user@example.com", "secret123");
  });

  test("sets isLoading to true during sign-in and false after", async () => {
    let resolveSignIn!: (v: any) => void;
    (signInAction as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((r) => { resolveSignIn = r; })
    );

    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(false);

    let signInPromise: Promise<any>;
    act(() => {
      signInPromise = result.current.signIn("a@b.com", "pw");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignIn({ success: false, error: "Invalid credentials" });
      await signInPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("does not call handlePostSignIn when sign-in fails", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("a@b.com", "wrong");
    });

    expect(getProjects).not.toHaveBeenCalled();
    expect(createProject).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("returns error result from server action", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const { result } = renderHook(() => useAuth());
    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signIn("a@b.com", "wrong");
    });

    expect(returnValue).toEqual({ success: false, error: "Invalid credentials" });
    expect(result.current.isLoading).toBe(false);
  });
});

// --- signUp ---

describe("signUp", () => {
  test("returns result from server action", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proj-2" });

    const { result } = renderHook(() => useAuth());
    let returnValue: any;
    await act(async () => {
      returnValue = await result.current.signUp("new@user.com", "password1");
    });

    expect(returnValue).toEqual({ success: true });
  });

  test("calls signUpAction with provided credentials", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "proj-2" });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp("new@user.com", "password1");
    });

    expect(signUpAction).toHaveBeenCalledWith("new@user.com", "password1");
  });

  test("sets isLoading true during sign-up and false after", async () => {
    let resolveSignUp!: (v: any) => void;
    (signUpAction as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((r) => { resolveSignUp = r; })
    );

    const { result } = renderHook(() => useAuth());

    let signUpPromise: Promise<any>;
    act(() => {
      signUpPromise = result.current.signUp("new@user.com", "pw");
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignUp({ success: false, error: "Email already registered" });
      await signUpPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  test("does not redirect when sign-up fails", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Email already registered",
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp("exists@user.com", "password1");
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});

// --- handlePostSignIn (via signIn success) ---

describe("handlePostSignIn", () => {
  test("migrates anon work and redirects when anonymous work exists", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue(ANON_WORK);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "anon-proj" });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("a@b.com", "pw");
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: ANON_WORK.messages,
        data: ANON_WORK.fileSystemData,
      })
    );
    expect(clearAnonWork).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/anon-proj");
    expect(getProjects).not.toHaveBeenCalled();
  });

  test("skips anon work migration when messages array is empty", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getAnonWorkData as ReturnType<typeof vi.fn>).mockReturnValue({
      messages: [],
      fileSystemData: {},
    });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "existing-proj" }]);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("a@b.com", "pw");
    });

    expect(createProject).not.toHaveBeenCalled();
    expect(clearAnonWork).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/existing-proj");
  });

  test("redirects to most recent project when user has projects", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "recent-proj" },
      { id: "older-proj" },
    ]);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("a@b.com", "pw");
    });

    expect(mockPush).toHaveBeenCalledWith("/recent-proj");
    expect(createProject).not.toHaveBeenCalled();
  });

  test("creates new project and redirects when user has no projects", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-proj" });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("a@b.com", "pw");
    });

    expect(createProject).toHaveBeenCalledWith(
      expect.objectContaining({ messages: [], data: {} })
    );
    expect(mockPush).toHaveBeenCalledWith("/new-proj");
  });

  test("new project name is a non-empty string", async () => {
    (signInAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "new-proj" });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signIn("a@b.com", "pw");
    });

    const callArg = (createProject as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(typeof callArg.name).toBe("string");
    expect(callArg.name.length).toBeGreaterThan(0);
  });

  test("works identically after signUp success", async () => {
    (signUpAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (getProjects as ReturnType<typeof vi.fn>).mockResolvedValue([{ id: "proj-x" }]);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.signUp("new@user.com", "password1");
    });

    expect(mockPush).toHaveBeenCalledWith("/proj-x");
  });
});
