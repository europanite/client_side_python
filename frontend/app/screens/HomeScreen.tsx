import Button from '@mui/material/Button';
import Textarea from '@mui/joy/Textarea';
import {TouchableOpacity, Text,StyleSheet, View, Image} from 'react-native';

import { useEffect, useRef, useState } from "react";
import { PyodideInterface,loadPyodide } from "pyodide";

const HomeScreen = () => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [code, setCode]       = useState("print('Hello from Python!')");
  const [output, setOutput]   = useState("");
  const outputRef             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ldPyodide = async () => {
      const pyodideInstance = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.0/full/" });
      setPyodide(pyodideInstance);
    };
    ldPyodide();
  }, []);

class OutputCapture {
  private output: string[] = [];

  capture(text: string) {
    this.output.push(text);
  }

  getOutput(): string {
    return this.output.join("\n");
  }

  clear() {
    this.output = [];
  }
}
  // const runCode       = async () => {
  const executePython = async (code: string, timeout: number) => {
  try {
    if (!pyodide) {
      throw new Error("Pyodide not initialized");
    }

    const outputCapture = new OutputCapture();
    
    pyodide.setStdout({
      batched: (text: string) => outputCapture.capture(text)
    });

    // console.error("Executing Python code:", code);

    const resultPromise = pyodide.runPythonAsync(code);
    const result = await Promise.race([
      resultPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Execution timeout")), timeout)
      ),
    ]);

    return {
      content: [
        {
          type: "text",
          text: outputCapture.getOutput()
            ? outputCapture.getOutput()
            : String(result),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error executing Python code: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
};

  const runCode = async () => {

    if (!pyodide) return;
    try {

      await pyodide.loadPackage("micropip");
      const micropip = pyodide.pyimport("micropip");

      const result = await executePython(code,30);
      // setOutput(result !== undefined ? result.toString() : "(no output)");
      setOutput(result !== undefined ? result.content[0].text : "(no output)");
    } catch (err: any) {
      setOutput(err.toString());
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Pyodide Python Runner</h1>
      <Textarea
        className="min-h-[150px]"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button 
        onClick={runCode} 
        disabled={!pyodide}
      >
        Run Python Code !!!
      </Button>
      <div ref={outputRef} className="p-2 bg-gray-100 rounded">
        <Text>Output:</Text>
        <pre className="whitespace-pre-wrap text-sm">{output}</pre>
      </div>
    </div>
  );
};

export default HomeScreen;
