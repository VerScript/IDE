import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

export default function MonacoEditor({
  value = '',
  onChange,
  language = 'verscript',
  theme = 'cyberpunk',
  options = {},
  beforeMount,
  onMount,
  height = '100%',
  width = '100%'
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (beforeMount) {
      beforeMount(monaco);
    }

    const editor = monaco.editor.create(containerRef.current, {
      value: value || '',
      language: language || 'verscript',
      theme: theme || 'cyberpunk',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'Courier New', Courier, monospace",
      padding: { top: 20 },
      wordWrap: 'on',
      scrollBeyondLastLine: false,
      ...options
    });

    editorRef.current = editor;

    if (onMount) {
      onMount(editor, monaco);
    }

    const disposable = editor.onDidChangeModelContent(() => {
      if (!isInternalChangeRef.current && onChange) {
        const val = editor.getValue();
        onChange(val);
      }
    });

    return () => {
      disposable.dispose();
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && theme) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (editorRef.current) {
      const currentVal = editorRef.current.getValue();
      if (value !== undefined && value !== currentVal) {
        isInternalChangeRef.current = true;
        editorRef.current.setValue(value);
        isInternalChangeRef.current = false;
      }
    }
  }, [value]);

  return <div ref={containerRef} style={{ width, height, position: 'relative' }} />;
}
