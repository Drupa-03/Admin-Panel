//Working Code

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import api, {API_URL} from "@/utills/api";
import { toast } from "react-toastify";
import ReactModalImage from "react-modal-image";
import { SortableItem } from "./SortableItem";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { v4 as uuidv4 } from "uuid";
import { X, Text, Heading, Image, GripVertical, ArrowLeft } from "lucide-react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { Blockquote } from "@tiptap/extension-blockquote";
import { Extension } from "@tiptap/core";
import EmojiPicker from "emoji-picker-react";
// Custom Emoji Extension
const Emoji = Extension.create({
  name: "emoji",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      insertEmoji:
        (emoji) =>
        ({ commands }) => {
          return commands.insertContent({
            type: "text",
            text: emoji,
          });
        },
    };
  },
});

const RichTextEditor = ({ content = "", onChange = () => {} }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "list-item",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc pl-6",
        },
        itemTypeName: "listItem",
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal pl-6",
        },
        itemTypeName: "listItem",
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-gray-300 pl-4 italic text-gray-600",
        },
      }),
      Emoji,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[200px] p-6",
      },
    },
  });

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const setColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setActiveDropdown(null);
  };

  const setHighlight = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
    setActiveDropdown(null);
  };

  const removeHighlight = () => {
    editor.chain().focus().unsetHighlight().run();
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Color palette
  const textColors = [
    { name: "Black", value: "#000000" },
    { name: "Dark Gray", value: "#374151" },
    { name: "Gray", value: "#6b7280" },
    { name: "Light Gray", value: "#9ca3af" },
    { name: "Red", value: "#dc2626" },
    { name: "Orange", value: "#ea580c" },
    { name: "Amber", value: "#d97706" },
    { name: "Yellow", value: "#ca8a04" },
    { name: "Lime", value: "#65a30d" },
    { name: "Green", value: "#16a34a" },
    { name: "Emerald", value: "#059669" },
    { name: "Teal", value: "#0d9488" },
    { name: "Cyan", value: "#0891b2" },
    { name: "Sky", value: "#0284c7" },
    { name: "Blue", value: "#2563eb" },
    { name: "Indigo", value: "#4f46e5" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Purple", value: "#9333ea" },
    { name: "Fuchsia", value: "#c026d3" },
    { name: "Pink", value: "#db2777" },
    { name: "Rose", value: "#e11d48" },
  ];

  const highlightColors = [
    { name: "Yellow", value: "#fef3c7" },
    { name: "Green", value: "#d1fae5" },
    { name: "Blue", value: "#dbeafe" },
    { name: "Purple", value: "#e9d5ff" },
    { name: "Pink", value: "#fce7f3" },
    { name: "Red", value: "#fee2e2" },
    { name: "Orange", value: "#fed7aa" },
    { name: "Teal", value: "#ccfbf1" },
    { name: "Indigo", value: "#e0e7ff" },
  ];

  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    title,
    children,
    className = "",
  }) => (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-2.5 rounded-lg transition-all duration-200 group
        ${
          isActive
            ? "bg-[#004b8f] text-white shadow-md"
            : "hover:bg-gray-100 text-gray-600 hover:text-[#004b8f]"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      title={title}>
      {children}
    </button>
  );

  const DropdownButton = ({ children, content, title, dropdownKey }) => (
    <div className='relative dropdown-container'>
      <ToolbarButton
        onClick={() => toggleDropdown(dropdownKey)}
        isActive={activeDropdown === dropdownKey}
        title={title}>
        {children}
        <svg
          className='w-3 h-3 ml-1 inline'
          fill='currentColor'
          viewBox='0 0 20 20'>
          <path
            fillRule='evenodd'
            d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
            clipRule='evenodd'
          />
        </svg>
      </ToolbarButton>
      {activeDropdown === dropdownKey && (
        <div className='absolute z-50 bg-white shadow-xl rounded-xl border border-gray-200 p-4 min-w-[200px] top-full mt-2 left-0 max-h-80 overflow-y-auto'>
          {content}
        </div>
      )}
    </div>
  );

  const EmojiPickerButton = ({ editor }) => {
    const [showPicker, setShowPicker] = useState(false);

    const onEmojiClick = (emojiData) => {
      editor.commands.insertEmoji(emojiData.emoji);
      setShowPicker(false);
    };

    return (
      <div className='relative dropdown-container'>
        {/* Toolbar */}
        <ToolbarButton
          onClick={() => setShowPicker(!showPicker)}
          isActive={showPicker}
          title='Insert Emoji'>
          <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z'
              clipRule='evenodd'
            />
          </svg>
        </ToolbarButton>
        {showPicker && (
          <div className='absolute z-50 top-full mt-2 left-0'>
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width={300}
              height={350}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>
    );
  };

  if (!editor) {
    return (
      <div className='animate-pulse bg-gray-100 rounded-xl h-96 flex items-center justify-center'>
        <div className='text-gray-400'>Loading editor...</div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'>
      {/* Toolbar */}
      <div className='bg-gray-50 border-b border-gray-200 p-4'>
        <div className='flex flex-wrap items-center gap-2'>
          {/* Text Formatting Group */}
          <div className='flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border'>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title='Bold (Ctrl+B)'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M5 3a2 2 0 00-2 2v10a2 2 0 002 2h4.5a3.5 3.5 0 001.852-6.47A3.5 3.5 0 0010 3H5zm4 6H6V6h3a1.5 1.5 0 110 3zm1 4H6v-3h4a2 2 0 110 4z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title='Italic (Ctrl+I)'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M8 1a.5.5 0 01.5.5V2h2.5a.5.5 0 010 1h-2.5v11h2.5a.5.5 0 010 1h-2.5v.5a.5.5 0 01-1 0V15H4.5a.5.5 0 010-1H7V3H4.5a.5.5 0 010-1H7v-.5A.5.5 0 018 1z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title='Underline (Ctrl+U)'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M6 2a.5.5 0 01.5.5v7a3.5 3.5 0 107 0v-7a.5.5 0 011 0v7a4.5 4.5 0 11-9 0v-7A.5.5 0 016 2zM3.5 16a.5.5 0 000 1h13a.5.5 0 000-1h-13z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title='Strikethrough'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M6 10h8v1H6v-1zM4 6h12v1H4V6zM4 13h12v1H4v-1z' />
              </svg>
            </ToolbarButton>

            <div className='w-px h-6 bg-gray-300 mx-1'></div>
          </div>

          {/* Text Alignment */}
          <div className='flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border'>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title='Align Left'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4h14v2H3V4zm0 4h10v2H3V8zm0 4h14v2H3v-2zm0 4h10v2H3v-2z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
              title='Align Center'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4h14v2H3V4zm2 4h10v2H5V8zm-2 4h14v2H3v-2zm2 4h10v2H5v-2z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title='Align Right'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4h14v2H3V4zm4 4h10v2H7V8zm-4 4h14v2H3v-2zm4 4h10v2H7v-2z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              isActive={editor.isActive({ textAlign: "justify" })}
              title='Justify'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4h14v2H3V4zm0 4h14v2H3V8zm0 4h14v2H3v-2zm0 4h14v2H3v-2z' />
              </svg>
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className='flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border'>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title='Bullet List'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4a1 1 0 11-2 0 1 1 0 012 0zM6 4a1 1 0 000 2h11a1 1 0 100-2H6zM3 10a1 1 0 11-2 0 1 1 0 012 0zM6 10a1 1 0 100 2h11a1 1 0 100-2H6zM3 16a1 1 0 11-2 0 1 1 0 012 0zM6 16a1 1 0 100 2h11a1 1 0 100-2H6z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title='Numbered List'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 4h1v1H3V4zM5 4h11a1 1 0 110 2H5a1 1 0 110-2zM3 9h1v1H3V9zM5 9h11a1 1 0 110 2H5a1 1 0 110-2zM3 14h1v1H3v-1zM5 14h11a1 1 0 110 2H5a1 1 0 110-2z' />
              </svg>
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title='Quote'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M3 10c0-2.761 1.239-4 4-4s4 1.239 4 4-1.239 4-4 4-4-1.239-4-4zm6 0c0-2.761 1.239-4 4-4s4 1.239 4 4-1.239 4-4 4-4-1.239-4-4z' />
              </svg>
            </ToolbarButton>
          </div>

          {/* Colors */}
          <div className='bg-white rounded-lg shadow-sm border flex items-center pl-1'>
            <svg
              className='w-4 h-4 text-gray-500'
              fill='currentColor'
              viewBox='0 0 20 20'>
              <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
            </svg>
            <DropdownButton
              title='Text Color'
              dropdownKey='textColor'
              content={
                <div className='space-y-4'>
                  <div className='text-xs font-semibold text-gray-500'>
                    Text Color
                  </div>
                  <div className='grid grid-cols-7 gap-2'>
                    {textColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setColor(color.value)}
                        className='w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-[#004b8f] transition-all hover:scale-110 shadow-sm'
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setColor("#000000")}
                    className='w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors'>
                    Reset to Black
                  </button>
                </div>
              }
            />
          </div>

          {/* Highlight */}
          <div className='bg-white rounded-lg shadow-sm border flex items-center pl-1'>
            <svg
              className='w-4 h-4 text-gray-500'
              fill='currentColor'
              viewBox='0 0 20 20'>
              <path d='M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z' />
              <path
                fillRule='evenodd'
                d='M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
                clipRule='evenodd'
              />
            </svg>
            <DropdownButton
              title='Highlight'
              dropdownKey='highlight'
              content={
                <div className='space-y-4'>
                  <div className='text-xs font-semibold text-gray-500'>
                    Highlight Color
                  </div>
                  <div className='grid grid-cols-3 gap-2'>
                    {highlightColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setHighlight(color.value)}
                        className='w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-[#004b8f] transition-all hover:scale-110 shadow-sm flex items-center justify-center'
                        style={{ backgroundColor: color.value }}
                        title={color.name}>
                        <span className='text-xs font-semibold text-gray-700'>
                          A
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={removeHighlight}
                    className='w-full py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-colors'>
                    Remove Highlight
                  </button>
                </div>
              }
            />
          </div>

          {/* Emoji Button */}
          <div className='flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border'>
            <EmojiPickerButton editor={editor} />
          </div>

          {/* Link Buttons */}
          <div className='flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm border'>
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive("link")}
              title='Add Link'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z'
                  clipRule='evenodd'
                />
              </svg>
            </ToolbarButton>

            {editor.isActive("link") && (
              <ToolbarButton onClick={removeLink} title='Remove Link'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </ToolbarButton>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className='relative bg-white'>
        <EditorContent
          editor={editor}
          className='min-h-[100px] max-h-[300px] overflow-y-auto focus-within:ring-2 focus-within:ring-[#004b8f] focus-within:ring-opacity-30 transition-all duration-200'
        />

        {/* Placeholder */}
        {editor.isEmpty && (
          <div className='absolute top-6 left-6 text-gray-400 pointer-events-none select-none'>
            <div className='text-lg font-medium mb-2'>
              Start writing your content...
            </div>
            <div className='text-sm text-gray-300'>
              Use the toolbar above to format your text with various styles and
              options.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage component
const EditorDemo = () => {
  const [content, setContent] = useState(
    "<p>Welcome to the improved rich text editor! Try out all the formatting options.</p>"
  );

  return (
    <div className='max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>
          Rich Text Editor
        </h1>
        <p className='text-gray-600'>
          All editing tools now work properly with click-based dropdowns and
          improved user experience.
        </p>
      </div>

      <RichTextEditor content={content} onChange={setContent} />

      <div className='mt-6 p-4 bg-white rounded-lg border'>
        <h3 className='text-lg font-semibold mb-2'>HTML Output:</h3>
        <pre className='text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto'>
          {content}
        </pre>
      </div>
    </div>
  );
};

export default function AddBlog() {
  const [blocks, setBlocks] = useState([]);
  const [blockErrors, setBlockErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const lastBlockRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get("id");

  const prevBlocksLength = useRef(blocks.length);

  useEffect(() => {
    const blockAdded = blocks.length > prevBlocksLength.current;

    if (blockAdded && lastBlockRef.current) {
      lastBlockRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    prevBlocksLength.current = blocks.length;
  }, [blocks]);

  useEffect(() => {
    if (blogId) {
      const fetchBlog = async () => {
        try {
          const res = await api.get(`/nodesetup/blogs/${blogId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
            },
          });
          const blog = res.data.data;
          formik.setValues({
            title: blog.title,
            status: blog.status,
          });
          setBlocks(
            blog.contents.map((content) => ({
              id: uuidv4(),
              content_id: content.content_id,
              type: content.type,
              content:
                content.type === "image"
                  ? `${API_URL}/${content.content}`
                  : content.content,
              previewUrl:
                content.type === "image"
                  ? `${API_URL}/${content.content}`
                  : "",
              order: content.order,
            }))
          );
        } catch (error) {
          console.error("Error fetching blog:", error);
          setSubmissionError("Failed to load blog data. Please try again.");
        }
      };
      fetchBlog();
    }
  }, [blogId]);

  const formik = useFormik({
    initialValues: { title: "", status: 1 },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
    }),
    onSubmit: async (values) => {
      if (blocks.length === 0) {
        setSubmissionError("Add at least one block (text, subtitle, or image)");
        return;
      }

      const newErrors = {};
      blocks.forEach((block) => {
        if (
          block.type !== "image" &&
          (!block.content || !block.content.toString().trim())
        ) {
          newErrors[block.id] = "This block is required.";
        }
        if (block.type === "image" && !block.content) {
          newErrors[block.id] = "Please upload an image.";
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setBlockErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      setSubmissionError("");

      try {
        const payload = {
          title: values.title,
          status: values.status,
          contents: blocks.map((block, i) => ({
            type: block.type,
            order: i + 1,
            content:
              block.type === "image"
                ? block.content.replace(`${API_URL}/`, "")
                : block.content,
          })),
        };

        console.log("Blog payload:", payload);

        let res;
        if (blogId) {
          res = await api.put(`/nodesetup/blogs/${blogId}`, payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
            },
          });
        } else {
          res = await api.post("/nodesetup/blogs", payload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
            },
          });
        }

        if (res.status === 200 || res.status === 201) {
          toast.success(
            blogId ? "Blog updated successfully!" : "Blog created successfully!"
          );
          router.push("/Blogs");
        } else {
          throw new Error(
            res.data?.message || "Failed to submit blog. Please try again."
          );
        }
      } catch (error) {
        console.error("Submission failed:", error);
        setSubmissionError(
          error.message || "Failed to submit blog. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddBlock = (type) => {
    const newBlock = {
      id: uuidv4(),
      type,
      content: type === "text" ? "<p></p>" : "",
      file: null,
      previewUrl: "",
      filename: "",
      order: blocks.length + 1,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setBlockErrors((prev) => ({ ...prev, [newBlock.id]: "" }));
  };

  const handleRemoveBlock = async (id, e) => {
    e?.stopPropagation();
    const block = blocks.find((b) => b.id === id);
    if (block.type === "image" && block.filename) {
      try {
        await api.delete(`/nodesetup/blogs/images/temp/${block.filename}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
          },
        });
        console.log(`Deleted temporary image: ${block.filename}`);
      } catch (error) {
        console.error(
          `Failed to delete temporary image ${block.filename}:`,
          error
        );
      }
    }
    // Remove the block and recalculate order for remaining blocks
    setBlocks((prev) =>
      prev
        .filter((block) => block.id !== id)
        .map((block, index) => ({
          ...block,
          order: index + 1,
        }))
    );
  };

  const handleCancel = async () => {
    const imageBlocks = blocks.filter((b) => b.type === "image" && b.filename);
    for (const block of imageBlocks) {
      try {
        await api.delete(`/nodesetup/blogs/images/temp/${block.filename}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
          },
        });
        console.log(`Deleted temporary image: ${block.filename}`);
      } catch (error) {
        console.error(
          `Failed to delete temporary image ${block.filename}:`,
          error
        );
      }
    }
    router.push("/Blogs");
  };

  const handleInputChange = (id, value, e) => {
    e?.stopPropagation();
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, content: value } : block
      )
    );
    setBlockErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleImageUpload = async (e, id) => {
    e?.stopPropagation();
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.warn(
        "Please select a valid image file (JPEG, PNG, GIF, WebP or avif)"
      );
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.warn("File size must be less than 10MB");
      return;
    }
    const formData = new FormData();
    formData.append("images", file);
    try {
      const res = await api.post("/nodesetup/blogs/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
        },
      });
      const imageData = res.data?.data?.[0];
      if (!imageData?.tempUrl) {
        toast.warn("Image uploaded, but no URL returned.");
        return;
      }
      const previewUrl = `${API_URL}/${imageData.tempUrl.toLowerCase()}`;
      console.log("Setting previewUrl:", previewUrl);
      const img = new globalThis.Image();

      img.src = previewUrl;
      img.onload = () => {
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === id
              ? {
                  ...block,
                  content: imageData.tempUrl,
                  previewUrl: previewUrl,
                  filename: imageData.filename,
                }
              : block
          )
        );
        setBlockErrors((prev) => ({ ...prev, [id]: "" }));
      };
      img.onerror = () => {
        console.error("Failed to load image preview:", previewUrl);
        toast.error(
          "Image uploaded, but preview failed to load. Please try again."
        );
      };
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Image upload failed. Check console for details.");
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === id
            ? { ...block, previewUrl: "", content: "", filename: "" }
            : block
        )
      );
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map(
        (block, i) => ({
          ...block,
          order: i + 1,
        })
      );
      setBlocks(newBlocks);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8'>
      <div className='max-w-6xl mx-auto py-10'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white ml-2'>
            {blogId ? "Edit Blog" : "Add Blog"}
          </h1>
          <button
            onClick={handleCancel}
            className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] cursor-pointer'>
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <form onSubmit={formik.handleSubmit} className='space-y-4'>
          <div>
            <input
              type='text'
              name='title'
              placeholder='Title'
              {...formik.getFieldProps("title")}
              className='w-full p-3 rounded-lg border-2 border-gray-300 bg-white dark:bg-gray-800 dark:text-white  dark:border-gray-600'
            />
            {formik.touched.title && formik.errors.title && (
              <div className='text-red-500 text-sm mt-1'>
                {formik.errors.title}
              </div>
            )}
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}>
              {blocks.map((block, index) => (
                <SortableItem key={block.id} id={block.id}>
                  <div
                    ref={index === blocks.length - 1 ? lastBlockRef : null}
                    className='relative  p-4 mb-4 rounded-lg bg-white dark:bg-gray-800'>
                    <button
                      type='button'
                      onClick={(e) => handleRemoveBlock(block.id, e)}
                      className='absolute top-2 right-2 text-gray-500 hover:text-red-500'>
                      <X size={18} />
                    </button>
                    <div className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
                      {typeof block.type === "string"
                        ? block.type.toLowerCase()
                        : "unknown"}{" "}
                      (Order: {block.order})
                      {block.type === "image" && block.filename && (
                        <span className='ml-2 text-xs'>({block.filename})</span>
                      )}
                    </div>

                    {block.type === "text" ||
                    block.type === "secondary_title" ? (
                      <RichTextEditor
                        content={block.content}
                        onChange={(content) =>
                          handleInputChange(block.id, content)
                        }
                        compact={block.type === "secondary_title"}
                      />
                    ) : block.type === "secondary_title" ? (
                      <input
                        type='text'
                        className='w-full p-3 rounded-md  bg-white dark:bg-gray-700 text-black dark:text-white  dark:border-gray-500'
                        value={block.content}
                        onChange={(e) =>
                          handleInputChange(block.id, e.target.value, e)
                        }
                        placeholder='Enter subtitle...'
                      />
                    ) : (
                      <>
                        {/* <input
                          type='file'
                          accept='image/*'
                          onChange={(e) => handleImageUpload(e, block.id)}
                          className='text-sm text-black dark:text-white mb-2 '
                        /> */}
                        <div className='mt-2'>
                          {/* <label className='inline-block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            Upload Image
                          </label> */}
                          <div className='flex items-center gap-4'>
                            {block.previewUrl && (
                              <div className='relative group w-28 h-20 rounded-lg overflow-hidden border shadow'>
                                <ReactModalImage
                                  small={block.previewUrl}
                                  large={block.previewUrl}
                                  alt='Preview'
                                  hideDownload
                                  hideZoom
                                  className='w-full h-full object-cover'
                                />
                              </div>
                            )}

                            <label className='cursor-pointer inline-block px-4 py-2 bg-[#004b8f] text-white text-sm font-medium rounded-md hover:bg-[#003a73] transition'>
                              Choose Image
                              <input
                                type='file'
                                accept='image/*'
                                onChange={(e) => handleImageUpload(e, block.id)}
                                className='hidden'
                              />
                            </label>
                          </div>

                          {block.filename && (
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                              Selected: {block.filename}
                            </p>
                          )}
                        </div>

                        {/* {block.previewUrl && (
                          <div className='relative group w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden cursor-pointer mt-2'>
                            <ReactModalImage
                              small={block.previewUrl}
                              large={block.previewUrl}
                              alt='Preview'
                              hideDownload={true}
                              hideZoom={true}
                              className='w-full h-full object-cover'
                              imageBackgroundColor='transparent'
                            />
                          </div>
                        )} */}
                      </>
                    )}

                    {blockErrors[block.id] && (
                      <p className='text-red-500 text-sm mt-1'>
                        {blockErrors[block.id]}
                      </p>
                    )}
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>

          <div className='flex flex-wrap gap-4'>
            {/* Text (T) */}
            <button
              type='button'
              onClick={() => handleAddBlock("text")}
              className='w-12 h-12 flex items-center justify-center rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md cursor-pointer'>
              <Text size={18} />
            </button>

            {/* Subtitle (Sub) */}
            <button
              type='button'
              onClick={() => handleAddBlock("secondary_title")}
              className='w-12 h-12 flex flex-col items-center justify-center rounded-xl text-white bg-green-600 hover:bg-green-700 transition-all shadow-md cursor-pointer'>
              <Heading size={18} />
            </button>

            {/* Image (I) */}
            <button
              type='button'
              onClick={() => handleAddBlock("image")}
              className='w-12 h-12 flex flex-col items-center justify-center rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md cursor-pointer'>
              <Image size={18} />
            </button>
          </div>

          {submissionError && (
            <div className='text-red-500 text-sm mt-2'>{submissionError}</div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group w-full cursor-pointer ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}>
            {isSubmitting ? (
              <span className='flex items-center justify-center gap-2'>
                <svg
                  className='animate-spin h-5 w-5 text-white '
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                Submitting...
              </span>
            ) : blogId ? (
              "Update Blog"
            ) : (
              "Submit Blog"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
