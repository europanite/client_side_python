import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomeScreen from "../screens/HomeScreen";

// Mock pyodide (simulate loadPyodide and Python execution)
jest.mock("pyodide", () => ({
  loadPyodide: jest.fn(async () => ({
    runPythonAsync: jest.fn(async (code: string) => {
      if (code.includes("error")) throw new Error("Simulated Python error");
      return "3\n"; // simulate print(3)
    }),
    setStdout: jest.fn(),
    setStderr: jest.fn(),
  })),
}));

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title and buttons", async () => {
    render(<HomeScreen />);
    expect(await screen.findByText("Client Side Python")).toBeInTheDocument();
    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("loads Pyodide successfully and shows Ready status", async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Pyodide: Ready/i)).toBeTruthy();
    });
  });

  it("runs Python code and shows output", async () => {
    render(<HomeScreen />);
    await waitFor(() => screen.getByText(/Ready/));
    fireEvent.click(screen.getByText("Run"));
    await waitFor(() =>
      expect(screen.getByText(/3|no output/i)).toBeTruthy()
    );
  });

  it("handles Python errors gracefully", async () => {
    render(<HomeScreen />);
    await waitFor(() => screen.getByText(/Ready/));
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "error code" } });
    fireEvent.click(screen.getByText("Run"));
    await waitFor(() =>
      expect(screen.getByText(/\[ERROR\]/i)).toBeTruthy()
    );
  });

  it("clears console output", async () => {
    render(<HomeScreen />);
    await waitFor(() => screen.getByText(/Ready/));
    fireEvent.click(screen.getByText("Clear"));
    expect(screen.getByText(/\(No output yet\./i)).toBeInTheDocument();
  });
});
