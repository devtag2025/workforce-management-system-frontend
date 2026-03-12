import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const formatTime = (isoString) => {
  if (!isoString) return '—';
  return dayjs(isoString).format('h:mm A');
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return dayjs(dateString).format('MMM D');
};

export const formatFullDate = (dateString) => {
  if (!dateString) return '—';
  return dayjs(dateString).format('ddd, MMM D, YYYY');
};

export const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return dayjs(isoString).format('MMM D, YYYY · h:mm A');
};

export const formatHours = (hours) => {
  if (hours == null || isNaN(hours)) return '0h 0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const formatHoursFull = (hours) => {
  if (hours == null || isNaN(hours)) return '0H 0min';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}H ${m}min`;
};

export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '$0';
  return `$${Math.round(amount).toLocaleString()}`;
};

export const formatCurrencyFull = (amount) => {
  if (amount == null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDuration = (clockIn, clockOut) => {
  if (!clockIn || !clockOut) return '—';
  const diff = dayjs(clockOut).diff(dayjs(clockIn), 'minute');
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

export const formatElapsed = (clockInIso) => {
  if (!clockInIso) return '00:00:00';
  const now = Date.now();
  const start = new Date(clockInIso).getTime();
  const diffMs = Math.max(0, now - start);
  const totalSec = Math.floor(diffMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const getDayName = (dateStr) => {
  return dayjs(dateStr).format('ddd');
};

export const getWeekLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${dayjs(startDate).format('MMM D')} – ${dayjs(endDate).format('MMM D')}`;
};

export const getMonthName = (dateStr) => {
  return dayjs(dateStr).format('MMMM YYYY');
};

export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const toISODateString = (date) => dayjs(date).format('YYYY-MM-DD');
