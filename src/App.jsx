import { simulateVerScriptAsync } from './instantVM.js';
import { useState, useRef, useEffect } from 'react';
import Editor from './MonacoEditor.jsx';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const VS_SHARP_API = 'https://verscript-polyserver.onrender.com/vs-sharp';

// ─── PURE JS ZIP GENERATOR FOR PROJECT EXPORT ───
function createZip(files) {
  const makeCrcTable = () => {
    let c;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c >>> 0;
    }
    return table;
  };
  const crcTable = makeCrcTable();
  const getCrc32 = (bytes) => {
    let crc = 0 ^ (-1);
    for (let i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  };

  const textEncoder = new TextEncoder();
  const fileRecords = [];

  for (const f of files) {
    const nameBytes = textEncoder.encode(f.name);
    const contentBytes = textEncoder.encode(f.content || '');
    const crc = getCrc32(contentBytes);
    fileRecords.push({
      nameBytes,
      contentBytes,
      crc,
      uncompressedSize: contentBytes.length,
      compressedSize: contentBytes.length,
      modTime: 0,
      modDate: 0
    });
  }

  let localHeadersSize = 0;
  let cdSize = 0;
  for (const r of fileRecords) {
    localHeadersSize += 30 + r.nameBytes.length + r.contentBytes.length;
    cdSize += 46 + r.nameBytes.length;
  }
  const totalSize = localHeadersSize + cdSize + 22;

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);
  let offset = 0;

  for (const r of fileRecords) {
    r.localHeaderOffset = offset;
    view.setUint32(offset, 0x04034b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 0, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, r.modTime, true);
    view.setUint16(offset + 12, r.modDate, true);
    view.setUint32(offset + 14, r.crc, true);
    view.setUint32(offset + 18, r.compressedSize, true);
    view.setUint32(offset + 22, r.uncompressedSize, true);
    view.setUint16(offset + 26, r.nameBytes.length, true);
    view.setUint16(offset + 28, 0, true);
    offset += 30;

    buffer.set(r.nameBytes, offset);
    offset += r.nameBytes.length;

    buffer.set(r.contentBytes, offset);
    offset += r.contentBytes.length;
  }

  const cdOffset = offset;

  for (const r of fileRecords) {
    view.setUint32(offset, 0x02014b50, true);
    view.setUint16(offset + 4, 20, true);
    view.setUint16(offset + 6, 20, true);
    view.setUint16(offset + 8, 0, true);
    view.setUint16(offset + 10, 0, true);
    view.setUint16(offset + 12, r.modTime, true);
    view.setUint16(offset + 14, r.modDate, true);
    view.setUint32(offset + 16, r.crc, true);
    view.setUint32(offset + 20, r.compressedSize, true);
    view.setUint32(offset + 24, r.uncompressedSize, true);
    view.setUint16(offset + 28, r.nameBytes.length, true);
    view.setUint16(offset + 30, 0, true);
    view.setUint16(offset + 32, 0, true);
    view.setUint16(offset + 34, 0, true);
    view.setUint16(offset + 36, 0, true);
    view.setUint32(offset + 38, 0, true);
    view.setUint32(offset + 42, r.localHeaderOffset, true);
    offset += 46;

    buffer.set(r.nameBytes, offset);
    offset += r.nameBytes.length;
  }

  view.setUint32(offset, 0x06054b50, true);
  view.setUint16(offset + 4, 0, true);
  view.setUint16(offset + 6, 0, true);
  view.setUint16(offset + 8, fileRecords.length, true);
  view.setUint16(offset + 10, fileRecords.length, true);
  view.setUint32(offset + 12, cdSize, true);
  view.setUint32(offset + 16, cdOffset, true);
  view.setUint16(offset + 20, 0, true);

  return buffer;
}


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
            // Core keywords
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
            'alias': 'keyword',
            'step': 'keyword',
            'DataType': 'keyword',
            'extends': 'keyword',
            'it': 'keyword',
            'num': 'keyword',
            'bool': 'keyword',
            'str': 'keyword',
            'arr': 'keyword',
            'entity': 'keyword',
            'set': 'keyword',
            'def': 'keyword',
            'func': 'keyword',
            'method': 'keyword',
            'inbound': 'keyword',
            'outbound': 'keyword',
            'outscope': 'keyword',
            'reply': 'keyword',
            'class': 'keyword',
            'lib': 'keyword',
            'library': 'keyword',
            'load': 'keyword',
            'import': 'keyword',
            'static': 'keyword',
            'dynamic': 'keyword',
            'const': 'keyword',
            'public': 'keyword',
            'private': 'keyword',
            'temp': 'keyword',
            'inst': 'keyword',
            'del': 'keyword',
            'on': 'keyword',
            'when': 'keyword',
            'emit': 'keyword',
            'async': 'keyword',
            'sync': 'keyword',
            'guard': 'keyword',
            'chan': 'keyword',
            'send': 'keyword',
            'recv': 'keyword',
            'match': 'keyword',
            'with': 'keyword',
            'start': 'keyword',
            'complete': 'keyword',
            'interval': 'keyword',
            'timeout': 'keyword',
            'by': 'keyword',
            'is': 'keyword',
            'even': 'keyword',
            'odd': 'keyword',
            'isEven': 'keyword',
            'isOdd': 'keyword',
            'and': 'keyword',
            'or': 'keyword',
            'not': 'keyword',

            // Header System & Pragmas & Structs
            'header': 'keyword',
            'include': 'keyword',
            'pragma': 'keyword',
            'once': 'keyword',
            'strict': 'keyword',
            'export': 'keyword',
            'struct': 'keyword',
            'enum': 'keyword',
            'config': 'keyword',
            'strict_mode': 'keyword',
            'error_mode': 'keyword',
            'timeout_ms': 'keyword',
            'target_version': 'keyword',
            'log_level': 'keyword',

            // All 21 Standard Libraries
            'Math': 'keyword',
            'Matrix': 'keyword',
            'Vector': 'keyword',
            'Stats': 'keyword',
            'Pseudo': 'keyword',
            'Random': 'keyword',
            'Arrays': 'keyword',
            'Strings': 'keyword',
            'Json': 'keyword',
            'Validate': 'keyword',
            'Crypto': 'keyword',
            'Regex': 'keyword',
            'Fs': 'keyword',
            'Path': 'keyword',
            'Env': 'keyword',
            'Time': 'keyword',
            'Http': 'keyword',
            'Log': 'keyword',
            'Color': 'keyword',
            'Console': 'keyword',
            'Benchmark': 'keyword',
            'Mock': 'keyword',
            'Assert': 'keyword',

            // All 29 Standard Error Types
            'MemoryAllocationError': 'keyword',
            'UndefinedVariableError': 'keyword',
            'InvalidOperandError': 'keyword',
            'DivisionByZeroError': 'keyword',
            'IndentationError': 'keyword',
            'LoopIterationError': 'keyword',
            'LoopLimitError': 'keyword',
            'LoopDirectionError': 'keyword',
            'LoopStepError': 'keyword',
            'ScopeViolationError': 'keyword',
            'SyntaxError': 'keyword',
            'RuntimeError': 'keyword',
            'InvalidErrorNameError': 'keyword',
            'SystemError': 'keyword',
            'VisibilityError': 'keyword',
            'ImmutableError': 'keyword',
            'IndexOutOfBoundsError': 'keyword',
            'EntityError': 'keyword',
            'FileError': 'keyword',
            'DomainError': 'keyword',
            'AssertError': 'keyword',
            'DataTypeError': 'keyword',
            'UnassignedVariableError': 'keyword',
            'AsyncError': 'keyword',
            'ChannelError': 'keyword',
            'MatchError': 'keyword',
            'OperationError': 'keyword',
            'HeaderMismatchError': 'keyword',
            'InvalidHeaderError': 'keyword',

            '@default': 'identifier'
          }
        }],
        [/[0-9]+/, 'number'],
        [/"([^"\\]|\\.)*"/, 'string'],
        [/![^\n]*/, 'comment'],
        [/[+\-*/:=><^!|&%?~]|x=|\|>|\/\/|::|->/, 'operators']
      ]
    }
  });

  // ─── MONACO AUTOCOMPLETE FOR ALL 118 KEYWORDS, 29 ERRORS & 21 STDLIB MODULES ───
  monaco.languages.registerCompletionItemProvider('verscript', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const keywords = [
        { label: 'display', insertText: 'display ${1:expression}', isSnippet: true, detail: 'Print value to stdout with optional ?color attribute' },
        { label: 'prompt', insertText: 'prompt ${1:variable} ?default="${2:Explorer}"', isSnippet: true, detail: 'Read interactive input from console stdin' },
        { label: 'true', insertText: 'true', detail: 'Boolean true' },
        { label: 'false', insertText: 'false', detail: 'Boolean false' },
        { label: 'loop', insertText: 'loop ${1:5}\n\t$0', isSnippet: true, detail: 'Repeat block n times' },
        { label: 'iterate', insertText: 'iterate ${1:i} from ${2:1} to ${3:10} step ${4:1}\n\t$0', isSnippet: true, detail: 'Iterate i from start to end with step override' },
        { label: 'from', insertText: 'from ', detail: 'Loop range lower bound' },
        { label: 'to', insertText: 'to ', detail: 'Loop range upper bound' },
        { label: 'step', insertText: 'step ${1:2}', isSnippet: true, detail: 'Loop step increment override' },
        { label: 'by', insertText: 'by ${1:2}', isSnippet: true, detail: 'Step increment alias' },
        { label: 'if', insertText: 'if ${1:condition} then\n\t$0', isSnippet: true, detail: 'If conditional branch' },
        { label: 'then', insertText: 'then', detail: 'Then conditional block prefix' },
        { label: 'else if', insertText: 'else if ${1:condition} then\n\t$0', isSnippet: true, detail: 'Else If conditional branch' },
        { label: 'else', insertText: 'else\n\t$0', isSnippet: true, detail: 'Else fallback branch' },
        { label: 'while', insertText: 'while ${1:condition}\n\t$0', isSnippet: true, detail: 'While loop' },
        { label: 'until', insertText: 'until ${1:condition}\n\t$0', isSnippet: true, detail: 'Until loop (loops while condition is false)' },
        { label: 'do', insertText: 'do\n\t$0\nunless ${1:error}', isSnippet: true, detail: 'Try-Unless exception handling block' },
        { label: 'unless', insertText: 'unless ${1:condition}\n\t$0', isSnippet: true, detail: 'Exception catcher / reactive watch block' },
        { label: 'unless internal', insertText: 'unless internal ${1:state_flag}\n\t$0', isSnippet: true, detail: 'Watch internal reactive state changes' },
        { label: 'unless external', insertText: 'unless external ${1:event}\n\t$0', isSnippet: true, detail: 'Watch external reactive trigger' },
        { label: 'internal', insertText: 'internal', detail: 'Internal state modifier' },
        { label: 'external', insertText: 'external', detail: 'External trigger modifier' },
        { label: 'error', insertText: 'error', detail: 'Caught error object / message symbol' },
        { label: 'ForceErrors', insertText: 'ForceErrors\n\t$0', isSnippet: true, detail: 'Execute block forcing strict error reporting' },
        { label: 'CriticalErrors', insertText: 'CriticalErrors\n\t$0', isSnippet: true, detail: 'Execute block throwing critical errors only' },
        { label: 'SuppressErrors', insertText: 'SuppressErrors\n\t$0', isSnippet: true, detail: 'Execute block suppressing all runtime errors' },
        { label: 'throw', insertText: 'throw ${1:RuntimeError} ?msg="${2:Error description}"', isSnippet: true, detail: 'Throw error with custom ?msg and ?code attributes' },
        { label: 'inject', insertText: 'inject ${1:python}\n\t$0', isSnippet: true, detail: 'Inject code from 100+ languages (python, js, c, cpp, etc.)' },
        { label: 'alias', insertText: 'alias ${1:display}: ${2:print} ? ${3:color}=${4:tint}', isSnippet: true, detail: 'Define keyword alias with attribute remapping' },
        { label: 'header', insertText: 'header ${1:ServiceName}:\n    func ${2:methodName}(${3:args})', isSnippet: true, detail: 'Declare a typed interface contract header' },
        { label: 'include', insertText: 'include "${1:include/service.h.vrs}"', isSnippet: true, detail: 'Include a header interface contract' },
        { label: 'pragma', insertText: 'pragma ${1|once,strict|}', isSnippet: true, detail: 'Compiler directive' },
        { label: 'pragma once', insertText: 'pragma once', detail: 'Prevent duplicate header inclusions' },
        { label: 'pragma strict', insertText: 'pragma strict', detail: 'Enforce strict type checking and contract conformity' },
        { label: 'export', insertText: 'export ${1:symbol}', isSnippet: true, detail: 'Export symbol from module' },
        { label: 'struct', insertText: 'struct ${1:RecordName}:\n    ${2:id}: ${3:num}\n    ${4:name}: ${5:str}', isSnippet: true, detail: 'Declare a structured typed data record' },
        { label: 'enum', insertText: 'enum ${1:Status}:\n    ${2:PENDING} : 0\n    ${3:ACTIVE} : 1\n    ${4:COMPLETED} : 2', isSnippet: true, detail: 'Declare an enumerated constant mapping' },
        { label: 'config', insertText: 'config ${1|strict_mode,error_mode,timeout_ms,target_version,log_level|}: ${2:value}', isSnippet: true, detail: 'Configure runtime options' },
        { label: 'DataType', insertText: 'DataType ${1:CustomType} extends ${2|num,str,bool,arr|}\n  it ${3:>= 0}', isSnippet: true, detail: 'Declare custom constrained scalar type' },
        { label: 'extends', insertText: 'extends ', detail: 'Inherit from primitive type in DataType declaration' },
        { label: 'it', insertText: 'it', detail: 'Constraint evaluation subject in DataType block' },
        { label: 'num', insertText: 'num ', detail: 'Numeric primitive type' },
        { label: 'bool', insertText: 'bool ', detail: 'Boolean primitive type' },
        { label: 'str', insertText: 'str ', detail: 'String primitive type' },
        { label: 'arr', insertText: 'arr ', detail: 'Array primitive type' },
        { label: 'entity', insertText: 'entity ', detail: 'Object entity primitive type' },
        { label: 'set', insertText: 'set ${1:varName}: ${2:value}', isSnippet: true, detail: 'Assign variable value' },
        { label: 'def', insertText: 'def func ${1:name} ${2:param}\n  reply ${3:result}', isSnippet: true, detail: 'Function definition prefix' },
        { label: 'func', insertText: 'func ${1:name}(${2:params}):\n    reply ${3:result}', isSnippet: true, detail: 'Function declaration' },
        { label: 'method', insertText: 'method ${1:name}(${2:params}):\n    reply ${3:result}', isSnippet: true, detail: 'Method declaration inside class or library' },
        { label: 'inbound', insertText: 'inbound', detail: 'Inbound parameter modifier' },
        { label: 'outbound', insertText: 'outbound', detail: 'Outbound parameter modifier' },
        { label: 'outscope', insertText: 'outscope', detail: 'Outscope closure variable modifier' },
        { label: 'reply', insertText: 'reply ${1:value}', isSnippet: true, detail: 'Return result from function or method' },
        { label: 'class', insertText: 'class ${1:ClassName}:\n    $0', isSnippet: true, detail: 'Define object-oriented class' },
        { label: 'lib', insertText: 'lib ${1:LibName}\n  dynamic:\n    def func ${2:example}\n      reply ${3:42}', isSnippet: true, detail: 'Define modular library block' },
        { label: 'library', insertText: 'library ${1:LibName}\n  dynamic:\n    def func ${2:example}\n      reply ${3:42}', isSnippet: true, detail: 'Library definition alias' },
        { label: 'load', insertText: 'load ${1|Matrix,Vector,Math,Stats,Pseudo,Fs,Path,Env,Time,Http,Json,Crypto,Regex,Arrays,Strings,Log,Color,Console,Benchmark,Mock,Assert|}', isSnippet: true, detail: 'Load standard library or native module into memory' },
        { label: 'import', insertText: 'import "${1:library_file}"', isSnippet: true, detail: 'Import external VerScript library' },
        { label: 'static', insertText: 'static:\n    $0', isSnippet: true, detail: 'Static module members section' },
        { label: 'dynamic', insertText: 'dynamic:\n    $0', isSnippet: true, detail: 'Dynamic module members section' },
        { label: 'const', insertText: 'const ${1:NAME}: ${2:value}', isSnippet: true, detail: 'Immutable constant variable' },
        { label: 'public', insertText: 'public ', detail: 'Public member visibility' },
        { label: 'private', insertText: 'private ', detail: 'Private member visibility' },
        { label: 'temp', insertText: 'temp ${1:varName}: ${2:value}', isSnippet: true, detail: 'Scoped temporary variable' },
        { label: 'inst', insertText: 'inst ${1:instance}: ${2:ClassName}()', isSnippet: true, detail: 'Instantiate class' },
        { label: 'del', insertText: 'del ${1:varName}', isSnippet: true, detail: 'Delete variable from current scope' },
        { label: 'on', insertText: 'on ${1:event} do\n    $0', isSnippet: true, detail: 'Register event handler' },
        { label: 'when', insertText: 'when ${1:condition} do\n    $0', isSnippet: true, detail: 'Reactive state trigger' },
        { label: 'emit', insertText: 'emit ${1:eventName} ?data=${2:payload}', isSnippet: true, detail: 'Emit asynchronous event' },
        { label: 'async', insertText: 'async func ${1:name}():\n    $0', isSnippet: true, detail: 'Asynchronous task definition' },
        { label: 'sync', insertText: 'sync ${1:task}', isSnippet: true, detail: 'Synchronize async execution' },
        { label: 'guard', insertText: 'guard ${1:condition} else reply ${2:null}', isSnippet: true, detail: 'Guard condition with early exit' },
        { label: 'chan', insertText: 'set ${1:ch}: chan(${2:5})', isSnippet: true, detail: 'Create concurrency channel with capacity' },
        { label: 'send', insertText: 'send ${1:ch} <- ${2:val}', isSnippet: true, detail: 'Send value into concurrency channel' },
        { label: 'recv', insertText: 'recv ${1:val} <- ${2:ch}', isSnippet: true, detail: 'Receive value from concurrency channel' },
        { label: 'match', insertText: 'match ${1:expr} with\n    ${2:pattern} -> ${3:action}', isSnippet: true, detail: 'Pattern matching construct' },
        { label: 'with', insertText: 'with ', detail: 'Match statement pattern target' },
        { label: 'is', insertText: 'is ', detail: 'Comparison operator keyword' },
        { label: 'even', insertText: 'is even', detail: 'Parity check operator' },
        { label: 'odd', insertText: 'is odd', detail: 'Parity check operator' },
        { label: 'isEven', insertText: 'isEven', detail: 'Parity check function' },
        { label: 'isOdd', insertText: 'isOdd', detail: 'Parity check function' },
        { label: 'and', insertText: 'and ', detail: 'Logical AND operator' },
        { label: 'or', insertText: 'or ', detail: 'Logical OR operator' },
        { label: 'not', insertText: 'not ', detail: 'Logical NOT operator' },
        { label: 'xor', insertText: 'xor ', detail: 'Bitwise / Logical XOR operator' },
        { label: 'shl', insertText: 'shl ', detail: 'Bitwise shift left' },
        { label: 'shr', insertText: 'shr ', detail: 'Bitwise shift right' }
      ];

      const attributes = [
        { label: '?color=', insertText: '?color="${1|green,cyan,yellow,red,purple,blue,white|}"', isSnippet: true, detail: 'Attribute: Colorize output with named color' },
        { label: '?color=#', insertText: '?color=#${1:00ffcc}', isSnippet: true, detail: 'Attribute: Colorize output with 24-bit Truecolor hex' },
        { label: '?tint=', insertText: '?tint="${1|green,cyan,yellow,red,purple,blue|}"', isSnippet: true, detail: 'Attribute: Tint alias for color' },
        { label: '?newline=false', insertText: '?newline=false', detail: 'Attribute: Print inline segment without trailing newline' },
        { label: '?default=', insertText: '?default="${1:Explorer}"', isSnippet: true, detail: 'Attribute: Default fallback value for prompt stdin' },
        { label: '?msg=', insertText: '?msg="${1:Custom error message}"', isSnippet: true, detail: 'Attribute: Custom error message attached to throw' },
        { label: '?code=', insertText: '?code=${1:500}', isSnippet: true, detail: 'Attribute: Numerical error code' },
        { label: '?retry=', insertText: '?retry=${1:3}', isSnippet: true, detail: 'Attribute: Retry count for operation' },
        { label: '?catch=', insertText: '?catch=${1:RuntimeError}', isSnippet: true, detail: 'Attribute: Inline error handler' },
        { label: '?timeout=', insertText: '?timeout=${1:1000}', isSnippet: true, detail: 'Attribute: Execution timeout in milliseconds' }
      ];

      const errors = [
        'MemoryAllocationError', 'UndefinedVariableError', 'InvalidOperandError', 'DivisionByZeroError',
        'IndentationError', 'LoopIterationError', 'LoopLimitError', 'LoopDirectionError',
        'LoopStepError', 'ScopeViolationError', 'SyntaxError', 'RuntimeError',
        'InvalidErrorNameError', 'SystemError', 'VisibilityError', 'ImmutableError',
        'IndexOutOfBoundsError', 'EntityError', 'FileError', 'DomainError',
        'AssertError', 'DataTypeError', 'UnassignedVariableError', 'AsyncError',
        'ChannelError', 'MatchError', 'OperationError', 'HeaderMismatchError', 'InvalidHeaderError'
      ].map(err => ({
        label: err,
        insertText: err,
        kind: monaco.languages.CompletionItemKind.Class,
        detail: 'Standard Error Type'
      }));

      const stdlibs = [
        // Matrix
        { label: 'Matrix.create', insertText: 'Matrix.create(${1:rows}, ${2:cols})', isSnippet: true, detail: 'Create zero matrix (r x c)' },
        { label: 'Matrix.identity', insertText: 'Matrix.identity(${1:size})', isSnippet: true, detail: 'Create n x n identity matrix' },
        { label: 'Matrix.add', insertText: 'Matrix.add(${1:m1}, ${2:m2})', isSnippet: true, detail: 'Matrix addition' },
        { label: 'Matrix.sub', insertText: 'Matrix.sub(${1:m1}, ${2:m2})', isSnippet: true, detail: 'Matrix subtraction' },
        { label: 'Matrix.mul', insertText: 'Matrix.mul(${1:m1}, ${2:m2})', isSnippet: true, detail: 'Matrix multiplication' },
        { label: 'Matrix.scale', insertText: 'Matrix.scale(${1:m}, ${2:scalar})', isSnippet: true, detail: 'Scale matrix by scalar' },
        { label: 'Matrix.transpose', insertText: 'Matrix.transpose(${1:m})', isSnippet: true, detail: 'Transpose matrix rows and columns' },
        { label: 'Matrix.det', insertText: 'Matrix.det(${1:m})', isSnippet: true, detail: 'Compute determinant of square matrix' },
        { label: 'Matrix.inverse', insertText: 'Matrix.inverse(${1:m})', isSnippet: true, detail: 'Compute inverse matrix' },
        { label: 'Matrix.solve', insertText: 'Matrix.solve(${1:A}, ${2:B})', isSnippet: true, detail: 'Solve linear system A * X = B' },
        { label: 'Matrix.trace', insertText: 'Matrix.trace(${1:m})', isSnippet: true, detail: 'Sum of main diagonal elements' },
        { label: 'Matrix.rank', insertText: 'Matrix.rank(${1:m})', isSnippet: true, detail: 'Compute matrix rank' },

        // Vector
        { label: 'Vector.create', insertText: 'Vector.create(${1:components})', isSnippet: true, detail: 'Create n-dimensional vector' },
        { label: 'Vector.dot', insertText: 'Vector.dot(${1:v1}, ${2:v2})', isSnippet: true, detail: 'Vector dot product' },
        { label: 'Vector.cross', insertText: 'Vector.cross(${1:v1}, ${2:v2})', isSnippet: true, detail: '3D vector cross product' },
        { label: 'Vector.mag', insertText: 'Vector.mag(${1:v})', isSnippet: true, detail: 'Vector magnitude / Euclidean length' },
        { label: 'Vector.norm', insertText: 'Vector.norm(${1:v})', isSnippet: true, detail: 'Normalize vector to unit length' },
        { label: 'Vector.dist', insertText: 'Vector.dist(${1:v1}, ${2:v2})', isSnippet: true, detail: 'Distance between two vectors' },
        { label: 'Vector.angle', insertText: 'Vector.angle(${1:v1}, ${2:v2})', isSnippet: true, detail: 'Angle between two vectors in radians' },

        // Math
        { label: 'Math.abs', insertText: 'Math.abs(${1:x})', isSnippet: true, detail: 'Absolute value' },
        { label: 'Math.sqrt', insertText: 'Math.sqrt(${1:x})', isSnippet: true, detail: 'Square root' },
        { label: 'Math.pow', insertText: 'Math.pow(${1:base}, ${2:exp})', isSnippet: true, detail: 'Exponentiation' },
        { label: 'Math.floor', insertText: 'Math.floor(${1:x})', isSnippet: true, detail: 'Floor round' },
        { label: 'Math.ceil', insertText: 'Math.ceil(${1:x})', isSnippet: true, detail: 'Ceiling round' },
        { label: 'Math.round', insertText: 'Math.round(${1:x})', isSnippet: true, detail: 'Nearest round' },
        { label: 'Math.sin', insertText: 'Math.sin(${1:x})', isSnippet: true, detail: 'Trigonometric sine' },
        { label: 'Math.cos', insertText: 'Math.cos(${1:x})', isSnippet: true, detail: 'Trigonometric cosine' },
        { label: 'Math.tan', insertText: 'Math.tan(${1:x})', isSnippet: true, detail: 'Trigonometric tangent' },
        { label: 'Math.max', insertText: 'Math.max(${1:a}, ${2:b})', isSnippet: true, detail: 'Maximum of two numbers' },
        { label: 'Math.min', insertText: 'Math.min(${1:a}, ${2:b})', isSnippet: true, detail: 'Minimum of two numbers' },
        { label: 'Math.clamp', insertText: 'Math.clamp(${1:val}, ${2:min}, ${3:max})', isSnippet: true, detail: 'Clamp value between min and max' },

        // Stats
        { label: 'Stats.mean', insertText: 'Stats.mean(${1:arr})', isSnippet: true, detail: 'Arithmetic mean of array' },
        { label: 'Stats.median', insertText: 'Stats.median(${1:arr})', isSnippet: true, detail: 'Median value of array' },
        { label: 'Stats.variance', insertText: 'Stats.variance(${1:arr})', isSnippet: true, detail: 'Sample variance' },
        { label: 'Stats.stddev', insertText: 'Stats.stddev(${1:arr})', isSnippet: true, detail: 'Standard deviation' },
        { label: 'Stats.sum', insertText: 'Stats.sum(${1:arr})', isSnippet: true, detail: 'Sum of array elements' },
        { label: 'Stats.mode', insertText: 'Stats.mode(${1:arr})', isSnippet: true, detail: 'Most frequent element' },

        // Pseudo
        { label: 'Pseudo.seed', insertText: 'Pseudo.seed(${1:seed})', isSnippet: true, detail: 'Seed deterministic PRNG' },
        { label: 'Pseudo.rand', insertText: 'Pseudo.rand()', detail: 'Generate random 32-bit integer' },
        { label: 'Pseudo.randRange', insertText: 'Pseudo.randRange(${1:min}, ${2:max})', isSnippet: true, detail: 'Random integer in [min, max]' },
        { label: 'Pseudo.randFloat', insertText: 'Pseudo.randFloat()', detail: 'Random float in [0.0, 1.0)' },
        { label: 'Pseudo.choice', insertText: 'Pseudo.choice(${1:arr})', isSnippet: true, detail: 'Random choice from array' },
        { label: 'Pseudo.shuffle', insertText: 'Pseudo.shuffle(${1:arr})', isSnippet: true, detail: 'In-place array shuffle' },

        // Arrays
        { label: 'Arrays.push', insertText: 'Arrays.push(${1:arr}, ${2:item})', isSnippet: true, detail: 'Append item to array' },
        { label: 'Arrays.pop', insertText: 'Arrays.pop(${1:arr})', isSnippet: true, detail: 'Remove and return last element' },
        { label: 'Arrays.map', insertText: 'Arrays.map(${1:arr}, ${2:fn})', isSnippet: true, detail: 'Map elements with function' },
        { label: 'Arrays.filter', insertText: 'Arrays.filter(${1:arr}, ${2:fn})', isSnippet: true, detail: 'Filter elements matching predicate' },
        { label: 'Arrays.reduce', insertText: 'Arrays.reduce(${1:arr}, ${2:fn}, ${3:initial})', isSnippet: true, detail: 'Reduce array to single value' },
        { label: 'Arrays.find', insertText: 'Arrays.find(${1:arr}, ${2:item})', isSnippet: true, detail: 'Find item index in array' },
        { label: 'Arrays.sort', insertText: 'Arrays.sort(${1:arr})', isSnippet: true, detail: 'Sort array elements' },
        { label: 'Arrays.reverse', insertText: 'Arrays.reverse(${1:arr})', isSnippet: true, detail: 'Reverse array in-place' },
        { label: 'Arrays.join', insertText: 'Arrays.join(${1:arr}, ${2:delim})', isSnippet: true, detail: 'Join elements with delimiter' },

        // Strings
        { label: 'Strings.split', insertText: 'Strings.split(${1:str}, ${2:delim})', isSnippet: true, detail: 'Split string by delimiter' },
        { label: 'Strings.upper', insertText: 'Strings.upper(${1:str})', isSnippet: true, detail: 'Convert to uppercase' },
        { label: 'Strings.lower', insertText: 'Strings.lower(${1:str})', isSnippet: true, detail: 'Convert to lowercase' },
        { label: 'Strings.trim', insertText: 'Strings.trim(${1:str})', isSnippet: true, detail: 'Trim whitespace' },
        { label: 'Strings.replace', insertText: 'Strings.replace(${1:str}, ${2:target}, ${3:sub})', isSnippet: true, detail: 'Replace substring' },
        { label: 'Strings.contains', insertText: 'Strings.contains(${1:str}, ${2:sub})', isSnippet: true, detail: 'Check if string contains substring' },
        { label: 'Strings.sub', insertText: 'Strings.sub(${1:str}, ${2:start}, ${3:len})', isSnippet: true, detail: 'Extract substring' },

        // Json
        { label: 'Json.parse', insertText: 'Json.parse(${1:jsonStr})', isSnippet: true, detail: 'Parse JSON string into object' },
        { label: 'Json.stringify', insertText: 'Json.stringify(${1:obj})', isSnippet: true, detail: 'Serialize object to JSON string' },
        { label: 'Json.get', insertText: 'Json.get(${1:obj}, ${2:key})', isSnippet: true, detail: 'Get JSON property' },
        { label: 'Json.set', insertText: 'Json.set(${1:obj}, ${2:key}, ${3:val})', isSnippet: true, detail: 'Set JSON property' },
        { label: 'Json.isValid', insertText: 'Json.isValid(${1:str})', isSnippet: true, detail: 'Validate JSON syntax' },

        // Validate
        { label: 'Validate.isEmail', insertText: 'Validate.isEmail(${1:str})', isSnippet: true, detail: 'Validate email address' },
        { label: 'Validate.isUrl', insertText: 'Validate.isUrl(${1:str})', isSnippet: true, detail: 'Validate URL format' },
        { label: 'Validate.isNum', insertText: 'Validate.isNum(${1:val})', isSnippet: true, detail: 'Check if value is numeric' },
        { label: 'Validate.isAlpha', insertText: 'Validate.isAlpha(${1:str})', isSnippet: true, detail: 'Check if string is alphabetic' },
        { label: 'Validate.isAlphanumeric', insertText: 'Validate.isAlphanumeric(${1:str})', isSnippet: true, detail: 'Check if string is alphanumeric' },
        { label: 'Validate.matches', insertText: 'Validate.matches(${1:str}, ${2:pattern})', isSnippet: true, detail: 'Test string against regex' },

        // Crypto
        { label: 'Crypto.md5', insertText: 'Crypto.md5(${1:str})', isSnippet: true, detail: 'Compute MD5 hash' },
        { label: 'Crypto.sha256', insertText: 'Crypto.sha256(${1:str})', isSnippet: true, detail: 'Compute SHA-256 hash' },
        { label: 'Crypto.sha512', insertText: 'Crypto.sha512(${1:str})', isSnippet: true, detail: 'Compute SHA-512 hash' },
        { label: 'Crypto.base64Encode', insertText: 'Crypto.base64Encode(${1:str})', isSnippet: true, detail: 'Encode string to Base64' },
        { label: 'Crypto.base64Decode', insertText: 'Crypto.base64Decode(${1:str})', isSnippet: true, detail: 'Decode Base64 string' },

        // Regex
        { label: 'Regex.test', insertText: 'Regex.test(${1:pattern}, ${2:str})', isSnippet: true, detail: 'Test regex pattern against string' },
        { label: 'Regex.match', insertText: 'Regex.match(${1:pattern}, ${2:str})', isSnippet: true, detail: 'Match regex pattern in string' },
        { label: 'Regex.replace', insertText: 'Regex.replace(${1:str}, ${2:pattern}, ${3:replacement})', isSnippet: true, detail: 'Replace regex matches' },

        // Fs
        { label: 'Fs.read', insertText: 'Fs.read(${1:path})', isSnippet: true, detail: 'Read file contents' },
        { label: 'Fs.write', insertText: 'Fs.write(${1:path}, ${2:content})', isSnippet: true, detail: 'Write file contents' },
        { label: 'Fs.append', insertText: 'Fs.append(${1:path}, ${2:content})', isSnippet: true, detail: 'Append content to file' },
        { label: 'Fs.exists', insertText: 'Fs.exists(${1:path})', isSnippet: true, detail: 'Check if file exists' },
        { label: 'Fs.delete', insertText: 'Fs.delete(${1:path})', isSnippet: true, detail: 'Delete file' },
        { label: 'Fs.list', insertText: 'Fs.list(${1:dir})', isSnippet: true, detail: 'List files in directory' },
        { label: 'Fs.mkdir', insertText: 'Fs.mkdir(${1:dir})', isSnippet: true, detail: 'Create directory' },

        // Path
        { label: 'Path.join', insertText: 'Path.join(${1:p1}, ${2:p2})', isSnippet: true, detail: 'Join file path segments' },
        { label: 'Path.dirname', insertText: 'Path.dirname(${1:path})', isSnippet: true, detail: 'Get directory name of path' },
        { label: 'Path.basename', insertText: 'Path.basename(${1:path})', isSnippet: true, detail: 'Get base filename' },
        { label: 'Path.extname', insertText: 'Path.extname(${1:path})', isSnippet: true, detail: 'Get file extension' },
        { label: 'Path.resolve', insertText: 'Path.resolve(${1:path})', isSnippet: true, detail: 'Resolve absolute path' },

        // Env
        { label: 'Env.get', insertText: 'Env.get("${1:VAR_NAME}")', isSnippet: true, detail: 'Get environment variable value' },
        { label: 'Env.set', insertText: 'Env.set("${1:VAR_NAME}", "${2:value}")', isSnippet: true, detail: 'Set environment variable' },
        { label: 'Env.has', insertText: 'Env.has("${1:VAR_NAME}")', isSnippet: true, detail: 'Check if environment variable exists' },
        { label: 'Env.all', insertText: 'Env.all()', detail: 'Get all environment variables' },

        // Time
        { label: 'Time.now', insertText: 'Time.now()', detail: 'Get current timestamp in milliseconds' },
        { label: 'Time.sleep', insertText: 'Time.sleep(${1:ms})', isSnippet: true, detail: 'Sleep execution for milliseconds' },
        { label: 'Time.format', insertText: 'Time.format(${1:timestamp}, "${2:YYYY-MM-DD}")', isSnippet: true, detail: 'Format timestamp string' },
        { label: 'Time.diff', insertText: 'Time.diff(${1:t1}, ${2:t2})', isSnippet: true, detail: 'Time difference between two timestamps' },

        // Http
        { label: 'Http.get', insertText: 'Http.get("${1:https://api.example.com}")', isSnippet: true, detail: 'Perform HTTP GET request' },
        { label: 'Http.post', insertText: 'Http.post("${1:https://api.example.com}", ${2:body})', isSnippet: true, detail: 'Perform HTTP POST request' },
        { label: 'Http.put', insertText: 'Http.put("${1:https://api.example.com}", ${2:body})', isSnippet: true, detail: 'Perform HTTP PUT request' },
        { label: 'Http.delete', insertText: 'Http.delete("${1:https://api.example.com}")', isSnippet: true, detail: 'Perform HTTP DELETE request' },

        // Log
        { label: 'Log.info', insertText: 'Log.info("${1:message}")', isSnippet: true, detail: 'Log informational message' },
        { label: 'Log.warn', insertText: 'Log.warn("${1:warning}")', isSnippet: true, detail: 'Log warning message' },
        { label: 'Log.error', insertText: 'Log.error("${1:error}")', isSnippet: true, detail: 'Log error message' },
        { label: 'Log.debug', insertText: 'Log.debug("${1:debug}")', isSnippet: true, detail: 'Log debug message' },

        // Color
        { label: 'Color.ansi', insertText: 'Color.ansi("${1:text}", "${2:cyan}")', isSnippet: true, detail: 'Wrap text in ANSI color escape' },
        { label: 'Color.hex', insertText: 'Color.hex("${1:text}", "#${2:00ffcc}")', isSnippet: true, detail: 'Wrap text in Truecolor hex ANSI escape' },
        { label: 'Color.strip', insertText: 'Color.strip(${1:text})', isSnippet: true, detail: 'Strip all ANSI escape codes from text' },

        // Console
        { label: 'Console.clear', insertText: 'Console.clear()', detail: 'Clear terminal screen' },
        { label: 'Console.read', insertText: 'Console.read()', detail: 'Read line from console stdin' },
        { label: 'Console.write', insertText: 'Console.write("${1:text}")', isSnippet: true, detail: 'Write string to console without newline' },

        // Benchmark
        { label: 'Benchmark.run', insertText: 'Benchmark.run("${1:TestName}", ${2:fn})', isSnippet: true, detail: 'Benchmark execution duration of function' },
        { label: 'Benchmark.profile', insertText: 'Benchmark.profile(${1:fn})', isSnippet: true, detail: 'Profile memory and operation counts' },

        // Mock
        { label: 'Mock.spy', insertText: 'Mock.spy(${1:obj}, "${2:method}")', isSnippet: true, detail: 'Create mock spy on method' },
        { label: 'Mock.stub', insertText: 'Mock.stub(${1:obj}, "${2:method}", ${3:returnValue})', isSnippet: true, detail: 'Stub method return value' },

        // Assert
        { label: 'Assert.equal', insertText: 'Assert.equal(${1:actual}, ${2:expected})', isSnippet: true, detail: 'Assert values are equal' },
        { label: 'Assert.true', insertText: 'Assert.true(${1:condition})', isSnippet: true, detail: 'Assert condition is true' },
        { label: 'Assert.false', insertText: 'Assert.false(${1:condition})', isSnippet: true, detail: 'Assert condition is false' },
        { label: 'Assert.throws', insertText: 'Assert.throws(${1:fn}, ${2:RuntimeError})', isSnippet: true, detail: 'Assert function throws expected error' },
        { label: 'Assert.notEqual', insertText: 'Assert.notEqual(${1:a}, ${2:b})', isSnippet: true, detail: 'Assert values are not equal' }
      ];

      const suggestions = [
        ...keywords.map(k => ({
          label: k.label,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: k.insertText,
          insertTextRules: k.isSnippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          detail: k.detail,
          range
        })),
        ...attributes.map(a => ({
          label: a.label,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: a.insertText,
          insertTextRules: a.isSnippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          detail: a.detail,
          range
        })),
        ...errors.map(e => ({
          ...e,
          range
        })),
        ...stdlibs.map(s => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Method,
          insertText: s.insertText,
          insertTextRules: s.isSnippet ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined,
          detail: s.detail,
          range
        }))
      ];

      return { suggestions };
    }
  });

  // ─── MONACO HOVER PROVIDER FOR VERIPEDIA QUICK TOOLTIPS ───
  monaco.languages.registerHoverProvider('verscript', {
    provideHover: (model, position) => {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      const term = word.word;

      const HOVER_DOCS = {
        'display': '**display** statement\n\nPrints expressions to standard output.\n\nAttributes:\n- `?color="cyan"` or `?color=#00ffcc` - Colorized terminal output\n- `?newline=false` - Suppress trailing newline',
        'prompt': '**prompt** statement\n\nReads a line of interactive text input into a variable.\n\nAttributes:\n- `?default="Val"` - Fallback default when input is empty',
        'header': '**header** declaration\n\nDefines a typed interface contract in `.h.vrs` files.\n\nExample:\n```verscript\nheader MathService:\n    func add(a, b)\n```',
        'include': '**include** directive\n\nIncludes a header contract file (`.h.vrs`). Validates that implementations match the contract signatures.',
        'pragma': '**pragma** directive\n\nCompiler control directive:\n- `pragma once` - Prevent duplicate inclusion\n- `pragma strict` - Enforce type checking & contracts',
        'struct': '**struct** declaration\n\nDefines a typed data structure schema with typed fields.',
        'enum': '**enum** declaration\n\nDefines enumerated numerical constants.',
        'Matrix': '**Matrix** Standard Library\n\nProvides linear algebra, determinant, inverse, transpose, solving systems, and matrix arithmetic.',
        'Vector': '**Vector** Standard Library\n\nProvides Euclidean vectors, dot products, cross products, magnitude, and unit normalization.',
        'Pseudo': '**Pseudo** Standard Library\n\nHigh-performance deterministic Pseudo-Random Number Generator with seedable state.',
        'chan': '**chan** Concurrency Channel\n\nCreates a typed FIFO communication channel between async tasks.\n\nSyntax: `chan(capacity)`',
        'send': '**send** operator\n\nPushes data into a concurrency channel.\n\nSyntax: `send ch <- value`',
        'recv': '**recv** operator\n\nPulls data from a concurrency channel.\n\nSyntax: `recv var <- ch`',
        'alias': '**alias** command\n\nRemaps keywords or commands with attribute substitution.\n\nSyntax: `alias display: print ? color=tint`',
        'do': '**do ... unless** block\n\nVerScript exception handling and reactive watch block.',
        'throw': '**throw** statement\n\nThrows a standard or custom error type with optional `?msg` and `?code` attributes.'
      };

      if (HOVER_DOCS[term]) {
        return {
          range: new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn),
          contents: [{ value: HOVER_DOCS[term] }]
        };
      }
      return null;
    }
  });
};

const TEMPLATES = {

  headers_contracts: `!!
  Template: Headers & Interface Contracts (.h.vrs)
  Featuring pragma once, pragma strict, and structured data contracts!
!!

pragma once
pragma strict

struct UserProfile:
    id: num
    name: str
    active: bool

header AuthenticationService:
    func verify(user: str, token: str)
    func issueSession(profile: UserProfile)

display "=== Header & Contract System Active ===" ?color="cyan"
display "Pragmas and Struct definitions verified successfully." ?color="green"`,

  matrix_linear_algebra: `!!
  Template: Matrix & Vector Linear Algebra
  Demonstrating Matrix.create, determinants, inverses, and direct operator overloading!
!!

load Matrix
load Vector

set A: [[2, 1], [5, 3]]
set B: [[1, 2], [3, 4]]
set V: [10, 20]

display "=== Matrix Direct Infix Operations ===" ?color="cyan"
display "A + B: " + (A + B) ?color="green"
display "A * B: " + (A * B) ?color="yellow"
display "A * V: " + (A * V) ?color="purple"
display "det(A): " + (Matrix.det A) ?color="cyan"`,

  concurrency_channels: `!!
  Template: Concurrency Channels & Pipelines
  Demonstrating async tasks, chan buffers, send and recv operations!
!!

set workChan: chan(5)

send workChan <- "Task #1: Matrix computation"
send workChan <- "Task #2: Crypto hash verification"

display "=== Concurrency Pipeline ===" ?color="cyan"
recv task1 <- workChan
display "Dispatched: " + task1 ?color="green"
recv task2 <- workChan
display "Dispatched: " + task2 ?color="yellow"`,

  structs_enums: `!!
  Template: Typed Structs & Enum Mappings
  Demonstrating custom schemas, enumerated values, and field validation!
!!

enum OrderStatus:
    PENDING : 0
    PAID : 1
    SHIPPED : 2

struct OrderRecord:
    order_id: num
    customer: str
    status: num

set my_order: OrderRecord(101, "Alice", OrderStatus.PAID)
display "Order ID: " + my_order.order_id ?color="cyan"
display "Customer: " + my_order.customer ?color="green"
display "Status Code: " + my_order.status ?color="yellow"`,
  datatypes_pseudo: `!!
  Template: DataType Constraints & Native Pseudo PRNG
  Demonstrates custom types, parameter constraints, and PRNG engine!
!!

display "=== 1. Primitive DataType Constraints ===" ?color="cyan"
num user_level: 5
str user_tag: "Alpha"
bool is_verified: true
display "User: " + user_tag + " (Level: " + user_level + ")" ?color="green"

display "=== 2. Custom Constrained DataType ===" ?color="purple"
DataType PortNumber extends num
  it >= 1024
  it <= 65535

PortNumber active_port: 8080
display "Validated Port: " + active_port ?color="green"

do
  PortNumber invalid_port: 80
unless DataTypeError
  display "Purity Guard: Caught invalid port 80!" ?color="yellow"

display "=== 3. Native Pseudo & Random Engine ===" ?color="cyan"
Pseudo.seed 42
display "Random Port: " + (between 1024 9999) ?color="yellow"
display "PRNG UUID: " + (uuid) ?color="purple"
arr agents: ["Sentinel", "Guardian", "Warden"]
display "Selected Agent: " + (choice agents) ?color="green"`,

  alias_demo: `!!
  Template: Command Aliases & Attribute Mapping (alias keyword)
  Demonstrates single-line, attribute remapping, and multi-line alias blocks!
!!

display "=== Single-line Command Alias ===" ?color="cyan"
alias display: print
print "Hello via aliased 'print' command!" ?color="green"

display "=== Alias with Attribute Mapping ===" ?color="purple"
alias display: echo ? color=tint
echo "Echoed with mapped attribute ?tint -> ?color" ?tint="cyan"

display "=== Multi-line Alias Block ===" ?color="yellow"
alias:
  loop: repeat
  iterate: for

repeat 2
  print "Repeated loop via alias!" ?color="green"

for i from 1 to 5 step 2
  print "Iterate aliased as for: " + i ?color="purple"`,

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
  VerScript Polyglot Showcase — v1.2.0
  Featuring:
    1: Command Aliasing & Attribute Remapping (alias display: print ? color=tint)
    2: Unquoted Truecolor Hex Attributes (?color=#hex) & ANSI Sequences
    3: Stepped Iteration & Loops (iterate i from x to y step z)
    4: Reactive Watch Condition Guards (do ... unless internal)
    5: Polyglot Code Injection (inject [lang]) & System Operators
!!

alias display: print ? color=tint

print "=== 1. ANSI & Truecolor Hex Terminal Output ===" ?tint=#00ffcc
print "Success: VerScript Engine Active!" ?tint=#50fa7b
print "Warning: Memory optimization recommended." ?tint=#f1fa8c
print "Error: DivisionByZero handled gracefully." ?tint=#ff5555

print "=== 2. Inline Printing with ?newline=false ===" ?tint="purple"
print "Loading modules: [" ?newline=false ?tint="cyan"
print "Core, " ?newline=false ?tint="yellow"
print "Lexer, " ?newline=false ?tint="yellow"
print "VS#-1B Neural Engine] " ?newline=false ?tint="cyan"
print "Done!" ?tint="green"

print "=== 3. Stepped Iteration Showcase ===" ?tint=#00d2ff
iterate idx from 1 to 9 step 2
  print "Stepped Index (+2): " + idx ?tint="cyan"

print "=== 4. Custom Throw with ?msg Attribute ===" ?tint="purple"
do
  print "Triggering custom exception with ?msg attribute..." ?tint="yellow"
  throw DivisionByZeroError ?msg="Division by zero in calculate_ratio()"
unless DivisionByZeroError
  print "Caught Exception: " + error ?tint="green"

print "=== 5. Polyglot Code Injection ===" ?tint=#ff79c6
inject python ?color="yellow"
  print("Polyglot Python snippet executing cleanly!")

print "=== 6. Error Suppression Block Operator ===" ?tint="cyan"
SuppressErrors
  print "Running invalid operation under SuppressErrors..." ?tint="yellow"
  invalid_val : 10 / 0
  print "Division by zero bypassed cleanly!" ?tint="green"`;


// --- ANSI ESCAPE CODE RENDERER FOR TERMINAL ---
function renderAnsiLine(rawText) {
    if (!rawText) return null;
    let text = String(rawText)
        .replace(/\\033\[/g, '\x1b[')
        .replace(/\\x1b\[/gi, '\x1b[')
        .replace(/\\u001b\[/gi, '\x1b[');

    const standardColors = {
        '30': '#6272a4',
        '31': '#ff5555', // Red
        '32': '#50fa7b', // Green
        '33': '#f1fa8c', // Yellow
        '34': '#8be9fd', // Blue/Cyan
        '35': '#ff79c6', // Purple/Magenta
        '36': '#00ffcc', // Cyan
        '37': '#f8f8f2', // White
        '90': '#6272a4',
        '91': '#ff6e6e',
        '92': '#69ff94',
        '93': '#ffffa5',
        '94': '#d6acff',
        '95': '#ff92df',
        '96': '#a4ffff',
        '97': '#ffffff'
    };

    // Match any ANSI SGR sequence: \x1b[...m
    // eslint-disable-next-line no-control-regex
    const regex = /\x1b\[([\d;]+)m/g;
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

        const codeSeq = match[1];
        if (codeSeq === '0') {
            currentColor = null;
        } else if (codeSeq.startsWith('38;2;')) {
            const rgbParts = codeSeq.split(';');
            if (rgbParts.length >= 5) {
                const r = parseInt(rgbParts[2], 10);
                const g = parseInt(rgbParts[3], 10);
                const b = parseInt(rgbParts[4], 10);
                currentColor = `rgb(${r}, ${g}, ${b})`;
            }
        } else {
            const pArr = codeSeq.split(';');
            let col = null;
            for (const p of pArr) {
                if (standardColors[p]) {
                    col = standardColors[p];
                    break;
                }
            }
            currentColor = col !== null ? col : currentColor;
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), color: currentColor });
    }

    if (parts.length === 0) return text;

    return parts.map((p, idx) => (
        <span key={idx} style={p.color ? { color: p.color, fontWeight: 'bold', textShadow: `0 0 5px ${p.color}55` } : {}}>
            {p.text}
        </span>
    ));
}

function App() {
  // ─── 1. All State & Ref Hooks ──────────────────────────────────────────
  const [terminalHeight, setTerminalHeight] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('editor'); // 'editor' | 'ai' | 'terminal'

  const [engineMode, setEngineMode] = useState('instant'); // 'instant' | 'cloud'
  const [terminalTab, setTerminalTab] = useState('output'); // 'output' | 'stdin'
  const [stdinInput, setStdinInput] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState(null); // { vname, defVal, resolve }
  const [promptCurrentVal, setPromptCurrentVal] = useState('');


  const [files, setFiles] = useState([
    { name: 'sample.vrs', content: defaultSampleCode },
    { name: 'include/math_service.h.vrs', content: "pragma once\npragma strict\n\nstruct Vec2:\n    x: num\n    y: num\n\nheader MathService:\n    func add(a, b)\n    func dot(x1, y1, x2, y2)\n" },
    { name: 'src/main.vrs', content: 'include "include/math_service.h.vrs"\n\nfunc add(a, b):\n    reply a + b\n\nfunc dot(x1, y1, x2, y2):\n    reply (x1 * x2) + (y1 * y2)\n\nset p1: Vec2(3, 4)\nset p2: Vec2(5, 6)\ndisplay "Sum: " + add(p1.x, p2.x) ?color="green"\ndisplay "Dot Product: " + dot(p1.x, p1.y, p2.x, p2.y) ?color="cyan"\n' },
    { name: 'linear_algebra.vrs', content: "! Symbolic Matrix & Vector Direct Operations\nload Matrix\nload Vector\n\nset M1: [[1, 2], [3, 4]]\nset M2: [[5, 6], [7, 8]]\nset V1: [10, 20]\n\ndisplay \"M1 + M2: \" + (M1 + M2) ?color=\"cyan\"\ndisplay \"M1 * V1: \" + (M1 * V1) ?color=\"green\"\n" },
    { name: 'core/Math.lib.vrs', content: "! VerScript Core Library: Math\nlib Math\n  dynamic:\n    def func abs x\n      if x < 0 then\n        reply 0 - x\n      reply x\n    def func gcd a b\n      set x: (abs a)\n      set y: (abs b)\n      while y != 0\n        set temp: y\n        set q: x / y\n        set y: x - (q * y)\n        set x: temp\n      reply x\n" },
    { name: 'tests/test_step.vrs', content: "!! Test step loop !!\niterate i from 1 to 10 step 3\n  display \"Step test: \" + i ?color=\"yellow\"\n" }
  ]);
  const [folders, setFolders] = useState(['src', 'include', 'core', 'tests']);
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [targetFolder, setTargetFolder] = useState('');
  const [activeFileName, setActiveFileName] = useState('sample.vrs');
  const [searchQuery, setSearchQuery] = useState('');
  const [extensionFilter, setExtensionFilter] = useState('all'); // 'all' | '.vrs' | '.lib.vrs' | '.h.vrs'
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

  const detectStaticLibName = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    let libName = null;
    let hasOtherTopLevelCode = false;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('!') || trimmed.startsWith('//')) {
        continue;
      }
      const match = trimmed.match(/^(?:lib|library)\s+([A-Za-z0-9_]+)/);
      if (match) {
        if (!libName) {
          libName = match[1];
        } else {
          hasOtherTopLevelCode = true;
        }
      } else if (!line.startsWith(' ') && !line.startsWith('\t')) {
        hasOtherTopLevelCode = true;
      }
    }

    if (libName && !hasOtherTopLevelCode) {
      return libName;
    }
    return null;
  };

  const checkAndAutoRenameLib = (fileName, fileContent, currentFiles) => {
    const libName = detectStaticLibName(fileContent);
    if (!libName) return fileName;
    const dir = fileName.includes('/') ? fileName.substring(0, fileName.lastIndexOf('/') + 1) : '';
    const targetName = `${dir}${libName}.lib.vrs`;
    if (fileName === targetName) return fileName;
    if (currentFiles.some(f => f.name.toLowerCase() === targetName.toLowerCase() && f.name !== fileName)) {
      return fileName;
    }
    return targetName;
  };

  const matchesExtFilter = (fileName) => {
    if (extensionFilter === 'all') return true;
    if (extensionFilter === '.lib.vrs') return fileName.endsWith('.lib.vrs');
    if (extensionFilter === '.h.vrs') return fileName.endsWith('.h.vrs');
    if (extensionFilter === '.vrs') return fileName.endsWith('.vrs') && !fileName.endsWith('.lib.vrs') && !fileName.endsWith('.h.vrs');
    return true;
  };

  const handleSelectFile = (fileName) => {
    if (isAnimatingRef.current) return;
    const renamedActive = checkAndAutoRenameLib(activeFileName, code, files);
    const updatedFiles = files.map(f => {
      if (f.name === activeFileName) {
        return { name: renamedActive, content: code };
      }
      return f;
    });
    setFiles(updatedFiles);

    const targetName = (fileName === activeFileName) ? renamedActive : fileName;
    const selected = updatedFiles.find(f => f.name === targetName) || updatedFiles.find(f => f.name === fileName);
    if (selected) {
      setActiveFileName(selected.name);
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
      if (name.endsWith('.lib')) {
        name += '.vrs';
      } else if (name.endsWith('.h')) {
        name += '.vrs';
      } else {
        name += '.vrs';
      }
    }
    if (files.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      alert('A file with this name already exists!');
      return;
    }
    const isHeader = name.endsWith('.h.vrs');
    const isLib = name.endsWith('.lib.vrs');
    const baseHeaderName = isHeader ? name.split('/').pop().replace('.h.vrs', '') : '';
    const baseLibName = isLib ? name.split('/').pop().replace('.lib.vrs', '') : '';
    const initialContent = isHeader
      ? `pragma once\npragma strict\n\nheader ${baseHeaderName}:\n    func example(a, b)\n`
      : isLib
      ? `! VerScript Library: ${baseLibName}\nlib ${baseLibName}\n  const:\n    version: "1.0.0"\n  dynamic:\n    def func example\n      reply 42\n`
      : `! VerScript ${name}\n`;

    const renamedActive = checkAndAutoRenameLib(activeFileName, code, files);
    const newFiles = files.map(f => f.name === activeFileName ? { name: renamedActive, content: code } : f);
    const newFile = { name, content: initialContent };
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
  // ─── Export Project as ZIP ────────────────────────────────────────
  const handleExportZip = () => {
    try {
      const allFiles = files.map(f => f.name === activeFileName ? { name: f.name, content: code } : { name: f.name, content: f.content });
      const zipBytes = createZip(allFiles);
      const blob = new Blob([zipBytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'verscript_project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOutput(prev => [...prev, { type: 'success', text: `📦 Exported ${allFiles.length} project files to verscript_project.zip` }]);
    } catch (err) {
      alert("Export failed: " + err.message);
    }
  };

  // ─── Interactive In-Console Prompt Helper ─────────────────────────
  const askTerminalPrompt = (vname, defVal) => {
    return new Promise((resolve) => {
      setTerminalTab('output');
      setPromptCurrentVal(defVal || '');
      setOutput(prev => [...prev, { type: 'cmd', text: `[?] Enter input for '${vname}' (default: "${defVal}"):` }]);
      setPendingPrompt({ vname, defVal, resolve });
    });
  };

  // ─── Run Code via VS-Sharp /run endpoint ─────────────────────────
  const handleRun = async () => {
    if (isRunning) return;
    const renamedActive = checkAndAutoRenameLib(activeFileName, code, files);
    let runName = activeFileName;
    if (renamedActive !== activeFileName) {
      setFiles(prev => prev.map(f => f.name === activeFileName ? { ...f, name: renamedActive, content: code } : f));
      setActiveFileName(renamedActive);
      runName = renamedActive;
    }
    setIsRunning(true);
    setTerminalTab('output');

    const allFiles = files.map(f => f.name === activeFileName ? { name: f.name, content: code } : { name: f.name, content: f.content });

    if (engineMode === 'instant') {
      setOutput(prev => [...prev, { type: 'cmd', text: `VerScript ${runName} (Instant VM)>` }]);
      try {
        await simulateVerScriptAsync(
          code,
          allFiles,
          stdinInput,
          (lineObj) => setOutput(prev => [...prev, lineObj]),
          askTerminalPrompt
        );
      } catch (err) {
        setOutput(prev => [...prev, { type: 'error', text: err.message }]);
      } finally {
        setIsRunning(false);
        setPendingPrompt(null);
      }
      return;
    }

    // Cloud VM mode with auto-routing fallback to Instant VM
    setOutput(prev => [...prev, { type: 'cmd', text: `VerScript ${runName} (Cloud VM)>` }]);
    try {
      let stdinData = stdinInput || '';
      
      const controller = new AbortController();
      const cloudTimeout = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(`${VS_SHARP_API}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, files: allFiles, stdin: stdinData }),
        signal: controller.signal
      });
      clearTimeout(cloudTimeout);

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      if (data.error && data.error.includes('timed out')) {
        throw new Error('Cloud execution timed out. Auto-routing to Instant VM...');
      }

      if (data.output) {
        const lines = data.output.split('\n').filter(l => l !== '');
        lines.forEach(line => {
          const isError = line.startsWith('ERROR') || line.startsWith('LEXER ERROR');
          setOutput(prev => [...prev, { type: isError ? 'error' : 'success', text: line }]);
        });
      }

      if (data.error && data.error.trim()) {
        data.error.trim().split('\n').forEach(line => {
          setOutput(prev => [...prev, { type: 'error', text: line }]);
        });
      }

      setOutput(prev => [...prev, { type: 'cmd', text: 'Program completed.' }]);
    } catch (err) {
      setOutput(prev => [
        ...prev,
        { type: 'cmd', text: `⚡ ${err.message || 'Routing to Instant VM for in-code execution...'}` }
      ]);
      // Fallback to Instant VM for interactive execution
      try {
        await simulateVerScriptAsync(
          code,
          allFiles,
          stdinInput,
          (lineObj) => setOutput(prev => [...prev, lineObj]),
          askTerminalPrompt
        );
      } catch (innerErr) {
        setOutput(prev => [...prev, { type: 'error', text: innerErr.message }]);
      }
    } finally {
      setIsRunning(false);
      setPendingPrompt(null);
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
          <button id="btnExportZip" className="btn" onClick={handleExportZip} title="Export project as ZIP">
            📦 Export ZIP
          </button>
          <select
            id="selectEngine"
            className="btn"
            value={engineMode}
            onChange={(e) => setEngineMode(e.target.value)}
            title="Switch execution VM"
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #00ffcc', color: '#00ffcc', fontWeight: 'bold' }}
          >
            <option value="instant">⚡ Instant VM</option>
            <option value="cloud">☁️ Cloud VM</option>
          </select>
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
            <div className="extension-filters" style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <button
                type="button"
                className={`filter-btn ${extensionFilter === 'all' ? 'active' : ''}`}
                onClick={() => setExtensionFilter('all')}
                style={{
                  flex: 1,
                  padding: '3px 4px',
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  border: '1px solid ' + (extensionFilter === 'all' ? '#BD93F9' : '#44475A'),
                  background: extensionFilter === 'all' ? 'rgba(189, 147, 249, 0.25)' : 'transparent',
                  color: extensionFilter === 'all' ? '#F8F8F2' : '#6272A4',
                  cursor: 'pointer',
                  fontWeight: extensionFilter === 'all' ? '600' : 'normal'
                }}
              >
                All
              </button>
              <button
                type="button"
                className={`filter-btn ${extensionFilter === '.vrs' ? 'active' : ''}`}
                onClick={() => setExtensionFilter('.vrs')}
                style={{
                  flex: 1,
                  padding: '3px 4px',
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  border: '1px solid ' + (extensionFilter === '.vrs' ? '#50FA7B' : '#44475A'),
                  background: extensionFilter === '.vrs' ? 'rgba(80, 250, 123, 0.25)' : 'transparent',
                  color: extensionFilter === '.vrs' ? '#50FA7B' : '#6272A4',
                  cursor: 'pointer',
                  fontWeight: extensionFilter === '.vrs' ? '600' : 'normal'
                }}
                title="VerScript Programs (.vrs)"
              >
                .vrs
              </button>
              <button
                type="button"
                className={`filter-btn ${extensionFilter === '.lib.vrs' ? 'active' : ''}`}
                onClick={() => setExtensionFilter('.lib.vrs')}
                style={{
                  flex: 1.2,
                  padding: '3px 4px',
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  border: '1px solid ' + (extensionFilter === '.lib.vrs' ? '#8BE9FD' : '#44475A'),
                  background: extensionFilter === '.lib.vrs' ? 'rgba(139, 233, 253, 0.25)' : 'transparent',
                  color: extensionFilter === '.lib.vrs' ? '#8BE9FD' : '#6272A4',
                  cursor: 'pointer',
                  fontWeight: extensionFilter === '.lib.vrs' ? '600' : 'normal'
                }}
                title="Libraries (.lib.vrs)"
              >
                .lib.vrs
              </button>
              <button
                type="button"
                className={`filter-btn ${extensionFilter === '.h.vrs' ? 'active' : ''}`}
                onClick={() => setExtensionFilter('.h.vrs')}
                style={{
                  flex: 1.2,
                  padding: '3px 4px',
                  fontSize: '0.72rem',
                  borderRadius: '4px',
                  border: '1px solid ' + (extensionFilter === '.h.vrs' ? '#FFB86C' : '#44475A'),
                  background: extensionFilter === '.h.vrs' ? 'rgba(255, 184, 108, 0.25)' : 'transparent',
                  color: extensionFilter === '.h.vrs' ? '#FFB86C' : '#6272A4',
                  cursor: 'pointer',
                  fontWeight: extensionFilter === '.h.vrs' ? '600' : 'normal'
                }}
                title="Headers (.h.vrs)"
              >
                .h.vrs
              </button>
            </div>
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
                placeholder="New file.vrs or lib.lib.vrs..."
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
              .filter(f => matchesExtFilter(f.name))
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
                  {file.name.endsWith('.h.vrs') ? (
                    <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '3px', background: 'rgba(255, 184, 108, 0.25)', color: '#FFB86C', marginRight: '4px', fontWeight: 'bold' }}>
                      HDR
                    </span>
                  ) : file.name.endsWith('.lib.vrs') ? (
                    <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '3px', background: 'rgba(139, 233, 253, 0.2)', color: '#8BE9FD', marginRight: '4px', fontWeight: 'bold' }}>
                      LIB
                    </span>
                  ) : null}
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
              const matchingFolderFiles = folderFiles
                .filter(f => matchesExtFilter(f.name))
                .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

              if ((searchQuery || extensionFilter !== 'all') && matchingFolderFiles.length === 0) {
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
                      {matchingFolderFiles.map(file => (
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
                          {file.name.endsWith('.h.vrs') ? (
                            <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '3px', background: 'rgba(255, 184, 108, 0.25)', color: '#FFB86C', marginRight: '4px', fontWeight: 'bold' }}>
                              HDR
                            </span>
                          ) : file.name.endsWith('.lib.vrs') ? (
                            <span style={{ fontSize: '0.62rem', padding: '1px 4px', borderRadius: '3px', background: 'rgba(139, 233, 253, 0.2)', color: '#8BE9FD', marginRight: '4px', fontWeight: 'bold' }}>
                              LIB
                            </span>
                          ) : null}
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`terminal-tab-btn ${terminalTab === 'output' ? 'active' : ''}`}
                  onClick={() => setTerminalTab('output')}
                  style={{
                    background: terminalTab === 'output' ? 'rgba(0, 255, 204, 0.15)' : 'transparent',
                    border: '1px solid ' + (terminalTab === 'output' ? '#00FFCC' : 'transparent'),
                    color: terminalTab === 'output' ? '#00FFCC' : '#6272A4',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🖥️ Output
                </button>
                <button
                  type="button"
                  className={`terminal-tab-btn ${terminalTab === 'stdin' ? 'active' : ''}`}
                  onClick={() => setTerminalTab('stdin')}
                  style={{
                    background: terminalTab === 'stdin' ? 'rgba(189, 147, 249, 0.15)' : 'transparent',
                    border: '1px solid ' + (terminalTab === 'stdin' ? '#BD93F9' : 'transparent'),
                    color: terminalTab === 'stdin' ? '#BD93F9' : '#6272A4',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  📥 Stdin / Custom Input {stdinInput.trim() ? '●' : ''}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {terminalTab === 'stdin' ? (
                  <button
                    onClick={() => setStdinInput('')}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.75rem' }}
                    title="Clear Stdin"
                  >
                    clear input
                  </button>
                ) : (
                  <button
                    id="btnClearTerminal"
                    onClick={handleClearTerminal}
                    style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.75rem' }}
                    title="Clear terminal"
                  >
                    clear
                  </button>
                )}
              </div>
            </div>

            {terminalTab === 'stdin' ? (
              <div style={{ padding: '8px', height: 'calc(100% - 35px)', boxSizing: 'border-box' }}>
                <textarea
                  value={stdinInput}
                  onChange={(e) => setStdinInput(e.target.value)}
                  placeholder="Enter pre-filled standard input (stdin) lines here before running code. Each line will be consumed in order by 'prompt' commands..."
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#09090b',
                    color: '#00ffcc',
                    border: '1px solid #44475a',
                    borderRadius: '4px',
                    padding: '8px',
                    fontFamily: "'Courier New', Courier, monospace",
                    fontSize: '0.85rem',
                    resize: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ) : (
              <div className="terminal-output" ref={terminalRef} style={{ display: 'flex', flexDirection: 'column' }}>
                {output.map((line, i) => (
                  <div key={i} className={`terminal-line ${line.type}`}>
                    {renderAnsiLine(line.text)}
                  </div>
                ))}

                {pendingPrompt && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const val = promptCurrentVal;
                      const res = pendingPrompt.resolve;
                      setPendingPrompt(null);
                      setPromptCurrentVal('');
                      res(val);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      margin: '6px 0',
                      background: 'rgba(0, 255, 204, 0.08)',
                      border: '1px solid #00ffcc',
                      borderRadius: '6px'
                    }}
                  >
                    <span style={{ color: '#00ffcc', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      ? {pendingPrompt.vname}:
                    </span>
                    <input
                      type="text"
                      autoFocus
                      value={promptCurrentVal}
                      onChange={(e) => setPromptCurrentVal(e.target.value)}
                      placeholder={pendingPrompt.defVal ? `default: ${pendingPrompt.defVal}` : 'Type input value and press Enter...'}
                      style={{
                        flex: 1,
                        background: '#09090b',
                        border: '1px solid #44475a',
                        borderRadius: '4px',
                        color: '#f8f8f2',
                        padding: '4px 8px',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      className="btn"
                      style={{
                        background: '#00ffcc',
                        color: '#09090b',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Submit ↵
                    </button>
                  </form>
                )}
              </div>
            )}
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
