'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImagePlus,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`h-7 w-7 ${active ? 'bg-christina-blue/10 text-christina-blue' : 'text-muted-foreground'}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-christina-blue underline' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto my-2' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setShowImageInput(false);
    setImageUrl('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      editor.chain().focus().setImage({ src: dataUrl }).run();
    };
    reader.readAsDataURL(file);
    setShowImageInput(false);
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-background ${className || ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/30">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          active={editor.isActive('link')}
          title={editor.isActive('link') ? 'Remove link' : 'Add link'}
        >
          {editor.isActive('link') ? (
            <Unlink className="h-3.5 w-3.5" />
          ) : (
            <LinkIcon className="h-3.5 w-3.5" />
          )}
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton
          onClick={() => setShowImageInput(!showImageInput)}
          title="Insert image"
        >
          <ImagePlus className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 p-2 border-b bg-blue-50/50">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="h-7 text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={addLink}>
            Add
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowLinkInput(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Image input bar */}
      {showImageInput && (
        <div className="flex items-center gap-2 p-2 border-b bg-blue-50/50">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL or upload below"
            className="h-7 text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addImage()}
          />
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={addImage}>
            Add URL
          </Button>
          <label className="cursor-pointer">
            <Button size="sm" variant="outline" className="h-7 text-xs pointer-events-none">
              Upload
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowImageInput(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}
