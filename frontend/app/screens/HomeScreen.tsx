import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import Button from "@mui/material/Button";
import Textarea from "@mui/joy/Textarea";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { loadPyodide, PyodideInterface } from "pyodide";

/**
 * HomeScreen (Vertical layout, toolbar on top)
 * ---------------------------------------------
 * [ Top Toolbar: Title + Buttons + Status ]
 * [ Code Window (flex: 1)                 ]
 * [ Console Window (short, fixed height)  ]
 */

type ExecResult =
  | { isError?: false; text: string }
  | { isError: true; text: string };

const DEFAULT_SAMPLE = `# Sample: 
# print number
a = 1
b = 2
c = a + b
print(c)
`;

export default function HomeScreen() {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "running">("loading");
  const [code, setCode] = useState<string>(DEFAULT_SAMPLE);
  const [consoleText, setConsoleText] = useState<string>("");
  const consoleRef = useRef<HTMLPreElement | null>(null);

  // soft-cancel token for "Stop"
  const execIdRef = useRef<number>(0);

  const { height, width } = useWindowDimensions();
  // Keep console clearly smaller than before (≈ 20% of viewport, clamped)
  const consoleHeight = Math.max(120, Math.min(200, Math.round(height * 0.22)));
  const narrow = width < 720;

  const styles = useMemo(() => {
    return {
      root: {
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
        padding: 12,
        display: "flex",
        flexDirection: "column" as const,
        gap: 12,
        minHeight: height - 60,
      },
      toolbar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap" as const,
      },
      title: { fontSize: 22, fontWeight: 800, margin: 0 },
      codePaper: {
        flex: 1,
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
        padding: 12,
        minHeight: 260,
      },
      codeTextarea: {
        fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
        fontSize: 14,
        minHeight: 220,
        flex: 1,
      },
      consolePaper: {
        padding: 12,
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
      },
      consoleBox: {
        height: consoleHeight,
        background: "#0b0b0b",
        color: "#e6e6e6",
        borderRadius: 8,
        padding: 12,
        overflow: "auto" as const,
        fontFamily: "ui-monospace, Menlo, Monaco, Consolas, monospace",
        fontSize: 14,
        border: "1px solid #333",
        lineHeight: 1.35,
        whiteSpace: "pre-wrap" as const,
      },
    };
  }, [height, width, consoleHeight]);

  // auto-scroll console
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleText]);

  // load Pyodide once
  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        const instance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/",
        });
        setPyodide(instance);
        setStatus("ready");
      } catch (e) {
        appendConsole({ isError: true, text: toErrMsg(e) });
        setStatus("idle");
      }
    })();
  }, []);

  function toErrMsg(err: any) {
    return err instanceof Error ? err.message : String(err);
  }
  function appendConsole(res: ExecResult) {
    setConsoleText((prev) => {
      const line = res.isError ? `[ERROR] ${res.text}` : res.text;
      return prev ? `${prev}\n${line}` : line;
    });
  }
  function clearConsole() {
    setConsoleText("");
  }
  function loadSample() {
    setCode(DEFAULT_SAMPLE);
  }
  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(consoleText);
      appendConsole({ text: "[INFO] Output copied to clipboard." });
    } catch {
      appendConsole({ isError: true, text: "Failed to copy output." });
    }
  }

  async function run() {
    if (!pyodide || status !== "ready") return;
    setStatus("running");
    const myExecId = ++execIdRef.current;

    try {
      // capture streams
      const lines: string[] = [];
      pyodide.setStdout({ batched: (t: string) => lines.push(t) });
      pyodide.setStderr({ batched: (t: string) => lines.push(t) });

      // soft timeout guard
      const TIMEOUT_MS = 30_000;
      const p = pyodide.runPythonAsync(code);
      await Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("Execution timeout")), TIMEOUT_MS))]);

      // if not stopped mid-run, flush
      if (myExecId === execIdRef.current) {
        const out = lines.join("");
        appendConsole({ text: out || "(no output)" });
      }
    } catch (e) {
      if (myExecId === execIdRef.current) appendConsole({ isError: true, text: toErrMsg(e) });
    } finally {
      if (myExecId === execIdRef.current) setStatus("ready");
    }
  }

  function stop() {
    // Soft-cancel: bump token so any in-flight run discards its result
    execIdRef.current++;
    appendConsole({ isError: true, text: "Stopped current execution." });
    // Note: For true hard-cancel, move execution to a WebWorker and terminate it.
  }

  const statusChip = (
    <Chip
      label={
        status === "loading"
          ? "Pyodide: Loading..."
          : status === "running"
          ? "Pyodide: Running"
          : status === "ready"
          ? "Pyodide: Ready"
          : "Pyodide: Idle"
      }
      color={status === "ready" ? "success" : status === "running" ? "warning" : "default"}
      variant="filled"
      icon={status === "loading" ? <CircularProgress size={16} /> : undefined}
      sx={{ fontWeight: 700 }}
    />
  );

  return (
    <div style={styles.root}>
      {/* Top toolbar: Title + Buttons + Status */}
      <div style={styles.toolbar}>
        <h1 style={styles.title as any}>
          <a
            href="https://github.com/europanite/browser_based_python/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Python Front
          </a>
        </h1>
        <Stack
          direction={narrow ? "column" : "row"}
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ alignItems: "center" }}
        >
          <Tooltip title={!pyodide ? "Pyodide not ready" : ""} arrow>
            <span>
              <Button variant="contained" size="large" onClick={run} disabled={!pyodide || status !== "ready"}>
                Run
              </Button>
            </span>
          </Tooltip>
          <Button variant="outlined" size="large" onClick={stop} disabled={status !== "running"}>
            Stop
          </Button>
          <Button variant="outlined" size="large" onClick={clearConsole}>
            Clear
          </Button>
          <Button variant="outlined" size="large" onClick={loadSample}>
            Load Sample
          </Button>
          <Button variant="outlined" size="large" onClick={copyOutput} disabled={!consoleText}>
            Copy Output
          </Button>
        </Stack>

        {statusChip}
      </div>

      {/* Code window (big, flexible) */}
      <Paper elevation={2} style={styles.codePaper}>
        <strong>Code</strong>
        <Divider />
        <Textarea
          minRows={12}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          variant="outlined"
          sx={styles.codeTextarea as any}
        />
      </Paper>

      {/* Console window (short, fixed) */}
      <Paper elevation={2} style={styles.consolePaper}>
        <strong>Console</strong>
        <Divider />
        <pre ref={consoleRef} style={styles.consoleBox} aria-live="polite" aria-label="Console output">
          {consoleText || "(No output yet. Press Run to execute.)"}
        </pre>
      </Paper>
    </div>
  );
}
