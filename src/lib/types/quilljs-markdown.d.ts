declare module 'quilljs-markdown' {
  interface QuillMarkdownOptions {
    ignoreTags?: string[];
    tags?: {
      blockquote?: {
        pattern: RegExp;
        filter: boolean;
      };
      list?: {
        pattern: RegExp;
        filter: boolean;
      };
      header?: {
        pattern: RegExp;
        filter: boolean;
      };
      code?: {
        pattern: RegExp;
        filter: boolean;
      };
    };
  }

  export default class QuillMarkdown {
    constructor(quill: any, options?: QuillMarkdownOptions);
  }
}
