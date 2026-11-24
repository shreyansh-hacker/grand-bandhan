export function generateIcsCalendar(
  title: string,
  description: string,
  location: string,
  startDateIso?: string
): void {
  let start = new Date(startDateIso || '');
  if (isNaN(start.getTime())) {
    start = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000); // 4 hour duration

  const formatIcsDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grand Bandhan//Invite Studio//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(
  title: string,
  description: string,
  location: string,
  startDateIso?: string
): string {
  let start = new Date(startDateIso || '');
  if (isNaN(start.getTime())) {
    start = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location: location,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
