/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react-markdown' {
  import React from 'react';
  
  interface ReactMarkdownOptions {
    remarkPlugins?: any[];
    rehypePlugins?: any[];
    children: string;
    components?: Record<string, React.ComponentType<any>>;
    className?: string;
  }

  const ReactMarkdown: React.FC<ReactMarkdownOptions>;
  
  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: any;
  export default remarkGfm;
}

declare module 'remark-rehype' {
  const remarkRehype: any;
  export default remarkRehype;
}

declare module 'rehype-highlight' {
  const rehypeHighlight: any;
  export default rehypeHighlight;
}

declare module 'date-fns' {
  export function format(date: Date | number, formatStr: string): string;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
