import { useState } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [code, setCode] = useState('display "Hello World\n! VS# knows there is a missing quote here');
  const [output, setOutput] = useState([
    { type: 'cmd', text: 'VerScript VM initialized v1.1.0' },
    { type: 'success', text: 'Ready for execution. (Math & Variables Enabled)' }
  ]);
  const [isPrompting, setIsPrompting] = useState(false);
  const [promptVar, setPromptVar] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [variables, setVariables] = useState({});
  const [executionQueue, setExecutionQueue] = useState([]);
  
  // VS# State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'system', text: "I'm VS#, your VerScript AI assistant. I'm connected to your editor! Ask me to check your code." }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setChatInput('');

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, message: userMsg })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { type: 'system', text: data.response || "Sorry, I couldn't process that." }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { type: 'system', text: "Error connecting to VS# Backend on port 3001." }]);
    }
  };

  const executeLine = (line, currentVars) => {
    let trimmed = line;
    const commentIdx = trimmed.indexOf('!');
    if (commentIdx !== -1) {
      trimmed = trimmed.substring(0, commentIdx);
    }
    trimmed = trimmed.trim();
    if (!trimmed) return { vars: currentVars, wait: false };

    // Handle string display
    if (trimmed.startsWith('display "') && trimmed.endsWith('"')) {
      const content = trimmed.substring(9, trimmed.length - 1);
      setOutput(prev => [...prev, { type: 'success', text: content }]);
      return { vars: currentVars, wait: false };
    }

    // Handle variable/math display
    if (trimmed.startsWith('display ')) {
      const expr = trimmed.substring(8).trim();
      try {
        let evalStr = expr;
        Object.keys(currentVars).forEach(k => {
          const val = currentVars[k];
          evalStr = evalStr.replace(new RegExp(`\\b${k}\\b`, 'g'), typeof val === 'string' ? `"${val}"` : val);
        });
        
        if (evalStr.startsWith('"') && evalStr.endsWith('"')) {
          setOutput(prev => [...prev, { type: 'success', text: evalStr.substring(1, evalStr.length - 1) }]);
        } else {
          const result = eval(evalStr);
          setOutput(prev => [...prev, { type: 'success', text: result.toString() }]);
        }
      } catch (e) {
        setOutput(prev => [...prev, { type: 'error', text: `ERROR: Cannot evaluate '${expr}'` }]);
      }
      return { vars: currentVars, wait: false };
    }

    // Handle prompt
    if (trimmed.startsWith('prompt ')) {
      const varName = trimmed.substring(7).trim();
      setPromptVar(varName);
      setIsPrompting(true);
      return { vars: currentVars, wait: true };
    }

    // Handle variable assignment (var: expr)
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      const varName = parts[0].trim();
      const expr = parts.slice(1).join(':').trim();
      
      if (expr.startsWith('"') && expr.endsWith('"')) {
        currentVars[varName] = expr.substring(1, expr.length - 1);
      } else {
        try {
          let evalStr = expr;
          Object.keys(currentVars).forEach(k => {
            evalStr = evalStr.replace(new RegExp(`\\b${k}\\b`, 'g'), currentVars[k]);
          });
          currentVars[varName] = eval(evalStr);
        } catch (e) {
          setOutput(prev => [...prev, { type: 'error', text: `ERROR: Invalid expression '${expr}'` }]);
        }
      }
      return { vars: currentVars, wait: false };
    }

    setOutput(prev => [...prev, { type: 'error', text: `ERROR: Syntax error near '${trimmed}'` }]);
    return { vars: currentVars, wait: false };
  };

  const processQueue = (queue, vars) => {
    let currentVars = { ...vars };
    for (let i = 0; i < queue.length; i++) {
      const result = executeLine(queue[i], currentVars);
      currentVars = result.vars;
      if (result.wait) {
        setExecutionQueue(queue.slice(i + 1));
        setVariables(currentVars);
        return; 
      }
    }
    
    setOutput(prev => [...prev, { type: 'cmd', text: 'Program completed successfully.' }]);
    setExecutionQueue([]);
    setVariables(currentVars);
  };

  const handleRun = () => {
    setOutput(prev => [...prev, { type: 'cmd', text: '> verscript test.vrs' }]);
    setIsPrompting(false);
    const lines = code.split('\n');
    processQueue(lines, {});
  };

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    const parsedVal = isNaN(Number(inputValue)) || inputValue.trim() === '' ? inputValue : Number(inputValue);
    const newVars = { ...variables, [promptVar]: parsedVal };
    setVariables(newVars);
    setOutput(prev => [...prev, { type: 'success', text: `> ${inputValue}` }]);
    setIsPrompting(false);
    setInputValue('');
    processQueue(executionQueue, newVars);
  };

  return (
    <div className="ide-container">
      {/* Header */}
      <div className="ide-header">
        <div className="logo-container">
          <div className="logo-text">VerScript IDE</div>
        </div>
        <div className="header-actions">
          <button 
            className={`btn btn-ai ${isAiOpen ? 'active' : ''}`} 
            onClick={() => setIsAiOpen(!isAiOpen)}
          >
            ✨ VS#
          </button>
          <a href="http://localhost:8000/docs/index.html" target="_blank" rel="noreferrer" className="btn" style={{textDecoration: 'none'}}>📖 Docs</a>
          <button className="btn">Share</button>
          <button className="btn btn-run" onClick={handleRun}>▶ Run Code</button>
        </div>
      </div>

      <div className="ide-body">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">Explorer</div>
          <ul className="file-list">
            <li className="file-item active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              test.vrs
            </li>
          </ul>
        </div>

        {/* Editor Area */}
        <div className="editor-container">
          <div className="editor-tabs">
            <div className="editor-tab active">test.vrs</div>
          </div>
          
          <div className="editor-wrapper">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Courier New', Courier, monospace",
                padding: { top: 20 }
              }}
            />
            
            {/* AI Panel Overlay */}
            <div className={`ai-panel ${isAiOpen ? 'open' : ''}`}>
              <div className="ai-header">
                <span>✨ VS# Assistant</span>
                <button onClick={() => setIsAiOpen(false)} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>✕</button>
              </div>
              <div className="ai-messages">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`ai-msg ${msg.type}`}>
                    {msg.text}
                  </div>
                ))}
              </div>
              <form className="ai-input-area" onSubmit={handleAiSubmit}>
                <input 
                  type="text" 
                  className="ai-input" 
                  placeholder="Ask VS# about your code..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
              </form>
            </div>
          </div>
          
          {/* Terminal Area */}
          <div className="terminal-panel">
            <div className="terminal-header">Terminal Output</div>
            <div className="terminal-output" style={{display: 'flex', flexDirection: 'column'}}>
              {output.map((line, i) => (
                <div key={i} className={`terminal-line ${line.type}`}>
                  {line.text}
                </div>
              ))}
              
              {isPrompting && (
                <form onSubmit={handlePromptSubmit} style={{display: 'flex', marginTop: '5px'}}>
                  <span style={{color: '#00FFCC', marginRight: '8px'}}>[PROMPT: {promptVar}] &gt;</span>
                  <input 
                    autoFocus
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                      background: 'transparent', 
                      border: 'none', 
                      color: 'white', 
                      outline: 'none', 
                      flex: 1,
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: '0.9rem'
                    }} 
                  />
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
