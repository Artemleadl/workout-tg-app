declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

interface TelegramWebApp {
  ready(): void
  expand(): void
  close(): void
  initDataUnsafe: {
    user?: {
      id: number
      first_name: string
      username?: string
    }
  }
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  MainButton: {
    text: string
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    onClick(fn: () => void): void
    offClick(fn: () => void): void
  }
  BackButton: {
    show(): void
    hide(): void
    onClick(fn: () => void): void
    offClick(fn: () => void): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
  }
}

export const tg = window.Telegram?.WebApp

export function getTelegramUserId(): number {
  return tg?.initDataUnsafe?.user?.id ?? 0
}

export function getTelegramUserName(): string {
  return tg?.initDataUnsafe?.user?.first_name ?? 'Атлет'
}
