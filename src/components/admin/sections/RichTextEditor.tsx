"use client";

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tavsif matnini kiriting...'
}) => {
  // SSR vaqtida xatolik chiqmasligi uchun faqat klientda yuklaymiz
  const ReactQuill = useMemo(
    () =>
      dynamic(() => import('react-quill-new'), {
        ssr: false,
        loading: () => (
          <div className="min-h-[140px] bg-gray-950 p-4 text-xs text-gray-500 flex items-center justify-center">
            Matn muharriri yuklanmoqda...
          </div>
        ),
      }),
    []
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link', 'clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'link',
  ];

  return (
    <div className="rich-editor-wrapper bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-white"
      />

      <style jsx global>{`
        .rich-editor-wrapper .ql-toolbar {
          background-color: #111827;
          border: none;
          border-bottom: 1px solid #1f2937;
        }
        .rich-editor-wrapper .ql-container {
          border: none;
          min-height: 140px;
          font-size: 13px;
          color: #f3f4f6;
        }
        .rich-editor-wrapper .ql-editor {
          min-height: 140px;
        }
        .rich-editor-wrapper .ql-editor.ql-blank::before {
          color: #6b7280;
          font-style: normal;
        }
        .rich-editor-wrapper .ql-stroke {
          stroke: #9ca3af !important;
        }
        .rich-editor-wrapper .ql-fill {
          fill: #9ca3af !important;
        }
        .rich-editor-wrapper .ql-picker {
          color: #9ca3af !important;
        }
        .rich-editor-wrapper .ql-picker-options {
          background-color: #111827 !important;
          border: 1px solid #374151 !important;
          border-radius: 8px;
        }
        .rich-editor-wrapper button:hover .ql-stroke,
        .rich-editor-wrapper .ql-picker-label:hover .ql-stroke {
          stroke: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};