import React, { useEffect, useState } from "react";
import CustomEditor from "./components/Editor";

export default function MainPage() {
  const [editorContent, setEditorContent] = useState("");
  const [textareaContent, setTextareaContent] = useState("");
  const [htmlValue, setHtmlValue] = useState("");
  const [a, setA] = useState(false);
  const [sanitizedContent, setSanitizedContent] = useState("");

  useEffect(() => {
    let DOMPurify;
    import("isomorphic-dompurify").then((module) => {
      DOMPurify = module.default;
      setSanitizedContent(DOMPurify.sanitize(editorContent));
    });
  }, [editorContent]);

  const handleSave = () => {
    setA(true);
    setEditorContent(textareaContent);
  };

  useEffect(() => {
    if (a) {
      setA(false);
    }
  }, [a]);

  const handleConvertToHtml = () => {
    setTextareaContent(editorContent);
  };

  const handleLogData = () => {
    console.log("Editor Content: ", editorContent);
    console.log("Textarea Content: ", textareaContent);
    console.log("htmlValue Content: ", htmlValue);
  };

  return (
    <>
      {!a && (
        <CustomEditor
          value={editorContent}
          onChange={(e) => setEditorContent(e)}
          setHtmlValue={setHtmlValue}
        />
      )}

      <button onClick={handleConvertToHtml}>تبدیل به HTML</button>
      <button onClick={handleLogData}>لاگ کردن داده‌ها</button>

      <div style={{ width: "100%", marginTop: "20px" }}>
        <textarea
          value={textareaContent}
          onChange={(e) => setTextareaContent(e.target.value)}
          style={{ width: "100%", height: "150px" }}
        ></textarea>
        <button onClick={handleSave}>ذخیره</button>
      </div>

      <div
        style={{ marginTop: "50px", border: "1px solid #ccc", padding: "10px" }}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      <div
        style={{ marginTop: "50px", border: "1px solid #ccc", padding: "10px" }}
        dangerouslySetInnerHTML={{ __html: editorContent }}
      />
    </>
  );
}
