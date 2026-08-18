import { useState, useRef, useEffect } from 'react';
import Editor from './MonacoEditor.jsx';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const VS_SHARP_API = 'https://verscript-polyserver.onrender.com/vs-sharp';

const handleEditorWillMount = (monaco) => {
  const languages = monaco.languages.getLanguages();
  if (languages.some(lang => lang.id === 'verscript')) return;

  monaco.languages.register({ id: 'verscript' });

  monaco.editor.defineTheme('cyberpunk', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '00FFCC', fontStyle: 'bold' },
      { token: 'string', foreground: 'FF79C6' },
      { token: 'number', foreground: 'BD93F9' },
      { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
      { token: 'operators', foreground: 'FFB86C' }
    ],
    colors: { 'editor.background': '#09090b' }
  });

  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'F92672', fontStyle: 'bold' },
      { token: 'string', foreground: 'E6DB74' },
      { token: 'number', foreground: 'AE81FF' },
      { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
      { token: 'operators', foreground: 'F92672' }
    ],
    colors: { 'editor.background': '#272822' }
  });

  monaco.editor.defineTheme('solarized', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '859900', fontStyle: 'bold' },
      { token: 'string', foreground: '2AA198' },
      { token: 'number', foreground: 'D33682' },
      { token: 'comment', foreground: '586E75', fontStyle: 'italic' },
      { token: 'operators', foreground: 'CB4B16' }
    ],
    colors: { 'editor.background': '#002B36' }
  });

  monaco.editor.defineTheme('light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '2563EB', fontStyle: 'bold' },
      { token: 'string', foreground: '059669' },
      { token: 'number', foreground: '7C3AED' },
      { token: 'comment', foreground: '94A3B8', fontStyle: 'italic' },
      { token: 'operators', foreground: 'DC2626' }
    ],
    colors: { 'editor.background': '#F8FAFC' }
  });


  monaco.languages.setMonarchTokensProvider('verscript', {
    tokenizer: {
      root: [
        [/[a-zA-Z_]\w*/, {
          cases: {
            'display': 'keyword',
            'prompt': 'keyword',
            'true': 'keyword',
            'false': 'keyword',
            'loop': 'keyword',
            'iterate': 'keyword',
            'from': 'keyword',
            'to': 'keyword',
            'if': 'keyword',
            'then': 'keyword',
            'else': 'keyword',
            'while': 'keyword',
            'until': 'keyword',
            'do': 'keyword',
            'unless': 'keyword',
            'internal': 'keyword',
            'external': 'keyword',
            'error': 'keyword',
            'ForceErrors': 'keyword',
            'CriticalErrors': 'keyword',
            'SuppressErrors': 'keyword',
            'throw': 'keyword',
            'inject': 'keyword',
            'step': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[0-9]+/, 'number'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/![^\n]*/, 'comment'],
        [/[+\-*/:=><]|x=/, 'operators']
      ]
    }
  });

  monaco.languages.registerCompletionItemProvider('verscript', {
    provideCompletionItems: (_model, _position) => {
      const suggestions = [
        {
          label: 'display',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'display ${1:expression}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Print value to stdout'
        },
        {
          label: 'prompt',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'prompt ${1:variable}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Read value from stdin'
        },
        {
          label: 'true',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'true',
          detail: 'Boolean true'
        },
        {
          label: 'false',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'false',
          detail: 'Boolean false'
        },
        {
          label: 'loop',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'loop ${1:n}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Repeat n times'
        },
        {
          label: 'iterate',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'iterate ${1:i} from ${2:x} to ${3:y}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Iterate i from x to y'
        },
        {
          label: 'if',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'if ${1:condition} then\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'If statement'
        },
        {
          label: 'else if',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'else if ${1:condition} then\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Else If statement'
        },
        {
          label: 'else',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'else\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Else statement'
        },
        {
          label: 'while',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'while ${1:condition}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'While loop'
        },
        {
          label: 'until',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'until ${1:condition}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Until loop'
        },
        {
          label: 'do',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'do\n\t$0\nunless ${1:error}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Try-Unless block'
        },
        {
          label: 'unless',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'unless ${1:condition}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Unless handler'
        },
        {
          label: 'unless internal',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'unless internal ${1:condition}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Unless internal condition watch'
        },
        {
          label: 'unless external',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'unless external ${1:condition}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Unless external condition block'
        },
        {
          label: 'internal',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'internal',
          detail: 'Internal modifier keyword'
        },
        {
          label: 'external',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'external',
          detail: 'External modifier keyword'
        },
        {
          label: 'error',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'error',
          detail: 'Caught error keyword symbol'
        },
        {
          label: 'ForceErrors',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'ForceErrors\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Execute block forcing display of all errors'
        },
        {
          label: 'CriticalErrors',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'CriticalErrors\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Execute block throwing critical errors only'
        },
        {
          label: 'SuppressErrors',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'SuppressErrors\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Execute block skipping all errors'
        },
        {
          label: 'inject',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'inject ${1:python}\n\t$0',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Inject code from 100+ languages (e.g. python, js, cpp, verscript)'
        },
        {
          label: 'throw',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'throw ${1:ErrorName}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Throw registered error or active error'
        },
        {
          label: 'step',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'step ${1:2}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Step increment for loops'
        }
      ];
      return { suggestions };
    }
  });
};


const TEMPLATES = {
  inject_polyglot: `!!
  Template: Dynamic Polyglot Code Injection (inject [lang])
  Supports 100+ languages (python, js, cpp, rust, go, java...)
  Use "inject verscript" / "inject eval" for dynamic evaluation!
!!

display "=== Polyglot Code Injection Showcase ===" ?color="cyan"

inject python
  print("Python snippet executing inside VerScript!")
  val = [x**2 for x in range(5)]
  print("Squares:", val)

inject javascript
  const arr = ["Rust", "Go", "TypeScript", "Python"];
  console.log("Joined languages:", arr.join(" -> "));

inject verscript
  display "Nested VerScript dynamic evaluation!" ?color="green"
  iterate i from 1 to 3
    display "Step: " + i ?color="yellow"`,


  attributes_demo: `!!
  Template: Command Attributes & Kwargs Showcase
  Attributes customize output colors, inline printing, prompt defaults, and throw messages!
!!

display "=== Colorized Terminal Output ===" ?color="cyan"
display "Success Status!" ?color="green"
display "Warning Notice!" ?color="yellow"
display "Error Alert!" ?color="red"

display "=== Inline Segmented Printing ===" ?color="purple"
display "Segment 1, " ?newline=false ?color="cyan"
display "Segment 2, " ?newline=false ?color="yellow"
display "Segment 3 (Done!)" ?color="green"

prompt username ?default="GuestUser"
display "User registered: " + username ?color="green"`,

  stepped_loops: `!!
  Template: Stepped Loops & Iterations
  Demonstrates loop step size overrides and attribute modifiers.
!!

display "--- Stepped Iteration ---" ?color="cyan"
iterate i from 1 to 10 step 2
  display "Stepped Iteration: " + i ?color="cyan"

display "--- Stepped While Loop ---" ?color="purple"
count : 0
while count < 9 step 3
  display "Count Step: " + count ?color="yellow"
  count : count + 1`,

  do_unless: `!!
  Template: Do-Unless Exception Catching & Custom Throw Attributes
  Demonstrates try-catch error handling with ?msg attributes.
!!

display "--- Exception Handling ---" ?color="cyan"
do
  display "Throwing exception with custom message..." ?color="yellow"
  throw DivisionByZeroError ?msg="Division by zero in calculation module"
unless DivisionByZeroError
  display "Caught exception: " + error ?color="green"

display "--- Reactive Internal Watch ---" ?color="purple"
flag : false
do
  display "Step 1 executing..." ?color="cyan"
  flag : true
  display "Step 2 skipped!" ?color="yellow"
unless internal flag
  display "Reactive watch triggered!" ?color="green"`,

  system_operators: `!!
  Template: System Operators & SuppressErrors
  Demonstrates error suppression block scope.
!!

display "--- SuppressErrors Scope ---" ?color="cyan"
SuppressErrors
  val : 10 / 0
  display "Error suppressed successfully!" ?color="green"`
};

const defaultSampleCode = `!!
  VerScript Showcase — v1.2.0
  Featuring:
    1: Multiline Comments and Single-line Comments
    2: Command Attributes (?color, ?newline=false, ?default, ?msg)
    3: Stepped Iteration & Loops (iterate i from x to y step z)
    4: Exception Handling (do ... unless) & Custom Throws
    5: System Block Operators (SuppressErrors, CriticalErrors)
!!

display "=== 1. ANSI Colorized Terminal Output ===" ?color="cyan"
display "Success: VerScript Engine Active!" ?color="green"
display "Warning: Memory optimization recommended." ?color="yellow"
display "Error: DivisionByZero handled gracefully." ?color="red"

display "=== 2. Inline Printing with ?newline=false ===" ?color="purple"
display "Loading modules: [" ?newline=false ?color="cyan"
display "Core, " ?newline=false ?color="yellow"
display "Lexer, " ?newline=false ?color="yellow"
display "VS#-1B Neural Engine] " ?newline=false ?color="cyan"
display "Done!" ?color="green"

display "=== 3. Stepped Iteration Showcase ===" ?color="cyan"
iterate idx from 1 to 10 step 2
  display "Stepped Iteration: " + idx ?color="cyan"

display "=== 4. Custom Throw with ?msg Attribute ===" ?color="purple"
do
  display "Triggering custom exception with ?msg attribute..." ?color="yellow"
  throw DivisionByZeroError ?msg="Division by zero in calculate_ratio()"
unless DivisionByZeroError
  display "Caught Exception: " + error ?color="green"

display "=== 5. Error Suppression Block Operator ===" ?color="cyan"
SuppressErrors
  display "Running invalid operation under SuppressErrors..." ?color="yellow"
  invalid_val : 10 / 0
  display "Division by zero bypassed cleanly!" ?color="green"`;


// --- ANSI ESCAPE CODE RENDERER FOR TERMINAL ---
function renderAnsiLine(text) {
    if (!text) return null;
    const colorMap = {
        '31': '#ff5555',
        '32': '#50fa7b',
        '33': '#f1fa8c',
        '34': '#bd93f9',
        '35': '#ff79c6',
        '36': '#8be9fd',
        '0': null
    };

    const regex = /\033\[(\d+)m|\x1b\[(\d+)m/g;
    const parts = [];
    let lastIndex = 0;
    let currentColor = null;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const matchIndex = match.index;
        if (matchIndex > lastIndex) {
            const segment = text.slice(lastIndex, matchIndex);
            parts.push({ text: segment, color: currentColor });
        }
        const code = match[1] || match[2];
        currentColor = colorMap[code] !== undefined ? colorMap[code] : currentColor;
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), color: currentColor });
    }

    if (parts.length === 0) return text;

    return parts.map((p, idx) => (
        <span key={idx} style={p.color ? { color: p.color, fontWeight: 'bold' } : {}}>
            {p.text}
        </span>
    ));
}

function App() {
  // ─── 1. All State & Ref Hooks ──────────────────────────────────────────
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('editor'); // 'editor' | 'ai' | 'terminal'

  const [files, setFiles] = useState([
    { name: 'sample.vrs', content: defaultSampleCode },
    { name: 'src/main.vrs', content: "!! Main script in src folder !!\ndisplay \"Running from src/main.vrs\" ?color=\"cyan\"\n" },
    { name: 'tests/test_step.vrs', content: "!! Test step loop !!\niterate i from 1 to 10 step 3\n  display \"Step test: \" + i ?color=\"yellow\"\n" }
  ]);
  const [folders, setFolders] = useState(['src', 'tests']);
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [targetFolder, setTargetFolder] = useState('');
  const [activeFileName, setActiveFileName] = useState('sample.vrs');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [decorationsList, setDecorationsList] = useState([]);
  
  const [code, setCode] = useState(defaultSampleCode);
  const [output, setOutput] = useState([
    { type: 'cmd',     text: 'VerScript VM v1.1.0 — powered by verscript-polyserver.onrender.com' },
    { type: 'success', text: 'Ready. Press ▶ Run Code to execute.' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  // VS# State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'system', text: "I'm VS#-1B, your 1-Billion Parameter VerScript AI assistant. Powered by a custom 1B parameter neural architecture trained specifically for VerScript logic synthesis and code repair!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const [theme, setTheme] = useState('cyberpunk');
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugStepIndex, setDebugStepIndex] = useState(0);
  const [debugVariables, setDebugVariables] = useState({});
  const [debugDecorations, setDebugDecorations] = useState([]);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const terminalRef = useRef(null);
  const chatRef = useRef(null);

  // ─── Resizable Terminal Mouse & Touch Handlers ───────────────────────
  const handleResizeStart = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizing) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const newHeight = window.innerHeight - clientY;
      if (newHeight >= 100 && newHeight <= window.innerHeight * 0.7) {
        setTerminalHeight(newHeight);
      }
    };

    const handleEnd = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('code');
      if (urlCode) {
        const decoded = decodeURIComponent(atob(urlCode));
        if (decoded && decoded.trim()) {
          setCode(decoded);
          setFiles([{ name: 'shared.vrs', content: decoded }]);
          setActiveFileName('shared.vrs');
        }
      }
    } catch (e) {
      console.error("Error reading shared URL code", e);
    }
  }, []);

  const handleShareCode = () => {
    try {
      const encoded = btoa(encodeURIComponent(code));
      const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encoded}`;
      navigator.clipboard?.writeText(shareUrl);
      alert("🔗 Shareable code link copied to clipboard!\n\n" + shareUrl);
    } catch (e) {
      alert("Error sharing code: " + e.message);
    }
  };

  const handleSelectTemplate = (templateKey) => {
    if (!templateKey) return;
    const content = TEMPLATES[templateKey];
    if (!content) return;
    const fileName = `${templateKey}.vrs`;
    setFiles(prev => {
      const exists = prev.find(f => f.name === fileName);
      if (exists) return prev.map(f => f.name === fileName ? { ...f, content } : f);
      return [...prev, { name: fileName, content }];
    });
    setActiveFileName(fileName);
    setCode(content);
  };

  const getExecutableLines = (rawCode) => {
    const lines = rawCode.split('\n');
    const result = [];
    lines.forEach((lineText, idx) => {
      const trimmed = lineText.trim();
      if (trimmed && !trimmed.startsWith('!')) {
        result.push({ lineNum: idx + 1, text: trimmed, original: lineText });
      }
    });
    return result;
  };

  const startDebugger = () => {
    const execLines = getExecutableLines(code);
    if (execLines.length === 0) {
      alert("No executable code lines found!");
      return;
    }
    setIsDebugMode(true);
    setDebugStepIndex(0);
    setDebugVariables({});
    setOutput(prev => [...prev, { type: 'cmd', text: '🐞 Debugger started. Click "Next Step" to advance.' }]);
    highlightDebugLine(execLines[0].lineNum);
  };

  const stopDebugger = () => {
    setIsDebugMode(false);
    setDebugStepIndex(0);
    setDebugVariables({});
    if (editorRef.current && monacoRef.current) {
      editorRef.current.deltaDecorations(debugDecorations, []);
    }
    setDebugDecorations([]);
    setOutput(prev => [...prev, { type: 'cmd', text: '⏹️ Debugger stopped.' }]);
  };

  const highlightDebugLine = (lineNum) => {
    if (!editorRef.current || !monacoRef.current) return;
    const newDec = {
      range: new monacoRef.current.Range(lineNum, 1, lineNum, 1),
      options: {
        isWholeLine: true,
        className: 'debug-active-line',
        glyphMarginClassName: 'debug-active-glyph'
      }
    };
    const ids = editorRef.current.deltaDecorations(debugDecorations, [newDec]);
    setDebugDecorations(ids);
    editorRef.current.revealLineInCenter(lineNum);
  };

  const stepNextLine = () => {
    const execLines = getExecutableLines(code);
    if (debugStepIndex >= execLines.length) {
      setOutput(prev => [...prev, { type: 'success', text: '✅ Debugger reached end of program.' }]);
      stopDebugger();
      return;
    }

    const currentExec = execLines[debugStepIndex];
    const lineText = currentExec.text;

    if (lineText.startsWith('display ')) {
      const expr = lineText.replace('display ', '').trim();
      let outputVal = expr;
      Object.keys(debugVariables).forEach(varName => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        outputVal = outputVal.replace(regex, JSON.stringify(debugVariables[varName].value));
      });
      outputVal = outputVal.replace(/^"|"$/g, '');
      setOutput(prev => [...prev, { type: 'success', text: `[Line ${currentExec.lineNum}] ${outputVal}` }]);
    } 
    else if (lineText.includes(':')) {
      const parts = lineText.split(':');
      const varName = parts[0].trim();
      let rawVal = parts[1].trim();
      let type = 'int';
      let parsedVal = parseInt(rawVal);
      if (isNaN(parsedVal)) {
        if (rawVal === 'true' || rawVal === 'false') {
          type = 'boolean';
          parsedVal = rawVal === 'true';
        } else {
          type = 'string';
          parsedVal = rawVal.replace(/^"|"$/g, '');
        }
      }
      setDebugVariables(prev => ({
        ...prev,
        [varName]: { name: varName, value: parsedVal, type }
      }));
      setOutput(prev => [...prev, { type: 'cmd', text: `[Line ${currentExec.lineNum}] Scope update: ${varName} = ${parsedVal}` }]);
    }

    const nextIndex = debugStepIndex + 1;
    setDebugStepIndex(nextIndex);
    if (nextIndex < execLines.length) {
      highlightDebugLine(execLines[nextIndex].lineNum);
    } else {
      highlightDebugLine(currentExec.lineNum);
    }
  };

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const formatCode = (rawCode) => {
    const lines = rawCode.split('\n');
    let currentIndent = 0;
    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      const isDeIndentKeyword = /^(else|unless)(\s|$)/.test(trimmed);
      let actualIndent = currentIndent;
      if (isDeIndentKeyword && currentIndent > 0) {
        actualIndent = currentIndent - 1;
      }
      const spaces = '  '.repeat(actualIndent);
      const isBlockStart = /^(loop|iterate|if|while|until|do|ForceErrors|CriticalErrors|SuppressErrors|else|unless)(\s|$)/.test(trimmed);
      if (isBlockStart) {
        currentIndent = actualIndent + 1;
      }
      return spaces + trimmed;
    }).join('\n');
  };

  const triggerAutoIndent = () => {
    const formatted = formatCode(code);
    setCode(formatted);
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: formatted } : f));
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      show: true
    });
  };

  const handleHighlight = (color) => {
    if (!editorRef.current || !monacoRef.current) return;
    const selection = editorRef.current.getSelection();
    if (!selection || (selection.startLineNumber === selection.endLineNumber && selection.startColumn === selection.endColumn)) {
      alert("Please select some text first to highlight!");
      return;
    }
    
    const className = `hl-${Math.random().toString(36).substring(2, 9)}`;
    const style = document.createElement('style');
    style.innerHTML = `.${className} { background-color: ${color} !important; color: #000 !important; font-weight: bold !important; }`;
    document.head.appendChild(style);
    
    const newDec = {
      range: new monacoRef.current.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      ),
      options: {
        inlineClassName: className
      }
    };
    
    const ids = editorRef.current.deltaDecorations([], [newDec]);
    setDecorationsList(prev => [...prev, { ids, className }]);
  };

  const clearAllHighlights = () => {
    if (!editorRef.current) return;
    decorationsList.forEach(dec => {
      editorRef.current.deltaDecorations(dec.ids, []);
    });
    setDecorationsList([]);
  };

  const addDescriptionComments = async () => {
    if (!editorRef.current) return;
    const selection = editorRef.current.getSelection();
    const selectedText = editorRef.current.getModel().getValueInRange(selection);
    const textToComment = selectedText.trim() ? selectedText : code;
    
    setIsAiOpen(true);
    setChatMessages(prev => [...prev, { type: 'user', text: 'Generate description comments.' }]);
    setChatMessages(prev => [...prev, { type: 'system', text: '⏳ VS# is generating line comments...' }]);
    
    try {
      const res = await fetch(`${VS_SHARP_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: textToComment, message: "add description comments" })
      });
      const data = await res.json();
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'system', text: data.response || "Done adding comments." }
      ]);
      if (data.action && data.action.type === 'edit') {
        if (selectedText.trim()) {
          const range = new monacoRef.current.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          );
          editorRef.current.executeEdits('', [{ range, text: data.action.code, forceMoveMarkers: true }]);
        } else {
          setCode(data.action.code);
          setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: data.action.code } : f));
        }
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'error', text: 'Failed to generate comments: ' + e.message }
      ]);
    }
  };

  const removeSyntaxErrors = async () => {
    if (!editorRef.current) return;
    setIsAiOpen(true);
    setChatMessages(prev => [...prev, { type: 'user', text: 'Fix all syntax errors in my code.' }]);
    setChatMessages(prev => [...prev, { type: 'system', text: '⏳ VS# is analyzing and repairing syntax...' }]);
    
    try {
      const res = await fetch(`${VS_SHARP_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, message: "fix syntax errors" })
      });
      const data = await res.json();
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'system', text: data.response || "Syntax repaired." }
      ]);
      if (data.action && data.action.type === 'edit') {
        setCode(data.action.code);
        setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: data.action.code } : f));
      }
    } catch (e) {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'error', text: 'Failed to fix syntax: ' + e.message }
      ]);
    }
  };

  const handleSelectFile = (fileName) => {
    if (isAnimatingRef.current) return;
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: code } : f));
    const selected = files.find(f => f.name === fileName);
    if (selected) {
      setActiveFileName(fileName);
      setCode(selected.content);
    }
    setIsSidebarOpen(false);
  };

  
  const toggleFolder = (folderName) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  const handleAddFolder = () => {
    const name = window.prompt('Enter new folder name:');
    if (!name || !name.trim()) return;
    const cleanName = name.trim().replace(/\/+$|^\/+/g, '');
    if (!cleanName) return;
    if (folders.includes(cleanName)) {
      alert('Folder already exists!');
      return;
    }
    setFolders(prev => [...prev, cleanName]);
  };

  const handleDeleteFolder = (folderName, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete folder "${folderName}" and all files inside it?`);
    if (!confirmed) return;

    const remainingFiles = files.filter(f => !f.name.startsWith(folderName + '/'));
    if (remainingFiles.length === 0) {
      alert('Cannot delete folder: at least one file must remain in workspace.');
      return;
    }
    setFiles(remainingFiles);
    setFolders(prev => prev.filter(f => f !== folderName));

    if (activeFileName.startsWith(folderName + '/')) {
      setActiveFileName(remainingFiles[0].name);
      setCode(remainingFiles[0].content);
    }
  };

  const handleAddFile = (e) => {
    e.preventDefault();
    let name = newFileName.trim();
    if (!name) return;
    if (targetFolder) {
      name = `${targetFolder}/${name}`;
    }
    if (!name.endsWith('.vrs')) {
      name += '.vrs';
    }
    if (files.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      alert('A file with this name already exists!');
      return;
    }
    const newFiles = files.map(f => f.name === activeFileName ? { ...f, content: code } : f);
    const newFile = { name, content: `! VerScript ${name}\n` };
    setFiles([...newFiles, newFile]);
    setActiveFileName(name);
    setCode(newFile.content);
    setNewFileName('');
  };

  const handleDeleteFile = (fileName, e) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert('Cannot delete the last remaining file.');
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete "${fileName}"?`);
    if (!confirmed) return;

    const remaining = files.filter(f => f.name !== fileName);
    setFiles(remaining);

    if (activeFileName === fileName) {
      const nextActive = remaining[0].name;
      setActiveFileName(nextActive);
      setCode(remaining[0].content);
    }
  };

  // Auto-scroll terminal and chat
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // ─── Animated code transition ────────────────────────────────────
  const animateTextTransition = async (startCode, targetCode) => {
    isAnimatingRef.current = true;
    setIsAnimating(true);
    let current = startCode;

    let idx = 0;
    while (idx < current.length && idx < targetCode.length && current[idx] === targetCode[idx]) idx++;
    const commonPrefix = current.slice(0, idx);

    const totalBackspaces = current.length - commonPrefix.length;
    const bsTime = Math.max(5, Math.min(30, Math.floor(1500 / (totalBackspaces || 1))));
    while (current.length > commonPrefix.length) {
      current = current.slice(0, -1);
      setCode(current);
      await sleep(bsTime);
    }

    const totalTyping = targetCode.length - commonPrefix.length;
    const typeTime = Math.max(8, Math.min(45, Math.floor(2000 / (totalTyping || 1))));
    while (current.length < targetCode.length) {
      current += targetCode[current.length];
      setCode(current);
      await sleep(typeTime);
    }

    isAnimatingRef.current = false;
    setIsAnimating(false);
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: targetCode } : f));
  };

  // ─── VS# Chat Submit ─────────────────────────────────────────────
  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAnimatingRef.current) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setChatInput('');
    setChatMessages(prev => [...prev, { type: 'system', text: '⏳ VS# is thinking...' }]);

    try {
      const res = await fetch(`${VS_SHARP_API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, message: userMsg })
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();

      // Replace the "thinking" placeholder with actual response
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'system', text: data.response || "Sorry, I couldn't process that." }
      ]);

      if (data.action && data.action.type === 'edit') {
        await animateTextTransition(code, data.action.code);
      }
    } catch (err) {
      setChatMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'system', text: `⚠️ Could not reach VS# backend: ${err.message}` }
      ]);
    }
  };

  // ─── Run Code via VS-Sharp /run endpoint ─────────────────────────
  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(prev => [...prev, { type: 'cmd', text: `VerScript ${activeFileName}>` }]);

    try {
      const res = await fetch(`${VS_SHARP_API}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      // Parse stdout lines
      if (data.output) {
        const lines = data.output.split('\n').filter(l => l !== '');
        lines.forEach(line => {
          const isError = line.startsWith('ERROR') || line.startsWith('LEXER ERROR');
          setOutput(prev => [...prev, { type: isError ? 'error' : 'success', text: line }]);
        });
      }

      // Any stderr / exec errors
      if (data.error && data.error.trim()) {
        data.error.trim().split('\n').forEach(line => {
          setOutput(prev => [...prev, { type: 'error', text: line }]);
        });
      }

      setOutput(prev => [...prev, { type: 'cmd', text: 'Program completed.' }]);
    } catch (err) {
      setOutput(prev => [
        ...prev,
        { type: 'error', text: `⚠️ Could not reach run endpoint: ${err.message}` },
        { type: 'error', text: 'Hint: The Render service may be waking up (free tier). Try again in ~30s.' }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearTerminal = () => {
    setOutput([
      { type: 'cmd',     text: 'VerScript VM v1.1.0 — powered by verscript-polyserver.onrender.com' },
      { type: 'success', text: 'Terminal cleared.' }
    ]);
  };

  return (
    <div className={`ide-container theme-${theme}`}>
      {/* ── Header ── */}
      <div className="ide-header">
        <div className="logo-container">
          <button
            className="btn btn-sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title="Toggle File Explorer"
            style={{ marginRight: '10px' }}
          >
            📂 Explorer
          </button>
          <div className="logo-text">VerScript IDE</div>
        </div>
        <div className="header-actions">
          <button
            id="btnVsSharp"
            className={`btn btn-ai ${isAiOpen ? 'active' : ''}`}
            onClick={() => setIsAiOpen(!isAiOpen)}
            title="Toggle VS# AI Assistant"
          >
            ✨ VS#
          </button>
          <a
            id="btnDocs"
            href="https://verscript.github.io/docs/index.html"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ textDecoration: 'none' }}
          >
            📖 Docs
          </a>

          <select
            className="btn"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value="cyberpunk">Cyberpunk Theme</option>
            <option value="monokai">Monokai Theme</option>
            <option value="solarized">Solarized Theme</option>
            <option value="light">Light Theme</option>
          </select>

          <select
            className="btn"
            onChange={(e) => handleSelectTemplate(e.target.value)}
            defaultValue=""
            style={{ padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value="" disabled>Select Template...</option>
            {Object.keys(TEMPLATES).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>

          <button id="btnShare" className="btn" onClick={handleShareCode} title="Share code">
            🔗 Share
          </button>
          <button
            id="btnRun"
            className="btn btn-run"
            onClick={handleRun}
            disabled={isRunning}
            title="Run your VerScript code"
          >
            {isRunning ? '⏳ Running…' : '▶ Run Code'}
          </button>
        </div>
      </div>

      <div className="ide-body">
        {/* ── Sidebar ── */}
        <div className={`sidebar ${isSidebarOpen ? 'open-mobile' : ''}`}>
          <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Explorer</span>
            <button className="btn-close-sidebar-mobile" onClick={() => setIsSidebarOpen(false)}>✕</button>
          </div>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ padding: '0 10px', marginTop: '10px' }}>
            <button className="btn" style={{ width: '100%', fontSize: '0.85rem' }} onClick={handleAddFolder}>
              + New Folder
            </button>
          </div>
          <form className="add-file-container" onSubmit={handleAddFile} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <select
              className="add-file-input"
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              style={{ padding: '4px' }}
            >
              <option value="">Root (/)</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}/</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                className="add-file-input"
                placeholder="New file.vrs..."
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-add-file">+</button>
            </div>
          </form>
          <ul className="file-list explorer-tree">
            {/* Root Files */}
            {files
              .filter(f => !f.name.includes('/'))
              .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(file => (
                <li
                  key={file.name}
                  className={`file-item ${activeFileName === file.name ? 'active' : ''}`}
                  onClick={() => handleSelectFile(file.name)}
                >
                  <img
                    src="https://github.com/VerScript.png"
                    alt="vrs"
                    style={{ width: '16px', height: '16px', borderRadius: '3px', marginRight: '6px' }}
                  />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {file.name}
                  </span>
                  <button
                    className="btn-delete-file"
                    onClick={(e) => handleDeleteFile(file.name, e)}
                    title="Delete file"
                  >
                    ✕
                  </button>
                </li>
              ))}

            {/* Folders */}
            {folders.map(folder => {
              const folderFiles = files.filter(f => f.name.startsWith(folder + '/'));
              if (searchQuery && !folderFiles.some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
                return null;
              }

              return (
                <div key={folder} className="folder-container">
                  <div
                    className="folder-header file-item"
                    onClick={() => toggleFolder(folder)}
                    style={{ cursor: 'pointer', paddingLeft: '5px' }}
                  >
                    <span style={{ marginRight: '6px', fontSize: '0.8em' }}>
                      {collapsedFolders[folder] ? '▶' : '▼'}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#BD93F9', flex: 1 }}>
                      {folder}
                    </span>
                    <button
                      className="btn-delete-file"
                      onClick={(e) => handleDeleteFolder(folder, e)}
                      title="Delete folder"
                    >
                      ✕
                    </button>
                  </div>

                  {!collapsedFolders[folder] && (
                    <ul className="folder-files">
                      {folderFiles
                        .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(file => (
                          <li
                            key={file.name}
                            className={`file-item ${activeFileName === file.name ? 'active' : ''}`}
                            onClick={() => handleSelectFile(file.name)}
                          >
                            <img
                              src="https://github.com/VerScript.png"
                              alt="vrs"
                              style={{ width: '16px', height: '16px', borderRadius: '3px', marginRight: '6px' }}
                            />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {file.name.replace(folder + '/', '')}
                            </span>
                            <button
                              className="btn-delete-file"
                              onClick={(e) => handleDeleteFile(file.name, e)}
                              title="Delete file"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </ul>
        </div>

        {/* ── Editor Area ── */}
        <div className="editor-container">
          <div className="editor-tabs">
            {files.map(file => (
              <div
                key={file.name}
                className={`editor-tab ${activeFileName === file.name ? 'active' : ''}`}
                onClick={() => handleSelectFile(file.name)}
              >
                {file.name}
              </div>
            ))}
          </div>

          <div className="editor-wrapper" onContextMenu={handleContextMenu}>
            {contextMenu?.show && (
              <div
                className="custom-context-menu"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onMouseLeave={() => setContextMenu(null)}
              >
                <div className="context-menu-item" onClick={() => { triggerAutoIndent(); setContextMenu(null); }}>
                  ✨ Auto-Indent
                </div>
                <div className="context-menu-divider" />
                <div className="context-menu-item" onClick={() => { handleHighlight('yellow'); setContextMenu(null); }}>
                  🖍️ Highlight Yellow
                </div>
                <div className="context-menu-item" onClick={() => { handleHighlight('cyan'); setContextMenu(null); }}>
                  🖍️ Highlight Cyan
                </div>
                <div className="context-menu-item" onClick={() => { clearAllHighlights(); setContextMenu(null); }}>
                  🧹 Clear Highlights
                </div>
                <div className="context-menu-divider" />
                <div className="context-menu-item" onClick={() => { addDescriptionComments(); setContextMenu(null); }}>
                  📝 Add AI Comments
                </div>
                <div className="context-menu-item" onClick={() => { removeSyntaxErrors(); setContextMenu(null); }}>
                  🔧 Fix Syntax Errors
                </div>
              </div>
            )}

            {isDebugMode && (
              <div className="debug-bar">
                <span>🐞 <strong>Debugger Active</strong></span>
                <button className="btn" onClick={stepNextLine}>⏭️ Next Step</button>
                <button className="btn" onClick={startDebugger}>🔄 Restart</button>
                <button className="btn" onClick={stopDebugger}>⏹️ Exit</button>
              </div>
            )}
            <Editor
              height="100%"
              language="verscript"
              beforeMount={handleEditorWillMount}
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
              }}
              theme={theme}
              value={code}
              onChange={(value) => {
                if (!isAnimatingRef.current) {
                  const val = value || '';
                  setCode(val);
                  setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: val } : f));
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Courier New', Courier, monospace",
                padding: { top: 20 },
                readOnly: isAnimating,
                wordWrap: 'on',
                scrollBeyondLastLine: false
              }}
            />

            {/* ── VS# AI Panel ── */}
            <div className={`ai-panel ${isAiOpen ? 'open' : ''}`}>
              <div className="ai-header">
                <span>✨ VS#-1B Assistant (1B Params)</span>
                <button
                  id="btnCloseAi"
                  onClick={() => setIsAiOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem' }}
                  aria-label="Close VS# panel"
                >
                  ✕
                </button>
              </div>
              <div className="ai-messages" ref={chatRef}>
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`ai-msg ${msg.type}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form className="ai-input-area" onSubmit={handleAiSubmit}>
                <input
                  id="aiChatInput"
                  type="text"
                  className="ai-input"
                  placeholder="Ask VS#-1B (1B Parameters) about your code…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAnimating}
                />
              </form>
            </div>
          </div>

          {/* ── Resizable Terminal Handle ── */}
          <div
            className={`terminal-resizer ${isResizing ? 'active' : ''}`}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            title="Drag to resize terminal"
          >
            <div className="resizer-bar" />
          </div>

          {/* ── Terminal Panel ── */}
          <div
            className={`terminal-panel ${activeMobileTab === 'terminal' ? 'mobile-show' : ''}`}
            style={{ height: terminalHeight }}
          >
            <div className="terminal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Terminal Output</span>
              <button
                id="btnClearTerminal"
                onClick={handleClearTerminal}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.75rem' }}
                title="Clear terminal"
              >
                clear
              </button>
            </div>
            <div className="terminal-output" ref={terminalRef} style={{ display: 'flex', flexDirection: 'column' }}>
              {output.map((line, i) => (
                <div key={i} className={`terminal-line ${line.type}`}>
                  {renderAnsiLine(line.text)}
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile Navigation Bar ── */}
          <div className="mobile-tab-bar">
            <button
              className={`mobile-tab-btn ${activeMobileTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('editor')}
            >
              📝 Editor
            </button>
            <button
              className={`mobile-tab-btn ${activeMobileTab === 'ai' ? 'active' : ''}`}
              onClick={() => { setActiveMobileTab('ai'); setIsAiOpen(true); }}
            >
              ✨ Assistant
            </button>
            <button
              className={`mobile-tab-btn ${activeMobileTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveMobileTab('terminal')}
            >
              🖥️ Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
