import axios from "axios";
import { env } from "../config/env";
type SendTelegramMessageInput = {
  message: string;
  isHTML?: boolean;
};

export class TelegramService {
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly baseUrl: string;

  constructor() {
    this.botToken = env.TELEGRAM_BOT_TOKEN|| "";
    this.chatId = env.TELEGRAM_CHAT_ID || "";
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken) {
      console.error("TELEGRAM_BOT_TOKEN is missing");
    }

    if (!this.chatId) {
      console.error("TELEGRAM_CHAT_ID is missing");
    }
  }

  async sendMessage({ message, isHTML = false }: SendTelegramMessageInput): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: this.chatId,
        text: message,
        parse_mode: isHTML ? "HTML" : undefined,
        disable_web_page_preview: true,
      });

      return response.data?.ok === true;
    } catch (error: any) {
      const errMessage =
        error?.response?.data?.description || error?.message || "Telegram send failed";
      console.error("Telegram error:", errMessage);
      return false;
    }
  }

  async testConnection(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/getMe`);
    return response.data;
  }
}