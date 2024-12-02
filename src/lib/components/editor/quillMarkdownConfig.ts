export const markdownConfig = {
  ignoreTags: ['pre', 'strikethrough'],
  tags: {
    blockquote: {
      pattern: /^(\||\>)\s/,
      filter: false
    },
    list: {
      pattern: /^(\*|\-|\+)\s/,
      filter: false
    },
    header: {
      pattern: /^(#){1,6}\s/,
      filter: false
    },
    code: {
      pattern: /^`{3}(?:\r?\n|\r)/,
      filter: false
    }
  }
};
