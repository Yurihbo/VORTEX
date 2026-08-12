import { storageService } from '@/services/storage';

let reminderTimer: number | undefined;

function dayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextReminderAt(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const target = new Date();
  target.setHours(Number.isFinite(hours) ? hours : 20, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  return target;
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
}

async function showReadingReminder(): Promise<void> {
  const settings = storageService.getReadingReminderSettings();
  const streak = storageService.getReadingStreak();
  const today = dayKey(new Date());
  if (!settings.enabled || settings.lastNotifiedDate === today || streak.lastReadDate === today) return;
  const body = streak.currentStreak > 0
    ? `Sua chama está em ${streak.currentStreak} dia${streak.currentStreak === 1 ? '' : 's'}. Leia algumas páginas para protegê-la.`
    : 'Abra um tomo e registre algumas páginas para acender sua primeira chama.';

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration?.showNotification) {
      await registration.showNotification('Uma página espera por você', {
        body,
        icon: '/vortex-icon.svg',
        badge: '/vortex-icon.svg',
        tag: 'vortex-reading-reminder',
        data: { url: '/profile' },
      });
    } else if (typeof Notification !== 'undefined') {
      new Notification('Uma página espera por você', { body, icon: '/vortex-icon.svg', tag: 'vortex-reading-reminder' });
    }
    storageService.saveReadingReminderSettings({ ...settings, lastNotifiedDate: today });
  } catch {
    // The browser may deny notification delivery even after permission is granted.
  }
}

export function scheduleReadingReminder(): void {
  stopReadingReminder();
  const settings = storageService.getReadingReminderSettings();
  if (!settings.enabled || getNotificationPermission() !== 'granted') return;
  const target = nextReminderAt(settings.time);
  reminderTimer = window.setTimeout(() => {
    void showReadingReminder().finally(scheduleReadingReminder);
  }, Math.max(1000, target.getTime() - Date.now()));
}
