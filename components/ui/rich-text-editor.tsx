"use client"

import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Placeholder } from "@tiptap/extensions"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import {
  Undo2,
  Redo2,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Code as CodeIcon,
  Code2,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Link2,
  Link2Off,
  Table as TableIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  Trash2,
} from "lucide-react"

import { cn } from "@/lib/utils"

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  label,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded transition disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-[#8b6f47] text-white"
          : "text-[#2d2d2d] hover:bg-[#f5f1e8]",
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-[#e4ddd0]" />
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null
  }

  const headingValue = editor.isActive("heading", { level: 1 })
    ? "1"
    : editor.isActive("heading", { level: 2 })
      ? "2"
      : editor.isActive("heading", { level: 3 })
        ? "3"
        : "paragraph"

  function setHeading(value: string) {
    if (value === "paragraph") {
      editor?.chain().focus().setParagraph().run()
      return
    }

    editor
      ?.chain()
      .focus()
      .setHeading({ level: Number(value) as 1 | 2 | 3 })
      .run()
  }

  function setLink() {
    const previousUrl = editor?.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL", previousUrl ?? "")

    if (url === null) {
      return
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const inTable = editor.isActive("table")

  return (
    <div className="border-b border-[#e4ddd0] p-1.5">
      <div className="flex flex-wrap items-center gap-0.5">
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <select
          aria-label="Paragraph style"
          value={headingValue}
          onChange={(event) => setHeading(event.target.value)}
          className="h-7 rounded border border-[#e4ddd0] bg-white px-1.5 text-xs text-[#2d2d2d] outline-none focus:border-[#8b6f47]"
        >
          <option value="paragraph">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <ToolbarDivider />

        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <CodeIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Subscript"
          active={editor.isActive("subscript")}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Superscript"
          active={editor.isActive("superscript")}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <label
          title="Text color"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-[#2d2d2d] transition hover:bg-[#f5f1e8]"
        >
          <input
            type="color"
            aria-label="Text color"
            className="size-0 opacity-0"
            onChange={(event) =>
              editor.chain().focus().setColor(event.target.value).run()
            }
          />
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="pointer-events-none size-4"
          >
            <text x="2" y="18" fontSize="16" fontWeight="bold" fill="currentColor">
              A
            </text>
          </svg>
        </label>

        <label
          title="Highlight"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded text-[#2d2d2d] transition hover:bg-[#f5f1e8]"
        >
          <input
            type="color"
            aria-label="Highlight color"
            className="size-0 opacity-0"
            onChange={(event) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: event.target.value })
                .run()
            }
          />
          <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none size-4">
            <rect x="3" y="14" width="18" height="6" fill="currentColor" opacity="0.4" />
            <path
              d="M8 14 L15 3 L20 6 L13 17 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </label>

        <ToolbarDivider />

        <ToolbarButton
          label="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Justify"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Task list"
          active={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        >
          <ListTodo className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <Eraser className="size-4" />
        </ToolbarButton>
      </div>

      {inTable && (
        <div className="mt-1 flex flex-wrap items-center gap-0.5 border-t border-[#e4ddd0] pt-1">
          <span className="px-1 text-[10px] font-semibold uppercase text-[#999999]">
            Table
          </span>

          <ToolbarButton
            label="Add row after"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <Plus className="size-4" />
            <span className="sr-only">Row</span>
          </ToolbarButton>

          <ToolbarButton
            label="Delete row"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Row</span>
          </ToolbarButton>

          <ToolbarButton
            label="Add column after"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <Plus className="size-4 rotate-90" />
          </ToolbarButton>

          <ToolbarButton
            label="Delete column"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <Trash2 className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            label="Merge or split cells"
            onClick={() => editor.chain().focus().mergeOrSplit().run()}
          >
            <span className="text-xs font-semibold">⇔</span>
          </ToolbarButton>

          <ToolbarButton
            label="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <Trash2 className="size-4 text-[#cc3333]" />
          </ToolbarButton>
        </div>
      )}
    </div>
  )
}

type RichTextEditorProps = {
  content: string
  onChange: (html: string) => void
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      // Image isn't exposed via the toolbar - it's included so an <img>
      // (the ScanX signature logo) already present in the initial content
      // isn't silently stripped out, since StarterKit alone doesn't
      // support <img>.
      Image,
      Placeholder.configure({ placeholder: "Write your message…" }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] px-3 py-2 text-sm text-[#2d2d2d] outline-none " +
          "[&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-[#e4ddd0] [&_blockquote]:pl-3 [&_blockquote]:text-[#777777] " +
          "[&_code]:rounded [&_code]:bg-[#f5f1e8] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs " +
          "[&_pre]:rounded [&_pre]:bg-[#2d2d2d] [&_pre]:p-3 [&_pre]:text-white [&_pre]:overflow-x-auto " +
          "[&_hr]:my-3 [&_hr]:border-[#e4ddd0] " +
          "[&_a]:text-[#2563eb] [&_a]:underline " +
          "[&_table]:border-collapse [&_table]:w-full " +
          "[&_th]:border [&_th]:border-[#e4ddd0] [&_th]:bg-[#f5f1e8] [&_th]:p-1.5 [&_th]:text-left " +
          "[&_td]:border [&_td]:border-[#e4ddd0] [&_td]:p-1.5 " +
          "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0 " +
          "[&_.is-editor-empty:first-child::before]:text-[#999999] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
      },
    },
  })

  return (
    <div className="overflow-hidden rounded-md border border-[#e4ddd0] focus-within:border-[#8b6f47]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
