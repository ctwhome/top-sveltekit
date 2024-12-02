import type Quill from 'quill';

interface SlashCommand {
  name: string;
  command: (quill: Quill) => void;
}

export const slashCommands: SlashCommand[] = [
  {
    name: 'Heading 1',
    command: (quill) => {
      const range = quill.getSelection(true);
      quill.formatLine(range.index, range.length, 'header', 1);
    }
  },
  {
    name: 'Heading 2',
    command: (quill) => {
      const range = quill.getSelection(true);
      quill.formatLine(range.index, range.length, 'header', 2);
    }
  },
  {
    name: 'Bullet List',
    command: (quill) => {
      const range = quill.getSelection(true);
      quill.formatLine(range.index, range.length, 'list', 'bullet');
    }
  },
  {
    name: 'Numbered List',
    command: (quill) => {
      const range = quill.getSelection(true);
      quill.formatLine(range.index, range.length, 'list', 'ordered');
    }
  },
  {
    name: 'Blockquote',
    command: (quill) => {
      const range = quill.getSelection(true);
      quill.formatLine(range.index, range.length, 'blockquote', true);
    }
  },
  {
    name: 'Code Block',
    command: (quill) => {
      const range = quill.getSelection(true);
      quill.formatLine(range.index, range.length, 'code-block', true);
    }
  }
];

export class SlashCommandsModule {
  private quill: Quill;
  private container: HTMLElement | null = null;
  private isOpen = false;

  constructor(quill: Quill) {
    this.quill = quill;
    this.setupContainer();
    this.attachEventListeners();
  }

  private setupContainer() {
    this.container = document.createElement('div');
    this.container.className = 'slash-commands-container hidden fixed bg-base-200 rounded-lg shadow-lg p-2 w-64 z-50';
    document.body.appendChild(this.container);
  }

  private attachEventListeners() {
    this.quill.on('text-change', (delta: any) => {
      // Only handle single character insertions
      if (delta.ops?.length !== 1 || !delta.ops[0]?.insert) {
        this.hideCommands();
        return;
      }

      // Check if we just typed a slash
      if (delta.ops[0].insert === '/') {
        const range = this.quill.getSelection();
        if (!range) return;

        // Get the previous character
        const prevChar = range.index > 0 ? this.quill.getText(range.index - 1, 1) : '\n';

        // Only show commands after space or newline
        if (prevChar === ' ' || prevChar === '\n') {
          this.showCommands();
        }
      }
    });

    // Hide commands on selection change
    this.quill.on('selection-change', (range) => {
      if (!range) {
        this.hideCommands();
      }
    });

    // Hide commands when clicking outside
    document.addEventListener('click', (e) => {
      if (this.container && !this.container.contains(e.target as Node) && !this.quill.container.contains(e.target as Node)) {
        this.hideCommands();
      }
    });
  }

  private showCommands() {
    if (!this.container || this.isOpen) return;

    const range = this.quill.getSelection();
    if (!range) return;

    const bounds = this.quill.getBounds(range.index);
    const quillContainer = this.quill.container.getBoundingClientRect();

    this.container.innerHTML = this.renderCommands();
    this.container.classList.remove('hidden');

    // Position the container below the cursor
    const top = quillContainer.top + (bounds?.top || 0) + (bounds?.height || 0) + 10;
    const left = quillContainer.left + (bounds?.left || 0);

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;

    this.isOpen = true;
    this.attachCommandListeners();
  }

  private hideCommands() {
    if (!this.container || !this.isOpen) return;
    this.container.classList.add('hidden');
    this.isOpen = false;
  }

  private renderCommands(): string {
    return `
      <div class="flex flex-col gap-2">
        ${slashCommands.map((cmd, index) => `
          <button class="slash-command-item flex items-center gap-2 p-2 hover:bg-base-300 rounded-lg w-full text-left" data-index="${index}">
            <span>${cmd.name}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  private attachCommandListeners() {
    if (!this.container) return;

    const items = this.container.querySelectorAll('.slash-command-item');
    items.forEach((item) => {
      item.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
        const command = slashCommands[index];

        // Delete the slash character
        const range = this.quill.getSelection();
        if (range) {
          this.quill.deleteText(range.index - 1, 1);
        }

        // Execute the command
        command.command(this.quill);
        this.hideCommands();
      });
    });
  }
}
