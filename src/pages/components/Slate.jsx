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

  insertImage(
    editor,
    url,
    align = "flex-start",
    size = { width: "", height: "" }
  ) {
    if (url && isUrl(url)) {
      const text = { text: "" };
      const image = { type: "image", url, align, size, children: [text] };
      Transforms.insertNodes(editor, image);
    } else {
      const text = { text: "" };
      const image = { type: "image", url: null, align, size, children: [text] };
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
const getElementStyles = (align, fontWidth) => ({
  display: "flex",
  justifyContent: align || "flex-start",
  textAlign: align || "left",
  fontWidth: fontWidth || "normal",
});

const Element = ({ attributes, children, element }) => {
  const styles = getElementStyles(element.align, element.fontWidth);

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
        <h1 style={styles} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={styles} {...attributes}>
          {children}
        </h2>
      );
    case "heading-three":
      return (
        <h3 style={styles} {...attributes}>
          {children}
        </h3>
      );
    default:
      return (
        <p style={styles} {...attributes}>
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
  const { width, height } = element.size || {}; // سایز تصویر

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
              width: width || "auto", // استفاده از سایز تنظیم شده
              height: height || "auto", // استفاده از سایز تنظیم شده
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
const buttonStyle = (isActive) => ({
  backgroundColor: isActive ? "#007bff" : "#f0f0f0", // رنگ پس‌زمینه
  color: isActive ? "#fff" : "#000", // رنگ متن
  border: "1px solid #ccc", // حاشیه
  borderRadius: "4px", // گوشه‌های گرد
  padding: "8px 12px", // فاصله داخلی
  margin: "0 4px", // فاصله بیرونی
  cursor: "pointer", // نشانگر ماوس
});
const selectStyle = (isActive) => ({
  backgroundColor: "#f0f0f0", // رنگ پس‌زمینه
  color: "#000", // رنگ متن
  border: "1px solid #ccc", // حاشیه
  borderRadius: "4px", // گوشه‌های گرد
  padding: "8px 12px", // فاصله داخلی
  margin: "0 4px", // فاصله بیرونی
  cursor: "pointer", // نشانگر ماوس
  appearance: "none", // حذف استایل پیش‌فرض مرورگر
  outline: "none", // حذف حاشیه زمان فوکوس
  WebkitAppearance: "none", // حذف استایل پیش‌فرض مرورگرهای WebKit
  MozAppearance: "none", // حذف استایل پیش‌فرض مرورگرهای موزیلا
});
const imageButtonStyle = {
  backgroundColor: "#007bff", // رنگ پس‌زمینه دکمه
  color: "#fff", // رنگ متن
  border: "none", // حذف حاشیه
  borderRadius: "4px", // گوشه‌های گرد
  padding: "10px 20px", // فاصله داخلی
  margin: "0 4px", // فاصله بیرونی
  cursor: "pointer", // نشانگر ماوس
  fontSize: "16px", // اندازه فونت
  fontWeight: "bold", // ضخامت فونت
  display: "flex", // برای مرکز کردن محتویات
  alignItems: "center", // مرکز کردن محتویات عمودی
  justifyContent: "center", // مرکز کردن محتویات افقی
  transition: "background-color 0.3s, box-shadow 0.3s", // انیمیشن برای تغییر رنگ پس‌زمینه و سایه
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // سایه دکمه
};

const imageButtonHoverStyle = {
  ...imageButtonStyle,
  backgroundColor: "#0056b3", // رنگ پس‌زمینه هنگام هاور
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)", // سایه بزرگ‌تر هنگام هاور
};
const inputStyle = {
  border: "1px solid #ccc", // حاشیه
  borderRadius: "4px", // گوشه‌های گرد
  padding: "8px", // فاصله داخلی
  margin: "0 4px", // فاصله بیرونی
  fontSize: "16px", // اندازه فونت
  width: "120px", // عرض ثابت
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
  const [imageSize, setImageSize] = useState({ width: "", height: "" }); // برای نگهداری سایز تصویر
  const headingOptions = [
    { label: "پاراگراف", value: "paragraph" },
    { label: "هدینگ 1", value: "heading-one" },
    { label: "هدینگ 2", value: "heading-two" },
    { label: "هدینگ 3", value: "heading-three" },
  ];

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const fonts = ["Arial", "Georgia", "Times New Roman", "Iransansx"];

  const handleImageInsert = () => {
    const url = window.prompt("URL تصویر را وارد کنید:");
    if (!url) return;

    const align = "center";
    CustomEditor.insertImage(editor, url, align, imageSize);
    setImageSize({ width: "", height: "" }); // پاک کردن سایز پس از درج تصویر
  };

  return (
    <Slate
      editor={editor}
      initialValue={
        value || [
          {
            type: "paragraph",
            children: [{ text: "یک خط متن در یک پاراگراف." }],
          },
        ]
      }
      onChange={(newValue) => {
        setValue(newValue);
        setInitialValue(newValue);
      }}
    >
      <div>
        <select
          style={selectStyle(CustomEditor.isFontMarkActive(editor))}
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
          style={buttonStyle(CustomEditor.isBoldMarkActive(editor))}
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          پررنگ
        </button>
        <button
          style={buttonStyle(CustomEditor.isItalicMarkActive(editor))}
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleItalicMark(editor);
          }}
        >
          مورب
        </button>
        <button
          style={buttonStyle(CustomEditor.isAlignActive(editor, "flex-start"))}
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleAlign(editor, "flex-start");
          }}
        >
          راست‌چین
        </button>
        <button
          style={buttonStyle(CustomEditor.isAlignActive(editor, "center"))}
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleAlign(editor, "center");
          }}
        >
          وسط‌چین
        </button>
        <button
          style={buttonStyle(CustomEditor.isAlignActive(editor, "flex-end"))}
          onMouseDown={(e) => {
            e.preventDefault();
            CustomEditor.toggleAlign(editor, "flex-end");
          }}
        >
          چپ‌چین
        </button>

        {/* لیست کشویی هدینگ */}
        <select
          style={selectStyle(
            headingOptions.some((option) =>
              CustomEditor.isBlockActive(editor, option.value)
            )
          )}
          onChange={(e) => {
            e.preventDefault();
            const format = e.target.value;
            CustomEditor.toggleBlock(editor, format);
          }}
          value={
            headingOptions.find((option) =>
              CustomEditor.isBlockActive(editor, option.value)
            )?.value || "paragraph"
          }
        >
          {headingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div>
          <input
            type="number"
            placeholder="عرض (پیکسل)"
            value={imageSize.width}
            onChange={(e) =>
              setImageSize({ ...imageSize, width: e.target.value })
            }
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="ارتفاع (پیکسل)"
            value={imageSize.height}
            onChange={(e) =>
              setImageSize({ ...imageSize, height: e.target.value })
            }
            style={inputStyle}
          />
        </div>
        <button
          style={imageButtonStyle}
          onMouseEnter={(e) => (e.currentTarget.style = imageButtonHoverStyle)} // تغییر استایل هنگام هاور
          onMouseLeave={(e) => (e.currentTarget.style = imageButtonStyle)} // بازگشت به استایل اصلی
          onMouseDown={(e) => {
            e.preventDefault();
            handleImageInsert();
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
