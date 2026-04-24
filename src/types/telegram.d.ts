export {};

declare global {
  interface TelegramWebAppThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  }

  interface TelegramWebApp {
    initData: string;
    initDataUnsafe: Record<string, unknown>;
    colorScheme: "light" | "dark";
    themeParams: TelegramWebAppThemeParams;
    ready: () => void;
    expand: () => void;
    close: () => void;
    HapticFeedback?: {
      impactOccurred: (s: "light" | "medium" | "heavy") => void;
      notificationOccurred: (s: "error" | "success" | "warning") => void;
    };
  }

  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}
