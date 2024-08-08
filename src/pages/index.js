import React, { useEffect, useState } from "react";
import CustomEditor from "./components/Editor";

export default function MainPage() {
  const [editorContent, setEditorContent] = useState("");
  const [textareaContent, setTextareaContent] = useState("");
  const [htmlValue, setHtmlValue] = useState("");
  const [a, setA] = useState(false);

  // زمانی که کاربر دکمه "ذخیره" را فشار دهد، محتوای ورودی به ادیتور منتقل می‌شود
  const handleSave = () => {
    setA(true);
    setEditorContent(textareaContent);
  };
  useEffect(() => {
    if (a) {
      setA(false);
    }
  }, [a]);
  // تبدیل محتوای ادیتور به HTML و نمایش آن در ورودی
  const handleConvertToHtml = () => {
    setTextareaContent(editorContent);
  };

  // لاگ کردن داده‌های نهایی در کنسول
  const handleLogData = () => {
    console.log("Editor Content: ", editorContent);
    console.log("Textarea Content: ", textareaContent);
    console.log("htmlValue Content: ", htmlValue);
  };

  return (
    <>
      {/* ادیتور */}
      {!a && (
        <CustomEditor
          value={editorContent}
          onChange={(e) => setEditorContent(e)}
          setHtmlValue={setHtmlValue}
        />
      )}

      {/* دکمه‌ها */}
      <button onClick={handleConvertToHtml}>تبدیل به HTML</button>
      <button onClick={handleLogData}>لاگ کردن داده‌ها</button>

      {/* ورودی textarea */}
      <div style={{ width: "100%", marginTop: "20px" }}>
        <textarea
          value={textareaContent}
          onChange={(e) => setTextareaContent(e.target.value)}
          style={{ width: "100%", height: "150px" }}
        ></textarea>
        <button onClick={handleSave}>ذخیره</button>
      </div>
    </>
  );
}
