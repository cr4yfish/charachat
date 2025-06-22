// components/CodeBlock.tsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// Choose a style. Import from 'dist/cjs' for better Next.js compatibility (especially SSR).
// For a dark theme:
import { nord } from 'react-syntax-highlighter/dist/cjs/styles/prism';
// For a light theme example:
// import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

// OPTIONAL: For a "light" build of SyntaxHighlighter to reduce bundle size.
// Only uncomment and use this if you want to manually register languages.
// If you use 'Prism' directly, all common languages are included by default.
// import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// import js from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
// import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
// import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
// SyntaxHighlighter.registerLanguage('javascript', js);
// SyntaxHighlighter.registerLanguage('python', python);
// SyntaxHighlighter.registerLanguage('css', css);
// // ... register other languages you expect


interface CodeBlockProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node?: any; // react-markdown passes a 'node' prop, often not directly used for simple code blocks
  inline?: boolean; // True if it's an inline <code> tag, false if it's a block <pre><code>
  className?: string; // Contains "language-xyz" for block code
  children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children }) => {
  // react-markdown passes the code content as a single string in children
  const codeContent = String(children).replace(/\n$/, ''); // Remove trailing newline

  // Extract the language from the className
  const match = /language-(\w+)/.exec(className || '');

  // If it's a block code and we successfully extracted a language
  if (!inline && match) {
    const language = match[1]; // e.g., "javascript", "python"

    return (
      <SyntaxHighlighter
        // Apply your chosen theme here
        style={nord} // Or oneLight, nord, etc.
        language={language}
        showLineNumbers={false} // Set to true if you want line numbers
        wrapLines={true} // Wraps long lines
        PreTag="div" // IMPORTANT: Use a div to prevent conflicts with prose <pre> styling
        // You can add more custom styles directly here if needed,
        // or pass className to the CodeTagProps for the inner <code>
        codeTagProps={{
          // Tailwind prose styles might override these. 
          // You can apply additional Tailwind classes here if needed.
          // For example, if you want a specific font or text size for the code itself
          // className: 'text-sm font-mono' 
        }}
      >
        {codeContent}
      </SyntaxHighlighter>
    );
  } else {
    // This handles inline code (`inline`) or code blocks where no language was specified
    // (e.g., just ```` instead of ````javascript`).
    // The `prose` class will handle basic styling for these `<code>` tags.
    return (
      <code className={className}>
        {codeContent}
      </code>
    );
  }
};

export default CodeBlock;