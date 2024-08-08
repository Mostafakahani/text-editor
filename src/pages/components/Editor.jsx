import React, { useEffect, useRef, useState } from "react";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import dynamic from "next/dynamic";

const CustomEditor = ({ value, onChange, setHtmlValue }) => {
  const [editorState, setEditorState] = useState(null);
  //   const [htmlValue, setHtmlValue] = useState(value);
  const editorRef = useRef(null);

  useEffect(() => {
    const loadEditor = async () => {
      let htmlToDraft;
      if (typeof window !== "undefined") {
        htmlToDraft = (await import("html-to-draftjs")).default;
      } else {
        // Server-side rendering
        return;
      }

      const blocksFromHtml = htmlToDraft(value);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        const initialEditorState = EditorState.createWithContent(contentState);
        setEditorState(initialEditorState);
      }
    };

    loadEditor();
  }, []);

  const DynamicEditor = dynamic(
    () => import("react-draft-wysiwyg").then((module) => module.Editor),
    { ssr: false }
  );

  const handleEditorChange = (state) => {
    setEditorState(state);
    const contentHtml = draftToHtml(convertToRaw(state.getCurrentContent()));
    setHtmlValue(contentHtml);
    onChange(contentHtml);
  };

  return (
    <div
      style={{
        border: "1px solid black",
        padding: 16,
        maxWidth: "100%",
        borderRadius: "5px",
      }}
    >
      {editorState && (
        <DynamicEditor
          ref={editorRef}
          editorStyle={{ maxWidth: "100%" }}
          editorState={editorState}
          onEditorStateChange={handleEditorChange}
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "fontFamily",
              "list",
              "textAlign",
              "link",
              "embedded",
              "image",
              "history",
            ],
          }}
          mention={{
            separator: " ",
            trigger: "@",
            suggestions: [
              { text: "APPLE", value: "apple", url: "apple" },
              { text: "BANANA", value: "banana", url: "banana" },
              { text: "CHERRY", value: "cherry", url: "cherry" },
              { text: "DURIAN", value: "durian", url: "durian" },
              { text: "EGGFRUIT", value: "eggfruit", url: "eggfruit" },
              { text: "FIG", value: "fig", url: "fig" },
              { text: "GRAPEFRUIT", value: "grapefruit", url: "grapefruit" },
              { text: "HONEYDEW", value: "honeydew", url: "honeydew" },
            ],
          }}
        />
      )}
    </div>
  );
};

export default CustomEditor;
