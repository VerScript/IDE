import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Backend URL ──────────────────────────────────────────────────
const VS_SHARP_API = 'https://verscript-polyserver.onrender.com/vs-sharp';

const handleEditorWillMount = (monaco) => {
  const languages = monaco.languages.getLanguages();
  if (languages.some(lang => lang.id === 'verscript')) return;

  monaco.languages.register({ id: 'verscript' });

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
            '@default': 'identifier'
          }
        }],
        [/[0-9]+/, 'number'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/![^\n]*/, 'comment'],
        [/[+\-*/:]/, 'operators']
      ]
    }
  });

  monaco.languages.registerCompletionItemProvider('verscript', {
    provideCompletionItems: (model, position) => {
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
        }
      ];
      return { suggestions };
    }
  });
};

function App() {
  const [files, setFiles] = useState([
    { name: 'test.vrs', content: '! Welcome to VerScript IDE\n! Try: display "Hello World"\n\nname : "World"\ndisplay "Hello "\ndisplay name' },
    { name: 'loops.vrs', content: '! Testing Loops\niterate i from 1 to 5\n  display i' }
  ]);
  const [activeFileName, setActiveFileName] = useState('test.vrs');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFileName, setNewFileName] = useState('');

  const [code, setCode] = useState(
    '! Welcome to VerScript IDE\n! Try: display "Hello World"\n\nname : "World"\ndisplay "Hello "\ndisplay name'
  );
  const [output, setOutput] = useState([
    { type: 'cmd',     text: 'VerScript VM v1.1.0 — powered by verscript-polyserver.onrender.com' },
    { type: 'success', text: 'Ready. Press ▶ Run Code to execute.' }
  ]);
  const [isRunning, setIsRunning] = useState(false);

  // VS# State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'system', text: "I'm VS#, your VerScript AI assistant. I run on a custom neural network trained from scratch. Ask me to explain, write, or fix your code!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  const terminalRef = useRef(null);
  const chatRef = useRef(null);

  const handleSelectFile = (fileName) => {
    if (isAnimatingRef.current) return;
    setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, content: code } : f));
    const selected = files.find(f => f.name === fileName);
    if (selected) {
      setActiveFileName(fileName);
      setCode(selected.content);
    }
  };

  const handleAddFile = (e) => {
    e.preventDefault();
    let name = newFileName.trim();
    if (!name) return;
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
    setOutput(prev => [...prev, { type: 'cmd', text: '> verscript test.vrs' }]);

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
    <div className="ide-container">
      {/* ── Header ── */}
      <div className="ide-header">
        <div className="logo-container">
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
          <button id="btnShare" className="btn" onClick={() => {
            navigator.clipboard?.writeText(code);
          }} title="Copy code to clipboard">
            📋 Copy
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
        <div className="sidebar">
          <div className="sidebar-header">Explorer</div>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <form className="add-file-container" onSubmit={handleAddFile}>
            <input
              type="text"
              className="add-file-input"
              placeholder="New file.vrs..."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
            <button type="submit" className="btn-add-file">+</button>
          </form>
          <ul className="file-list">
            {files
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

          <div className="editor-wrapper">
            <Editor
              height="100%"
              language="verscript"
              beforeMount={handleEditorWillMount}
              theme="vs-dark"
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
                <span>✨ VS# Assistant</span>
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
                  placeholder="Ask VS# about your code…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={isAnimating}
                />
              </form>
            </div>
          </div>

          {/* ── Terminal ── */}
          <div className="terminal-panel">
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
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
