import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { Extension } from '@tiptap/core';
import {
    Bold, Italic, Underline as UnderlineIcon,
    Strikethrough, Link as LinkIcon, Code
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

// Кастомное расширение для обработки Tab
const TabHandler = Extension.create({
    name: 'tabHandler',
    addKeyboardShortcuts() {
        return {
            Tab: () => {
                this.editor.commands.insertContent('    ');
                return true;
            },
        };
    },
});

interface RichTextEditorProps {
    content: any;
    onChange: (content: any) => void;
    placeholder?: string;
}

// Очистка и нормализация контента для TipTap
const normalizeContent = (content: any): any => {
    if (!content || !content.type) {
        return {
            type: 'doc',
            content: [{ type: 'paragraph' }],
        };
    }

    // Удаляем пустые текстовые узлы
    const cleanNode = (node: any): any => {
        if (node.type === 'text' && (!node.text || node.text === '')) {
            return null;
        }
        if (node.content && Array.isArray(node.content)) {
            node.content = node.content.map(cleanNode).filter(Boolean);
        }
        return node;
    };

    const cleaned = cleanNode({ ...content });

    // Гарантируем, что есть хотя бы один параграф
    if (!cleaned.content || cleaned.content.length === 0) {
        cleaned.content = [{ type: 'paragraph' }];
    }

    return cleaned;
};

export const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
    const [activeStates, setActiveStates] = useState({
        bold: false,
        italic: false,
        underline: false,
        strike: false,
        code: false,
        link: false,
    });

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,      // Отключаем заголовки
                bulletList: false,   // Отключаем списки
                orderedList: false,  // Отключаем списки
                codeBlock: false,    // Отключаем блоки кода
            }),
            Underline,
            Strike,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: styles.link },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Напишите что-нибудь...',
                emptyEditorClass: styles.emptyEditor,
            }),
            TabHandler,
        ],
        content: normalizeContent(content),
        onUpdate: ({ editor }) => {
            const json = editor.getJSON();
            onChange(json);
        },
        editorProps: {
            attributes: { class: styles.editorContent },
        },
    });

    useEffect(() => {
        if (!editor) return;

        const updateActiveStates = () => {
            setActiveStates({
                bold: editor.isActive('bold'),
                italic: editor.isActive('italic'),
                underline: editor.isActive('underline'),
                strike: editor.isActive('strike'),
                code: editor.isActive('code'),
                link: editor.isActive('link'),
            });
        };

        editor.on('selectionUpdate', updateActiveStates);
        editor.on('transaction', updateActiveStates);
        updateActiveStates();

        return () => {
            editor.off('selectionUpdate', updateActiveStates);
            editor.off('transaction', updateActiveStates);
        };
    }, [editor]);

    if (!editor) return null;

    const toggleMark = (type: string) => {
        switch (type) {
            case 'bold': editor.chain().focus().toggleBold().run(); break;
            case 'italic': editor.chain().focus().toggleItalic().run(); break;
            case 'underline': editor.chain().focus().toggleUnderline().run(); break;
            case 'strike': editor.chain().focus().toggleStrike().run(); break;
            case 'code': editor.chain().focus().toggleCode().run(); break;
        }
    };

    const setLink = () => {
        const url = window.prompt('Введите URL:');
        if (url) editor.chain().focus().setLink({ href: url }).run();
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <button onClick={() => toggleMark('bold')} className={`${styles.toolbarButton} ${activeStates.bold ? styles.active : ''}`}>
                    <Bold size={16} />
                </button>
                <button onClick={() => toggleMark('italic')} className={`${styles.toolbarButton} ${activeStates.italic ? styles.active : ''}`}>
                    <Italic size={16} />
                </button>
                <button onClick={() => toggleMark('underline')} className={`${styles.toolbarButton} ${activeStates.underline ? styles.active : ''}`}>
                    <UnderlineIcon size={16} />
                </button>
                <button onClick={() => toggleMark('strike')} className={`${styles.toolbarButton} ${activeStates.strike ? styles.active : ''}`}>
                    <Strikethrough size={16} />
                </button>
                <div className={styles.divider} />
                <button onClick={() => toggleMark('code')} className={`${styles.toolbarButton} ${activeStates.code ? styles.active : ''}`}>
                    <Code size={16} />
                </button>
                <button onClick={setLink} className={`${styles.toolbarButton} ${activeStates.link ? styles.active : ''}`}>
                    <LinkIcon size={16} />
                </button>
            </div>
            <EditorContent editor={editor} className={styles.editor} />
        </div>
    );
};