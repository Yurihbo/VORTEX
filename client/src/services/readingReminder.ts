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

function sortedTimes(times: string[]): string[] {
  return Array.from(new Set(times)).sort();
}

function nextReminderAt(times: string[]): Date {
  const now = Date.now();
  const nextToday = sortedTimes(times).map(time => reminderDate(time)).find(target => target.getTime() > now);
  if (nextToday) return nextToday;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return reminderDate(sortedTimes(times)[0] || '20:00', tomorrow);
}

function dueReminderSlot(times: string[], settings: { lastNotifiedDate?: string; lastNotifiedSlot?: string; lastNotifiedSlots?: string[] }): string | undefined {
  const today = dayKey(new Date());
  const due = sortedTimes(times).filter(time => reminderDate(time).getTime() <= Date.now());
  if (!due.length) return undefined;
  if (settings.lastNotifiedDate !== today) return due[due.length - 1];
  const notifiedSlots = new Set(settings.lastNotifiedSlots || (settings.lastNotifiedSlot ? [settings.lastNotifiedSlot] : []));
  return due.filter(time => !notifiedSlots.has(time)).at(-1);
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

async function showReadingReminder(slot: string): Promise<void> {
  if (notificationInFlight) return;
  const settings = storageService.getReadingReminderSettings();
  const streak = storageService.getReadingStreak();
  const today = dayKey(new Date());
  if (!settings.enabled || settings.lastNotifiedDate === today && settings.lastNotifiedSlot === slot) return;

  notificationInFlight = true;
  const body = streak.currentStreak > 0
    ? `Sua chama está em ${streak.currentStreak} dia${streak.currentStreak === 1 ? '' : 's'}. Leia algumas páginas para protegê-la.`
    : 'Abra um tomo e registre algumas páginas para acender sua primeira chama.';
  const options = {
    body: `${body} Lembrete das ${slot}.`,
    icon: '/vortex-icon.svg',
    badge: '/vortex-icon.svg',
    tag: `vortex-reading-reminder-${slot.replace(':', '-')}`,
    data: { url: '/profile', reminderSlot: slot },
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
    if (delivered) {
      const notifiedSlots = settings.lastNotifiedDate === today ? [...(settings.lastNotifiedSlots || (settings.lastNotifiedSlot ? [settings.lastNotifiedSlot] : [])), slot] : [slot];
      storageService.saveReadingReminderSettings({ ...settings, lastNotifiedDate: today, lastNotifiedSlot: slot, lastNotifiedSlots: Array.from(new Set(notifiedSlots)) });
    }
  } finally {
    notificationInFlight = false;
  }
}

function checkDueReminder(): void {
  const settings = storageService.getReadingReminderSettings();
  if (!settings.enabled || getNotificationPermission() !== 'granted') return;
  const slot = dueReminderSlot(settings.times, settings);
  if (slot) void showReadingReminder(slot);
}

export function scheduleReadingReminder(): void {
  stopReadingReminder();
  const settings = storageService.getReadingReminderSettings();
  if (!settings.enabled || getNotificationPermission() !== 'granted' || !settings.times.length) return;

  const target = nextReminderAt(settings.times);
  reminderTimer = window.setTimeout(() => {
    reminderTimer = undefined;
    checkDueReminder();
    scheduleReadingReminder();
  }, Math.max(1000, target.getTime() - Date.now()));

  // Recupera o lembrete quando o navegador retoma uma aba suspensa ou o relógio muda.
  reminderHeartbeat = window.setInterval(checkDueReminder, 30_000);
  checkDueReminder();
}
