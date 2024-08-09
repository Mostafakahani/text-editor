import dynamic from "next/dynamic";
import { useState } from "react";

const SlateEditor = dynamic(() => import("./components/Slate"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const EditorPage = () => {
  const [initialValue, setInitialValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "یک خط متن در یک پاراگراف." }],
    },
  ]);

  return (
    <div>
      <h1>Enhanced Slate.js Editor in Next.js</h1>
      <SlateEditor
        initialValue={initialValue}
        setInitialValue={setInitialValue}
      />
      <button onClick={() => console.log(initialValue)}>Log values</button>
      <div style={{ width: "100%", marginTop: 80 }}>
        <div dangerouslySetInnerHTML={{ __html: serialize(initialValue) }} />
      </div>
    </div>
  );
};

const serializeText = (node) => {
  let text = node.text;

  // Bold
  if (node.bold) {
    text = `<strong>${text}</strong>`;
  }

  // Italic
  if (node.italic) {
    text = `<em>${text}</em>`;
  }

  // Underline
  if (node.underline) {
    text = `<u>${text}</u>`;
  }

  // Color
  if (node.color) {
    text = `<span style="color: ${node.color};">${text}</span>`;
  }

  // Font
  if (node.font) {
    text = `<span style="font-family: ${node.font};">${text}</span>`;
  }

  return text;
};

const serialize = (nodes) => {
  return nodes
    .map((node) => {
      if (node.type === "paragraph") {
        const align = node.align || "flex-start"; // مقدار پیش‌فرض 'flex-start' است
        return `<p style="display: flex; justify-content: ${align};">${node.children
          .map((child) => serializeText(child))
          .join("")}</p>`;
      }
      if (node.type === "heading-one") {
        const align = node.align || "flex-start"; // مقدار پیش‌فرض 'flex-start' است
        return `<h1 style="display: flex; justify-content: ${align}; text-align: ${align};">${node.children
          .map((child) => serializeText(child))
          .join("")}</h1>`;
      }
      if (node.type === "heading-two") {
        const align = node.align || "flex-start"; // مقدار پیش‌فرض 'flex-start' است
        return `<h2 style="display: flex; justify-content: ${align}; text-align: ${align};">${node.children
          .map((child) => serializeText(child))
          .join("")}</h2>`;
      }
      if (node.type === "heading-three") {
        const align = node.align || "flex-start"; // مقدار پیش‌فرض 'flex-start' است
        return `<h3 style="display: flex; justify-content: ${align}; text-align: ${align};">${node.children
          .map((child) => serializeText(child))
          .join("")}</h3>`;
      }
      if (node.type === "code") {
        return `<pre><code>${node.children
          .map((child) => serializeText(child))
          .join("")}</code></pre>`;
      }
      if (node.type === "image") {
        const width = node.size?.width || "auto";
        const height = node.size?.height || "auto";
        const align = node.align || "flex-start"; // مقادیر پیش‌فرض
        // let textAlign;
        // switch (align) {
        //   case "flex-start":
        //     textAlign = "left";
        //     break;
        //   case "flex-end":
        //     textAlign = "right";
        //     break;
        //   case "center":
        //     textAlign = "center";
        //     break;
        //   default:
        //     textAlign = "left"; // مقدار پیش‌فرض
        // }
        return `<div style="display: flex; justify-content: ${align};">
                    <img src="${node.url}" alt="" style="width: ${width}px; height: ${height}px;" />
                  </div>`;
      }
      return "";
    })
    .join("");
};

export default EditorPage;
