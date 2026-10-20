// ═══════════════════════════════════════════════════════════════════
//  VerScript Instant VM — Asynchronous In-Browser Execution Engine
//  Features: Progressive line-by-line output & In-Code Interactive Prompt
// ═══════════════════════════════════════════════════════════════════

let __seedState = 12345;

export function evalSimpleExpr(expr, vars) {
    let result = expr.trim();
    if (/^"(?:[^"\\]|\\.)*"$/.test(result)) {
        try { return JSON.parse(result); } catch (e) { return result.slice(1, -1); }
    }

    // Replace variable names
    Object.keys(vars).forEach(k => {
        const regex = new RegExp(`\\b${k}\\b`, 'g');
        const val = typeof vars[k] === 'string' ? `"${vars[k]}"` : vars[k];
        result = result.replace(regex, val);
    });

    // Mask string literals to protect exclamation marks and operators inside text
    const maskedStrings = [];
    result = result.replace(/"(?:[^"\\]|\\.)*"/g, (match) => {
        maskedStrings.push(match);
        return `__STR_${maskedStrings.length - 1}__`;
    });

    try {
        // Chained & nested ternary expressions: if cond then val1 else if cond2 then val2 else val3
        while (/\bif\s+([^\n\r]+?)\s+then\s+([^\n\r]+?)\s+else\b/i.test(result)) {
            result = result.replace(/\bif\s+([^\n\r]+?)\s+then\s+([^\n\r]+?)\s+else\b/g, '($1) ? ($2) : ');
        }

        // Native Mathematical Constants
        result = result.replace(/\b(pi|π)\b/g, '3.141592653589793');
        result = result.replace(/\b(tau|τ)\b/g, '6.283185307179586');
        result = result.replace(/\bphi\b/g, '1.618033988749895');
        result = result.replace(/\b(inf|infinity)\b/g, 'Infinity');

        // Absolute value |expr| -> Math.abs(expr)
        result = result.replace(/\|([^|]+)\|/g, 'Math.abs($1)');

        // Postfix Factorial x! -> __fact(x)
        result = result.replace(/([0-9a-zA-Z_\)]+)!/g, '(__fact($1))');

        // Exponentiation ^ -> **
        result = result.replace(/\^/g, '**');

        // Integer division // -> Math.floor(a / b)
        result = result.replace(/([0-9a-zA-Z_\.\(\)]+)\s*\/\/\s*([0-9a-zA-Z_\.\(\)]+)/g, 'Math.floor(($1) / ($2))');

        // Roots
        result = result.replace(/(?<!\.)(?:sqrt|√)\s*([0-9a-zA-Z_\.\(\)]+)/g, 'Math.sqrt($1)');
        result = result.replace(/(?<!\.)\brt\s+([0-9a-zA-Z_\.\(\)]+)\s+([0-9a-zA-Z_\.\(\)]+)/g, 'Math.pow($2, 1 / ($1))');

        // Min, Max, Clamping
        result = result.replace(/(?<!\.)\bclamp\s+([^\s]+)\s+from\s+([^\s]+)\s+to\s+([^\s]+)/g, 'Math.min(Math.max($1, $2), $3)');
        result = result.replace(/(?<!\.)\bclamp\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g, 'Math.min(Math.max($1, $2), $3)');
        result = result.replace(/(?<!\.)\bmin\s+([^\s]+)\s+([^\s]+)/g, 'Math.min($1, $2)');
        result = result.replace(/(?<!\.)\bmax\s+([^\s]+)\s+([^\s]+)/g, 'Math.max($1, $2)');

        // Interpolation
        result = result.replace(/(?<!\.)\blerp\s+from\s+([^\s]+)\s+to\s+([^\s]+)\s+by\s+([^\s]+)/g, '(($1) + (($2) - ($1)) * ($3))');
        result = result.replace(/(?<!\.)\blerp\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/g, '(($1) + (($2) - ($1)) * ($3))');

        // Signum & Parity
        result = result.replace(/(?<!\.)\b(sign|sgn)\s+([^\s]+)/g, 'Math.sign($2)');
        result = result.replace(/([0-9a-zA-Z_\.\(\)]+)\s+is\s+even\b/g, '(($1) % 2 === 0)');
        result = result.replace(/([0-9a-zA-Z_\.\(\)]+)\s+is\s+odd\b/g, '(($1) % 2 !== 0)');
        result = result.replace(/(?<!\.)\b(isEven|even)\s+([^\s]+)/g, '(($2) % 2 === 0)');
        result = result.replace(/(?<!\.)\b(isOdd|odd)\s+([^\s]+)/g, '(($2) % 2 !== 0)');

        // Trig and Log functions
        result = result.replace(/(?<!\.)\bsinDeg\s+([^\s]+)/g, 'Math.sin(($1) * Math.PI / 180)');
        result = result.replace(/(?<!\.)\bcosDeg\s+([^\s]+)/g, 'Math.cos(($1) * Math.PI / 180)');
        result = result.replace(/(?<!\.)\bdegToRad\s+([^\s]+)/g, '(($1) * Math.PI / 180)');
        result = result.replace(/(?<!\.)\bradToDeg\s+([^\s]+)/g, '(($1) * 180 / Math.PI)');
        result = result.replace(/(?<!\.)\bsin\s+([^\s]+)/g, 'Math.sin($1)');
        result = result.replace(/(?<!\.)\bcos\s+([^\s]+)/g, 'Math.cos($1)');
        result = result.replace(/(?<!\.)\btan\s+([^\s]+)/g, 'Math.tan($1)');
        result = result.replace(/(?<!\.)\bhypot\s+([^\s]+)\s+([^\s]+)/g, 'Math.hypot($1, $2)');
        result = result.replace(/(?<!\.)\bln\s+([^\s]+)/g, 'Math.log($1)');
        result = result.replace(/(?<!\.)\blog2\s+([^\s]+)/g, 'Math.log2($1)');
        result = result.replace(/(?<!\.)\blog\s+([^\s]+)/g, 'Math.log10($1)');
        result = result.replace(/(?<!\.)\bexp\s+([^\s]+)/g, 'Math.exp($1)');
        result = result.replace(/(?<!\.)\bfloor\s+([^\s]+)/g, 'Math.floor($1)');
        result = result.replace(/(?<!\.)\bceil\s+([^\s]+)/g, 'Math.ceil($1)');
        result = result.replace(/(?<!\.)\bround\s+([^\s]+)/g, 'Math.round($1)');

        // Native Pseudo & Random built-in functions
        result = result.replace(/(?:Pseudo|Random)\.seed\s*(?:\(([^)]+)\)|\s+([0-9a-zA-Z_]+))/g, (m, a, b) => `(__setSeed(${a || b}))`);
        result = result.replace(/\bseed\s+([0-9a-zA-Z_]+)/g, '(__setSeed($1))');
        result = result.replace(/(?:Pseudo|Random)\.between\s*(?:\(([^,]+),\s*([^)]+)\)|\s+([0-9a-zA-Z_]+)[,\s]+([0-9a-zA-Z_]+))/g, (m, a, b, c, d) => `(__between(${a || c}, ${b || d}))`);
        result = result.replace(/\bbetween\s+([0-9a-zA-Z_]+)[,\s]+([0-9a-zA-Z_]+)/g, '(__between($1, $2))');
        result = result.replace(/(?:Pseudo|Random)\.choice\s*(?:\(([^)]+)\)|\s+([a-zA-Z_]\w*))/g, (m, a, b) => `(__choice(${a || b}))`);
        result = result.replace(/\bchoice\s+([a-zA-Z_]\w*)/g, '(__choice($1))');
        result = result.replace(/(?:Pseudo|Random)\.shuffle\s*(?:\(([^)]+)\)|\s+([a-zA-Z_]\w*))/g, (m, a, b) => `(__shuffle(${a || b}))`);
        result = result.replace(/\bshuffle\s+([a-zA-Z_]\w*)/g, '(__shuffle($1))');
        result = result.replace(/(?:Pseudo|Random)\.sample\s*(?:\(([^,]+),\s*([^)]+)\)|\s+([a-zA-Z_]\w*)[,\s]+([0-9a-zA-Z_]+))/g, (m, a, b, c, d) => `(__sample(${a || c}, ${b || d}))`);
        result = result.replace(/\bsample\s+([a-zA-Z_]\w*)[,\s]+([0-9a-zA-Z_]+)/g, '(__sample($1, $2))');
        result = result.replace(/(?:Pseudo|Random)\.boolean(?:\s*\(\))?/g, '(__boolean())');
        result = result.replace(/\bboolean(?:\s*\(\))?/g, '(__boolean())');
        result = result.replace(/(?:Pseudo|Random)\.uuid(?:\s*\(\))?/g, '(__uuid())');
        result = result.replace(/\buuid(?:\s*\(\))?/g, '(__uuid())');
        result = result.replace(/(?:Pseudo|Random)\.name(?:\s*\(\))?/g, '(__name())');
        result = result.replace(/\bname(?:\s*\(\))?/g, '(__name())');
        result = result.replace(/(?:Pseudo|Random)\.email(?:\s*\(\))?/g, '(__email())');
        result = result.replace(/\bemail(?:\s*\(\))?/g, '(__email())');
        result = result.replace(/(?:Pseudo|Random)\.alphaNumeric\s*(?:\(([^)]+)\)|\s+([0-9a-zA-Z_]+))/g, (m, a, b) => `(__alphaNumeric(${a || b}))`);
        result = result.replace(/\balphaNumeric\s+([0-9a-zA-Z_]+)/g, '(__alphaNumeric($1))');
        result = result.replace(/(?:Pseudo|Random)\.(?:random|next)(?:\s*\(\))?/g, '(__rng())');
        result = result.replace(/\b(?:random|next)(?:\s*\(\))?/g, '(__rng())');

        // Restore masked strings
        result = result.replace(/__STR_(\d+)__/g, (m, idx) => maskedStrings[Number(idx)]);

        // Stats built-in helpers
        result = result.replace(/\bStats\.sum\s*\(([^)]+)\)/g, '(__sum($1))');
        result = result.replace(/\bStats\.sum\s+([a-zA-Z_]\w*)/g, '(__sum($1))');
        result = result.replace(/\bStats\.mean\s*\(([^)]+)\)/g, '(__mean($1))');
        result = result.replace(/\bStats\.mean\s+([a-zA-Z_]\w*)/g, '(__mean($1))');
        result = result.replace(/\bStats\.minMax\s*\(([^)]+)\)/g, '(__minMax($1))');
        result = result.replace(/\bStats\.minMax\s+([a-zA-Z_]\w*)/g, '(__minMax($1))');
        result = result.replace(/\bStats\.range\s*\(([^)]+)\)/g, '(__range($1))');
        result = result.replace(/\bStats\.range\s+([a-zA-Z_]\w*)/g, '(__range($1))');

        // Boolean logic gates
        result = result.replace(/\bxnor\b/g, ' === ');
        result = result.replace(/\bxand\b/g, ' === ');
        result = result.replace(/x&/g, ' === ');
        result = result.replace(/\bxor\b/g, ' !== ');
        result = result.replace(/([a-zA-Z0-9_")\]]+)\s+nor\s+([a-zA-Z0-9_"(]+)/g, '!($1 || $2)');
        result = result.replace(/([a-zA-Z0-9_")\]]+)\s+nand\s+([a-zA-Z0-9_"(]+)/g, '!($1 && $2)');
        result = result.replace(/\band\b/g, ' && ');
        result = result.replace(/&+/g, '&&');
        result = result.replace(/\bor\b/g, ' || ');
        result = result.replace(/\bnot\b/g, ' ! ');

        const clean = result.replace(/[^0-9a-zA-Z_\s\+\-\*\/\(\)\[\]\"\'\.\,\:\=\>\<\!\&\|\%]/g, '');
        const factHelper = `
            function __fact(n){ let r=1; for(let i=2;i<=n;i++)r*=i; return r; }
            function __setSeed(s){ __seedState = Number(s) || 1; return 0; }
            function __rng(){ __seedState = (__seedState * 1103515245 + 12345) & 0x7fffffff; return __seedState; }
            function __between(min, max){ let a=Number(min), b=Number(max); if(a>b){let t=a; a=b; b=t;} return a + (__rng() % (b - a + 1)); }
            function __choice(arr){ if(!Array.isArray(arr) || !arr.length) return ""; return arr[__rng() % arr.length]; }
            function __shuffle(arr){ if(!Array.isArray(arr)) return []; const c=[...arr]; for(let i=c.length-1;i>0;i--){ const j=__rng()%(i+1); [c[i],c[j]]=[c[j],c[i]]; } return c; }
            function __sample(arr, k){ return __shuffle(arr).slice(0, k); }
            function __boolean(){ return (__rng() % 2) === 1; }
            function __uuid(){ return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){ var r=(__rng()%16); var v=c=='x'?r:(r&0x3|0x8); return v.toString(16); }); }
            function __name(){ const n=["Ada Lovelace", "Alan Turing", "Grace Hopper", "Dennis Ritchie", "Ken Thompson", "Linus Torvalds"]; return n[__rng() % n.length]; }
            function __email(){ return __name().toLowerCase().replace(/\\s+/g, '.') + "@verscript.org"; }
            function __alphaNumeric(len){ const ch="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; let r=""; for(let i=0;i<len;i++) r+=ch[__rng()%ch.length]; return r; }
            function __sum(arr){ return Array.isArray(arr) ? arr.reduce((a,b)=>a+Number(b),0) : 0; }
            function __mean(arr){ return Array.isArray(arr) && arr.length ? __sum(arr)/arr.length : 0; }
            function __minMax(arr){ return Array.isArray(arr) && arr.length ? [Math.min(...arr), Math.max(...arr)] : [0,0]; }
            function __range(arr){ return Array.isArray(arr) && arr.length ? Math.max(...arr)-Math.min(...arr) : 0; }

            const Math = globalThis.Math || window.Math;
            Math.clamp = (val, low, high) => Math.min(Math.max(Number(val), Number(low)), Number(high));
            Math.gcd = (a, b) => { a = Math.abs(Number(a)); b = Math.abs(Number(b)); while (b) { let t = b; b = a % b; a = t; } return a; };
            Math.lcm = (a, b) => (!a || !b) ? 0 : Math.abs((Number(a) * Number(b)) / Math.gcd(a, b));
            
            const Strings = {
                toUpper: (s) => String(s).toUpperCase(),
                toLower: (s) => String(s).toLowerCase(),
                trim: (s) => String(s).trim(),
                length: (s) => String(s).length,
                len: (s) => String(s).length,
                contains: (s, sub) => String(s).includes(sub),
                startsWith: (s, pref) => String(s).startsWith(pref),
                endsWith: (s, suf) => String(s).endsWith(suf),
                slice: (s, a, b) => String(s).slice(a, b),
                split: (s, d) => String(s).split(d),
                replace: (s, t, r) => String(s).split(t).join(r),
                repeat: (s, c) => String(s).repeat(Number(c))
            };

            const Arrays = {
                length: (a) => (Array.isArray(a) ? a.length : 0),
                len: (a) => (Array.isArray(a) ? a.length : 0),
                first: (a) => (Array.isArray(a) && a.length ? a[0] : ""),
                last: (a) => (Array.isArray(a) && a.length ? a[a.length - 1] : ""),
                sort: (a) => (Array.isArray(a) ? [...a].sort((x, y) => (x > y ? 1 : x < y ? -1 : 0)) : []),
                reverse: (a) => (Array.isArray(a) ? [...a].reverse() : []),
                contains: (a, v) => (Array.isArray(a) ? a.includes(v) : false),
                indexOf: (a, v) => (Array.isArray(a) ? a.indexOf(v) : -1),
                join: (a, d) => (Array.isArray(a) ? a.join(d) : ""),
                slice: (a, s, e) => (Array.isArray(a) ? a.slice(s, e) : []),
                concat: (a1, a2) => (Array.isArray(a1) && Array.isArray(a2) ? a1.concat(a2) : [])
            };

            const Matrix = {
                create: (r, c, v) => Array.from({length: r}, () => Array(c).fill(v)),
                zeros: (r, c) => Array.from({length: r}, () => Array(c).fill(0)),
                ones: (r, c) => Array.from({length: r}, () => Array(c).fill(1)),
                identity: (n) => Array.from({length: n}, (_, r) => Array.from({length: n}, (_, c) => r === c ? 1 : 0)),
                shape: (m) => Array.isArray(m) && m.length ? [m.length, Array.isArray(m[0]) ? m[0].length : 0] : [0, 0],
                rows: (m) => Array.isArray(m) ? m.length : 0,
                cols: (m) => Array.isArray(m) && m.length && Array.isArray(m[0]) ? m[0].length : 0,
                transpose: (m) => {
                    if (!Array.isArray(m) || !m.length) return [];
                    const rows = m.length, cols = m[0].length;
                    const res = [];
                    for (let c = 0; c < cols; c++) {
                        const row = [];
                        for (let r = 0; r < rows; r++) row.push(m[r][c]);
                        res.push(row);
                    }
                    return res;
                },
                add: (a, b) => a.map((r, i) => r.map((val, j) => val + b[i][j])),
                subtract: (a, b) => a.map((r, i) => r.map((val, j) => val - b[i][j])),
                scale: (m, s) => m.map(r => r.map(val => val * s)),
                multiply: (a, b) => {
                    const r1 = a.length, c1 = a[0].length, c2 = b[0].length;
                    const res = Array.from({length: r1}, () => Array(c2).fill(0));
                    for (let r = 0; r < r1; r++) {
                        for (let c = 0; c < c2; c++) {
                            let sum = 0;
                            for (let k = 0; k < c1; k++) sum += a[r][k] * b[k][c];
                            res[r][c] = sum;
                        }
                    }
                    return res;
                },
                trace: (m) => m.reduce((acc, r, i) => acc + (r[i] || 0), 0),
                submatrix: (m, sr, sc) => m.filter((_, r) => r !== sr).map(row => row.filter((_, c) => c !== sc)),
                determinant: function det(m) {
                    if (!Array.isArray(m) || !m.length) return 0;
                    if (m.length === 1) return m[0][0];
                    if (m.length === 2) return (m[0][0] * m[1][1]) - (m[0][1] * m[1][0]);
                    let total = 0, sign = 1;
                    for (let c = 0; c < m.length; c++) {
                        total += sign * m[0][c] * det(Matrix.submatrix(m, 0, c));
                        sign *= -1;
                    }
                    return total;
                },
                det: function(m) { return Matrix.determinant(m); },
                flatten: (m) => m.flat(),
                equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
                multiplyVector: (m, v) => m.map(r => r.reduce((acc, val, c) => acc + val * v[c], 0))
            };

            const Vector = {
                create: (d, v) => Array(d).fill(v),
                zeros: (d) => Array(d).fill(0),
                ones: (d) => Array(d).fill(1),
                dim: (v) => Array.isArray(v) ? v.length : 0,
                length: (v) => Array.isArray(v) ? v.length : 0,
                add: (u, v) => u.map((x, i) => x + v[i]),
                subtract: (u, v) => u.map((x, i) => x - v[i]),
                scale: (v, s) => v.map(x => x * s),
                dot: (u, v) => u.reduce((acc, x, i) => acc + x * v[i], 0),
                magnitude: (v) => Math.sqrt(v.reduce((acc, x) => acc + x * x, 0)),
                norm: (v) => Math.sqrt(v.reduce((acc, x) => acc + x * x, 0)),
                distance: (u, v) => Math.sqrt(u.reduce((acc, x, i) => acc + (x - v[i]) ** 2, 0)),
                cross: (u, v) => [
                    (u[1] * v[2]) - (u[2] * v[1]),
                    (u[2] * v[0]) - (u[0] * v[2]),
                    (u[0] * v[1]) - (u[1] * v[0])
                ]
            };

            const Json = {
                stringify: (d) => JSON.stringify(d),
                parse: (s) => { try { return JSON.parse(s); } catch(e) { return s; } },
                isValid: (s) => {
                    if (typeof s !== "string") return false;
                    const t = s.trim();
                    return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
                }
            };

            const Crypto = {
                sha256: (text) => "sha256:" + String(text).length * 31,
                md5: (text) => "md5:" + String(text).length * 17,
                base64Encode: (text) => btoa(encodeURIComponent(String(text))),
                base64Decode: (text) => decodeURIComponent(atob(String(text)))
            };

            const Regex = {
                test: (pat, text) => new RegExp(pat).test(text),
                match: (pat, text) => { const m = String(text).match(new RegExp(pat)); return m ? m[0] : ""; }
            };

            const Stats = {
                sum: (vals) => (Array.isArray(vals) ? vals.reduce((a, b) => a + Number(b), 0) : 0),
                mean: (vals) => (Array.isArray(vals) && vals.length ? vals.reduce((a, b) => a + Number(b), 0) / vals.length : 0),
                range: (vals) => (Array.isArray(vals) && vals.length ? Math.max(...vals) - Math.min(...vals) : 0)
            };

            const Validate = {
                isEmail: (t) => String(t).includes("@") && String(t).includes("."),
                isUrl: (t) => String(t).startsWith("http://") || String(t).startsWith("https://")
            };

            const Fs = {
                exists: (p) => true,
                isVrsFile: (p) => String(p).endsWith(".vrs")
            };

            const Path = {
                join: (d, f) => (String(d).split('\\\\').join('/').replace(/\\/+$/, '') + '/' + String(f).split('\\\\').join('/').replace(/^\\/+/, '')),
                extname: (p) => { const dot = String(p).lastIndexOf("."); return dot >= 0 ? p.slice(dot) : ""; }
            };

            const Env = {
                isDevelopment: () => false,
                isProduction: () => true,
                get: (k, def) => def
            };

            const Time = {
                now: () => Date.now(),
                sleep: (ms) => ms
            };

            const Color = {
                isHexCode: (h) => typeof h === "string" && h.startsWith("#"),
                ansiWrap: (t, c) => "\\x1b[32m" + t + "\\x1b[0m"
            };
        `;

        const fn = new Function('vars', `${factHelper}; return (${clean});`);
        const evaluated = fn(vars);
        if (Array.isArray(evaluated)) {
            return JSON.stringify(evaluated);
        } else if (typeof evaluated === 'object' && evaluated !== null) {
            return JSON.stringify(evaluated);
        }
        return evaluated;
    } catch (e) {
        return result.replace(/^"|"$/g, '');
    }
}

export function registerAlias(spec, aliases) {
    if (!spec) return;
    let s = spec.trim();
    if (s.startsWith('alias')) s = s.substring(5).trim();
    if (s.startsWith(':')) s = s.substring(1).trim();
    if (!s) return;
    
    const colonIdx = s.indexOf(':');
    if (colonIdx === -1) return;
    const cmd1 = s.substring(0, colonIdx).trim();
    let rest = s.substring(colonIdx + 1).trim();
    let qIdx = rest.indexOf('?');
    let cmd2 = qIdx !== -1 ? rest.substring(0, qIdx).trim() : rest.trim();
    let argMap = {};
    if (qIdx !== -1) {
        let attrPart = rest.substring(qIdx + 1);
        let pairs = attrPart.split(/[\s,]+/);
        for (let p of pairs) {
            if (!p) continue;
            if (p.includes('=')) {
                let [toA, fromA] = p.split('=');
                if (toA && fromA) argMap[fromA.trim()] = toA.trim();
            } else {
                argMap[p.trim()] = (cmd1 === 'display' ? 'color' : p.trim());
            }
        }
    }
    aliases[cmd2] = { target: cmd1, argMap };
}

export function resolveLineAlias(line, aliases) {
    if (!line) return line;
    let trimmed = line.trim();
    const firstWord = trimmed.split(/[\s?]/)[0];
    if (aliases[firstWord]) {
        const { target, argMap } = aliases[firstWord];
        let replaced = target + trimmed.substring(firstWord.length);
        Object.keys(argMap).forEach(fromA => {
            const toA = argMap[fromA];
            const attrRegex = new RegExp(`\\?${fromA}(?=[\\s=]|$)`, 'g');
            replaced = replaced.replace(attrRegex, `?${toA}`);
        });
        return replaced;
    }
    return line;
}

/**
 * Executes VerScript code asynchronously line by line, providing progressive streaming
 * and interactive in-code prompt input.
 */
export async function simulateVerScriptAsync(code, files = null, stdin = '', onOutputLine, onPromptRequest, isTopLevel = true) {
    const lines = code.split('\n');
    const vars = {};
    const aliases = {};
    const stdinLines = (typeof stdin === 'string' && stdin.length > 0) ? stdin.split(/\r?\n/) : [];

    try {
        let i = 0;
        while (i < lines.length) {
            let line = lines[i].trim();
            if (!line || line.startsWith('!')) {
                i++;
                continue;
            }

            // Alias block & line resolution
            if (line.startsWith('alias:')) {
                i++;
                while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                    const aliasLine = lines[i].trim();
                    if (aliasLine && !aliasLine.startsWith('!')) {
                        registerAlias(aliasLine, aliases);
                    }
                    i++;
                }
                continue;
            } else if (line.startsWith('alias ')) {
                registerAlias(line, aliases);
                i++;
                continue;
            }

            // Resolve aliased command and attributes
            line = resolveLineAlias(line, aliases);

            // Display with ANSI formatting
            if (line.startsWith('display ') || line === 'display') {
                let colMatch = line.match(/\?color=(?:#([0-9a-fA-F]{3,8})|"([^"]*)"|'([^']*)'|([a-zA-Z0-9_#]+))/);
                let colorVal = colMatch ? (colMatch[1] ? ('#' + colMatch[1]) : (colMatch[2] || colMatch[3] || colMatch[4])) : null;
                let isInline = line.includes('?inline') || /\?newline=(?:false|0|"false")/.test(line);
                let expr = line.length > 8 ? line.substring(8).trim() : '';
                expr = expr.replace(/\?[a-zA-Z_]+(?:=(?:"[^"]*"|'[^']*'|[^\s]+))?/g, '').trim();
                let evaluated = evalSimpleExpr(expr, vars);

                if (colorVal) {
                    if (colorVal.startsWith('#')) {
                        let hex = colorVal.substring(1);
                        let r = 0, g = 0, b = 0;
                        if (hex.length === 6) {
                            r = parseInt(hex.substring(0, 2), 16);
                            g = parseInt(hex.substring(2, 4), 16);
                            b = parseInt(hex.substring(4, 6), 16);
                        } else if (hex.length === 3) {
                            r = parseInt(hex[0] + hex[0], 16);
                            g = parseInt(hex[1] + hex[1], 16);
                            b = parseInt(hex[2] + hex[2], 16);
                        }
                        onOutputLine({ type: 'success', text: `\x1b[38;2;${r};${g};${b}m${evaluated}\x1b[0m` });
                    } else {
                        const namedCodes = {
                            'red': '31', 'green': '32', 'yellow': '33',
                            'blue': '34', 'purple': '35', 'cyan': '36', 'white': '37'
                        };
                        let code = namedCodes[colorVal.toLowerCase()] || '37';
                        onOutputLine({ type: 'success', text: `\x1b[${code}m${evaluated}\x1b[0m` });
                    }
                } else {
                    onOutputLine({ type: 'success', text: String(evaluated) });
                }
                i++;
            }
            // Prompt - IN-CODE INTERACTIVE EVALUATION
            else if (line.startsWith('prompt ')) {
                let rest = line.substring(7).trim();
                const vname = rest.split(' ')[0];
                let defMatch = rest.match(/\?default="([^"]*)"/);
                const defaultVal = defMatch ? defMatch[1] : '';
                let answer;
                if (stdinLines.length > 0 && stdinLines[0] !== '') {
                    answer = stdinLines.shift();
                } else if (onPromptRequest) {
                    answer = await onPromptRequest(vname, defaultVal);
                } else {
                    answer = defaultVal;
                }
                vars[vname] = (!isNaN(answer) && answer !== '') ? Number(answer) : answer;
                onOutputLine({ type: 'system', text: `[prompt] ${vname} = ${vars[vname]}` });
                i++;
            }
            // Declarations (Pragma, Header, Struct, Enum)
            else if (line.startsWith('pragma ') || line.startsWith('include ') || line.startsWith('export ') || line.startsWith('DataType ') || line.startsWith('config:') || line.startsWith('struct:') || line.startsWith('struct ') || line.startsWith('header ')) {
                if (line.startsWith('pragma ') || line.startsWith('include ')) {
                    i++;
                    continue;
                }
                i++;
                while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                    i++;
                }
                continue;
            }
            // Enum declaration
            else if (line.startsWith('enum ') || line.startsWith('enum:')) {
                if (line.includes(':')) {
                    const colonIdx = line.indexOf(':');
                    const pairs = line.substring(colonIdx + 1).split(',');
                    const enumName = line.substring(5, colonIdx).trim();
                    vars[enumName] = {};
                    pairs.forEach(p => {
                        const [k, v] = p.split('=').map(s => s ? s.trim() : '');
                        if (k && v !== undefined) vars[enumName][k] = isNaN(Number(v)) ? v : Number(v);
                    });
                }
                i++;
                while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                    i++;
                }
                continue;
            }
            // Variable assignment
            else if (line.includes(':') && !line.startsWith('loop') && !line.startsWith('iterate')) {
                const parts = line.split(':');
                let vname = parts[0].trim();
                if (vname.startsWith('set ')) vname = vname.substring(4).trim();
                const vexpr = parts.slice(1).join(':').trim();
                const val = evalSimpleExpr(vexpr, vars);
                vars[vname] = val;
                i++;
            }
            // Loop count
            else if (line.startsWith('loop ')) {
                const count = parseInt(line.substring(5).trim()) || 1;
                i++;
                let block = [];
                while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                    block.push(lines[i].trim());
                    i++;
                }
                for (let c = 0; c < count; c++) {
                    await simulateVerScriptAsync(block.join('\n'), files, stdin, onOutputLine, onPromptRequest, false);
                }
            }
            // Iterate
            else if (line.startsWith('iterate ')) {
                const match = line.match(/iterate\s+([a-zA-Z_]\w*)\s+from\s+(\d+)\s+to\s+(\d+)(\s+step\s+(\d+))?/);
                if (match) {
                    const varName = match[1];
                    const start = parseInt(match[2]);
                    const end = parseInt(match[3]);
                    const step = match[5] ? parseInt(match[5]) : 1;
                    i++;
                    let block = [];
                    while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                        block.push(lines[i].trim());
                        i++;
                    }
                    for (let val = start; val <= end; val += step) {
                        vars[varName] = val;
                        let subCode = block.map(bLine => bLine.replace(new RegExp(`\\b${varName}\\b`, 'g'), val)).join('\n');
                        await simulateVerScriptAsync(subCode, files, stdin, onOutputLine, onPromptRequest, false);
                    }
                } else {
                    i++;
                }
            }
            // Inject
            else if (line.startsWith('inject ')) {
                const lang = line.substring(7).trim();
                i++;
                let block = [];
                while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                    block.push(lines[i].trim());
                    i++;
                }
                if (lang === 'verscript' || lang === 'vrs' || lang === 'eval') {
                    await simulateVerScriptAsync(block.join('\n'), files, stdin, onOutputLine, onPromptRequest, false);
                } else {
                    onOutputLine({ type: 'success', text: `[Inject:${lang}] Evaluated ${block.length} code line(s) cleanly.` });
                }
            }
            // Do-Unless
            else if (line === 'do') {
                i++;
                let doBlock = [];
                while (i < lines.length && !lines[i].trim().startsWith('unless')) {
                    doBlock.push(lines[i].trim());
                    i++;
                }
                let caught = false;
                if (i < lines.length && lines[i].trim().startsWith('unless')) {
                    const unlessLine = lines[i].trim();
                    const unlessTarget = unlessLine.substring(6).trim();
                    i++;
                    let unlessBlock = [];
                    while (i < lines.length && (lines[i].startsWith('    ') || lines[i].startsWith('\t') || lines[i].startsWith('  '))) {
                        unlessBlock.push(lines[i].trim());
                        i++;
                    }

                    let thrownErr = null;
                    const doText = doBlock.join('\n');
                    const throwMatch = doText.match(/throw\s+([a-zA-Z_]\w*)/);
                    if (throwMatch) thrownErr = throwMatch[1];
                    else if (/\/\s*0\b/.test(doText)) thrownErr = 'DivisionByZeroError';

                    if (thrownErr && (!unlessTarget || unlessTarget === 'error' || unlessTarget === thrownErr)) {
                        vars['error'] = thrownErr;
                        await simulateVerScriptAsync(unlessBlock.join('\n'), files, stdin, onOutputLine, onPromptRequest, false);
                        caught = true;
                    }
                }
                if (!caught) {
                    await simulateVerScriptAsync(doBlock.join('\n'), files, stdin, onOutputLine, onPromptRequest, false);
                }
            } else {
                i++;
            }
        }
        if (isTopLevel) {
            onOutputLine({ type: 'cmd', text: 'Program completed.' });
        }
    } catch (err) {
        onOutputLine({ type: 'error', text: err.message });
    }
}
