import { Course, Task } from '../types';

/**
 * Generates an external Google Calendar "Add Event" URL
 */
export function generateGoogleCalendarUrl(task: Task, course?: Course): string {
  const title = encodeURIComponent(`[${course?.code || 'Task'}] ${task.title}`);
  
  let description = `${task.description || 'Student Task'}\nCourse: ${course ? `${course.code} - ${course.name}` : 'General'}\nPriority: ${task.priority.toUpperCase()}\nEstimated Study Time: ${task.estimatedMinutes} mins`;
  
  if (task.subtasks && task.subtasks.length > 0) {
    description += `\n\nChecklist:\n` + task.subtasks.map(s => `- [${s.completed ? 'x' : ' '}] ${s.title}`).join('\n');
  }

  const details = encodeURIComponent(description);
  const location = encodeURIComponent(course?.location || 'Campus / Study Desk');

  // Compute start and end dates
  const dueDate = new Date(task.dueDate);
  // Default duration is estimatedMinutes or 60 min
  const durationMs = (task.estimatedMinutes || 60) * 60 * 1000;
  const startDate = new Date(dueDate.getTime() - durationMs);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const datesParam = `${formatGCalDate(startDate)}/${formatGCalDate(dueDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Formats a Date object into iCalendar UTC format (e.g. 20260905T120000Z)
 */
function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Exports multiple tasks to a downloadable standard .ics iCalendar file
 */
export function exportTasksToIcs(tasks: Task[], courses: Course[], filename: string = 'student-study-schedule.ics') {
  const courseMap = new Map<string, Course>();
  courses.forEach(c => courseMap.set(c.id, c));

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Student Study Hub//Academic Planner v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Student Study Hub Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  tasks.forEach(task => {
    const course = courseMap.get(task.courseId);
    const dueDate = new Date(task.dueDate);
    const durationMs = (task.estimatedMinutes || 60) * 60 * 1000;
    const startDate = new Date(dueDate.getTime() - durationMs);
    const now = new Date();

    const uid = `${task.id}-${task.dueDate.replace(/\D/g, '')}@studenthub.app`;
    const summary = `[${course?.code || 'Task'}] ${task.title.replace(/[,\\]/g, ' ')}`;
    const description = `${task.description || ''}\\nPriority: ${task.priority}\\nStatus: ${task.status}`.replace(/\r?\n/g, '\\n');

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(dueDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${(course?.location || 'Classroom / Study Desk').replace(/[,\\]/g, ' ')}`,
      `STATUS:${task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT60M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: ${summary}`,
      'END:VALARM',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports a single task to an .ics file
 */
export function exportSingleTaskIcs(task: Task, course?: Course) {
  exportTasksToIcs([task], course ? [course] : [], `${task.title.replace(/\s+/g, '_').toLowerCase()}.ics`);
}

/**
 * Parses an imported .ics calendar file into Task candidates
 */
export function parseIcsContent(icsText: string, defaultCourseId: string): Partial<Task>[] {
  const tasks: Partial<Task>[] = [];
  const lines = icsText.split(/\r\n|\n|\r/);
  
  let inEvent = false;
  let currentEvent: {
    summary?: string;
    description?: string;
    dtstart?: string;
    dtend?: string;
    uid?: string;
  } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent.summary) {
        // Parse date
        let dueDate = new Date().toISOString().slice(0, 16);
        if (currentEvent.dtend || currentEvent.dtstart) {
          const rawDate = currentEvent.dtend || currentEvent.dtstart;
          try {
            // Check YYYYMMDDTHHMMSS or YYYYMMDD
            const cleaned = rawDate?.replace(/^.*:/, '').replace('Z', '') || '';
            if (cleaned.length >= 8) {
              const year = cleaned.substring(0, 4);
              const month = cleaned.substring(4, 6);
              const day = cleaned.substring(6, 8);
              let hour = '12';
              let minute = '00';
              if (cleaned.length >= 13) {
                hour = cleaned.substring(9, 11);
                minute = cleaned.substring(11, 13);
              }
              dueDate = `${year}-${month}-${day}T${hour}:${minute}`;
            }
          } catch {
            // Keep default
          }
        }

        tasks.push({
          id: 'imported-' + Math.random().toString(36).substring(2, 9),
          title: currentEvent.summary.replace(/\\,/g, ',').replace(/\\;/g, ';'),
          description: (currentEvent.description || '').replace(/\\n/g, '\n').replace(/\\,/g, ','),
          courseId: defaultCourseId,
          type: 'assignment',
          priority: 'medium',
          dueDate,
          estimatedMinutes: 60,
          status: 'todo',
          subtasks: [],
          reminderOffsetMinutes: 60,
          tags: ['imported'],
          createdAt: new Date().toISOString(),
        });
      }
      inEvent = false;
    } else if (inEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith('DTEND') || line.startsWith('DTEND;')) {
        currentEvent.dtend = line;
      } else if (line.startsWith('DTSTART') || line.startsWith('DTSTART;')) {
        currentEvent.dtstart = line;
      }
    }
  }

  return tasks;
}
