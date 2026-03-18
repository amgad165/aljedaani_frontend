import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface BilingualField {
  en: string;
  ar: string;
}

interface Article {
  id: number;
  title: BilingualField;
  description: BilingualField | null;
  blockquote: BilingualField | null;
  body: BilingualField | null;
  image_url: string | null;
  author: string;
  read_time: string | null;
  published_at: string | null;
  sort_order: number;
  is_active: boolean;
}

interface FormState {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  blockquote_en: string;
  blockquote_ar: string;
  body_en: string;
  body_ar: string;
  author: string;
  read_time: string;
  published_at: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  title_en: '', title_ar: '',
  description_en: '', description_ar: '',
  blockquote_en: '', blockquote_ar: '',
  body_en: '', body_ar: '',
  author: '',
  read_time: '',
  published_at: '',
  sort_order: 0,
  is_active: true,
};

function getBilingual(field: BilingualField | string | null): BilingualField {
  if (!field) return { en: '', ar: '' };
  if (typeof field === 'string') {
    try { return JSON.parse(field); } catch { return { en: field, ar: '' }; }
  }
  return field;
}

/* ─── Rich Text Editor ─── */
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  dir?: 'ltr' | 'rtl';
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, dir = 'ltr', placeholder }) => {
  const editorRef      = useRef<HTMLDivElement>(null);
  const colorRef       = useRef<HTMLInputElement>(null);
  const bgColorRef     = useRef<HTMLInputElement>(null);
  const savedRange     = useRef<Range | null>(null);

  // Save the editor's selection whenever it loses focus
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  // Restore saved selection, then execute command
  const exec = (cmd: string, val?: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    if (savedRange.current) {
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(savedRange.current); }
    }
    document.execCommand(cmd, false, val ?? undefined);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Sync content when value changes externally (e.g. language tab switch)
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
      savedRange.current = null;
    }
  }, [value]);

  const handleFormatBlock = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value;
    e.target.value = 'p'; // reset to default visually
    exec('formatBlock', tag);
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    e.target.value = ''; // reset
    if (size) exec('fontSize', size);
  };

  const handleLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = window.prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
    padding: '8px 10px', background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  };

  const divider: React.CSSProperties = {
    width: 1, height: 22, background: '#e2e8f0', margin: '0 4px', flexShrink: 0,
  };

  const tbtn = (active = false): React.CSSProperties => ({
    background: active ? '#dbeafe' : 'transparent',
    border: '1px solid transparent',
    borderRadius: 6,
    width: 30, height: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#374151',
    flexShrink: 0,
    transition: 'background 0.15s',
  });

  const selectStyle: React.CSSProperties = {
    padding: '4px 6px', borderRadius: 6, border: '1px solid #e2e8f0',
    fontSize: 12, fontFamily: 'Nunito', color: '#374151',
    background: '#fff', cursor: 'pointer', outline: 'none',
    marginRight: 2,
  };

  const btnMouseDown = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
      {/* ── Toolbar ── */}
      <div style={toolbarStyle}>

        {/* Format Block */}
        <select
          style={selectStyle}
          defaultValue="p"
          onChange={handleFormatBlock}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Code</option>
        </select>

        {/* Font Size */}
        <select
          style={{ ...selectStyle, marginRight: 0 }}
          defaultValue=""
          onChange={handleFontSize}
        >
          <option value="" disabled>Size</option>
          <option value="1">XS · 11px</option>
          <option value="2">S · 13px</option>
          <option value="3">M · 16px</option>
          <option value="4">L · 20px</option>
          <option value="5">XL · 26px</option>
          <option value="6">XXL · 32px</option>
          <option value="7">XXXL · 48px</option>
        </select>

        <div style={divider} />

        {/* Bold */}
        <button style={tbtn()} title="Bold (Ctrl+B)" onMouseDown={btnMouseDown} onClick={() => exec('bold')}>
          <strong>B</strong>
        </button>
        {/* Italic */}
        <button style={{ ...tbtn(), fontStyle: 'italic' }} title="Italic (Ctrl+I)" onMouseDown={btnMouseDown} onClick={() => exec('italic')}>
          <em>I</em>
        </button>
        {/* Underline */}
        <button style={{ ...tbtn(), textDecoration: 'underline' }} title="Underline (Ctrl+U)" onMouseDown={btnMouseDown} onClick={() => exec('underline')}>
          U
        </button>
        {/* Strikethrough */}
        <button style={{ ...tbtn(), textDecoration: 'line-through' }} title="Strikethrough" onMouseDown={btnMouseDown} onClick={() => exec('strikeThrough')}>
          S
        </button>

        <div style={divider} />

        {/* Text Color */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            style={{ ...tbtn(), fontSize: 12, flexDirection: 'column', gap: 1 }}
            title="Text Color"
            onMouseDown={(e) => { e.preventDefault(); colorRef.current?.click(); }}
          >
            <span style={{ fontWeight: 700, lineHeight: 1 }}>A</span>
            <span style={{ width: 16, height: 3, background: '#e62020', borderRadius: 2 }} />
          </button>
          <input
            ref={colorRef}
            type="color"
            defaultValue="#e62020"
            style={{ opacity: 0, position: 'absolute', width: 1, height: 1, border: 'none', padding: 0 }}
            onChange={e => exec('foreColor', e.target.value)}
          />
        </div>

        {/* Highlight Color */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            style={{ ...tbtn(), fontSize: 12, flexDirection: 'column', gap: 1 }}
            title="Highlight"
            onMouseDown={(e) => { e.preventDefault(); bgColorRef.current?.click(); }}
          >
            <span style={{ fontWeight: 700, lineHeight: 1 }}>H</span>
            <span style={{ width: 16, height: 3, background: '#ffe066', borderRadius: 2 }} />
          </button>
          <input
            ref={bgColorRef}
            type="color"
            defaultValue="#ffe066"
            style={{ opacity: 0, position: 'absolute', width: 1, height: 1, border: 'none', padding: 0 }}
            onChange={e => exec('hiliteColor', e.target.value)}
          />
        </div>

        <div style={divider} />

        {/* Alignment */}
        <button style={tbtn()} title="Align Left" onMouseDown={btnMouseDown} onClick={() => exec('justifyLeft')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z"/></svg>
        </button>
        <button style={tbtn()} title="Align Center" onMouseDown={btnMouseDown} onClick={() => exec('justifyCenter')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm2 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
        </button>
        <button style={tbtn()} title="Align Right" onMouseDown={btnMouseDown} onClick={() => exec('justifyRight')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M6 3.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm4 3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-4 3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
        </button>

        <div style={divider} />

        {/* Lists */}
        <button style={tbtn()} title="Bullet List" onMouseDown={btnMouseDown} onClick={() => exec('insertUnorderedList')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
        </button>
        <button style={tbtn()} title="Numbered List" onMouseDown={btnMouseDown} onClick={() => exec('insertOrderedList')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/><path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588 0 .927.33.927.76 0 .288-.178.54-.481.620v.042c.379.083.534.33.534.65 0 .483-.388.815-1.010.815-.627 0-1.020-.35-1.040-.85h.591c.14.184.283.27.477.27.204 0 .356-.137.356-.32s-.15-.313-.372-.313h-.3zm.002-6.28V6H1v-.46h.14c.19 0 .314-.087.314-.217 0-.134-.125-.22-.3-.22-.162 0-.284.087-.29.22h-.58c.011-.383.354-.671.876-.671.52 0 .86.29.86.705 0 .298-.143.526-.383.656V6h.567v.415H1.715V5H1v-.415h.715zm-.002 3.5v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588 0 .927.33.927.76 0 .288-.178.54-.481.620v.042c.379.083.534.33.534.65 0 .483-.388.815-1.010.815-.627 0-1.020-.35-1.040-.85h.591c.14.184.283.27.477.27.204 0 .356-.137.356-.32s-.15-.313-.372-.313h-.3z"/></svg>
        </button>

        <div style={divider} />

        {/* Indent */}
        <button style={tbtn()} title="Indent" onMouseDown={btnMouseDown} onClick={() => exec('indent')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M3 8a.5.5 0 0 1 .5-.5h6.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H3.5A.5.5 0 0 1 3 8z"/><path d="M12.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5z"/></svg>
        </button>
        <button style={tbtn()} title="Outdent" onMouseDown={btnMouseDown} onClick={() => exec('outdent')}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L5.707 5H12.5a.5.5 0 0 1 0 1H5.707l2.647 2.646a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0zM3 14.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/><path d="M3 3a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 0 1H3.5A.5.5 0 0 1 3 3z"/></svg>
        </button>

        <div style={divider} />

        {/* Link */}
        <button style={tbtn()} title="Insert Link" onMouseDown={btnMouseDown} onClick={handleLink}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </button>
        <button style={tbtn()} title="Remove Link" onMouseDown={btnMouseDown} onClick={() => exec('unlink')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
        </button>

        <div style={divider} />

        {/* Undo / Redo */}
        <button style={tbtn()} title="Undo (Ctrl+Z)" onMouseDown={btnMouseDown} onClick={() => exec('undo')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </button>
        <button style={tbtn()} title="Redo (Ctrl+Y)" onMouseDown={btnMouseDown} onClick={() => exec('redo')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
        </button>

        <div style={divider} />

        {/* Clear Formatting */}
        <button style={{ ...tbtn(), color: '#ef4444' }} title="Clear Formatting" onMouseDown={btnMouseDown} onClick={() => exec('removeFormat')}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 12h12M4 6l16 12M20 6L4 18"/></svg>
        </button>
      </div>

      {/* ── Editable Area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        data-placeholder={placeholder}
        style={{
          minHeight: 260,
          padding: '16px 18px',
          outline: 'none',
          fontSize: 15,
          lineHeight: 1.75,
          color: '#1e293b',
          fontFamily: 'Nunito, sans-serif',
          overflowY: 'auto',
        }}
        onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
        onBlur={saveSelection}
        onKeyDown={e => {
          // Tab → indent
          if (e.key === 'Tab') { e.preventDefault(); exec(e.shiftKey ? 'outdent' : 'indent'); }
        }}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.3em; color: #0a4d68; }
        [contenteditable] h3 { font-size: 1.2em; font-weight: 700; margin: 0.65em 0 0.3em; color: #0a4d68; }
        [contenteditable] h4 { font-size: 1em; font-weight: 700; margin: 0.5em 0 0.2em; color: #0a4d68; }
        [contenteditable] blockquote { border-left: 4px solid #15C9FA; margin: 1em 0; padding: 8px 16px; color: #475569; font-style: italic; background: #f0fdff; border-radius: 0 8px 8px 0; }
        [contenteditable] pre { background: #1e293b; color: #e2e8f0; padding: 12px 16px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; }
        [contenteditable] ul { list-style-type: disc; padding-inline-start: 24px; margin: 6px 0 10px; }
        [contenteditable] ol { list-style-type: decimal; padding-inline-start: 24px; margin: 6px 0 10px; }
        [contenteditable] li { margin-bottom: 4px; }
        [contenteditable] a { color: #0a4d68; text-decoration: underline; }
        [contenteditable] font[size="1"] { font-size: 11px; }
        [contenteditable] font[size="2"] { font-size: 13px; }
        [contenteditable] font[size="3"] { font-size: 16px; }
        [contenteditable] font[size="4"] { font-size: 20px; }
        [contenteditable] font[size="5"] { font-size: 26px; }
        [contenteditable] font[size="6"] { font-size: 32px; }
        [contenteditable] font[size="7"] { font-size: 48px; }
      `}</style>
    </div>
  );
};

const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [langTab, setLangTab] = useState<'en' | 'ar'>('en');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/articles?active=all`, {
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) setArticles(data.data);
    } catch {
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openCreate = () => {
    setEditingArticle(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setLangTab('en');
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (article: Article) => {
    const title       = getBilingual(article.title);
    const description = getBilingual(article.description);
    const blockquote  = getBilingual(article.blockquote);
    const body        = getBilingual(article.body);

    setEditingArticle(article);
    setForm({
      title_en: title.en, title_ar: title.ar,
      description_en: description.en, description_ar: description.ar,
      blockquote_en: blockquote.en, blockquote_ar: blockquote.ar,
      body_en: body.en, body_ar: body.ar,
      author:       article.author ?? '',
      read_time:    article.read_time ?? '',
      published_at: article.published_at ?? '',
      sort_order:   article.sort_order ?? 0,
      is_active:    article.is_active ?? true,
    });
    setImageFile(null);
    setImagePreview(article.image_url ?? null);
    setLangTab('en');
    setError(null);
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title_en.trim()) { setError('English title is required'); return; }
    if (!form.author.trim())   { setError('Author is required'); return; }

    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.append('title',       JSON.stringify({ en: form.title_en, ar: form.title_ar }));
    fd.append('description', JSON.stringify({ en: form.description_en, ar: form.description_ar }));
    fd.append('blockquote',  JSON.stringify({ en: form.blockquote_en, ar: form.blockquote_ar }));
    fd.append('body',        JSON.stringify({ en: form.body_en, ar: form.body_ar }));
    fd.append('author',      form.author);
    fd.append('read_time',   form.read_time);
    fd.append('published_at', form.published_at);
    fd.append('sort_order',  String(form.sort_order));
    fd.append('is_active',   form.is_active ? '1' : '0');
    if (imageFile) fd.append('image', imageFile);

    try {
      const token = localStorage.getItem('auth_token');
      const authHeader: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      let res;
      if (editingArticle) {
        fd.append('_method', 'PUT');
        res = await fetch(`${API_BASE_URL}/articles/${editingArticle.id}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', ...authHeader },
          body: fd,
        });
      } else {
        res = await fetch(`${API_BASE_URL}/articles`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', ...authHeader },
          body: fd,
        });
      }
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Save failed'); return; }
      setModalOpen(false);
      fetchArticles();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (data.success) { setDeleteConfirmId(null); fetchArticles(); }
      else setError(data.message || 'Delete failed');
    } catch {
      setError('Network error');
    }
  };

  /* ─── Shared style tokens ─── */
  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 16, padding: '28px 32px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #e2e8f0', fontSize: 14, fontFamily: 'Nunito',
    outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontWeight: 600, fontSize: 13,
    color: '#374151', marginBottom: 6,
  };
  const btnPrimary: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0a4d68, #088395)',
    color: '#fff', border: 'none', borderRadius: 10,
    padding: '10px 24px', fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Nunito',
  };
  const btnDanger: React.CSSProperties = {
    background: '#fee2e2', color: '#dc2626',
    border: 'none', borderRadius: 8, padding: '6px 14px',
    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito',
  };
  const btnSecondary: React.CSSProperties = {
    background: '#f1f5f9', color: '#374151',
    border: 'none', borderRadius: 10, padding: '10px 24px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito',
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px 40px', fontFamily: 'Nunito' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0a4d68' }}>Articles</h1>
            <div style={{ width: 56, height: 4, background: 'linear-gradient(90deg,#0a4d68,#05bfdb)', borderRadius: 4, marginTop: 6 }} />
          </div>
          <button style={btnPrimary} onClick={openCreate}>+ New Article</button>
        </div>

        {error && !modalOpen && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Table card */}
        <div style={card}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>Loading articles…</div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>No articles yet. Click "New Article" to add one.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    {['Image', 'Title', 'Author', 'Published', 'Read Time', 'Order', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#6b7280', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {articles.map((a, i) => {
                    const title = getBilingual(a.title);
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                        <td style={{ padding: '10px 14px' }}>
                          {a.image_url ? (
                            <img src={a.image_url} alt="" style={{ width: 64, height: 42, objectFit: 'cover', borderRadius: 6 }} />
                          ) : (
                            <div style={{ width: 64, height: 42, background: '#e5e7eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 10 }}>No img</div>
                          )}
                        </td>
                        <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                          <div style={{ fontWeight: 700, color: '#0a4d68', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>{title.en}</div>
                          {title.ar && <div style={{ color: '#9ca3af', fontSize: 12, direction: 'rtl', marginTop: 2 }}>{title.ar}</div>}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#374151' }}>{a.author}</td>
                        <td style={{ padding: '10px 14px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                          {a.published_at ? new Date(a.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#6b7280' }}>{a.read_time || '—'}</td>
                        <td style={{ padding: '10px 14px', color: '#6b7280', textAlign: 'center' }}>{a.sort_order}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                            background: a.is_active ? '#dcfce7' : '#fee2e2',
                            color: a.is_active ? '#16a34a' : '#dc2626',
                          }}>
                            {a.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              style={{ background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Nunito' }}
                              onClick={() => openEdit(a)}
                            >Edit</button>
                            <button style={btnDanger} onClick={() => setDeleteConfirmId(a.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create / Edit Modal ─── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '32px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 820, padding: '36px 40px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Close */}
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>

            <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 800, color: '#0a4d68' }}>
              {editingArticle ? 'Edit Article' : 'New Article'}
            </h2>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>{error}</div>
            )}

            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {(['en', 'ar'] as const).map(l => (
                <button key={l} onClick={() => setLangTab(l)} style={{
                  padding: '8px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
                  background: langTab === l ? 'linear-gradient(135deg,#0a4d68,#088395)' : '#f1f5f9',
                  color: langTab === l ? '#fff' : '#374151',
                }}>
                  {l === 'en' ? 'English' : 'Arabic'}
                </button>
              ))}
            </div>

            {/* Bilingual fields */}
            <div style={{ direction: langTab === 'ar' ? 'rtl' : 'ltr' }}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Title {langTab === 'en' ? <span style={{ color: '#ef4444' }}>*</span> : '(العنوان)'}</label>
                <input
                  style={inputStyle}
                  value={langTab === 'en' ? form.title_en : form.title_ar}
                  onChange={e => setForm(f => ({ ...f, [`title_${langTab}`]: e.target.value }))}
                  placeholder={langTab === 'en' ? 'Article title' : 'عنوان المقالة'}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Short Description {langTab === 'ar' && '(وصف مختصر)'}</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                  value={langTab === 'en' ? form.description_en : form.description_ar}
                  onChange={e => setForm(f => ({ ...f, [`description_${langTab}`]: e.target.value }))}
                  placeholder={langTab === 'en' ? 'Brief excerpt shown on article cards' : 'ملخص يظهر على بطاقة المقالة'}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Blockquote {langTab === 'ar' && '(اقتباس)'}</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
                  value={langTab === 'en' ? form.blockquote_en : form.blockquote_ar}
                  onChange={e => setForm(f => ({ ...f, [`blockquote_${langTab}`]: e.target.value }))}
                  placeholder={langTab === 'en' ? 'Featured quote displayed at the top of the article' : 'الاقتباس المميز في بداية المقالة'}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>
                  Article Body {langTab === 'ar' && '(محتوى المقالة)'}
                </label>
                <RichTextEditor
                  value={langTab === 'en' ? form.body_en : form.body_ar}
                  onChange={html => setForm(f => ({ ...f, [`body_${langTab}`]: html }))}
                  dir={langTab === 'ar' ? 'rtl' : 'ltr'}
                  placeholder={langTab === 'en' ? 'Start writing the article body…' : 'ابدأ كتابة محتوى المقالة…'}
                />
              </div>
            </div>

            {/* Non-bilingual fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Author <span style={{ color: '#ef4444' }}>*</span></label>
                <input style={inputStyle} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Dr. Full Name" />
              </div>
              <div>
                <label style={labelStyle}>Read Time</label>
                <input style={inputStyle} value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))} placeholder="5 min read" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Published Date</label>
                <input type="date" style={inputStyle} value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Sort Order</label>
                <input type="number" style={inputStyle} value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <label style={{ ...labelStyle, marginBottom: 12 }}>Status</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <span style={{ fontWeight: 600, color: form.is_active ? '#16a34a' : '#dc2626', fontSize: 14 }}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Cover Image</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#f1f5f9', borderRadius: 10, cursor: 'pointer', border: '1.5px dashed #cbd5e1', fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: '#374151' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  {imageFile ? imageFile.name : 'Choose Image'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 10, border: '2px solid #e2e8f0' }} />
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button style={btnSecondary} onClick={() => setModalOpen(false)}>Cancel</button>
              <button style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editingArticle ? 'Update Article' : 'Create Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteConfirmId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, color: '#111' }}>Delete Article?</h3>
            <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 14 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button style={btnSecondary} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button style={{ ...btnPrimary, background: '#dc2626' }} onClick={() => handleDelete(deleteConfirmId!)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminArticles;
