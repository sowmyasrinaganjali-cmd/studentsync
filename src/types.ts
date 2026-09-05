export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskType = 
  | 'assignment' 
  | 'project' 
  | 'todo' 
  | 'homework' 
  | 'exam' 
  | 'reading' 
  | 'lab' 
  | 'quiz' 
  | 'presentation' 
  | 'study';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Course {
  id: string;
  code: string; // e.g. "CS 101"
  name: string; // e.g. "Intro to Computer Science"
  color: string; // Tailwind color token or hex
  accentBg: string;
  textColor: string;
  borderColor: string;
  instructor?: string;
  location?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  courseId: string;
  type: TaskType;
  priority: Priority;
  dueDate: string; // ISO string format: YYYY-MM-DDTHH:mm
  estimatedMinutes: number;
  status: TaskStatus;
  subtasks: Subtask[];
  reminderOffsetMinutes: number; // e.g. 15, 60, 1440 (1 day), 2880 (2 days)
  reminderDismissed?: boolean;
  groupStudyId?: string;
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface StudyMember {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
  email?: string;
  role: 'lead' | 'member';
  status: 'online' | 'studying' | 'away' | 'offline';
  currentFocus?: string;
  isCurrentUser?: boolean;
  invitedAt?: string;
}

export interface GroupTask {
  id: string;
  title: string;
  description?: string;
  assignedToMemberId?: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  authorName: string;
  updatedAt: string;
  tags: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
}

export interface GroupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isQuestion?: boolean;
}

export interface StudySession {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  topic: string;
  location: string;
  attendeeIds: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  courseCode: string;
  courseId: string;
  description: string;
  color: string;
  roomCode: string; // e.g. "ALGO-301", "STUDY-482"
  members: StudyMember[];
  sharedTasks: GroupTask[];
  notes: StudyNote[];
  flashcards: Flashcard[];
  chatMessages: GroupChatMessage[];
  upcomingSessions: StudySession[];
  pomodoroState: {
    isRunning: boolean;
    mode: 'focus' | 'break' | 'long_break';
    secondsRemaining: number;
    currentTopic: string;
  };
}

export interface ActiveReminder {
  id: string;
  taskId: string;
  taskTitle: string;
  courseCode: string;
  courseColor: string;
  dueDate: string;
  minutesRemaining: number;
  isOverdue: boolean;
  priority: Priority;
}
