type Range = {
  index: number;
  length: number;
};

type QuillInstance = {
  formatLine: (index: number, length: number, format: string, value: any) => void;
};

export const createKeyboardBindings = (quill: QuillInstance) => ({
  'header-one': {
    key: '1',
    shortKey: true,
    handler: (range: Range) => {
      quill.formatLine(range.index, range.length, 'header', 1);
    }
  },
  'header-two': {
    key: '2',
    shortKey: true,
    handler: (range: Range) => {
      quill.formatLine(range.index, range.length, 'header', 2);
    }
  },
  'bullet-list': {
    key: '8',
    shortKey: true,
    handler: (range: Range) => {
      quill.formatLine(range.index, range.length, 'list', 'bullet');
    }
  },
  'ordered-list': {
    key: '7',
    shortKey: true,
    handler: (range: Range) => {
      quill.formatLine(range.index, range.length, 'list', 'ordered');
    }
  }
});
