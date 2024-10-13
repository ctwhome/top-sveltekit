export type Message = {
  user: string;
  answers?: {
    openai: string;
    claude: string;
    gemini: string;
  }
};

export type Chat = {
  id: string;
  user_id: string;
  title: string;
  started_at: string;
  messages: Message[];
}