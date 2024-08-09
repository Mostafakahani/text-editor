import React, { useMemo, useState, useCallback } from "react";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  useSelected,
  useFocused,
} from "slate-react";
import isUrl from "is-url";

const CustomEditor = {
  isBoldMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },

  isItalicMarkActive(editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "bold");
    } else {
      Editor.addMark(editor, "bold", true);
    }
  },

  toggleItalicMark(editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, "italic");
    } else {
      Editor.addMark(editor, "italic", true);
    }
  },

  toggleAlign(editor, align) {
    const isActive = CustomEditor.isAlignActive(editor, align);
    Transforms.setNodes(
      editor,
      { align: isActive ? null : align },
      { match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  },

  isAlignActive(editor, align) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.align === align,
    });
    return !!match;
  },

  insertImage(editor, url, align = "flex-start") {
    if (url && isUrl(url)) {
      const text = { text: "" };
      const image = { type: "image", url, align, children: [text] };
      Transforms.insertNodes(editor, image);
    } else {
      const text = { text: "" };
      const image = { type: "image", url: null, align, children: [text] };
      Transforms.insertNodes(editor, image);
      console.warn("Invalid URL provided for image insertion");
    }
  },
  toggleColorMark(editor, color) {
    const isActive = CustomEditor.isColorMarkActive(editor, color);
    if (isActive) {
      Editor.removeMark(editor, "color");
    } else {
      Editor.addMark(editor, "color", color);
    }
  },

  isColorMarkActive(editor, color) {
    const marks = Editor.marks(editor);
    return marks ? marks.color === color : false;
  },
  toggleFontMark(editor, font) {
    const isActive = CustomEditor.isFontMarkActive(editor, font);
    if (isActive) {
      Editor.removeMark(editor, "font");
    } else {
      Editor.addMark(editor, "font", font);
    }
  },

  isFontMarkActive(editor, font) {
    const marks = Editor.marks(editor);
    return marks ? marks.font === font : false;
  },
  toggleBlock(editor, format) {
    const isActive = CustomEditor.isBlockActive(editor, format);
    Transforms.setNodes(
      editor,
      { type: isActive ? "paragraph" : format },
      { match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  },

  isBlockActive(editor, format) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === format,
    });
    return !!match;
  },
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "image":
      return (
        <ImageElement {...element} attributes={attributes} element={element}>
          {children}
        </ImageElement>
      );
    case "code":
      return (
        <pre {...attributes}>
          <code>{children}</code>
        </pre>
      );
    case "heading-one":
      return (
        <h1
          style={{
            display: "flex",
            justifyContent: element.align,
            textAlign: element.align,
          }}
          {...attributes}
        >
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          style={{
            display: "flex",
            justifyContent: element.align,
            textAlign: element.align,
          }}
          {...attributes}
        >
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3
          style={{
            display: "flex",
            justifyContent: element.align,
            textAlign: element.align,
          }}
          {...attributes}
        >
          {children}
        </h3>
      );
    default:
      return (
        <p
          style={{
            display: "flex",
            justifyContent: element.align,
            textAlign: element.align,
          }}
          {...attributes}
        >
          {children}
        </p>
      );
  }
};

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  console.log(element.align);
  const alignment = element.align || "flex-start"; // چپ‌چین پیش‌فرض
  if (!element.url) return null;

  return (
    <div {...attributes} style={{ display: "flex", justifyContent: alignment }}>
      <div contentEditable={false}>
        {element.url && isUrl(element.url) ? (
          <img
            src={element.url}
            alt=""
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "20em",
              boxShadow: selected && focused ? "0 0 0 3px #B4D5FF" : "none",
            }}
          />
        ) : (
          <div>تصویر نامعتبر یا URL از دست رفته</div>
        )}
      </div>
      {children}
    </div>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.color) {
    children = <span style={{ color: leaf.color }}>{children}</span>;
  }
  if (leaf.font) {
    children = <span style={{ fontFamily: leaf.font }}>{children}</span>;
  }
  return <span {...attributes}>{children}</span>;
};

const withImages = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) =>
    element.type === "image" ? true : isVoid(element);
  return editor;
};

const SlateEditor = ({ initialValue, setInitialValue }) => {
  const editor = useMemo(() => withImages(withReact(createEditor())), []);
  const [value, setValue] = useState(initialValue);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const fonts = ["Arial", "Georgia", "Times New Roman", "Iransansx"];

  return (
    <Slate
      editor={editor}
      initialValue={value}
      onChange={(newValue) => {
        setValue(newValue);
        setInitialValue(newValue);
      }}
    >
      <div>
        <select
          onChange={(e) => {
            e.preventDefault();
            const font = e.target.value;
            CustomEditor.toggleFontMark(editor, font);
          }}
        >
          <option value="">انتخاب فونت</option>
          {fonts.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
        <input
          type="color"
          onChange={(e) => {
            e.preventDefault();
            const color = e.target.value;
            CustomEditor.toggleColorMark(editor, color);
          }}
        />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          پررنگ
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleItalicMark(editor);
          }}
        >
          مورب
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleAlign(editor, "flex-end");
          }}
        >
          راست‌چین
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleAlign(editor, "center");
          }}
        >
          وسط‌چین
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleAlign(editor, "flex-start");
          }}
        >
          چپ‌چین
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleBlock(editor, "heading-one");
          }}
        >
          Heading 1
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleBlock(editor, "heading-two");
          }}
        >
          Heading 2
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleBlock(editor, "heading-three");
          }}
        >
          Heading 3
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleBlock(editor, "code");
          }}
        >
          Code Block
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            const url = window.prompt("URL تصویر را وارد کنید:");
            if (!url) return null;

            const align = "center";
            CustomEditor.insertImage(editor, url, align);
          }}
        >
          درج تصویر
        </button>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }
          switch (event.key) {
            case "b": {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }
            case "i": {
              event.preventDefault();
              CustomEditor.toggleItalicMark(editor);
              break;
            }
          }
        }}
      />
    </Slate>
  );
};

export default SlateEditor;
