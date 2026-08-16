import { storageService } from '@/services/storage';

let reminderTimer: number | undefined;
let reminderHeartbeat: number | undefined;
let notificationInFlight = false;

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function reminderDate(time: string, date = new Date()): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const target = new Date(date);
  target.setHours(Number.isFinite(hours) ? hours : 20, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return target;
}

function nextReminderAt(time: string): Date {
  const target = reminderDate(time);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  return target;
}

function isReminderDue(time: string): boolean {
  return reminderDate(time).getTime() <= Date.now();
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

export async function requestReadingReminderPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'default') return Notification.requestPermission();
  return Notification.permission;
}

export function stopReadingReminder(): void {
  if (reminderTimer !== undefined) {
    window.clearTimeout(reminderTimer);
    reminderTimer = undefined;
  }
  if (reminderHeartbeat !== undefined) {
    window.clearInterval(reminderHeartbeat);
    reminderHeartbeat = undefined;
  }
}

async function showReadingReminder(): Promise<void> {
  if (notificationInFlight) return;
  const settings = storageService.getReadingReminderSettings();
  const streak = storageService.getReadingStreak();
  const today = dayKey(new Date());
  if (!settings.enabled || settings.lastNotifiedDate === today || streak.lastReadDate === today) return;

  notificationInFlight = true;
  const body = streak.currentStreak > 0
    ? `Sua chama está em ${streak.currentStreak} dia${streak.currentStreak === 1 ? '' : 's'}. Leia algumas páginas para protegê-la.`
    : 'Abra um tomo e registre algumas páginas para acender sua primeira chama.';
  const options = {
    body,
    icon: '/vortex-icon.svg',
    badge: '/vortex-icon.svg',
    tag: 'vortex-reading-reminder',
    data: { url: '/profile' },
  };

  try {
    let delivered = false;
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration?.showNotification) {
          await registration.showNotification('Uma página espera por você', options);
          delivered = true;
        }
      } catch {
        // Tenta a API de notificação da página quando o service worker não está pronto.
      }
    }
    if (!delivered && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Uma página espera por você', options);
      delivered = true;
    }
    if (delivered) storageService.saveReadingReminderSettings({ ...settings, lastNotifiedDate: today });
  } finally {
    notificationInFlight = false;
  }
}

function checkDueReminder(): void {
  const settings = storageService.getReadingReminderSettings();
  if (!settings.enabled || getNotificationPermission() !== 'granted' || !isReminderDue(settings.time)) return;
  void showReadingReminder();
}

export function scheduleReadingReminder(): void {
  stopReadingReminder();
  const settings = storageService.getReadingReminderSettings();
  if (!settings.enabled || getNotificationPermission() !== 'granted') return;

  const target = nextReminderAt(settings.time);
  reminderTimer = window.setTimeout(() => {
    reminderTimer = undefined;
    checkDueReminder();
    scheduleReadingReminder();
  }, Math.max(1000, target.getTime() - Date.now()));

  // Recupera o lembrete quando o navegador retoma uma aba suspensa ou o relógio muda.
  reminderHeartbeat = window.setInterval(checkDueReminder, 30_000);
  checkDueReminder();
}
