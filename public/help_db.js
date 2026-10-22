// VerScript Comprehensive Ecosystem Help Database
// Total Topics: 154
window.VERSCRIPT_HELP_DB = [
  {
    "id": "kw-set",
    "name": "set",
    "category": "keyword",
    "subcategory": "Declaration & Assignment",
    "title": "set — Variable Assignment and Declaration",
    "summary": "Binds an identifier to a computed expression, literal value, or data structure. Supports type annotations, immutable constraints, and reactive bindings.",
    "syntax": "set <identifier> : <expression>\nset <type> <identifier> : <expression>\nset const <identifier> : <expression>",
    "functionalities": [
      {
        "title": "Standard Assignment",
        "desc": "Binds a variable to a value in the current scope using colon assignment syntax.",
        "code": "set greeting : \"Hello, VerScript!\"\nset count : 42\ndisplay greeting ?color=#00FFCC"
      },
      {
        "title": "Explicit Type Constraint",
        "desc": "Ensures the variable only accepts values matching the specified primitive or custom DataType.",
        "code": "set num score : 98.5\nset str username : \"alex_dev\"\nset arr matrix : [[1, 0], [0, 1]]"
      },
      {
        "title": "Immutable Constant Declaration",
        "desc": "Prevents reassignment throughout the lifecycle of the execution environment.",
        "code": "set const MAX_USERS : 1000\n! MAX_USERS : 2000 -> throws ImmutableError"
      }
    ],
    "pairedWith": [
      "const",
      "DataType",
      "temp",
      "inst",
      "static",
      "dynamic"
    ],
    "parameters": [
      {
        "name": "identifier",
        "type": "identifier",
        "desc": "The name of the variable to bind."
      },
      {
        "name": "expression",
        "type": "any",
        "desc": "The evaluated value assigned to the variable."
      },
      {
        "name": "type (optional)",
        "type": "type keyword",
        "desc": "Enforces strict type contracts (num, str, bool, arr, entity)."
      }
    ],
    "returns": "Returns the evaluated value assigned to the identifier.",
    "tags": [
      "assign",
      "variable",
      "let",
      "var",
      "const",
      "declare",
      "binding",
      "store",
      "value",
      "initialize"
    ],
    "example": "set num initialBalance : 500\nset num deposit : 150\nset num total : initialBalance + deposit\ndisplay \"Total Account Balance: $\" + total ?color=#22c55e"
  },
  {
    "id": "kw-display",
    "name": "display",
    "category": "keyword",
    "subcategory": "I/O & Concurrency",
    "title": "display — Standard Console & Terminal Output",
    "summary": "Streams evaluated arguments to standard output. Supports ANSI Truecolor hex styling, inline printing, formatting tags, and multiple arguments.",
    "syntax": "display <expr1> [, <expr2>, ...] [?<attribute>=<value>]",
    "functionalities": [
      {
        "title": "Standard Output with Newline",
        "desc": "Prints evaluated arguments separated by spaces, terminating with a newline character.",
        "code": "display \"Welcome to the VerScript Runtime!\""
      },
      {
        "title": "ANSI Truecolor Styling",
        "desc": "Applies 24-bit RGB/HEX color rendering to the output stream without manual escape sequences.",
        "code": "display \"Status: Online\" ?color=#00FFCC\ndisplay \"Warning: High Latency\" ?color=#f59e0b\ndisplay \"Error: Connection Terminated\" ?color=#ef4444"
      },
      {
        "title": "Inline Printing",
        "desc": "Suppresses trailing newline for continuous line progress bars and streaming prompts.",
        "code": "display \"Loading modules: \" ?inline ?color=#38bdf8\ndisplay \"100% complete\" ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "prompt",
      "?color",
      "?inline",
      "?bg",
      "?bold"
    ],
    "parameters": [
      {
        "name": "expressions",
        "type": "any...",
        "desc": "One or more comma-separated values to display."
      },
      {
        "name": "?color",
        "type": "attribute (hex/name)",
        "desc": "Text foreground color (e.g. ?color=#00FFCC)."
      },
      {
        "name": "?inline",
        "type": "attribute flag",
        "desc": "Suppresses the automatic trailing newline."
      }
    ],
    "returns": "void",
    "tags": [
      "print",
      "output",
      "echo",
      "log",
      "console",
      "terminal",
      "stdout",
      "write",
      "color",
      "ansi"
    ],
    "example": "display \"=== System Telemetry ===\" ?color=#bd00ff\ndisplay \"Uptime: 99.98%\" ?color=#00FFCC\ndisplay \"Load Avg: 0.12\" ?color=#38bdf8"
  },
  {
    "id": "kw-prompt",
    "name": "prompt",
    "category": "keyword",
    "subcategory": "I/O & Concurrency",
    "title": "prompt — Interactive User Input",
    "summary": "Suspends execution to receive interactive user input from stdin, terminal, or IDE interactive runbox.",
    "syntax": "set <var> : prompt [\"Optional Question String\"]",
    "functionalities": [
      {
        "title": "Interactive Console Input",
        "desc": "Prompts the operator and reads a full line of text until carriage return or newline.",
        "code": "set name : prompt \"Enter your name: \"\ndisplay \"Welcome, \" + name + \"!\" ?color=#00FFCC"
      },
      {
        "title": "Numeric Parsing with Input",
        "desc": "Reads user input and parses into a numeric variable for arithmetic computation.",
        "code": "set rawAge : prompt \"Enter your age: \"\nset num age : num(rawAge)\ndisplay \"In 5 years you will be: \" + (age + 5) ?color=#38bdf8"
      }
    ],
    "pairedWith": [
      "set",
      "display",
      "num",
      "str"
    ],
    "parameters": [
      {
        "name": "message (optional)",
        "type": "string",
        "desc": "The invitation string displayed before reading stdin."
      }
    ],
    "returns": "str — The line entered by the operator.",
    "tags": [
      "input",
      "read",
      "stdin",
      "interactive",
      "scan",
      "ask",
      "getline",
      "user",
      "terminal"
    ],
    "example": "set command : prompt \"vrs> \"\nif command == \"exit\" then\n  display \"Exiting session.\" ?color=#ef4444\nelse\n  display \"Executing: \" + command ?color=#00FFCC\nend"
  },
  {
    "id": "kw-def",
    "name": "def",
    "category": "keyword",
    "subcategory": "Procedures & Functions",
    "title": "def — General Procedure and Method Definition",
    "summary": "Declares a callable procedure or function block. Can have side effects, accept arguments, and return values with reply.",
    "syntax": "def <name> ( [arg1, arg2, ...] ):\n  <body>\n  reply <value>",
    "functionalities": [
      {
        "title": "Standard Procedure Definition",
        "desc": "Creates a named reusable code routine with scoped parameters.",
        "code": "def calculateHypotenuse(a, b):\n  reply sqrt(a^2 + b^2)\n\nset hyp : calculateHypotenuse(3, 4)\ndisplay \"Hypotenuse: \" + hyp ?color=#00FFCC"
      },
      {
        "title": "Multi-Argument Function with Logic",
        "desc": "Defines logic containing loops, conditionals, and error guards inside the procedure body.",
        "code": "def findMax(arr):\n  set maxVal : arr[0]\n  loop item in arr:\n    if item > maxVal then set maxVal : item\n  reply maxVal"
      }
    ],
    "pairedWith": [
      "reply",
      "func",
      "method",
      "inbound",
      "outbound",
      "DataType"
    ],
    "parameters": [
      {
        "name": "name",
        "type": "identifier",
        "desc": "Procedure identifier."
      },
      {
        "name": "arguments",
        "type": "identifier list",
        "desc": "Formal parameter names enclosed in parentheses."
      }
    ],
    "returns": "Value specified by the reply statement, or null if void.",
    "tags": [
      "function",
      "procedure",
      "method",
      "subroutine",
      "call",
      "parameter",
      "reply",
      "return",
      "routine"
    ],
    "example": "def greet(name, role):\n  display \"Operator: \" + name + \" [\" + role + \"]\" ?color=#38bdf8\n  reply true\n\ngreet(\"Dr. Aris\", \"Lead Scientist\")"
  },
  {
    "id": "kw-func",
    "name": "func",
    "category": "keyword",
    "subcategory": "Procedures & Functions",
    "title": "func — Pure Function Contract",
    "summary": "Enforces deterministic pure function semantics: zero global side effects, referential transparency, and deterministic outputs.",
    "syntax": "func <name> ( [arg1, arg2, ...] ):\n  <body>\n  reply <value>",
    "functionalities": [
      {
        "title": "Pure Mathematical Transformation",
        "desc": "Guarantees no external variables are mutated; strictly operates on inputs and returns results.",
        "code": "func circleArea(radius):\n  set const pi : 3.1415926535\n  reply pi * radius^2\n\ndisplay circleArea(5) ?color=#00FFCC"
      }
    ],
    "pairedWith": [
      "def",
      "reply",
      "const",
      "num"
    ],
    "parameters": [
      {
        "name": "name",
        "type": "identifier",
        "desc": "Function name."
      },
      {
        "name": "arguments",
        "type": "list",
        "desc": "Inputs passed by value."
      }
    ],
    "returns": "Computed pure result.",
    "tags": [
      "pure",
      "function",
      "deterministic",
      "math",
      "no-side-effects",
      "functional"
    ],
    "example": "func factorial(n):\n  if n <= 1 then reply 1\n  reply n * factorial(n - 1)\n\ndisplay \"5! = \" + factorial(5) ?color=#22c55e"
  },
  {
    "id": "kw-reply",
    "name": "reply",
    "category": "keyword",
    "subcategory": "Control Flow",
    "title": "reply — Function Return Statement",
    "summary": "Terminates the execution of the current procedure, method, or function, transmitting the resulting value back to the caller.",
    "syntax": "reply <expression>",
    "functionalities": [
      {
        "title": "Returning Values to Caller",
        "desc": "Stops execution of the function immediately and passes the evaluated result back.",
        "code": "def multiply(x, y):\n  reply x * y\n\nset res : multiply(6, 7)"
      },
      {
        "title": "Early Exit Guard",
        "desc": "Exits prematurely when validation checks fail.",
        "code": "def validateScore(score):\n  if score < 0 or score > 100 then reply false\n  reply true"
      }
    ],
    "pairedWith": [
      "def",
      "func",
      "method",
      "if"
    ],
    "parameters": [
      {
        "name": "expression",
        "type": "any",
        "desc": "The value returned to the caller."
      }
    ],
    "returns": "Exits current frame and passes the operand.",
    "tags": [
      "return",
      "reply",
      "exit",
      "yield",
      "result",
      "output",
      "back"
    ],
    "example": "def isPrime(n):\n  if n < 2 then reply false\n  loop i from 2 to sqrt(n):\n    if n % i == 0 then reply false\n  reply true"
  },
  {
    "id": "kw-do",
    "name": "do",
    "category": "keyword",
    "subcategory": "Control Flow & Exception Shielding",
    "title": "do — Scoped Execution & Exception Shield",
    "summary": "Creates a protected execution block. When paired with 'unless', provides robust try/catch-style exception shielding against runtime errors.",
    "syntax": "do:\n  <guarded code>\nunless <ErrorName>:\n  <recovery code>",
    "functionalities": [
      {
        "title": "Exception Shielding (Protected Execution)",
        "desc": "Catches critical errors without aborting the program, routing into recovery logic.",
        "code": "do:\n  set res : 100 / 0\nunless DivisionByZeroError:\n  display \"Interception: Cannot divide by zero!\" ?color=#f59e0b\n  set res : 0"
      },
      {
        "title": "Isolated Local Scope Block",
        "desc": "Executes a block with local variable isolation; variables declared inside do not leak outward.",
        "code": "do:\n  set tempKey : \"secret_token_123\"\n  display \"Key loaded in isolated scope\"\n! tempKey is out of scope here"
      }
    ],
    "pairedWith": [
      "unless",
      "internal",
      "external",
      "throw"
    ],
    "parameters": [
      {
        "name": "block",
        "type": "statement block",
        "desc": "The code executed within the protected frame."
      }
    ],
    "returns": "Result of block or recovery block.",
    "tags": [
      "do",
      "try",
      "catch",
      "unless",
      "shield",
      "protect",
      "recover",
      "block",
      "scope",
      "error-handling"
    ],
    "example": "do:\n  load Matrix\n  set inv : Matrix.inv([[1, 2], [2, 4]])\nunless SystemError:\n  display \"Singular matrix detected; fallback to pseudo-inverse.\" ?color=#ef4444"
  },
  {
    "id": "kw-unless",
    "name": "unless",
    "category": "keyword",
    "subcategory": "Control Flow & Exception Shielding",
    "title": "unless — Exception Interception Handler",
    "summary": "Pairs with 'do' to intercept specific or general errors, executing recovery procedures when an exception occurs.",
    "syntax": "do:\n  <body>\nunless [ErrorName]:\n  <fallback>",
    "functionalities": [
      {
        "title": "Specific Error Interception",
        "desc": "Catches only the named error type (e.g. MemoryAllocationError, FileError, DivisionByZeroError).",
        "code": "do:\n  set data : Fs.read(\"non_existent.txt\")\nunless FileError:\n  display \"Missing file; loading defaults.\" ?color=#38bdf8"
      },
      {
        "title": "Catch-All Runtime Interception",
        "desc": "Omitting the error name catches any runtime or syntax error that occurs within the block.",
        "code": "do:\n  riskyOperation()\nunless:\n  display \"Handled generic failure cleanly.\" ?color=#f59e0b"
      }
    ],
    "pairedWith": [
      "do",
      "throw",
      "internal",
      "external"
    ],
    "parameters": [
      {
        "name": "ErrorName (optional)",
        "type": "identifier",
        "desc": "Target exception type to catch."
      }
    ],
    "returns": "Fallback branch value.",
    "tags": [
      "catch",
      "except",
      "unless",
      "recover",
      "fallback",
      "error",
      "handler"
    ],
    "example": "do:\n  set res : 50 / divisor\nunless DivisionByZeroError:\n  set res : 999999\n  display \"Divisor was zero, defaulted to max.\" ?color=#f59e0b"
  },
  {
    "id": "kw-loop",
    "name": "loop",
    "category": "keyword",
    "subcategory": "Iteration & Control Flow",
    "title": "loop — Universal Iteration Engine",
    "summary": "Primary iteration construct in VerScript. Supports range iteration (from...to), step quantifiers (by), collection iteration, and fixed repeats.",
    "syntax": "loop [var] from <start> to <end> [by <step>]:\n  <body>\n\nloop <item> in <collection>:\n  <body>\n\nloop <count>:\n  <body>",
    "functionalities": [
      {
        "title": "Range Iteration with 'from' and 'to'",
        "desc": "Iterates inclusive integer bounds with an index variable.",
        "code": "loop i from 1 to 5:\n  display \"Index: \" + i ?color=#38bdf8"
      },
      {
        "title": "Custom Step with 'by'",
        "desc": "Steps by a custom positive or negative stride through the range.",
        "code": "loop val from 10 to 0 by -2:\n  display \"Countdown: \" + val ?color=#00FFCC"
      },
      {
        "title": "Collection Traversal (in)",
        "desc": "Iterates through array elements directly.",
        "code": "set fruits : [\"Apple\", \"Banana\", \"Cherry\"]\nloop fruit in fruits:\n  display \"Fruit: \" + fruit"
      },
      {
        "title": "Fixed Count Repeat",
        "desc": "Executes the inner body a fixed number of times.",
        "code": "loop 3:\n  display \"Heartbeat ping...\" ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "from",
      "to",
      "by",
      "step",
      "cycle",
      "while",
      "until"
    ],
    "parameters": [
      {
        "name": "start / from",
        "type": "num",
        "desc": "Starting index."
      },
      {
        "name": "end / to",
        "type": "num",
        "desc": "Ending bound (inclusive)."
      },
      {
        "name": "step / by",
        "type": "num",
        "desc": "Stride increment or decrement."
      }
    ],
    "returns": "void",
    "tags": [
      "loop",
      "for",
      "iteration",
      "repeat",
      "range",
      "from",
      "to",
      "by",
      "step",
      "iterate",
      "array"
    ],
    "example": "set primes : []\nloop num from 2 to 20:\n  set isP : true\n  loop d from 2 to (num - 1):\n    if num % d == 0 then set isP : false\n  if isP then primes.push(num)\ndisplay \"Primes: \" + primes ?color=#00FFCC"
  },
  {
    "id": "kw-if",
    "name": "if",
    "category": "keyword",
    "subcategory": "Conditional Control Flow",
    "title": "if — Conditional Branching",
    "summary": "Evaluates a boolean condition, executing the 'then' block if true, or the optional 'else' block if false.",
    "syntax": "if <condition> then\n  <consequent>\n[else\n  <alternative>]",
    "functionalities": [
      {
        "title": "Basic Conditional Branch",
        "desc": "Executes code if expression evaluates to true.",
        "code": "if score >= 90 then\n  display \"Grade: A\" ?color=#22c55e\nelse\n  display \"Keep practicing\" ?color=#f59e0b"
      },
      {
        "title": "One-Line Conditional",
        "desc": "Compact inline branch execution.",
        "code": "if temp > 100 then display \"Overheating!\" ?color=#ef4444"
      }
    ],
    "pairedWith": [
      "then",
      "else",
      "guard",
      "match"
    ],
    "parameters": [
      {
        "name": "condition",
        "type": "bool",
        "desc": "Expression evaluating to true or false."
      }
    ],
    "returns": "Branch result if used as expression.",
    "tags": [
      "if",
      "then",
      "else",
      "conditional",
      "branch",
      "when",
      "check",
      "decision"
    ],
    "example": "set speed : 120\nif speed > 100 then\n  display \"ALERT: Speed limit exceeded!\" ?color=#ef4444\nelse\n  display \"Speed within normal parameters.\" ?color=#22c55e"
  },
  {
    "id": "kw-match",
    "name": "match",
    "category": "keyword",
    "subcategory": "Conditional Control Flow",
    "title": "match — Pattern Matching and Multi-Case Branching",
    "summary": "Tests a subject against multiple pattern branches with structural deconstruction and type matching.",
    "syntax": "match <subject> with:\n  case <pattern1>: <action1>\n  case <pattern2>: <action2>\n  case _: <default_action>",
    "functionalities": [
      {
        "title": "Structural Multi-Case Matching",
        "desc": "Replaces cumbersome if-else ladders with clean pattern branches.",
        "code": "set code : 200\nmatch code with:\n  case 200: display \"OK\" ?color=#22c55e\n  case 404: display \"Not Found\" ?color=#f59e0b\n  case 500: display \"Server Error\" ?color=#ef4444\n  case _:   display \"Unknown Code\""
      }
    ],
    "pairedWith": [
      "with",
      "case",
      "if"
    ],
    "parameters": [
      {
        "name": "subject",
        "type": "any",
        "desc": "The value inspected."
      },
      {
        "name": "cases",
        "type": "pattern list",
        "desc": "Branch targets."
      }
    ],
    "returns": "Evaluated branch value.",
    "tags": [
      "match",
      "switch",
      "case",
      "pattern",
      "with",
      "dispatch",
      "branch"
    ],
    "example": "set role : \"admin\"\nmatch role with:\n  case \"admin\": display \"Full Root Permissions\" ?color=#00FFCC\n  case \"user\":  display \"Standard Access\" ?color=#38bdf8\n  case _:       display \"Guest Mode\""
  },
  {
    "id": "kw-load",
    "name": "load",
    "category": "keyword",
    "subcategory": "Module & Library System",
    "title": "load — Dynamic Standard Library Loader",
    "summary": "Loads one or more VerScript standard libraries into the execution environment. Supports comma-separated multi-loading.",
    "syntax": "load <Library1> [, <Library2>, ...]",
    "functionalities": [
      {
        "title": "Single Library Loading",
        "desc": "Imports a specific standard library (e.g. Matrix, Crypto, Stats, Math, Fs, Json).",
        "code": "load Matrix\nset m : Matrix.identity(3)\ndisplay m ?color=#00FFCC"
      },
      {
        "title": "Multi-Library Batch Loading",
        "desc": "Loads multiple modules in a single clean directive.",
        "code": "load Matrix, Crypto, Math, Stats\ndisplay \"All 4 libraries loaded successfully!\" ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "import",
      "lib",
      "inject"
    ],
    "parameters": [
      {
        "name": "libraries",
        "type": "identifiers...",
        "desc": "Names of stdlib modules to load."
      }
    ],
    "returns": "void",
    "tags": [
      "load",
      "import",
      "require",
      "module",
      "library",
      "stdlib",
      "package",
      "use"
    ],
    "example": "load Crypto, Json\nset payload : Json.stringify({ user: \"alex\", role: \"admin\" })\nset hash : Crypto.sha256(payload)\ndisplay \"Payload Hash: \" + hash ?color=#00FFCC"
  },
  {
    "id": "kw-inject",
    "name": "inject",
    "category": "keyword",
    "subcategory": "Polyglot & Metaprogramming",
    "title": "inject — In-Line Polyglot Code Injection",
    "summary": "Executes embedded foreign language code directly within VerScript, with automatic cross-runtime variable marshalling.",
    "syntax": "inject <language>:\n  <foreign code block>",
    "functionalities": [
      {
        "title": "Embedded Python Execution",
        "desc": "Invokes Python runtime and imports libraries like NumPy or SciPy directly.",
        "code": "inject python:\n  import math\n  print(\"Python computed pi:\", math.pi)"
      },
      {
        "title": "Embedded C Execution",
        "desc": "Compiles and executes high-performance native C code in-process.",
        "code": "inject c:\n  printf(\"Native C hardware execution\\n\");"
      }
    ],
    "pairedWith": [
      "load",
      "alias",
      "DataType"
    ],
    "parameters": [
      {
        "name": "language",
        "type": "identifier",
        "desc": "Target runtime (python, c, js, bash, rust)."
      },
      {
        "name": "code block",
        "type": "indented block",
        "desc": "Foreign source code to execute."
      }
    ],
    "returns": "Exported foreign symbols or standard output.",
    "tags": [
      "inject",
      "polyglot",
      "python",
      "c",
      "javascript",
      "interop",
      "foreign",
      "embedded",
      "bridge"
    ],
    "example": "inject js:\n  const now = new Date().toISOString();\n  console.log(\"Current ISO timestamp:\", now);"
  },
  {
    "id": "kw-guard",
    "name": "guard",
    "category": "keyword",
    "subcategory": "Control Flow & Watchguards",
    "title": "guard — Memory & Invariant Watchguard",
    "summary": "Establishes a reactive watchguard that monitors an invariant expression, immediately triggering alerts if violated.",
    "syntax": "guard <condition>:\n  <alert_action>",
    "functionalities": [
      {
        "title": "Invariant Assertions",
        "desc": "Guarantees conditions remain true throughout a scope.",
        "code": "guard memoryUsage < 1000000:\n  display \"CRITICAL: Memory threshold exceeded!\" ?color=#ef4444"
      }
    ],
    "pairedWith": [
      "do",
      "unless",
      "throw",
      "DataType"
    ],
    "parameters": [
      {
        "name": "condition",
        "type": "bool",
        "desc": "Invariant expression to check continuously."
      }
    ],
    "returns": "void",
    "tags": [
      "guard",
      "assert",
      "watchdog",
      "invariant",
      "memory",
      "protect",
      "monitor"
    ],
    "example": "set num balance : 500\nguard balance >= 0:\n  display \"Violation: Balance cannot be negative!\" ?color=#ef4444\nset balance : balance - 100"
  },
  {
    "id": "kw-async",
    "name": "async",
    "category": "keyword",
    "subcategory": "Concurrency & Reactive",
    "title": "async — Asynchronous Task Execution",
    "summary": "Spawns an asynchronous concurrent worker thread or fiber, executing the block non-blockingly.",
    "syntax": "async:\n  <body>\n\nset task : async def taskName():\n  <body>",
    "functionalities": [
      {
        "title": "Non-Blocking Background Worker",
        "desc": "Spawns background tasks while the main thread continues.",
        "code": "async:\n  Time.sleep(1000)\n  display \"Background task complete!\" ?color=#22c55e\ndisplay \"Main thread running immediately...\" ?color=#00FFCC"
      }
    ],
    "pairedWith": [
      "sync",
      "chan",
      "send",
      "recv",
      "when"
    ],
    "parameters": [
      {
        "name": "block",
        "type": "statement block",
        "desc": "Code executed asynchronously."
      }
    ],
    "returns": "Async task handle.",
    "tags": [
      "async",
      "await",
      "concurrency",
      "thread",
      "fiber",
      "parallel",
      "non-blocking",
      "task"
    ],
    "example": "set ch : chan 5\nasync:\n  send ch, \"Hello from fiber!\"\nset msg : recv ch\ndisplay \"Received: \" + msg ?color=#00FFCC"
  },
  {
    "id": "kw-chan",
    "name": "chan",
    "category": "keyword",
    "subcategory": "Concurrency & Reactive",
    "title": "chan — CSP Concurrency Channel",
    "summary": "Creates a typed or buffered Communicating Sequential Processes (CSP) channel for thread-safe message passing.",
    "syntax": "set <ch> : chan [bufferSize]",
    "functionalities": [
      {
        "title": "Thread-Safe Channel Creation",
        "desc": "Allocates a message-passing queue used with send and recv.",
        "code": "set jobs : chan 10\nsend jobs, \"Data payload 1\"\nset item : recv jobs"
      }
    ],
    "pairedWith": [
      "send",
      "recv",
      "async",
      "sync"
    ],
    "parameters": [
      {
        "name": "bufferSize (optional)",
        "type": "num",
        "desc": "Maximum buffer capacity before blocking."
      }
    ],
    "returns": "Channel handle.",
    "tags": [
      "chan",
      "channel",
      "queue",
      "message",
      "csp",
      "send",
      "recv",
      "pipe",
      "concurrency"
    ],
    "example": "set messages : chan 3\nsend messages, \"MSG_1\"\nsend messages, \"MSG_2\"\ndisplay recv messages ?color=#00FFCC\ndisplay recv messages ?color=#38bdf8"
  },
  {
    "id": "kw-send",
    "name": "send",
    "category": "keyword",
    "subcategory": "Concurrency & Reactive",
    "title": "send — Transmit Message to Channel",
    "summary": "Pushes a message onto a concurrency channel. Blocks if the channel buffer is saturated.",
    "syntax": "send <channel>, <message>",
    "functionalities": [
      {
        "title": "Channel Transmission",
        "desc": "Sends a value across a concurrency channel to waiting receivers.",
        "code": "set mailbox : chan 5\nsend mailbox, \"New Order Received\""
      }
    ],
    "pairedWith": [
      "recv",
      "chan",
      "async"
    ],
    "parameters": [
      {
        "name": "channel",
        "type": "chan",
        "desc": "Destination channel."
      },
      {
        "name": "message",
        "type": "any",
        "desc": "Payload to transmit."
      }
    ],
    "returns": "bool — true on successful delivery.",
    "tags": [
      "send",
      "channel",
      "push",
      "message",
      "transmit",
      "emit",
      "pipe"
    ],
    "example": "set queue : chan 2\nsend queue, 100\nsend queue, 200"
  },
  {
    "id": "kw-recv",
    "name": "recv",
    "category": "keyword",
    "subcategory": "Concurrency & Reactive",
    "title": "recv — Receive Message from Channel",
    "summary": "Pulls and consumes the next available message from a channel. Blocks if the channel is currently empty.",
    "syntax": "set <msg> : recv <channel>",
    "functionalities": [
      {
        "title": "Channel Message Consumption",
        "desc": "Retrieves a value from a channel queue.",
        "code": "set payload : recv jobQueue\ndisplay \"Processing: \" + payload"
      }
    ],
    "pairedWith": [
      "send",
      "chan",
      "async"
    ],
    "parameters": [
      {
        "name": "channel",
        "type": "chan",
        "desc": "Channel to read from."
      }
    ],
    "returns": "The message object read from the channel.",
    "tags": [
      "recv",
      "receive",
      "channel",
      "pull",
      "consume",
      "pop",
      "message"
    ],
    "example": "set pipe : chan 1\nsend pipe, \"Ping\"\nset reply : recv pipe\ndisplay reply ?color=#00FFCC"
  },
  {
    "id": "kw-emit",
    "name": "emit",
    "category": "keyword",
    "subcategory": "Reactive & Event Architecture",
    "title": "emit — Dispatch Reactive Event",
    "summary": "Fires an event into the global or scoped reactive bus, immediately triggering all matching 'on' listeners.",
    "syntax": "emit <eventName> [, <payload>]",
    "functionalities": [
      {
        "title": "Reactive Event Dispatch",
        "desc": "Triggers event handlers across the runtime asynchronously or synchronously.",
        "code": "emit \"user:login\", { id: 101, username: \"alex\" }"
      }
    ],
    "pairedWith": [
      "on",
      "when",
      "async"
    ],
    "parameters": [
      {
        "name": "eventName",
        "type": "str",
        "desc": "Unique event identifier."
      },
      {
        "name": "payload (optional)",
        "type": "any",
        "desc": "Data passed to listeners."
      }
    ],
    "returns": "void",
    "tags": [
      "emit",
      "event",
      "dispatch",
      "fire",
      "trigger",
      "publish",
      "pubsub"
    ],
    "example": "on \"telemetry:alert\", def(data):\n  display \"ALERT: \" + data ?color=#ef4444\n\nemit \"telemetry:alert\", \"Overheating in core 3\""
  },
  {
    "id": "kw-on",
    "name": "on",
    "category": "keyword",
    "subcategory": "Reactive & Event Architecture",
    "title": "on — Register Reactive Event Listener",
    "summary": "Attaches a callback procedure to listen for specific events fired via 'emit'.",
    "syntax": "on <eventName>, <handler_procedure>",
    "functionalities": [
      {
        "title": "Event Subscription",
        "desc": "Listens for dispatched events and runs the handler with the event payload.",
        "code": "on \"data:synced\", def(payload):\n  display \"Data synchronization complete!\" ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "emit",
      "when",
      "def"
    ],
    "parameters": [
      {
        "name": "eventName",
        "type": "str",
        "desc": "Target event name to observe."
      },
      {
        "name": "handler",
        "type": "procedure",
        "desc": "Callback procedure."
      }
    ],
    "returns": "Subscription ID.",
    "tags": [
      "on",
      "listen",
      "subscribe",
      "event",
      "handler",
      "callback",
      "observer"
    ],
    "example": "on \"payment:success\", def(amount):\n  display \"Payment processed: $\" + amount ?color=#22c55e\n\nemit \"payment:success\", 450"
  },
  {
    "id": "kw-when",
    "name": "when",
    "category": "keyword",
    "subcategory": "Reactive & Event Architecture",
    "title": "when — Reactive Conditional Observer",
    "summary": "Monitors a reactive property or state expression, executing a reaction as soon as the condition transitions to true.",
    "syntax": "when <condition>:\n  <reactive_action>",
    "functionalities": [
      {
        "title": "Reactive State Transition Observer",
        "desc": "Waits until a variable state satisfies a predicate before triggering.",
        "code": "when temperature > 85:\n  display \"Temperature warning active\" ?color=#ef4444"
      }
    ],
    "pairedWith": [
      "on",
      "emit",
      "guard"
    ],
    "parameters": [
      {
        "name": "condition",
        "type": "bool",
        "desc": "State predicate monitored."
      }
    ],
    "returns": "void",
    "tags": [
      "when",
      "reactive",
      "observe",
      "watch",
      "condition",
      "listener",
      "trigger"
    ],
    "example": "set fuelLevel : 10\nwhen fuelLevel < 15:\n  display \"LOW FUEL: Refuel required immediately.\" ?color=#f59e0b"
  },
  {
    "id": "datatype",
    "name": "DataType",
    "category": "datatype",
    "subcategory": "Constrained Types",
    "summary": "Defines a custom named datatype with runtime validation constraints and invariant predicates.",
    "syntax": "DataType <TypeName>:\n  guard <expression_with_it>\n\nDataType <Port>:\n  guard it >= 1 && it <= 65535",
    "details": "The `DataType` construct enables domain-driven type invariants. Any assignment to a variable annotated with this type verifies the `guard` rule against `it` and throws `DataTypeError` upon violation.",
    "parameters": [
      {
        "name": "TypeName",
        "type": "identifier",
        "description": "Name of the constrained custom type."
      },
      {
        "name": "guard",
        "type": "boolean expression using it",
        "description": "Validation invariant."
      }
    ],
    "return_type": "DataType",
    "paired_keywords": [
      "guard",
      "it",
      "set",
      "throw"
    ],
    "example": "DataType PositiveNum:\n  guard it > 0\n\nset PositiveNum count : 5\n! set PositiveNum err : -1  (Throws DataTypeError)",
    "tags": [
      "datatype",
      "constraint",
      "invariant",
      "guard",
      "it",
      "domain-types"
    ]
  },
  {
    "id": "kw-alias",
    "name": "alias",
    "category": "keyword",
    "subcategory": "Declaration & Metaprogramming",
    "title": "alias — Command and Identifier Aliasing",
    "summary": "Creates an alternate identifier or shortcut alias for existing keywords, standard libraries, or procedures.",
    "syntax": "alias <new_name> : <existing_target>",
    "functionalities": [
      {
        "title": "Keyword / Procedure Shortcut",
        "desc": "Provides human-friendly naming or domain-specific language shorthand.",
        "code": "alias print : display\nprint \"Aliased display keyword successfully!\" ?color=#00FFCC"
      },
      {
        "title": "Library Alias",
        "desc": "Shortens verbose standard library paths.",
        "code": "load Matrix\nalias M : Matrix\nset mat : M.identity(3)"
      }
    ],
    "pairedWith": [
      "set",
      "def",
      "load"
    ],
    "parameters": [
      {
        "name": "new_name",
        "type": "identifier",
        "desc": "New alias symbol."
      },
      {
        "name": "existing_target",
        "type": "identifier",
        "desc": "Target symbol or keyword."
      }
    ],
    "returns": "void",
    "tags": [
      "alias",
      "rename",
      "shortcut",
      "typedef",
      "synonym",
      "bind"
    ],
    "example": "alias echo : display\necho \"Hello via echo alias!\" ?color=#38bdf8"
  },
  {
    "id": "kw-class",
    "name": "class",
    "category": "keyword",
    "subcategory": "Object-Oriented Architecture",
    "title": "class — Object-Oriented Blueprint",
    "summary": "Declares an object-oriented class with encapsulated fields, static properties, constructors, and instance methods.",
    "syntax": "class <ClassName>:\n  [static: ...]\n  [dynamic: ...]\n  def init(args):\n    ...",
    "functionalities": [
      {
        "title": "Class Blueprint Definition",
        "desc": "Bundles state and behaviors into an instantiable type.",
        "code": "class Vector2D:\n  def init(x, y):\n    set this.x : x\n    set this.y : y\n  def magnitude():\n    reply sqrt(this.x^2 + this.y^2)\n\nset v : Vector2D(3, 4)\ndisplay v.magnitude() ?color=#00FFCC"
      }
    ],
    "pairedWith": [
      "static",
      "dynamic",
      "method",
      "def",
      "class"
    ],
    "parameters": [
      {
        "name": "ClassName",
        "type": "identifier",
        "desc": "Name of the class."
      }
    ],
    "returns": "Class constructor.",
    "tags": [
      "class",
      "oop",
      "object",
      "blueprint",
      "method",
      "constructor",
      "new",
      "instance"
    ],
    "example": "class BankAccount:\n  def init(holder, balance):\n    set this.holder : holder\n    set this.balance : balance\n  def deposit(amt):\n    set this.balance : this.balance + amt\n    reply this.balance"
  },
  {
    "id": "kw-throw",
    "name": "throw",
    "category": "keyword",
    "subcategory": "Control Flow & Exception Shielding",
    "title": "throw — Raise Custom Exception",
    "summary": "Explicitly raises a named exception or custom error, interrupting standard execution and transferring control to an enclosing 'unless' block.",
    "syntax": "throw <ErrorName> [\"Error message description\"]",
    "functionalities": [
      {
        "title": "Raising Built-in Errors",
        "desc": "Triggers standard exceptions like AssertError, ScopeViolationError, etc.",
        "code": "if balance < amount then\n  throw RuntimeError \"Insufficient funds for withdrawal\""
      }
    ],
    "pairedWith": [
      "do",
      "unless",
      "is_error_name"
    ],
    "parameters": [
      {
        "name": "ErrorName",
        "type": "identifier",
        "desc": "Registered error type."
      },
      {
        "name": "message (optional)",
        "type": "str",
        "desc": "Helpful diagnostic message."
      }
    ],
    "returns": "Unwinds call stack.",
    "tags": [
      "throw",
      "raise",
      "error",
      "exception",
      "abort",
      "panic",
      "fail"
    ],
    "example": "def requirePositive(n):\n  if n <= 0 then throw DomainError \"Value must be positive\"\n  reply n"
  },
  {
    "id": "kw-typeof",
    "name": "typeof",
    "category": "keyword",
    "subcategory": "Type System & Reflection",
    "title": "typeof — Runtime Type Reflection",
    "summary": "Returns the string primitive or class type name of any evaluated operand.",
    "syntax": "typeof <expression>",
    "functionalities": [
      {
        "title": "Inspecting Primitive Types",
        "desc": "Determines whether a value is 'num', 'str', 'bool', 'arr', 'entity', or a custom DataType.",
        "code": "display typeof 42 ?color=#38bdf8      ! \"num\"\ndisplay typeof \"test\" ?color=#38bdf8  ! \"str\"\ndisplay typeof [1, 2] ?color=#38bdf8  ! \"arr\""
      }
    ],
    "pairedWith": [
      "DataType",
      "num",
      "str",
      "bool",
      "arr"
    ],
    "parameters": [
      {
        "name": "expression",
        "type": "any",
        "desc": "Operand to inspect."
      }
    ],
    "returns": "str — Name of the type.",
    "tags": [
      "typeof",
      "type",
      "reflection",
      "inspect",
      "instanceof",
      "is"
    ],
    "example": "def printType(x):\n  display \"Type is: \" + (typeof x) ?color=#00FFCC"
  },
  {
    "id": "lib-matrix",
    "name": "Matrix",
    "category": "library",
    "subcategory": "Standard Library (Math)",
    "title": "Matrix — High-Performance Linear Algebra",
    "summary": "Deterministic linear algebra and matrix operations: determinants, inverses, eigenvalues, decompositions, and element-wise arithmetic.",
    "syntax": "load Matrix\nMatrix.det(m)\nMatrix.inv(m)\nMatrix.mult(a, b)\nMatrix.identity(n)",
    "functionalities": [
      {
        "title": "Matrix Multiplication & Determinants",
        "desc": "Fast native matrix manipulation with C99 determinism.",
        "code": "load Matrix\nset A : [[1, 2], [3, 4]]\nset det : Matrix.det(A)\nset inv : Matrix.inv(A)\ndisplay \"Determinant: \" + det ?color=#00FFCC\ndisplay \"Inverse: \" + inv ?color=#38bdf8"
      },
      {
        "title": "Identity and Zero Matrices",
        "desc": "Generates square identity matrices and dimensioned zero matrices.",
        "code": "load Matrix\nset I : Matrix.identity(3)\ndisplay I ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "Vector",
      "Math",
      "num"
    ],
    "parameters": [
      {
        "name": "matrix",
        "type": "2D array (arr)",
        "desc": "Array of numerical rows."
      }
    ],
    "returns": "Scalar number, transformed matrix array, or vector.",
    "tags": [
      "matrix",
      "linear-algebra",
      "determinant",
      "inverse",
      "math",
      "mult",
      "eigenvalues",
      "vector",
      "dimensions"
    ],
    "example": "load Matrix\nset M : [[2, 1], [5, 7]]\ndisplay \"Det: \" + Matrix.det(M) ?color=#00FFCC\ndisplay \"Trace: \" + Matrix.trace(M) ?color=#38bdf8"
  },
  {
    "id": "lib-crypto",
    "name": "Crypto",
    "category": "library",
    "subcategory": "Standard Library (Security)",
    "title": "Crypto — Cryptographic Hashing and Security",
    "summary": "Cryptographic digest routines including SHA-256, SHA-512, MD5, HMAC generation, and cryptographically secure random bytes.",
    "syntax": "load Crypto\nCrypto.sha256(text)\nCrypto.sha512(text)\nCrypto.hmac(key, data)\nCrypto.randomBytes(count)",
    "functionalities": [
      {
        "title": "SHA-256 Digest Computation",
        "desc": "Computes standard hex-encoded 256-bit hash of string data.",
        "code": "load Crypto\nset digest : Crypto.sha256(\"admin_password_2026\")\ndisplay \"Digest: \" + digest ?color=#00FFCC"
      },
      {
        "title": "HMAC Authentication Signatures",
        "desc": "Generates keyed HMAC digests for API signature verification.",
        "code": "load Crypto\nset sig : Crypto.hmac(\"secret_key\", \"POST /api/v1/trade\")\ndisplay \"Signature: \" + sig ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "Fs",
      "Json",
      "String"
    ],
    "parameters": [
      {
        "name": "data",
        "type": "str",
        "desc": "Data to hash."
      }
    ],
    "returns": "str — Hexadecimal digest string.",
    "tags": [
      "crypto",
      "hash",
      "sha256",
      "sha512",
      "md5",
      "hmac",
      "security",
      "digest",
      "salt",
      "signature"
    ],
    "example": "load Crypto\nset token : Crypto.sha256(\"user_token_seed\")\ndisplay \"Generated Token: \" + token ?color=#00FFCC"
  },
  {
    "id": "lib-stats",
    "name": "Stats",
    "category": "library",
    "subcategory": "Standard Library (Math)",
    "title": "Stats — Statistical Analysis & Probabilities",
    "summary": "Descriptive statistics, variance, standard deviation, linear regression, median, quartiles, and correlation.",
    "syntax": "load Stats\nStats.mean(arr)\nStats.median(arr)\nStats.variance(arr)\nStats.stdDev(arr)",
    "functionalities": [
      {
        "title": "Descriptive Statistics",
        "desc": "Calculates average, median, variance, and standard deviation.",
        "code": "load Stats\nset scores : [88, 92, 79, 95, 100, 85]\ndisplay \"Mean: \" + Stats.mean(scores) ?color=#00FFCC\ndisplay \"StdDev: \" + Stats.stdDev(scores) ?color=#38bdf8"
      }
    ],
    "pairedWith": [
      "Math",
      "Array",
      "Matrix"
    ],
    "parameters": [
      {
        "name": "dataset",
        "type": "arr of num",
        "desc": "Numeric data sample."
      }
    ],
    "returns": "Calculated numeric statistic.",
    "tags": [
      "stats",
      "statistics",
      "mean",
      "median",
      "variance",
      "stddev",
      "average",
      "analytics",
      "regression"
    ],
    "example": "load Stats\nset samples : [12, 15, 18, 22, 30]\ndisplay \"Median: \" + Stats.median(samples) ?color=#22c55e"
  },
  {
    "id": "lib-fs",
    "name": "Fs",
    "category": "library",
    "subcategory": "Standard Library (System)",
    "title": "Fs — File System Operations",
    "summary": "Synchronous and asynchronous file I/O: reading text/binary files, writing files, directory traversal, and path checking.",
    "syntax": "load Fs\nFs.read(path)\nFs.write(path, data)\nFs.exists(path)\nFs.list(dirPath)",
    "functionalities": [
      {
        "title": "Reading and Writing Text Files",
        "desc": "Loads file content into string variables and writes content to disk.",
        "code": "load Fs\nFs.write(\"output.log\", \"System started successfully\\n\")\nset content : Fs.read(\"output.log\")\ndisplay content ?color=#22c55e"
      }
    ],
    "pairedWith": [
      "Json",
      "Sys",
      "do",
      "unless"
    ],
    "parameters": [
      {
        "name": "path",
        "type": "str",
        "desc": "Relative or absolute file path."
      },
      {
        "name": "data",
        "type": "str",
        "desc": "File content to write."
      }
    ],
    "returns": "str / arr / bool depending on method.",
    "tags": [
      "fs",
      "file",
      "read",
      "write",
      "disk",
      "directory",
      "folder",
      "exists",
      "path",
      "io"
    ],
    "example": "load Fs\nif Fs.exists(\"config.json\") then\n  set cfg : Fs.read(\"config.json\")\n  display \"Loaded config.\" ?color=#00FFCC"
  },
  {
    "id": "lib-json",
    "name": "Json",
    "category": "library",
    "subcategory": "Standard Library (Data)",
    "title": "Json — JSON Serialization and Parsing",
    "summary": "Converts VerScript arrays and entity objects to standard JSON strings, and parses JSON strings into native data structures.",
    "syntax": "load Json\nJson.stringify(obj [, pretty])\nJson.parse(jsonString)",
    "functionalities": [
      {
        "title": "Serialization & Deserialization",
        "desc": "Marshals VerScript structures to/from standard JSON text.",
        "code": "load Json\nset raw : '{\"status\":\"ok\",\"code\":200}'\nset data : Json.parse(raw)\ndisplay \"Code: \" + data.code ?color=#22c55e\n\nset serialized : Json.stringify(data, true)\ndisplay serialized ?color=#38bdf8"
      }
    ],
    "pairedWith": [
      "Fs",
      "Http",
      "Net"
    ],
    "parameters": [
      {
        "name": "data",
        "type": "any",
        "desc": "Object to stringify or JSON string to parse."
      }
    ],
    "returns": "Parsed structure or JSON string.",
    "tags": [
      "json",
      "serialize",
      "parse",
      "stringify",
      "data",
      "object",
      "decode",
      "encode"
    ],
    "example": "load Json\nset user : { id: 1, name: \"Ada Lovelace\", verified: true }\nset jsonStr : Json.stringify(user)\ndisplay jsonStr ?color=#00FFCC"
  },
  {
    "id": "err-memory-allocation",
    "name": "MemoryAllocationError",
    "category": "error",
    "subcategory": "Runtime & Memory",
    "title": "MemoryAllocationError — Allocation Failure",
    "summary": "Raised when the operating system or native allocator refuses memory requests due to heap exhaustion or bounds violations.",
    "criticality": "9 / 10",
    "suppressionTier": "Tier 4 (Unsuppressable Fatal)",
    "causes": "Requested buffer exceeds available physical RAM; infinite recursive allocation loops.",
    "remedy": "Check array bounds, verify recursion termination conditions, and free tracked references.",
    "tags": [
      "memory",
      "allocation",
      "heap",
      "ram",
      "fatal",
      "out-of-memory",
      "oom",
      "exhaustion"
    ],
    "example": "do:\n  ! Allocate safe size\n  set safeArr : [1, 2, 3, 4]\nunless MemoryAllocationError:\n  display \"System low on memory; terminating buffers.\" ?color=#ef4444"
  },
  {
    "id": "err-division-by-zero",
    "name": "DivisionByZeroError",
    "category": "error",
    "subcategory": "Arithmetic",
    "title": "DivisionByZeroError — Divide or Modulo by Zero",
    "summary": "Triggered whenever an arithmetic division (/) or remainder (%) operation receives a zero denominator.",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1 (SuppressErrors compatible)",
    "causes": "Dividing a numeric value by 0 or 0.0.",
    "remedy": "Guard divisors with an if check or enclose within a do...unless DivisionByZeroError block.",
    "tags": [
      "division",
      "zero",
      "modulo",
      "arithmetic",
      "divide",
      "math",
      "error"
    ],
    "example": "do:\n  set res : 100 / divisor\nunless DivisionByZeroError:\n  display \"Cannot divide by zero!\" ?color=#f59e0b\n  set res : 0"
  },
  {
    "id": "err-undefined-variable",
    "name": "UndefinedVariableError",
    "category": "error",
    "subcategory": "Scope & Resolution",
    "title": "UndefinedVariableError — Unbound Identifier Read",
    "summary": "Raised when accessing an identifier that has not been declared with 'set', 'def', or passed as an argument in the current scope.",
    "criticality": "3 / 10",
    "suppressionTier": "Tier 1 (SuppressErrors compatible)",
    "causes": "Typo in variable name; accessing a variable outside the block where it was declared.",
    "remedy": "Declare variables before reading, check scope boundaries, and review variable spelling.",
    "tags": [
      "undefined",
      "variable",
      "scope",
      "unbound",
      "identifier",
      "missing",
      "name-error"
    ],
    "example": "do:\n  set val : missingVar\nunless UndefinedVariableError:\n  display \"Variable was not defined; fallback activated.\" ?color=#f59e0b"
  },
  {
    "id": "err-scope-violation",
    "name": "ScopeViolationError",
    "category": "error",
    "subcategory": "Purity & Architecture",
    "title": "ScopeViolationError — Scope or Purity Boundary Breach",
    "summary": "Raised when pure functions (func) attempt to mutate external variables or access private/unscoped identifiers.",
    "criticality": "7 / 10",
    "suppressionTier": "Tier 3 (Scoped Suppression)",
    "causes": "Mutating outer scope from inside a pure 'func' or accessing 'private' members externally.",
    "remedy": "Keep pure functions referentially transparent, or switch to 'def' for procedures with side effects.",
    "tags": [
      "scope",
      "purity",
      "mutation",
      "pure",
      "boundary",
      "violation",
      "private"
    ],
    "example": "set globalCount : 0\n! Inside func, modifying globalCount raises ScopeViolationError"
  },
  {
    "id": "err-datatype-error",
    "name": "DataTypeError",
    "category": "error",
    "subcategory": "Type System",
    "title": "DataTypeError — Invariant Constraint Breach",
    "summary": "Raised when assigning a value to a DataType-annotated variable that violates the declared type or guard invariant.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 2 (CriticalErrors compatible)",
    "causes": "Assigning string to num; violating guard predicate in custom DataType.",
    "remedy": "Ensure assigned values satisfy DataType guard conditions before assignment.",
    "tags": [
      "type",
      "datatype",
      "constraint",
      "guard",
      "mismatch",
      "schema",
      "validation"
    ],
    "example": "DataType PositiveNum:\n  val : num\n  guard val > 0\n\ndo:\n  set PositiveNum p : -5\nunless DataTypeError:\n  display \"Validation caught negative value!\" ?color=#ef4444"
  },
  {
    "id": "fn-printing-output",
    "name": "Printing and Console Output",
    "category": "functionality",
    "subcategory": "I/O",
    "title": "How to Print and Format Output in VerScript",
    "summary": "Methods for streaming formatted text, numbers, arrays, and Truecolor ANSI styled messages to the terminal.",
    "recommendedKeywords": [
      "display",
      "prompt",
      "?color",
      "?inline",
      "alias"
    ],
    "tags": [
      "print",
      "output",
      "display",
      "console",
      "log",
      "terminal",
      "color",
      "ansi",
      "write",
      "text",
      "show"
    ],
    "example": "display \"Default white text\"\ndisplay \"Cyan highlighted text\" ?color=#00FFCC\ndisplay \"Loading: \" ?inline ?color=#38bdf8\ndisplay \"Done!\" ?color=#22c55e"
  },
  {
    "id": "fn-exception-handling",
    "name": "Exception Handling & Error Shielding",
    "category": "functionality",
    "subcategory": "Control Flow",
    "title": "How to Catch and Shield Exceptions in VerScript",
    "summary": "Using the 'do...unless' block architecture to intercept runtime errors, prevent crashes, and implement graceful recovery fallbacks.",
    "recommendedKeywords": [
      "do",
      "unless",
      "throw",
      "internal",
      "external"
    ],
    "tags": [
      "try",
      "catch",
      "exception",
      "error",
      "shield",
      "protect",
      "recover",
      "throw",
      "raise",
      "prevent-crash"
    ],
    "example": "do:\n  set result : riskyCalculation()\nunless DivisionByZeroError:\n  display \"Caught division by zero; setting default.\" ?color=#f59e0b\n  set result : 0\nunless:\n  display \"Caught unexpected error.\" ?color=#ef4444\n  set result : null"
  },
  {
    "id": "fn-loops-and-ranges",
    "name": "Loops, Ranges, and Iteration",
    "category": "functionality",
    "subcategory": "Iteration",
    "title": "How to Iterate and Loop Over Numbers and Arrays",
    "summary": "Iterating ranges with 'from...to', stepping with 'by', repeating fixed counts, and iterating arrays with 'in'.",
    "recommendedKeywords": [
      "loop",
      "from",
      "to",
      "by",
      "step",
      "cycle",
      "while",
      "until"
    ],
    "tags": [
      "loop",
      "for",
      "iteration",
      "range",
      "array",
      "step",
      "by",
      "traverse",
      "repeat",
      "each"
    ],
    "example": "! Loop with step\nloop i from 0 to 10 by 2:\n  display \"Even number: \" + i ?color=#38bdf8\n\n! Array iteration\nloop item in [\"alpha\", \"beta\", \"gamma\"]:\n  display \"Item: \" + item ?color=#00FFCC"
  },
  {
    "id": "fn-linear-algebra",
    "name": "Linear Algebra & Matrix Math",
    "category": "functionality",
    "subcategory": "Mathematics",
    "title": "How to Compute Matrix Inverses, Determinants, and Multiplications",
    "summary": "Using the Matrix standard library for high-speed deterministic operations on 2D arrays.",
    "recommendedKeywords": [
      "Matrix",
      "load",
      "Vector",
      "Math"
    ],
    "tags": [
      "matrix",
      "linear-algebra",
      "determinant",
      "inverse",
      "multiply",
      "math",
      "arrays",
      "eigenvalues"
    ],
    "example": "load Matrix\nset A : [[4, 7], [2, 6]]\nset det : Matrix.det(A)\nset inv : Matrix.inv(A)\ndisplay \"Determinant: \" + det ?color=#00FFCC\ndisplay \"Inverse Matrix: \" + inv ?color=#22c55e"
  },
  {
    "id": "fn-concurrency-channels",
    "name": "Concurrency, Threads & CSP Channels",
    "category": "functionality",
    "subcategory": "Concurrency",
    "title": "How to Run Background Fibers and Message Passing",
    "summary": "Spawning concurrent non-blocking workers with 'async' and passing messages through thread-safe 'chan', 'send', and 'recv'.",
    "recommendedKeywords": [
      "async",
      "sync",
      "chan",
      "send",
      "recv"
    ],
    "tags": [
      "async",
      "concurrency",
      "thread",
      "fiber",
      "channel",
      "message",
      "queue",
      "send",
      "recv",
      "parallel"
    ],
    "example": "set queue : chan 2\nasync:\n  Time.sleep(500)\n  send queue, \"Worker finished payload\"\n\nset msg : recv queue\ndisplay \"Master received: \" + msg ?color=#00FFCC"
  },
  {
    "id": "fn-reactive-events",
    "name": "Reactive Events and Listeners",
    "category": "functionality",
    "subcategory": "Reactive",
    "title": "How to Build Event-Driven Architecture with emit and on",
    "summary": "Publishing and subscribing to reactive events across the VerScript runtime without tight coupling.",
    "recommendedKeywords": [
      "emit",
      "on",
      "when",
      "guard"
    ],
    "tags": [
      "events",
      "emit",
      "on",
      "when",
      "listener",
      "subscribe",
      "pubsub",
      "reactive",
      "trigger"
    ],
    "example": "on \"order:created\", def(orderId):\n  display \"Notification sent for order #\" + orderId ?color=#22c55e\n\nemit \"order:created\", 45892"
  },
  {
    "id": "kw-while",
    "name": "while",
    "category": "keyword",
    "subcategory": "Iteration",
    "title": "while — VerScript Language Keyword",
    "summary": "Executes a block continuously as long as the condition evaluates to true.",
    "syntax": "while <condition>:\n  <body>",
    "returns": "void / value",
    "example": "set i : 0\nwhile i < 5:\n  display i\n  set i : i + 1",
    "tags": [
      "while",
      "loop",
      "condition",
      "repeat"
    ]
  },
  {
    "id": "kw-until",
    "name": "until",
    "category": "keyword",
    "subcategory": "Iteration",
    "title": "until — VerScript Language Keyword",
    "summary": "Inverted condition loop; executes until the condition becomes true.",
    "syntax": "until <condition>:\n  <body>",
    "returns": "void / value",
    "example": "set done : false\nuntil done:\n  set done : true",
    "tags": [
      "until",
      "loop",
      "repeat",
      "invert"
    ]
  },
  {
    "id": "kw-repeat",
    "name": "repeat",
    "category": "keyword",
    "subcategory": "Iteration",
    "title": "repeat — VerScript Language Keyword",
    "summary": "Repeats a code block for a given count or while a condition holds.",
    "syntax": "repeat <count>:\n  <body>",
    "returns": "void / value",
    "example": "repeat 3:\n  display \"Ping!\"",
    "tags": [
      "repeat",
      "loop",
      "times"
    ]
  },
  {
    "id": "kw-cycle",
    "name": "cycle",
    "category": "keyword",
    "subcategory": "Iteration",
    "title": "cycle — VerScript Language Keyword",
    "summary": "Cycles through elements in an array or collection indefinitely or for a range.",
    "syntax": "cycle <item> in <arr>:\n  <body>",
    "returns": "void / value",
    "example": "cycle color in [\"red\", \"green\", \"blue\"]:\n  display color",
    "tags": [
      "cycle",
      "loop",
      "round-robin",
      "array"
    ]
  },
  {
    "id": "kw-for",
    "name": "for",
    "category": "keyword",
    "subcategory": "Iteration",
    "title": "for — VerScript Language Keyword",
    "summary": "Iterator loop syntax for stepping through countable sequences.",
    "syntax": "for <i = 0; i < N; i = i + 1>:\n  <body>",
    "returns": "void / value",
    "example": "for <i = 0; i < 3; i = i + 1>:\n  display i",
    "tags": [
      "for",
      "loop",
      "index"
    ]
  },
  {
    "id": "kw-from",
    "name": "from",
    "category": "keyword",
    "subcategory": "Iteration Range",
    "title": "from — VerScript Language Keyword",
    "summary": "Designates the starting bound of a range loop.",
    "syntax": "loop i from <start> to <end>",
    "returns": "void / value",
    "example": "loop i from 1 to 10:\n  display i",
    "tags": [
      "from",
      "range",
      "start",
      "loop"
    ]
  },
  {
    "id": "kw-to",
    "name": "to",
    "category": "keyword",
    "subcategory": "Iteration Range",
    "title": "to — VerScript Language Keyword",
    "summary": "Designates the ending bound of a range loop.",
    "syntax": "loop i from <start> to <end>",
    "returns": "void / value",
    "example": "loop i from 0 to 5:\n  display i",
    "tags": [
      "to",
      "range",
      "end",
      "loop"
    ]
  },
  {
    "id": "kw-by",
    "name": "by",
    "category": "keyword",
    "subcategory": "Iteration Step",
    "title": "by — VerScript Language Keyword",
    "summary": "Specifies the stride increment or decrement for a range loop.",
    "syntax": "loop i from <start> to <end> by <step>",
    "returns": "void / value",
    "example": "loop i from 10 to 0 by -2:\n  display i",
    "tags": [
      "by",
      "step",
      "stride",
      "increment",
      "decrement"
    ]
  },
  {
    "id": "kw-step",
    "name": "step",
    "category": "keyword",
    "subcategory": "Iteration Step",
    "title": "step — VerScript Language Keyword",
    "summary": "Explicit step keyword modifier for iteration loops.",
    "syntax": "loop i from 0 to 20 step 5",
    "returns": "void / value",
    "example": "loop i from 0 to 20 step 5:\n  display i",
    "tags": [
      "step",
      "stride",
      "by"
    ]
  },
  {
    "id": "kw-const",
    "name": "const",
    "category": "keyword",
    "subcategory": "Declaration",
    "title": "const — VerScript Language Keyword",
    "summary": "Declares an immutable symbol that cannot be rebound or mutated.",
    "syntax": "set const <name> : <value>",
    "returns": "void / value",
    "example": "set const PI : 3.14159",
    "tags": [
      "const",
      "immutable",
      "constant",
      "final"
    ]
  },
  {
    "id": "kw-static",
    "name": "static",
    "category": "keyword",
    "subcategory": "Scope & Storage",
    "title": "static — VerScript Language Keyword",
    "summary": "Preserves variable value across procedure invocations, or scopes to class namespace.",
    "syntax": "static <var> : <val>",
    "returns": "void / value",
    "example": "class MathUtil:\n  static: def add(a, b): reply a + b",
    "tags": [
      "static",
      "persistent",
      "class-level"
    ]
  },
  {
    "id": "kw-dynamic",
    "name": "dynamic",
    "category": "keyword",
    "subcategory": "Scope & Storage",
    "title": "dynamic — VerScript Language Keyword",
    "summary": "Binds variable dynamically in the execution call stack rather than lexically.",
    "syntax": "dynamic <var> : <val>",
    "returns": "void / value",
    "example": "dynamic logLevel : \"DEBUG\"",
    "tags": [
      "dynamic",
      "scope",
      "stack"
    ]
  },
  {
    "id": "kw-meta",
    "name": "meta",
    "category": "keyword",
    "subcategory": "Metaprogramming",
    "title": "meta — VerScript Language Keyword",
    "summary": "Accesses language reflection metadata and AST introspection tokens.",
    "syntax": "meta: <introspection>",
    "returns": "void / value",
    "example": "meta: display \"Compiling module\"",
    "tags": [
      "meta",
      "reflection",
      "ast",
      "macros"
    ]
  },
  {
    "id": "kw-thisstatic",
    "name": "thisstatic",
    "category": "keyword",
    "subcategory": "Object Orientation",
    "title": "thisstatic — VerScript Language Keyword",
    "summary": "Accesses class-level static properties from within an instance method.",
    "syntax": "thisstatic.<property>",
    "returns": "void / value",
    "example": "thisstatic.instanceCount : thisstatic.instanceCount + 1",
    "tags": [
      "thisstatic",
      "static",
      "class",
      "oop"
    ]
  },
  {
    "id": "kw-public",
    "name": "public",
    "category": "keyword",
    "subcategory": "Visibility",
    "title": "public — VerScript Language Keyword",
    "summary": "Exports a member or symbol outside the module or class boundary.",
    "syntax": "public <def/set/DataType>",
    "returns": "void / value",
    "example": "public def calculateTax(income): reply income * 0.15",
    "tags": [
      "public",
      "export",
      "visible"
    ]
  },
  {
    "id": "kw-private",
    "name": "private",
    "category": "keyword",
    "subcategory": "Visibility",
    "title": "private — VerScript Language Keyword",
    "summary": "Hides member from outside access, encapsulating it within current class/module.",
    "syntax": "private <set/def>",
    "returns": "void / value",
    "example": "private set internalSecret : \"xyz\"",
    "tags": [
      "private",
      "hidden",
      "encapsulation"
    ]
  },
  {
    "id": "kw-inbound",
    "name": "inbound",
    "category": "keyword",
    "subcategory": "Interface Contracts",
    "title": "inbound — VerScript Language Keyword",
    "summary": "Enforces input parameter validation and preconditions on a function entry.",
    "syntax": "inbound: <validation_guard>",
    "returns": "void / value",
    "example": "def divide(a, b):\n  inbound: b != 0\n  reply a / b",
    "tags": [
      "inbound",
      "precondition",
      "contract",
      "require"
    ]
  },
  {
    "id": "kw-outbound",
    "name": "outbound",
    "category": "keyword",
    "subcategory": "Interface Contracts",
    "title": "outbound — VerScript Language Keyword",
    "summary": "Enforces postconditions and return value contracts on function exit.",
    "syntax": "outbound: <return_guard>",
    "returns": "void / value",
    "example": "def getPositive():\n  outbound: it > 0\n  reply 42",
    "tags": [
      "outbound",
      "postcondition",
      "contract",
      "ensure"
    ]
  },
  {
    "id": "kw-outscope",
    "name": "outscope",
    "category": "keyword",
    "subcategory": "Scope Escapes",
    "title": "outscope — VerScript Language Keyword",
    "summary": "Binds a value in the parent lexical scope from within a nested block.",
    "syntax": "outscope <var> : <val>",
    "returns": "void / value",
    "example": "do:\n  outscope leakedVar : 100",
    "tags": [
      "outscope",
      "parent",
      "scope",
      "escape"
    ]
  },
  {
    "id": "kw-temp",
    "name": "temp",
    "category": "keyword",
    "subcategory": "Storage Lifecycles",
    "title": "temp — VerScript Language Keyword",
    "summary": "Declares an ephemeral variable that is automatically discarded after block termination.",
    "syntax": "set temp <var> : <val>",
    "returns": "void / value",
    "example": "set temp buffer : [1, 2, 3]",
    "tags": [
      "temp",
      "ephemeral",
      "short-lived",
      "stack"
    ]
  },
  {
    "id": "kw-inst",
    "name": "inst",
    "category": "keyword",
    "subcategory": "Storage Lifecycles",
    "title": "inst — VerScript Language Keyword",
    "summary": "Eagerly instantiates an object instance into memory.",
    "syntax": "set inst <var> : <Constructor>",
    "returns": "void / value",
    "example": "set inst logger : Logger()",
    "tags": [
      "inst",
      "instance",
      "eager"
    ]
  },
  {
    "id": "kw-del",
    "name": "del",
    "category": "keyword",
    "subcategory": "Lifecycle",
    "title": "del — VerScript Language Keyword",
    "summary": "Deletes a variable or property reference, allowing garbage collection.",
    "syntax": "del <var>",
    "returns": "void / value",
    "example": "del tempCache",
    "tags": [
      "del",
      "delete",
      "free",
      "remove"
    ]
  },
  {
    "id": "kw-import",
    "name": "import",
    "category": "keyword",
    "subcategory": "Module System",
    "title": "import — VerScript Language Keyword",
    "summary": "Imports native modules, headers, or external VerScript packages.",
    "syntax": "import <module> [as <alias>]",
    "returns": "void / value",
    "example": "import \"stdlib/Math.lib.vrs\" as M",
    "tags": [
      "import",
      "module",
      "require",
      "include"
    ]
  },
  {
    "id": "kw-as",
    "name": "as",
    "category": "keyword",
    "subcategory": "Type Casting & Aliasing",
    "title": "as — VerScript Language Keyword",
    "summary": "Casts an expression to a target type or binds an imported module alias.",
    "syntax": "<expr> as <Type>\nimport <mod> as <alias>",
    "returns": "void / value",
    "example": "set n : \"123\" as num",
    "tags": [
      "as",
      "cast",
      "alias",
      "convert"
    ]
  },
  {
    "id": "kw-export",
    "name": "export",
    "category": "keyword",
    "subcategory": "Module System",
    "title": "export — VerScript Language Keyword",
    "summary": "Explicitly exports identifiers from a library file.",
    "syntax": "export <symbol1>, <symbol2>",
    "returns": "void / value",
    "example": "export add, subtract, multiply",
    "tags": [
      "export",
      "public",
      "module",
      "share"
    ]
  },
  {
    "id": "kw-enum",
    "name": "enum",
    "category": "keyword",
    "subcategory": "Type System",
    "title": "enum — VerScript Language Keyword",
    "summary": "Defines an enumerated set of named integer constants.",
    "syntax": "enum <EnumName>:\n  <VAL1>, <VAL2>, ...",
    "returns": "void / value",
    "example": "enum Direction:\n  North, South, East, West",
    "tags": [
      "enum",
      "enumeration",
      "constants"
    ]
  },
  {
    "id": "kw-struct",
    "name": "struct",
    "category": "keyword",
    "subcategory": "Type System",
    "title": "struct — VerScript Language Keyword",
    "summary": "Declares a composite value data structure.",
    "syntax": "struct <Point>:\n  x : num\n  y : num",
    "returns": "void / value",
    "example": "struct Point:\n  x : num\n  y : num",
    "tags": [
      "struct",
      "composite",
      "record",
      "c-struct"
    ]
  },
  {
    "id": "kw-pragma",
    "name": "pragma",
    "category": "keyword",
    "subcategory": "Compiler Directives",
    "title": "pragma — VerScript Language Keyword",
    "summary": "Configures compiler optimizations, suppression tiers, and runtime flags.",
    "syntax": "pragma <directive>",
    "returns": "void / value",
    "example": "pragma SuppressErrors\npragma OptimizeO2",
    "tags": [
      "pragma",
      "compiler",
      "flag",
      "directive"
    ]
  },
  {
    "id": "kw-it",
    "name": "it",
    "category": "keyword",
    "subcategory": "Pipeline & Implicit Receiver",
    "title": "it — VerScript Language Keyword",
    "summary": "Implicit receiver representing the pipelined input in pipeline expressions (|>) or postconditions.",
    "syntax": "<expr> |> <op it>",
    "returns": "void / value",
    "example": "[1, 2, 3] |> it.length",
    "tags": [
      "it",
      "pipeline",
      "receiver",
      "current"
    ]
  },
  {
    "id": "num",
    "name": "num",
    "category": "datatype",
    "subcategory": "Primitive Types",
    "summary": "64-bit IEEE 754 double-precision floating point numeric value, representing integers and decimals seamlessly.",
    "syntax": "set num <name> : <numeric_literal>\nstr a : \"42\"\nset num parsed : a as num",
    "details": "The `num` type in VerScript represents both integer and fractional floating point values. It supports standard arithmetic operators (+, -, *, /, %), bitwise operations, mathematical functions in the Math library, and automatic type inference.",
    "parameters": [
      {
        "name": "literal",
        "type": "integer or float",
        "description": "Any decimal representation, e.g. 42, -10, 3.14159, 1e-4."
      }
    ],
    "return_type": "num",
    "paired_keywords": [
      "DataType",
      "as",
      "set",
      "Math"
    ],
    "example": "set num count : 10\nset num price : 19.99\nset num total : count * price\ndisplay \"Total: \" + total ?color=cyan",
    "tags": [
      "num",
      "number",
      "int",
      "float",
      "double",
      "datatype",
      "primitive",
      "math"
    ]
  },
  {
    "id": "str",
    "name": "str",
    "category": "datatype",
    "subcategory": "Primitive Types",
    "summary": "UTF-8 encoded string sequence with built-in string methods (.length, .substring, .toUpper, etc.).",
    "syntax": "set str <name> : \"string content\"\nstr multiline : \"Line 1\\nLine 2\"",
    "details": "VerScript strings are immutable UTF-8 text sequences. They support dynamic concatenation with the `+` operator, indexing, slicing, safe navigation, and rich methods such as `.split()`, `.trim()`, `.replace()`, and `.indexOf()`.",
    "parameters": [
      {
        "name": "literal",
        "type": "text sequence",
        "description": "Double-quoted string with escape sequences (\\n, \\t, \\\", \\\\)."
      }
    ],
    "return_type": "str",
    "paired_keywords": [
      "display",
      "prompt",
      "as",
      "String"
    ],
    "example": "set str name : \"VerScript\"\nset str greeting : \"Hello \" + name\ndisplay greeting.toUpper()",
    "tags": [
      "str",
      "string",
      "text",
      "utf8",
      "datatype",
      "primitive",
      "char"
    ]
  },
  {
    "id": "bool",
    "name": "bool",
    "category": "datatype",
    "subcategory": "Primitive Types",
    "summary": "Boolean truth flag literal accepting either true or false.",
    "syntax": "set bool <name> : true | false",
    "details": "Used across all conditional control flow branches (if, unless, while, until, match). Boolean expressions evaluate comparison operations (==, !=, <, >, <=, >=) and logical combinations (&&, ||, !).",
    "parameters": [
      {
        "name": "value",
        "type": "boolean",
        "description": "Keyword true or false."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "if",
      "while",
      "until",
      "unless",
      "guard"
    ],
    "example": "set bool active : true\nif active then:\n  display \"System is online!\" ?color=green",
    "tags": [
      "bool",
      "boolean",
      "true",
      "false",
      "datatype",
      "flag",
      "primitive"
    ]
  },
  {
    "id": "arr",
    "name": "arr",
    "category": "datatype",
    "subcategory": "Collections",
    "summary": "Dynamically sized heterogeneous linear collection supporting indexed access, push/pop, and slice operations.",
    "syntax": "set arr <name> : [<elem1>, <elem2>, ...]\nset <elem> : <name>[<index>]",
    "details": "Arrays hold an ordered list of elements of any type. They support indexing with zero-based integer offsets, length querying with `arr.length`, functional pipelines, and iteration loops.",
    "parameters": [
      {
        "name": "elements",
        "type": "comma-separated values",
        "description": "Elements enclosed within square brackets []."
      }
    ],
    "return_type": "arr",
    "paired_keywords": [
      "cycle",
      "loop",
      "iterate",
      "Array",
      "in"
    ],
    "example": "set arr items : [1, \"two\", 3.0, true]\nitems.push(50)\ndisplay \"Length: \" + items.length\ndisplay items[1]",
    "tags": [
      "arr",
      "array",
      "list",
      "collection",
      "datatype",
      "vector",
      "index"
    ]
  },
  {
    "id": "entity",
    "name": "entity",
    "category": "datatype",
    "subcategory": "Object Orientation",
    "summary": "Dynamic object record or instantiated class/library instance holding bound methods and member fields.",
    "syntax": "set entity <name> : <ClassOrLibName>(<args...>)\nset <name>.<prop> : <val>",
    "details": "Entities represent stateful object instances. They can be created from `class` blueprints, `lib` modules with constructors, or dynamic property maps. Entity members are accessed via the dot `.` operator.",
    "parameters": [
      {
        "name": "constructor",
        "type": "Class or Lib invocation",
        "description": "Invocation of a class or library with constructor parameters."
      }
    ],
    "return_type": "entity",
    "paired_keywords": [
      "class",
      "lib",
      "construct",
      "this",
      "inst"
    ],
    "example": "class Point x y:\n  construct:\n    set this.x : x\n    set this.y : y\n\nset p : Point(10, 20)\ndisplay p.x + \", \" + p.y",
    "tags": [
      "entity",
      "object",
      "instance",
      "class",
      "struct",
      "datatype",
      "oop"
    ]
  },
  {
    "id": "lib-math",
    "name": "Math",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Math — Standard Library",
    "summary": "Trigonometric, logarithmic, and advanced mathematical operations.",
    "syntax": "load Math\nMath.sin(x)\nMath.cos(x)\nMath.pow(a, b)",
    "returns": "Module methods & utilities",
    "example": "load Math\nMath.sin(x)\nMath.cos(x)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "math",
      "sin",
      "cos",
      "pow",
      "sqrt",
      "trig"
    ]
  },
  {
    "id": "lib-vector",
    "name": "Vector",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Vector — Standard Library",
    "summary": "High-speed 2D, 3D, and n-dimensional geometric vector operations (dot, cross, norm).",
    "syntax": "load Vector\nVector.dot(u, v)\nVector.norm(v)\nVector.cross(u, v)",
    "returns": "Module methods & utilities",
    "example": "load Vector\nVector.dot(u, v)\nVector.norm(v)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "vector",
      "geometry",
      "dot-product",
      "cross-product",
      "physics"
    ]
  },
  {
    "id": "lib-string",
    "name": "String",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "String — Standard Library",
    "summary": "String formatting, regex pattern evaluation, slicing, and transformations.",
    "syntax": "load String\nString.split(s, delim)\nString.replace(s, pat, repl)",
    "returns": "Module methods & utilities",
    "example": "load String\nString.split(s, delim)\nString.replace(s, pat, repl)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "string",
      "regex",
      "text",
      "format",
      "replace"
    ]
  },
  {
    "id": "lib-array",
    "name": "Array",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Array — Standard Library",
    "summary": "Functional array manipulation: map, filter, reduce, sort, and zip.",
    "syntax": "load Array\nArray.map(arr, fn)\nArray.filter(arr, fn)\nArray.sort(arr)",
    "returns": "Module methods & utilities",
    "example": "load Array\nArray.map(arr, fn)\nArray.filter(arr, fn)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "array",
      "map",
      "filter",
      "reduce",
      "sort",
      "list"
    ]
  },
  {
    "id": "lib-random",
    "name": "Random",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Random — Standard Library",
    "summary": "Cryptographic and pseudo-random distributions: gaussian, uniform, choice, shuffle.",
    "syntax": "load Random\nRandom.int(min, max)\nRandom.float()\nRandom.choice(arr)",
    "returns": "Module methods & utilities",
    "example": "load Random\nRandom.int(min, max)\nRandom.float()\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "random",
      "rand",
      "dice",
      "shuffle",
      "noise"
    ]
  },
  {
    "id": "lib-color",
    "name": "Color",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Color — Standard Library",
    "summary": "ANSI 24-bit Truecolor terminal palette generation, RGB/HSL conversions, and gradients.",
    "syntax": "load Color\nColor.rgb(r, g, b)\nColor.hex(\"#00FFCC\")",
    "returns": "Module methods & utilities",
    "example": "load Color\nColor.rgb(r, g, b)\nColor.hex(\"#00FFCC\")\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "color",
      "ansi",
      "terminal",
      "rgb",
      "hex",
      "style"
    ]
  },
  {
    "id": "lib-watchdog",
    "name": "Watchdog",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Watchdog — Standard Library",
    "summary": "Hardware memory and execution time watchdogs preventing freeze and leaks.",
    "syntax": "load Watchdog\nWatchdog.arm(maxMs)\nWatchdog.feed()",
    "returns": "Module methods & utilities",
    "example": "load Watchdog\nWatchdog.arm(maxMs)\nWatchdog.feed()\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "watchdog",
      "timeout",
      "guard",
      "leak",
      "monitor"
    ]
  },
  {
    "id": "lib-time",
    "name": "Time",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Time — Standard Library",
    "summary": "High-resolution monotonic timer, epoch timestamps, sleep delay, and date formatting.",
    "syntax": "load Time\nTime.now()\nTime.sleep(ms)\nTime.epoch()",
    "returns": "Module methods & utilities",
    "example": "load Time\nTime.now()\nTime.sleep(ms)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "time",
      "date",
      "sleep",
      "delay",
      "clock",
      "timer"
    ]
  },
  {
    "id": "lib-net",
    "name": "Net",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Net — Standard Library",
    "summary": "Low-level TCP/UDP socket network communications.",
    "syntax": "load Net\nNet.connect(host, port)\nNet.listen(port)",
    "returns": "Module methods & utilities",
    "example": "load Net\nNet.connect(host, port)\nNet.listen(port)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "net",
      "tcp",
      "udp",
      "socket",
      "network"
    ]
  },
  {
    "id": "lib-http",
    "name": "Http",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Http — Standard Library",
    "summary": "High-level HTTP/HTTPS client for GET, POST, and REST API requests.",
    "syntax": "load Http\nHttp.get(url)\nHttp.post(url, body)",
    "returns": "Module methods & utilities",
    "example": "load Http\nHttp.get(url)\nHttp.post(url, body)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "http",
      "https",
      "get",
      "post",
      "api",
      "rest",
      "fetch"
    ]
  },
  {
    "id": "lib-sys",
    "name": "Sys",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Sys — Standard Library",
    "summary": "Operating system inspection: environment variables, arguments, platform, and exit codes.",
    "syntax": "load Sys\nSys.env(\"PATH\")\nSys.args()\nSys.exit(0)",
    "returns": "Module methods & utilities",
    "example": "load Sys\nSys.env(\"PATH\")\nSys.args()\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "sys",
      "os",
      "env",
      "args",
      "platform",
      "exit"
    ]
  },
  {
    "id": "lib-polyserver",
    "name": "Polyserver",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Polyserver — Standard Library",
    "summary": "Dynamic microservice gateway binding internal VerScript endpoints.",
    "syntax": "load Polyserver\nPolyserver.route(\"/api\", handler)",
    "returns": "Module methods & utilities",
    "example": "load Polyserver\nPolyserver.route(\"/api\", handler)\ndisplay \"Library initialized.\" ?color=#00FFCC",
    "tags": [
      "polyserver",
      "server",
      "microservice",
      "gateway",
      "web"
    ]
  },
  {
    "id": "err-invalidoperanderror",
    "name": "InvalidOperandError",
    "category": "error",
    "subcategory": "Expression",
    "title": "InvalidOperandError — Exception Type",
    "summary": "Applying an operator to incompatible types (e.g. adding boolean to array).",
    "criticality": "4 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Applying an operator to incompatible types (e.g. adding boolean to array).",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless InvalidOperandError:\n  display \"Caught InvalidOperandError\" ?color=#f59e0b",
    "tags": [
      "invalidoperanderror",
      "error",
      "exception",
      "expression",
      "failure"
    ]
  },
  {
    "id": "err-indentationerror",
    "name": "IndentationError",
    "category": "error",
    "subcategory": "Syntax",
    "title": "IndentationError — Exception Type",
    "summary": "Mismatched indentation spacing across block boundaries.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 2",
    "causes": "Mismatched indentation spacing across block boundaries.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless IndentationError:\n  display \"Caught IndentationError\" ?color=#f59e0b",
    "tags": [
      "indentationerror",
      "error",
      "exception",
      "syntax",
      "failure"
    ]
  },
  {
    "id": "err-loopiterationerror",
    "name": "LoopIterationError",
    "category": "error",
    "subcategory": "Iteration",
    "title": "LoopIterationError — Exception Type",
    "summary": "Invalid iteration parameters or modifying collection while iterating.",
    "criticality": "4 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Invalid iteration parameters or modifying collection while iterating.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless LoopIterationError:\n  display \"Caught LoopIterationError\" ?color=#f59e0b",
    "tags": [
      "loopiterationerror",
      "error",
      "exception",
      "iteration",
      "failure"
    ]
  },
  {
    "id": "err-looplimiterror",
    "name": "LoopLimitError",
    "category": "error",
    "subcategory": "Iteration",
    "title": "LoopLimitError — Exception Type",
    "summary": "Loop iterations exceeded max execution bound.",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Loop iterations exceeded max execution bound.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless LoopLimitError:\n  display \"Caught LoopLimitError\" ?color=#f59e0b",
    "tags": [
      "looplimiterror",
      "error",
      "exception",
      "iteration",
      "failure"
    ]
  },
  {
    "id": "err-loopdirectionerror",
    "name": "LoopDirectionError",
    "category": "error",
    "subcategory": "Iteration",
    "title": "LoopDirectionError — Exception Type",
    "summary": "Positive step specified for descending range (e.g. 10 to 0 by +1).",
    "criticality": "4 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Positive step specified for descending range (e.g. 10 to 0 by +1).",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless LoopDirectionError:\n  display \"Caught LoopDirectionError\" ?color=#f59e0b",
    "tags": [
      "loopdirectionerror",
      "error",
      "exception",
      "iteration",
      "failure"
    ]
  },
  {
    "id": "err-loopsteperror",
    "name": "LoopStepError",
    "category": "error",
    "subcategory": "Iteration",
    "title": "LoopStepError — Exception Type",
    "summary": "Step of 0 passed to range loop.",
    "criticality": "4 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Step of 0 passed to range loop.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless LoopStepError:\n  display \"Caught LoopStepError\" ?color=#f59e0b",
    "tags": [
      "loopsteperror",
      "error",
      "exception",
      "iteration",
      "failure"
    ]
  },
  {
    "id": "err-syntaxerror",
    "name": "SyntaxError",
    "category": "error",
    "subcategory": "Parser",
    "title": "SyntaxError — Exception Type",
    "summary": "Invalid token stream or missing required delimiter.",
    "criticality": "7 / 10",
    "suppressionTier": "Tier 3",
    "causes": "Invalid token stream or missing required delimiter.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless SyntaxError:\n  display \"Caught SyntaxError\" ?color=#f59e0b",
    "tags": [
      "syntaxerror",
      "error",
      "exception",
      "parser",
      "failure"
    ]
  },
  {
    "id": "err-runtimeerror",
    "name": "RuntimeError",
    "category": "error",
    "subcategory": "Execution",
    "title": "RuntimeError — Exception Type",
    "summary": "Generic runtime exception during expression evaluation.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 2",
    "causes": "Generic runtime exception during expression evaluation.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless RuntimeError:\n  display \"Caught RuntimeError\" ?color=#f59e0b",
    "tags": [
      "runtimeerror",
      "error",
      "exception",
      "execution",
      "failure"
    ]
  },
  {
    "id": "err-invaliderrornameerror",
    "name": "InvalidErrorNameError",
    "category": "error",
    "subcategory": "Exception",
    "title": "InvalidErrorNameError — Exception Type",
    "summary": "Suppression directive or throw passed an unregistered error name.",
    "criticality": "4 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Suppression directive or throw passed an unregistered error name.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless InvalidErrorNameError:\n  display \"Caught InvalidErrorNameError\" ?color=#f59e0b",
    "tags": [
      "invaliderrornameerror",
      "error",
      "exception",
      "exception",
      "failure"
    ]
  },
  {
    "id": "err-systemerror",
    "name": "SystemError",
    "category": "error",
    "subcategory": "OS",
    "title": "SystemError — Exception Type",
    "summary": "Native operating system call failure.",
    "criticality": "8 / 10",
    "suppressionTier": "Tier 3",
    "causes": "Native operating system call failure.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless SystemError:\n  display \"Caught SystemError\" ?color=#f59e0b",
    "tags": [
      "systemerror",
      "error",
      "exception",
      "os",
      "failure"
    ]
  },
  {
    "id": "err-visibilityerror",
    "name": "VisibilityError",
    "category": "error",
    "subcategory": "OOP",
    "title": "VisibilityError — Exception Type",
    "summary": "Accessing private member from outside enclosing scope.",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Accessing private member from outside enclosing scope.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless VisibilityError:\n  display \"Caught VisibilityError\" ?color=#f59e0b",
    "tags": [
      "visibilityerror",
      "error",
      "exception",
      "oop",
      "failure"
    ]
  },
  {
    "id": "err-immutableerror",
    "name": "ImmutableError",
    "category": "error",
    "subcategory": "Storage",
    "title": "ImmutableError — Exception Type",
    "summary": "Attempting to reassign a const variable.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 2",
    "causes": "Attempting to reassign a const variable.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless ImmutableError:\n  display \"Caught ImmutableError\" ?color=#f59e0b",
    "tags": [
      "immutableerror",
      "error",
      "exception",
      "storage",
      "failure"
    ]
  },
  {
    "id": "err-indexoutofboundserror",
    "name": "IndexOutOfBoundsError",
    "category": "error",
    "subcategory": "Array",
    "title": "IndexOutOfBoundsError — Exception Type",
    "summary": "Index exceeds array bounds.",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Index exceeds array bounds.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless IndexOutOfBoundsError:\n  display \"Caught IndexOutOfBoundsError\" ?color=#f59e0b",
    "tags": [
      "indexoutofboundserror",
      "error",
      "exception",
      "array",
      "failure"
    ]
  },
  {
    "id": "err-entityerror",
    "name": "EntityError",
    "category": "error",
    "subcategory": "Object",
    "title": "EntityError — Exception Type",
    "summary": "Invalid property access or mutation on entity.",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Invalid property access or mutation on entity.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless EntityError:\n  display \"Caught EntityError\" ?color=#f59e0b",
    "tags": [
      "entityerror",
      "error",
      "exception",
      "object",
      "failure"
    ]
  },
  {
    "id": "err-fileerror",
    "name": "FileError",
    "category": "error",
    "subcategory": "I/O",
    "title": "FileError — Exception Type",
    "summary": "File not found or permission denied during Fs operations.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 2",
    "causes": "File not found or permission denied during Fs operations.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless FileError:\n  display \"Caught FileError\" ?color=#f59e0b",
    "tags": [
      "fileerror",
      "error",
      "exception",
      "i/o",
      "failure"
    ]
  },
  {
    "id": "err-domainerror",
    "name": "DomainError",
    "category": "error",
    "subcategory": "Math",
    "title": "DomainError — Exception Type",
    "summary": "Math function domain violation (e.g. sqrt of negative number).",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Math function domain violation (e.g. sqrt of negative number).",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless DomainError:\n  display \"Caught DomainError\" ?color=#f59e0b",
    "tags": [
      "domainerror",
      "error",
      "exception",
      "math",
      "failure"
    ]
  },
  {
    "id": "err-asserterror",
    "name": "AssertError",
    "category": "error",
    "subcategory": "Guard",
    "title": "AssertError — Exception Type",
    "summary": "Guard condition or assert evaluated to false.",
    "criticality": "7 / 10",
    "suppressionTier": "Tier 3",
    "causes": "Guard condition or assert evaluated to false.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless AssertError:\n  display \"Caught AssertError\" ?color=#f59e0b",
    "tags": [
      "asserterror",
      "error",
      "exception",
      "guard",
      "failure"
    ]
  },
  {
    "id": "err-unassignedvariableerror",
    "name": "UnassignedVariableError",
    "category": "error",
    "subcategory": "Scope",
    "title": "UnassignedVariableError — Exception Type",
    "summary": "Reading variable declared without initialization.",
    "criticality": "4 / 10",
    "suppressionTier": "Tier 1",
    "causes": "Reading variable declared without initialization.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless UnassignedVariableError:\n  display \"Caught UnassignedVariableError\" ?color=#f59e0b",
    "tags": [
      "unassignedvariableerror",
      "error",
      "exception",
      "scope",
      "failure"
    ]
  },
  {
    "id": "err-asyncerror",
    "name": "AsyncError",
    "category": "error",
    "subcategory": "Concurrency",
    "title": "AsyncError — Exception Type",
    "summary": "Unhandled panic inside async worker fiber.",
    "criticality": "7 / 10",
    "suppressionTier": "Tier 3",
    "causes": "Unhandled panic inside async worker fiber.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless AsyncError:\n  display \"Caught AsyncError\" ?color=#f59e0b",
    "tags": [
      "asyncerror",
      "error",
      "exception",
      "concurrency",
      "failure"
    ]
  },
  {
    "id": "err-channelerror",
    "name": "ChannelError",
    "category": "error",
    "subcategory": "Concurrency",
    "title": "ChannelError — Exception Type",
    "summary": "Writing to closed channel or buffer deadlock.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 2",
    "causes": "Writing to closed channel or buffer deadlock.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless ChannelError:\n  display \"Caught ChannelError\" ?color=#f59e0b",
    "tags": [
      "channelerror",
      "error",
      "exception",
      "concurrency",
      "failure"
    ]
  },
  {
    "id": "err-matcherror",
    "name": "MatchError",
    "category": "error",
    "subcategory": "Control",
    "title": "MatchError — Exception Type",
    "summary": "No match branch satisfied and no default case (_) provided.",
    "criticality": "5 / 10",
    "suppressionTier": "Tier 1",
    "causes": "No match branch satisfied and no default case (_) provided.",
    "remedy": "Use do...unless blocks or validate inputs prior to invocation.",
    "example": "do:\n  ! Risky code\n  display \"Running...\"\nunless MatchError:\n  display \"Caught MatchError\" ?color=#f59e0b",
    "tags": [
      "matcherror",
      "error",
      "exception",
      "control",
      "failure"
    ]
  },
  {
    "id": "err-assertionerror",
    "name": "AssertionError",
    "category": "error",
    "subcategory": "Compiler Exception",
    "title": "AssertionError — Auto-Registered Exception",
    "summary": "Compiler error exception registered in src/main.c.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 1 (SuppressErrors compatible)",
    "causes": "Triggered by runtime or syntax violation during evaluation.",
    "remedy": "Guard with do...unless AssertionError block or validate inputs.",
    "example": "do:\n  ! Operation\nunless AssertionError:\n  display \"Caught AssertionError\" ?color=#f59e0b",
    "tags": [
      "assertionerror",
      "error",
      "exception"
    ]
  },
  {
    "id": "err-operationerror",
    "name": "OperationError",
    "category": "error",
    "subcategory": "Compiler Exception",
    "title": "OperationError — Auto-Registered Exception",
    "summary": "Compiler error exception registered in src/main.c.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 1 (SuppressErrors compatible)",
    "causes": "Triggered by runtime or syntax violation during evaluation.",
    "remedy": "Guard with do...unless OperationError block or validate inputs.",
    "example": "do:\n  ! Operation\nunless OperationError:\n  display \"Caught OperationError\" ?color=#f59e0b",
    "tags": [
      "operationerror",
      "error",
      "exception"
    ]
  },
  {
    "id": "err-headermismatcherror",
    "name": "HeaderMismatchError",
    "category": "error",
    "subcategory": "Compiler Exception",
    "title": "HeaderMismatchError — Auto-Registered Exception",
    "summary": "Compiler error exception registered in src/main.c.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 1 (SuppressErrors compatible)",
    "causes": "Triggered by runtime or syntax violation during evaluation.",
    "remedy": "Guard with do...unless HeaderMismatchError block or validate inputs.",
    "example": "do:\n  ! Operation\nunless HeaderMismatchError:\n  display \"Caught HeaderMismatchError\" ?color=#f59e0b",
    "tags": [
      "headermismatcherror",
      "error",
      "exception"
    ]
  },
  {
    "id": "err-invalidheadererror",
    "name": "InvalidHeaderError",
    "category": "error",
    "subcategory": "Compiler Exception",
    "title": "InvalidHeaderError — Auto-Registered Exception",
    "summary": "Compiler error exception registered in src/main.c.",
    "criticality": "6 / 10",
    "suppressionTier": "Tier 1 (SuppressErrors compatible)",
    "causes": "Triggered by runtime or syntax violation during evaluation.",
    "remedy": "Guard with do...unless InvalidHeaderError block or validate inputs.",
    "example": "do:\n  ! Operation\nunless InvalidHeaderError:\n  display \"Caught InvalidHeaderError\" ?color=#f59e0b",
    "tags": [
      "invalidheadererror",
      "error",
      "exception"
    ]
  },
  {
    "id": "lib-arrays",
    "name": "Arrays",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Arrays — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Arrays.lib.vrs.",
    "syntax": "load Arrays",
    "returns": "Library exports and methods",
    "example": "load Arrays\ndisplay \"Arrays loaded\" ?color=#00FFCC",
    "tags": [
      "arrays",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-assert",
    "name": "Assert",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Assert — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Assert.lib.vrs.",
    "syntax": "load Assert",
    "returns": "Library exports and methods",
    "example": "load Assert\ndisplay \"Assert loaded\" ?color=#00FFCC",
    "tags": [
      "assert",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-benchmark",
    "name": "Benchmark",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Benchmark — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Benchmark.lib.vrs.",
    "syntax": "load Benchmark",
    "returns": "Library exports and methods",
    "example": "load Benchmark\ndisplay \"Benchmark loaded\" ?color=#00FFCC",
    "tags": [
      "benchmark",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-console",
    "name": "Console",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Console — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Console.lib.vrs.",
    "syntax": "load Console",
    "returns": "Library exports and methods",
    "example": "load Console\ndisplay \"Console loaded\" ?color=#00FFCC",
    "tags": [
      "console",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-env",
    "name": "Env",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Env — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Env.lib.vrs.",
    "syntax": "load Env",
    "returns": "Library exports and methods",
    "example": "load Env\ndisplay \"Env loaded\" ?color=#00FFCC",
    "tags": [
      "env",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-log",
    "name": "Log",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Log — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Log.lib.vrs.",
    "syntax": "load Log",
    "returns": "Library exports and methods",
    "example": "load Log\ndisplay \"Log loaded\" ?color=#00FFCC",
    "tags": [
      "log",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-mock",
    "name": "Mock",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Mock — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Mock.lib.vrs.",
    "syntax": "load Mock",
    "returns": "Library exports and methods",
    "example": "load Mock\ndisplay \"Mock loaded\" ?color=#00FFCC",
    "tags": [
      "mock",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-path",
    "name": "Path",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Path — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Path.lib.vrs.",
    "syntax": "load Path",
    "returns": "Library exports and methods",
    "example": "load Path\ndisplay \"Path loaded\" ?color=#00FFCC",
    "tags": [
      "path",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-regex",
    "name": "Regex",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Regex — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Regex.lib.vrs.",
    "syntax": "load Regex",
    "returns": "Library exports and methods",
    "example": "load Regex\ndisplay \"Regex loaded\" ?color=#00FFCC",
    "tags": [
      "regex",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-strings",
    "name": "Strings",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Strings — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Strings.lib.vrs.",
    "syntax": "load Strings",
    "returns": "Library exports and methods",
    "example": "load Strings\ndisplay \"Strings loaded\" ?color=#00FFCC",
    "tags": [
      "strings",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "lib-validate",
    "name": "Validate",
    "category": "library",
    "subcategory": "Standard Library",
    "title": "Validate — Auto-Registered Standard Library",
    "summary": "Standard library module discovered in stdlib/Validate.lib.vrs.",
    "syntax": "load Validate",
    "returns": "Library exports and methods",
    "example": "load Validate\ndisplay \"Validate loaded\" ?color=#00FFCC",
    "tags": [
      "validate",
      "library",
      "stdlib",
      "module"
    ]
  },
  {
    "id": "any",
    "name": "any",
    "category": "datatype",
    "subcategory": "Variant Type",
    "summary": "Unconstrained polymorphic variant type bypassing strict compile-time type validation.",
    "syntax": "set any <name> : <value>",
    "details": "The `any` datatype allows a variable to hold any value (num, str, bool, arr, entity) and be dynamically reassigned to other types at runtime without triggering a DataTypeError.",
    "parameters": [
      {
        "name": "value",
        "type": "any expression",
        "description": "Any valid VerScript expression."
      }
    ],
    "return_type": "any",
    "paired_keywords": [
      "DataType",
      "as",
      "set"
    ],
    "example": "set any dynamicVal : 42\nset dynamicVal : \"Now I am a string\"\ndisplay dynamicVal",
    "tags": [
      "any",
      "variant",
      "dynamic",
      "unconstrained",
      "datatype",
      "polymorphic"
    ]
  },
  {
    "id": "void",
    "name": "void",
    "category": "datatype",
    "subcategory": "Function Signatures",
    "summary": "Designates that a routine performs side-effects and returns no meaningful value.",
    "syntax": "def func <name>(<params>) -> void:\n  <body>",
    "details": "Used primarily in header contract files (*.h.vrs) and explicit function signatures to indicate procedure calls that reply nothing.",
    "parameters": [],
    "return_type": "void",
    "paired_keywords": [
      "def",
      "func",
      "reply",
      "header"
    ],
    "example": "header LoggerContract:\n  def func logMessage(msg: str) -> void\n\ninclude \"LoggerContract.h.vrs\"",
    "tags": [
      "void",
      "none",
      "empty",
      "signature",
      "datatype",
      "return"
    ]
  },
  {
    "id": "nil",
    "name": "nil",
    "category": "datatype",
    "subcategory": "Literals",
    "summary": "Represents the intentional absence of any value or uninitialized object reference.",
    "syntax": "set <name> : nil\nif <name> == nil then: ...",
    "details": "`nil` (or `null`) represents null pointers and absent values. Safe navigation `?.` and nullish coalescing `??` operators are designed specifically to handle `nil` references safely.",
    "parameters": [],
    "return_type": "nil",
    "paired_keywords": [
      "null",
      "??",
      "?.",
      "if"
    ],
    "example": "set user : nil\nset name : user?.name ?? \"Anonymous\"\ndisplay name",
    "tags": [
      "nil",
      "null",
      "absent",
      "empty",
      "datatype",
      "optional"
    ]
  },
  {
    "id": "header",
    "name": "header",
    "category": "keyword",
    "subcategory": "Header Contracts",
    "summary": "Defines an interface contract specification declaring prototypes and type constraints in *.h.vrs files.",
    "syntax": "header <ContractName>:\n  def func <routineName>(<params>): <return_type>\n  struct <StructName>:\n    <field> : <type>",
    "details": "Header specifications enforce compile-time and runtime contracts between callers and implementations. Companion headers (<file>.h.vrs) are automatically detected and verified against implementations (<file>.vrs).",
    "parameters": [
      {
        "name": "ContractName",
        "type": "identifier",
        "description": "Name of the header specification block."
      }
    ],
    "return_type": "Contract Definition",
    "paired_keywords": [
      "include",
      "contract",
      "require",
      "ensure",
      "struct",
      "def"
    ],
    "example": "header MathSpec:\n  def func add(a: num, b: num): num\n  def func mul(a: num, b: num): num",
    "tags": [
      "header",
      "contract",
      "interface",
      "prototype",
      "specification",
      "h.vrs"
    ]
  },
  {
    "id": "contract",
    "name": "contract",
    "category": "keyword",
    "subcategory": "Header Contracts",
    "summary": "Declares an invariant behavioral specification for functions, structs, or libraries.",
    "syntax": "contract <Name>:\n  require: <precondition>\n  ensure: <postcondition>",
    "details": "Enforces Design by Contract (DbC). Contracts guarantee preconditions before routines execute and postconditions after return.",
    "parameters": [
      {
        "name": "Name",
        "type": "identifier",
        "description": "Name of the contract specification."
      }
    ],
    "return_type": "Contract Block",
    "paired_keywords": [
      "header",
      "require",
      "ensure",
      "inbound",
      "outbound"
    ],
    "example": "contract SafeDivision:\n  require: denominator != 0\n  ensure: it != nil",
    "tags": [
      "contract",
      "dbc",
      "invariant",
      "precondition",
      "postcondition",
      "header"
    ]
  },
  {
    "id": "require",
    "name": "require",
    "category": "keyword",
    "subcategory": "Header Contracts",
    "summary": "Specifies a precondition predicate that must evaluate to true prior to executing a routine.",
    "syntax": "require: <boolean_condition>",
    "details": "If the `require` predicate evaluates to false or 0 upon entering a routine, the runtime immediately throws a `PreconditionViolationError`.",
    "parameters": [
      {
        "name": "condition",
        "type": "bool",
        "description": "Precondition assertion expression."
      }
    ],
    "return_type": "void",
    "paired_keywords": [
      "ensure",
      "contract",
      "header",
      "inbound"
    ],
    "example": "def func withdraw(amount: num):\n  require: amount > 0 && amount <= this.balance\n  set this.balance : this.balance - amount",
    "tags": [
      "require",
      "precondition",
      "contract",
      "assertion",
      "guard",
      "header"
    ]
  },
  {
    "id": "ensure",
    "name": "ensure",
    "category": "keyword",
    "subcategory": "Header Contracts",
    "summary": "Specifies a postcondition predicate that must evaluate to true after routine completion before returning to caller.",
    "syntax": "ensure: <boolean_condition_using_it>",
    "details": "Validates return values (accessible via `it`) and state postconditions. A false condition raises `PostconditionViolationError`.",
    "parameters": [
      {
        "name": "condition",
        "type": "bool expression using it",
        "description": "Postcondition assertion predicate."
      }
    ],
    "return_type": "void",
    "paired_keywords": [
      "require",
      "contract",
      "header",
      "outbound",
      "it"
    ],
    "example": "def func abs(x: num):\n  ensure: it >= 0\n  if x < 0 then: reply -x else: reply x",
    "tags": [
      "ensure",
      "postcondition",
      "contract",
      "assertion",
      "it",
      "header"
    ]
  },
  {
    "id": "include",
    "name": "include",
    "category": "keyword",
    "subcategory": "Header Contracts",
    "summary": "Explicitly imports and binds an external *.h.vrs header contract specification into the current compilation unit.",
    "syntax": "include \"<path_to_header>.h.vrs\"",
    "details": "Loads header prototypes and validates all function implementations against declared signatures.",
    "parameters": [
      {
        "name": "headerPath",
        "type": "string",
        "description": "Relative or absolute file path to the *.h.vrs file."
      }
    ],
    "return_type": "void",
    "paired_keywords": [
      "header",
      "contract",
      "import",
      "load"
    ],
    "example": "include \"math_contract.h.vrs\"\n\ndef func add(a: num, b: num):\n  reply a + b",
    "tags": [
      "include",
      "header",
      "contract",
      "import",
      "prototype",
      "h.vrs"
    ]
  },
  {
    "id": "op_plus",
    "name": "+ (Addition / Concat)",
    "category": "operator",
    "subcategory": "Arithmetic & Strings",
    "summary": "Adds numeric values, concatenates strings, or appends elements to arrays.",
    "syntax": "<a> + <b>",
    "details": "Polymorphic operator: (1) Numeric addition: 5 + 3 = 8, (2) String concatenation: \"Hello \" + \"World\", (3) Array union: [1, 2] + [3, 4].",
    "parameters": [
      {
        "name": "a",
        "type": "num | str | arr",
        "description": "Left operand."
      },
      {
        "name": "b",
        "type": "num | str | arr",
        "description": "Right operand."
      }
    ],
    "return_type": "num | str | arr",
    "paired_keywords": [
      "-",
      "*",
      "/",
      "%"
    ],
    "example": "set n : 10 + 25\nset msg : \"Total count: \" + n\ndisplay msg",
    "tags": [
      "+",
      "plus",
      "add",
      "addition",
      "concat",
      "concatenation",
      "operator"
    ]
  },
  {
    "id": "op_minus",
    "name": "- (Subtraction / Negation)",
    "category": "operator",
    "subcategory": "Arithmetic",
    "summary": "Subtracts the right numeric operand from the left operand, or negates a numeric expression as unary minus.",
    "syntax": "<a> - <b>\n-<expression>",
    "details": "Binary subtraction (e.g. 10 - 4 = 6) and unary negation (e.g. -x).",
    "parameters": [
      {
        "name": "a",
        "type": "num",
        "description": "Minuend."
      },
      {
        "name": "b",
        "type": "num",
        "description": "Subtrahend."
      }
    ],
    "return_type": "num",
    "paired_keywords": [
      "+",
      "*",
      "/"
    ],
    "example": "set diff : 100 - 35\nset inv : -diff\ndisplay inv",
    "tags": [
      "-",
      "minus",
      "subtract",
      "subtraction",
      "negation",
      "operator"
    ]
  },
  {
    "id": "op_multiply",
    "name": "* (Multiplication)",
    "category": "operator",
    "subcategory": "Arithmetic",
    "summary": "Multiplies two numeric factors, or repeats a string/array by an integer factor.",
    "syntax": "<a> * <b>",
    "details": "Performs arithmetic multiplication: 6 * 7 = 42. When used with strings and numbers (\"=\" * 10), generates repeating sequences.",
    "parameters": [
      {
        "name": "a",
        "type": "num | str",
        "description": "Left multiplicand."
      },
      {
        "name": "b",
        "type": "num",
        "description": "Right multiplicand."
      }
    ],
    "return_type": "num | str",
    "paired_keywords": [
      "/",
      "+",
      "-"
    ],
    "example": "set area : width * height\nset line : \"=\" * 20\ndisplay line",
    "tags": [
      "*",
      "multiply",
      "multiplication",
      "times",
      "product",
      "operator"
    ]
  },
  {
    "id": "op_divide",
    "name": "/ (Division)",
    "category": "operator",
    "subcategory": "Arithmetic",
    "summary": "Divides the left numeric operand by the right operand. Throws DivisionByZeroError if denominator is 0.",
    "syntax": "<a> / <b>",
    "details": "Floating point division. Automatically throws `DivisionByZeroError` if the denominator equals 0.",
    "parameters": [
      {
        "name": "a",
        "type": "num",
        "description": "Dividend."
      },
      {
        "name": "b",
        "type": "num (non-zero)",
        "description": "Divisor."
      }
    ],
    "return_type": "num",
    "paired_keywords": [
      "%",
      "*",
      "+"
    ],
    "example": "set ratio : 100 / 4\ndisplay \"Ratio: \" + ratio",
    "tags": [
      "/",
      "divide",
      "division",
      "slash",
      "quotient",
      "operator"
    ]
  },
  {
    "id": "op_modulo",
    "name": "% (Modulo)",
    "category": "operator",
    "subcategory": "Arithmetic",
    "summary": "Calculates the integer or floating-point remainder of dividing two numbers.",
    "syntax": "<a> % <b>",
    "details": "Computes remainder after division (e.g. 10 % 3 = 1). Essential for parity checks and circular buffer wrapping.",
    "parameters": [
      {
        "name": "a",
        "type": "num",
        "description": "Dividend."
      },
      {
        "name": "b",
        "type": "num",
        "description": "Divisor."
      }
    ],
    "return_type": "num",
    "paired_keywords": [
      "/",
      "Math"
    ],
    "example": "if count % 2 == 0 then:\n  display \"Even number\"\nelse:\n  display \"Odd number\"",
    "tags": [
      "%",
      "modulo",
      "mod",
      "remainder",
      "operator"
    ]
  },
  {
    "id": "op_eq",
    "name": "== (Equality)",
    "category": "operator",
    "subcategory": "Comparison",
    "summary": "Tests whether two expressions have equal values across numbers, strings, booleans, and arrays.",
    "syntax": "<a> == <b>",
    "details": "Returns true if values are identical; supports structural comparison of strings and numbers.",
    "parameters": [
      {
        "name": "a",
        "type": "any",
        "description": "Left operand."
      },
      {
        "name": "b",
        "type": "any",
        "description": "Right operand."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "!=",
      "<",
      ">",
      "<=",
      ">="
    ],
    "example": "if status == \"ready\" then:\n  display \"Proceeding\"",
    "tags": [
      "==",
      "equality",
      "equals",
      "compare",
      "comparison",
      "operator"
    ]
  },
  {
    "id": "op_neq",
    "name": "!= (Inequality)",
    "category": "operator",
    "subcategory": "Comparison",
    "summary": "Tests whether two expressions evaluate to different values.",
    "syntax": "<a> != <b>",
    "details": "Inverted equality test. Returns true when `a` is not equal to `b`.",
    "parameters": [
      {
        "name": "a",
        "type": "any",
        "description": "Left operand."
      },
      {
        "name": "b",
        "type": "any",
        "description": "Right operand."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "==",
      "!",
      "if"
    ],
    "example": "if token != nil then:\n  display \"Authenticated\"",
    "tags": [
      "!=",
      "inequality",
      "not equal",
      "compare",
      "operator"
    ]
  },
  {
    "id": "op_relational",
    "name": "<, >, <=, >= (Relational)",
    "category": "operator",
    "subcategory": "Comparison",
    "summary": "Ordered relational comparisons: less than (<), greater than (>), less/equal (<=), greater/equal (>=).",
    "syntax": "<a> < <b>\n<a> > <b>\n<a> <= <b>\n<a> >= <b>",
    "details": "Evaluates numerical order and lexicographical string order.",
    "parameters": [
      {
        "name": "a",
        "type": "num | str",
        "description": "Left operand."
      },
      {
        "name": "b",
        "type": "num | str",
        "description": "Right operand."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "==",
      "!=",
      "if",
      "while"
    ],
    "example": "if age >= 18 then:\n  display \"Adult\"",
    "tags": [
      "<",
      ">",
      "<=",
      ">=",
      "relational",
      "comparison",
      "order",
      "operator"
    ]
  },
  {
    "id": "op_and",
    "name": "&& (Logical AND)",
    "category": "operator",
    "subcategory": "Logical",
    "summary": "Short-circuiting logical conjunction. Evaluates to true only if both operands are truthy.",
    "syntax": "<a> && <b>",
    "details": "If `a` evaluates to false, `b` is short-circuited and not evaluated.",
    "parameters": [
      {
        "name": "a",
        "type": "bool",
        "description": "First condition."
      },
      {
        "name": "b",
        "type": "bool",
        "description": "Second condition."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "||",
      "!",
      "if"
    ],
    "example": "if user.isLoggedIn && user.hasPermission then:\n  display \"Access Granted\"",
    "tags": [
      "&&",
      "and",
      "logical and",
      "boolean",
      "operator"
    ]
  },
  {
    "id": "op_or",
    "name": "|| (Logical OR)",
    "category": "operator",
    "subcategory": "Logical",
    "summary": "Short-circuiting logical disjunction. Evaluates to true if either operand is truthy.",
    "syntax": "<a> || <b>",
    "details": "If `a` is true, returns true immediately without evaluating `b`.",
    "parameters": [
      {
        "name": "a",
        "type": "bool",
        "description": "First condition."
      },
      {
        "name": "b",
        "type": "bool",
        "description": "Second condition."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "&&",
      "!",
      "if"
    ],
    "example": "if cache.exists || fetchRemote() then:\n  display \"Data ready\"",
    "tags": [
      "||",
      "or",
      "logical or",
      "boolean",
      "operator"
    ]
  },
  {
    "id": "op_not",
    "name": "! (Logical NOT / Comment Prefix)",
    "category": "operator",
    "subcategory": "Logical & Comments",
    "summary": "Logical negation operator in expressions (!expr); also line comment prefix when starting a line (! comment).",
    "syntax": "!<expression>\n! Single line comment",
    "details": "Dual functionality in VerScript: (1) Inside expressions: inverts boolean truthiness (!true == false), (2) At start of line: denotes a line comment.",
    "parameters": [
      {
        "name": "expr",
        "type": "bool or expression",
        "description": "Expression to negate."
      }
    ],
    "return_type": "bool",
    "paired_keywords": [
      "&&",
      "||",
      "unless"
    ],
    "example": "! This is a VerScript comment line\nset bool flag : false\nif !flag then:\n  display \"Flag was false\"",
    "tags": [
      "!",
      "not",
      "negation",
      "comment",
      "invert",
      "operator"
    ]
  },
  {
    "id": "op_safe_nav",
    "name": "?. (Safe Navigation)",
    "category": "operator",
    "subcategory": "Member Access",
    "summary": "Safe property or method navigation; returns nil without throwing an error if the receiver is nil.",
    "syntax": "<receiver>?.<property>\n<receiver>?.<method>(<args>)",
    "details": "Prevents NullPointer / UndefinedVariable errors when traversing deeply nested optional structures.",
    "parameters": [
      {
        "name": "receiver",
        "type": "entity | object | nil",
        "description": "Object to traverse."
      }
    ],
    "return_type": "any or nil",
    "paired_keywords": [
      "??",
      "nil",
      "."
    ],
    "example": "set city : user?.profile?.address?.city ?? \"Unknown City\"\ndisplay city",
    "tags": [
      "?.",
      "safe navigation",
      "optional chaining",
      "nil safe",
      "operator"
    ]
  },
  {
    "id": "op_null_coalesce",
    "name": "?? (Nullish Coalescing)",
    "category": "operator",
    "subcategory": "Fallbacks",
    "summary": "Returns the right-hand operand if the left operand is nil or empty, otherwise returns the left operand.",
    "syntax": "<expr> ?? <default_value>",
    "details": "Provides a robust fallback mechanism for optional or uninitialized variables.",
    "parameters": [
      {
        "name": "expr",
        "type": "any",
        "description": "Primary value."
      },
      {
        "name": "default_value",
        "type": "any",
        "description": "Fallback value if expr is nil."
      }
    ],
    "return_type": "any",
    "paired_keywords": [
      "?.",
      "nil",
      "set"
    ],
    "example": "set port : config.port ?? 8080\ndisplay \"Running on port: \" + port",
    "tags": [
      "??",
      "coalescing",
      "nullish",
      "default",
      "fallback",
      "operator"
    ]
  },
  {
    "id": "op_colon",
    "name": ": (Assignment & Block Colon)",
    "category": "operator",
    "subcategory": "Syntax & Assignment",
    "summary": "Binds values to variables (set x: 42) and marks indented block headers (if cond:, loop 5:).",
    "syntax": "set <var> : <value>\n<keyword> <condition>:\n  <indented_body>",
    "details": "The fundamental syntactic pillar of VerScript: (1) Replaces the equal sign `=` for variable assignments, (2) Introduces Python-style indented blocks.",
    "parameters": [],
    "return_type": "void",
    "paired_keywords": [
      "set",
      "def",
      "if",
      "while",
      "class",
      "lib"
    ],
    "example": "set x : 100\nif x > 50:\n  display \"Greater than 50\"",
    "tags": [
      ":",
      "colon",
      "assignment",
      "block",
      "bind",
      "syntax",
      "operator"
    ]
  },
  {
    "id": "op_question_flag",
    "name": "? (Directive / Flag Marker)",
    "category": "operator",
    "subcategory": "Directives & Flags",
    "summary": "Prefixes modifier flags and inline parameters on statements (e.g. ?color=cyan, ?default=25, ?override).",
    "syntax": "display <msg> ?color=<name> ?bold\nprompt <var> ?default=<val>",
    "details": "VerScript statements support inline keyword options prefixed by `?` to configure visual formatting or execution flags.",
    "parameters": [],
    "return_type": "void",
    "paired_keywords": [
      "display",
      "prompt",
      "meta",
      "pragma"
    ],
    "example": "display \"Success!\" ?color=green ?bold\nprompt username ?default=\"Guest\"",
    "tags": [
      "?",
      "directive",
      "flag",
      "modifier",
      "color",
      "options",
      "operator"
    ]
  },
  {
    "id": "op_dot",
    "name": ". (Member Access)",
    "category": "operator",
    "subcategory": "Member Access",
    "summary": "Accesses a property or invokes a method on an entity, library, string, or array instance.",
    "syntax": "<object>.<member>",
    "details": "Standard dot-operator notation for object-oriented dispatch, library routine calls (Matrix.det), and property reading.",
    "parameters": [
      {
        "name": "object",
        "type": "entity | lib | str | arr",
        "description": "Receiver instance."
      },
      {
        "name": "member",
        "type": "identifier",
        "description": "Property or method name."
      }
    ],
    "return_type": "any",
    "paired_keywords": [
      "?.",
      "this",
      "class",
      "lib"
    ],
    "example": "load Math\nset radius : 5\nset circ : 2 * Math.PI * radius",
    "tags": [
      ".",
      "dot",
      "member",
      "method",
      "property",
      "call",
      "operator"
    ]
  },
  {
    "id": "construct",
    "name": "construct",
    "category": "keyword",
    "subcategory": "Object Orientation",
    "summary": "Constructor block or routine automatically invoked when instantiating a class or library entity.",
    "syntax": "class <Name> <arg1> <arg2>:\n  construct:\n    set this.<field1> : <arg1>\n    set this.<field2> : <arg2>\n\nlib <LibName> <arg1>:\n  construct:\n    ...",
    "details": "The constructor initializes an entity's dynamic state upon creation. Parameters passed into `MyClass(a, b)` or `MyLib(a, b)` are bound in scope and available to initialize `this` properties. Constructors require no arguments of their own because class/lib arguments are attached directly to the definition.",
    "parameters": [
      {
        "name": "this properties",
        "type": "assignments",
        "description": "Initialization statements setting this.<prop> fields."
      }
    ],
    "return_type": "Entity Instance",
    "paired_keywords": [
      "class",
      "lib",
      "this",
      "inst",
      "set"
    ],
    "example": "class Vector2D x y:\n  construct:\n    set this.x : x\n    set this.y : y\n  def func magnitude:\n    reply Math.sqrt(this.x * this.x + this.y * this.y)\n\nset v : Vector2D(3, 4)\ndisplay v.magnitude()  ! 5",
    "tags": [
      "construct",
      "constructor",
      "init",
      "create",
      "class",
      "lib",
      "oop"
    ]
  },
  {
    "id": "this",
    "name": "this",
    "category": "keyword",
    "subcategory": "Object Orientation",
    "summary": "Implicit reference to the current entity instance executing a method or constructor.",
    "syntax": "this.<property>\nthis.<method>()",
    "details": "Within `class` and `lib` methods and constructors, `this` binds to the active instance state and dynamic member variables.",
    "parameters": [],
    "return_type": "entity",
    "paired_keywords": [
      "class",
      "lib",
      "construct",
      "thisstatic"
    ],
    "example": "class Counter:\n  construct:\n    set this.val : 0\n  def func inc:\n    set this.val : this.val + 1",
    "tags": [
      "this",
      "self",
      "instance",
      "current",
      "oop",
      "keyword"
    ]
  },
  {
    "id": "matrix_class",
    "name": "Matrix (Constructor & Class)",
    "category": "library",
    "subcategory": "Matrix Math",
    "summary": "Linear algebra library and matrix class supporting constructors, determinants, matrix multiplication, inversion, and decomposition.",
    "syntax": "load Matrix\nset m : Matrix(rows, cols, defaultValue)\nMatrix.det(m)\nMatrix.identity(n)",
    "details": "`Matrix` can be used statically (`Matrix.multiply(A, B)`) or instantiated as an entity (`set m : Matrix(3, 3, 0); m.det()`).",
    "parameters": [
      {
        "name": "rows",
        "type": "num",
        "description": "Number of rows."
      },
      {
        "name": "cols",
        "type": "num",
        "description": "Number of columns."
      },
      {
        "name": "defaultVal",
        "type": "num",
        "description": "Optional initial element value (default 0)."
      }
    ],
    "return_type": "Matrix entity or 2D Array",
    "paired_keywords": [
      "load",
      "Vector",
      "Math",
      "construct"
    ],
    "example": "load Matrix\nset m : Matrix.identity(3)\ndisplay \"Determinant: \" + Matrix.det(m)",
    "tags": [
      "matrix",
      "det",
      "determinant",
      "identity",
      "inverse",
      "linear-algebra",
      "math",
      "library"
    ]
  },
  {
    "id": "vector_class",
    "name": "Vector (Constructor & Class)",
    "category": "library",
    "subcategory": "Vector Math",
    "summary": "2D, 3D, and n-dimensional geometric vector library and class (dot product, cross product, magnitude, normalize).",
    "syntax": "load Vector\nset v : Vector(x, y, z)\nv.magnitude()\nVector.dot(v1, v2)",
    "details": "Provides high-speed vector arithmetic. Supports instance method calls (`v.magnitude()`) as well as static library functions (`Vector.cross(u, v)`).",
    "parameters": [
      {
        "name": "x",
        "type": "num",
        "description": "X component."
      },
      {
        "name": "y",
        "type": "num",
        "description": "Y component."
      },
      {
        "name": "z",
        "type": "num",
        "description": "Optional Z component (default 0)."
      }
    ],
    "return_type": "Vector entity",
    "paired_keywords": [
      "load",
      "Matrix",
      "Math",
      "construct"
    ],
    "example": "load Vector\nset v1 : Vector(1, 0, 0)\nset v2 : Vector(0, 1, 0)\nset v3 : Vector.cross(v1, v2)\ndisplay v3.z  ! 1",
    "tags": [
      "vector",
      "dot",
      "cross",
      "magnitude",
      "norm",
      "physics",
      "geometry",
      "library"
    ]
  },
  {
    "id": "json_methods",
    "name": "Json.parse / Json.stringify",
    "category": "library",
    "subcategory": "Serialization",
    "summary": "Parses JSON text into VerScript entities and arrays, or serializes data into formatted JSON strings.",
    "syntax": "load Json\nset data : Json.parse(jsonString)\nset text : Json.stringify(data)",
    "details": "Standard JSON parser and serializer with support for nested arrays, dictionaries, numbers, and escape characters.",
    "parameters": [
      {
        "name": "input",
        "type": "str or entity",
        "description": "JSON string to parse, or entity to serialize."
      }
    ],
    "return_type": "entity | arr | str",
    "paired_keywords": [
      "load",
      "Fs",
      "Http",
      "str"
    ],
    "example": "load Json\nset obj : Json.parse('{\"name\": \"VerScript\", \"version\": 2}')\ndisplay obj.name",
    "tags": [
      "json",
      "parse",
      "stringify",
      "serialization",
      "dict",
      "library"
    ]
  },
  {
    "id": "fs_methods",
    "name": "Fs.readFile / Fs.writeFile",
    "category": "library",
    "subcategory": "Filesystem",
    "summary": "Reads, writes, and manages files and directories on the local host filesystem.",
    "syntax": "load Fs\nset content : Fs.readFile(\"data.txt\")\nFs.writeFile(\"output.txt\", content)\nFs.exists(\"data.txt\")",
    "details": "Provides direct filesystem access. Automatically handles file descriptors, binary buffers, and text encodings.",
    "parameters": [
      {
        "name": "path",
        "type": "str",
        "description": "Filesystem path."
      },
      {
        "name": "content",
        "type": "str",
        "description": "Data to write."
      }
    ],
    "return_type": "str or bool",
    "paired_keywords": [
      "load",
      "Path",
      "Sys"
    ],
    "example": "load Fs\nif Fs.exists(\"config.vrs\") then:\n  set cfg : Fs.readFile(\"config.vrs\")",
    "tags": [
      "fs",
      "file",
      "readfile",
      "writefile",
      "io",
      "filesystem",
      "library"
    ]
  }
];
if (typeof module !== 'undefined' && module.exports) module.exports = window.VERSCRIPT_HELP_DB;
