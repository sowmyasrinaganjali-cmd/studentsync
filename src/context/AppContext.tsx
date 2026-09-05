import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Course, GroupChatMessage, GroupTask, Priority, StudyGroup, StudyNote, Task, TaskStatus } from '../types';
import { INITIAL_COURSES, INITIAL_STUDY_GROUPS, INITIAL_TASKS } from '../data/initialData';
import { sounds } from '../utils/audio';
import { getNotificationPermission, requestNotificationPermission, showBrowserNotification } from '../utils/notifications';
import { createCourseWithTheme } from '../utils/courseThemes';

interface AppContextType {
  courses: Course[];
  tasks: Task[];
  studyGroups: StudyGroup[];
  activeTab: 'tasks' | 'calendar' | 'groups' | 'reminders';
  setActiveTab: (tab: 'tasks' | 'calendar' | 'groups' | 'reminders') => void;
  selectedCourseFilter: string;
  setSelectedCourseFilter: (id: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  notificationPermission: NotificationPermission;
  requestDesktopNotifications: () => Promise<void>;
  
  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtaskToTask: (taskId: string, title: string) => void;
  deleteSubtaskFromTask: (taskId: string, subtaskId: string) => void;
  snoozeTaskReminder: (taskId: string, minutes: number) => void;
  importTasks: (newTasks: Partial<Task>[]) => number;

  // Study Group Actions
  activeGroup: StudyGroup | null;
  setActiveGroupId: (groupId: string | null) => void;
  createStudyGroup: (group: Omit<StudyGroup, 'id' | 'members' | 'sharedTasks' | 'notes' | 'flashcards' | 'chatMessages' | 'upcomingSessions' | 'pomodoroState'> & { initialFriendNames?: string[] }) => void;
  inviteFriendToGroup: (groupId: string, name: string, email?: string) => void;
  removeFriendFromGroup: (groupId: string, memberId: string) => void;
  joinGroupByCode: (roomCode: string) => boolean;
  inviteModalGroupId: string | null;
  setInviteModalGroupId: (id: string | null) => void;
  addGroupTask: (groupId: string, task: Omit<GroupTask, 'id'>) => void;
  toggleGroupTaskStatus: (groupId: string, taskId: string) => void;
  addGroupNote: (groupId: string, note: Omit<StudyNote, 'id' | 'updatedAt'>) => void;
  addFlashcard: (groupId: string, card: { question: string; answer: string; hint?: string }) => void;
  sendChatMessage: (groupId: string, text: string, isQuestion?: boolean) => void;
  updatePomodoro: (groupId: string, partial: Partial<StudyGroup['pomodoroState']>) => void;
  resetPomodoro: (groupId: string, mode?: 'focus' | 'break' | 'long_break') => void;

  // Course Actions
  addCourse: (course: { code: string; name: string; color?: string; instructor?: string; location?: string; id?: string } | Course) => Course;
  updateCourse: (course: Course) => void;
  deleteCourse: (courseId: string) => void;

  // UI state
  activeModal: 'create-task' | 'edit-task' | 'create-group' | 'join-group' | 'import-ics' | 'manage-courses' | 'add-course' | null;
  setActiveModal: (modal: 'create-task' | 'edit-task' | 'create-group' | 'join-group' | 'import-ics' | 'manage-courses' | 'add-course' | null) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  showReminderDrawer: boolean;
  setShowReminderDrawer: (show: boolean) => void;

  // Computed / Helpers
  upcomingRemindersCount: number;
  stats: {
    total: number;
    completed: number;
    pending: number;
    urgent: number;
    completionRate: number;
    totalEstimatedHours: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('sh_courses');
      return saved ? JSON.parse(saved) : INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('sh_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(t => ({
            ...t,
            subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
            tags: Array.isArray(t.tags) ? t.tags : [],
          }));
        }
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() => {
    try {
      const saved = localStorage.getItem('sh_groups');
      if (saved) {
        if (saved.includes('images.unsplash.com') || saved.includes('Alex Rivera') || saved.includes('Maya Chen')) {
          localStorage.setItem('sh_groups', JSON.stringify(INITIAL_STUDY_GROUPS));
          return INITIAL_STUDY_GROUPS;
        }
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(g => ({
            ...g,
            members: Array.isArray(g.members) ? g.members : [],
            sharedTasks: Array.isArray(g.sharedTasks) ? g.sharedTasks : [],
            notes: Array.isArray(g.notes) ? g.notes : [],
            flashcards: Array.isArray(g.flashcards) ? g.flashcards : [],
            chatMessages: Array.isArray(g.chatMessages) ? g.chatMessages : [],
            upcomingSessions: Array.isArray(g.upcomingSessions) ? g.upcomingSessions : [],
            pomodoroState: g.pomodoroState || {
              isRunning: false,
              mode: 'focus',
              secondsRemaining: 25 * 60,
              currentTopic: `${g.courseCode || 'Study'} Session`,
            },
          }));
        }
        return INITIAL_STUDY_GROUPS;
      }
      return INITIAL_STUDY_GROUPS;
    } catch {
      return INITIAL_STUDY_GROUPS;
    }
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'groups' | 'reminders'>('tasks');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(null);
  const [inviteModalGroupId, setInviteModalGroupId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'create-task' | 'edit-task' | 'create-group' | 'join-group' | 'import-ics' | 'manage-courses' | 'add-course' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showReminderDrawer, setShowReminderDrawer] = useState<boolean>(false);

  // Initialize notifications status
  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sh_courses', JSON.stringify(courses));
    } catch (e) {
      console.warn('LocalStorage save failed for courses', e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem('sh_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('LocalStorage save failed for tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('sh_groups', JSON.stringify(studyGroups));
    } catch (e) {
      console.warn('LocalStorage save failed for groups', e);
    }
  }, [studyGroups]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    sounds.setSoundEnabled(enabled);
  };

  const requestDesktopNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      showBrowserNotification('Reminders Enabled! 🔔', {
        body: 'You will receive timely alerts for upcoming assignments and study sessions.',
      });
    }
  };

  // Trigger reminders check every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();

      tasks.forEach(task => {
        if (task.status === 'completed' || task.reminderDismissed) return;

        const due = new Date(task.dueDate).getTime();
        const diffMinutes = Math.round((due - now) / 60000);
        const reminderThreshold = task.reminderOffsetMinutes || 60;

        // Trigger if within reminder window and not yet marked
        if (diffMinutes > 0 && diffMinutes <= reminderThreshold && !task.reminderDismissed) {
          // If due within 15 min or the exact offset
          if (diffMinutes <= 15 || diffMinutes === reminderThreshold) {
            sounds.playReminderAlert();
            showBrowserNotification(`Upcoming Due Date: ${task.title}`, {
              body: `Due in ${diffMinutes} minutes! Don't forget to submit.`,
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  // Pomodoro timer tick for active group
  useEffect(() => {
    const timer = setInterval(() => {
      setStudyGroups(prev =>
        prev.map(grp => {
          if (!grp.pomodoroState.isRunning) return grp;

          if (grp.pomodoroState.secondsRemaining <= 1) {
            // Timer expired!
            sounds.playTimerEnd();
            const nextMode = grp.pomodoroState.mode === 'focus' ? 'break' : 'focus';
            const nextDuration = nextMode === 'focus' ? 25 * 60 : 5 * 60;

            if (nextMode === 'break') {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
              });
              showBrowserNotification(`Focus Sprint Complete! 🎉`, {
                body: `Great job on "${grp.pomodoroState.currentTopic}". Time for a 5-minute breather!`,
              });
            } else {
              showBrowserNotification(`Break Finished! ⏱️`, {
                body: `Ready to jump back into "${grp.pomodoroState.currentTopic}"? Let's get focused!`,
              });
            }

            return {
              ...grp,
              pomodoroState: {
                ...grp.pomodoroState,
                isRunning: false,
                mode: nextMode,
                secondsRemaining: nextDuration,
              },
            };
          }

          return {
            ...grp,
            pomodoroState: {
              ...grp.pomodoroState,
              secondsRemaining: grp.pomodoroState.secondsRemaining - 1,
            },
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Task actions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (updated: Task) => {
    setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const willComplete = t.status !== 'completed';
        if (willComplete) {
          sounds.playTaskComplete();
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.8 },
          });
        }
        return {
          ...t,
          status: willComplete ? 'completed' : 'todo',
          completedAt: willComplete ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = t.subtasks.map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        if (allCompleted && t.status !== 'completed') {
          sounds.playTaskComplete();
        }
        return {
          ...t,
          subtasks: updatedSubtasks,
          status: allCompleted ? 'completed' : t.status,
        };
      })
    );
  };

  const setTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const willComplete = status === 'completed';
        if (willComplete && t.status !== 'completed') {
          sounds.playTaskComplete();
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.8 },
          });
        }
        return {
          ...t,
          status,
          completedAt: willComplete ? (t.completedAt || new Date().toISOString()) : undefined,
        };
      })
    );
  };

  const addSubtaskToTask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const newSubtask = {
          id: 'sub-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          title: title.trim(),
          completed: false,
        };
        return {
          ...t,
          subtasks: [...t.subtasks, newSubtask],
        };
      })
    );
  };

  const deleteSubtaskFromTask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          subtasks: t.subtasks.filter(st => st.id !== subtaskId),
        };
      })
    );
  };

  const snoozeTaskReminder = (taskId: string, minutes: number) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;
        const currentDue = new Date(t.dueDate).getTime();
        const newDue = new Date(currentDue + minutes * 60000).toISOString().slice(0, 16);
        return {
          ...t,
          dueDate: newDue,
          reminderDismissed: false,
        };
      })
    );
  };

  const importTasks = (newTasks: Partial<Task>[]): number => {
    const created: Task[] = [];
    newTasks.forEach(p => {
      if (!p.title) return;
      created.push({
        id: 'task-imp-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: p.title,
        description: p.description || '',
        courseId: p.courseId || courses[0]?.id || 'general',
        type: p.type || 'assignment',
        priority: p.priority || 'medium',
        dueDate: p.dueDate || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        estimatedMinutes: p.estimatedMinutes || 60,
        status: p.status || 'todo',
        subtasks: p.subtasks || [],
        reminderOffsetMinutes: p.reminderOffsetMinutes || 60,
        tags: p.tags || ['imported'],
        createdAt: new Date().toISOString(),
      });
    });

    if (created.length > 0) {
      setTasks(prev => [...created, ...prev]);
    }
    return created.length;
  };

  // Group actions
  const activeGroup = useMemo(() => {
    if (!activeGroupId) return null;
    return studyGroups.find(g => g.id === activeGroupId) || null;
  }, [studyGroups, activeGroupId]);

  const setActiveGroupId = (id: string | null) => {
    setActiveGroupIdState(id);
  };

  const createStudyGroup = (groupData: Omit<StudyGroup, 'id' | 'members' | 'sharedTasks' | 'notes' | 'flashcards' | 'chatMessages' | 'upcomingSessions' | 'pomodoroState'> & { initialFriendNames?: string[] }) => {
    const code = groupData.roomCode || `${groupData.courseCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const friendMembers = (groupData.initialFriendNames || []).map((friendName, idx) => ({
      id: 'mem-friend-' + Date.now().toString(36) + idx,
      name: friendName,
      role: 'member' as const,
      status: 'online' as const,
      currentFocus: 'Joined room',
      color: ['violet', 'emerald', 'amber', 'rose', 'cyan'][idx % 5],
      invitedAt: new Date().toISOString(),
    }));

    const newGroup: StudyGroup = {
      ...groupData,
      id: 'grp-' + Date.now().toString(36),
      roomCode: code,
      members: [
        {
          id: 'mem-user',
          name: 'You (Host)',
          role: 'lead',
          status: 'online',
          currentFocus: 'Studying in room',
          color: groupData.color || 'indigo',
          isCurrentUser: true,
        },
        ...friendMembers,
      ],
      sharedTasks: [],
      notes: [],
      flashcards: [],
      chatMessages: [
        {
          id: 'msg-welcome',
          senderId: 'mem-user',
          senderName: 'You (Host)',
          text: `Welcome to ${groupData.name}! Share room code ${code} to invite your friends and classmates to study together.`,
          timestamp: 'Just now',
        },
      ],
      upcomingSessions: [],
      pomodoroState: {
        isRunning: false,
        mode: 'focus',
        secondsRemaining: 25 * 60,
        currentTopic: `${groupData.courseCode} Study Session`,
      },
    };
    setStudyGroups(prev => [newGroup, ...prev]);
    setActiveGroupIdState(newGroup.id);
  };

  const inviteFriendToGroup = (groupId: string, name: string, email?: string) => {
    const friendMember = {
      id: 'mem-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      email,
      role: 'member' as const,
      status: 'online' as const,
      currentFocus: 'Invited to study room',
      color: 'emerald',
      invitedAt: new Date().toISOString(),
    };

    const noticeMessage: GroupChatMessage = {
      id: 'msg-' + Date.now().toString(36),
      senderId: 'system',
      senderName: 'Room Notice',
      text: `👋 ${name} was invited to the study room!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, members: [...g.members, friendMember], chatMessages: [...g.chatMessages, noticeMessage] } : g))
    );
    sounds.playTaskComplete();
  };

  const removeFriendFromGroup = (groupId: string, memberId: string) => {
    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, members: g.members.filter(m => m.id !== memberId) } : g))
    );
  };

  const joinGroupByCode = (roomCode: string): boolean => {
    const clean = roomCode.trim().toUpperCase();
    const match = studyGroups.find(
      g => g.roomCode?.toUpperCase() === clean || g.id.toUpperCase() === clean
    );
    if (match) {
      setActiveGroupIdState(match.id);
      setActiveTab('groups');
      sounds.playTaskComplete();
      return true;
    }
    return false;
  };

  const addGroupTask = (groupId: string, taskData: Omit<GroupTask, 'id'>) => {
    const newTask: GroupTask = {
      ...taskData,
      id: 'gt-' + Date.now().toString(36),
    };
    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, sharedTasks: [newTask, ...g.sharedTasks] } : g))
    );
  };

  const toggleGroupTaskStatus = (groupId: string, taskId: string) => {
    setStudyGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          sharedTasks: g.sharedTasks.map(t => {
            if (t.id !== taskId) return t;
            const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
            if (nextStatus === 'completed') {
              sounds.playTaskComplete();
            }
            return { ...t, status: nextStatus };
          }),
        };
      })
    );
  };

  const addGroupNote = (groupId: string, noteData: Omit<StudyNote, 'id' | 'updatedAt'>) => {
    const newNote: StudyNote = {
      ...noteData,
      id: 'note-' + Date.now().toString(36),
      updatedAt: new Date().toISOString(),
    };
    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, notes: [newNote, ...g.notes] } : g))
    );
  };

  const addFlashcard = (groupId: string, card: { question: string; answer: string; hint?: string }) => {
    const newCard = {
      ...card,
      id: 'fc-' + Date.now().toString(36),
    };
    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, flashcards: [...g.flashcards, newCard] } : g))
    );
  };

  const sendChatMessage = (groupId: string, text: string, isQuestion?: boolean) => {
    if (!text.trim()) return;
    const newMsg: GroupChatMessage = {
      id: 'msg-' + Date.now().toString(36),
      senderId: 'mem-user',
      senderName: 'You (Host)',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuestion,
    };
    setStudyGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, chatMessages: [...g.chatMessages, newMsg] } : g))
    );
  };

  const updatePomodoro = (groupId: string, partial: Partial<StudyGroup['pomodoroState']>) => {
    setStudyGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? {
              ...g,
              pomodoroState: {
                ...g.pomodoroState,
                ...partial,
              },
            }
          : g
      )
    );
  };

  const resetPomodoro = (groupId: string, mode: 'focus' | 'break' | 'long_break' = 'focus') => {
    let seconds = 25 * 60;
    if (mode === 'break') seconds = 5 * 60;
    if (mode === 'long_break') seconds = 15 * 60;

    updatePomodoro(groupId, {
      isRunning: false,
      mode,
      secondsRemaining: seconds,
    });
  };

  const addCourse = (courseInput: { code: string; name: string; color?: string; instructor?: string; location?: string; id?: string } | Course): Course => {
    let newCourse: Course;
    if ('accentBg' in courseInput && 'textColor' in courseInput) {
      newCourse = courseInput as Course;
    } else {
      newCourse = createCourseWithTheme(courseInput);
    }
    setCourses(prev => {
      // Avoid duplicate by ID
      const exists = prev.some(c => c.id === newCourse.id);
      if (exists) {
        return prev.map(c => (c.id === newCourse.id ? newCourse : c));
      }
      return [...prev, newCourse];
    });
    return newCourse;
  };

  const updateCourse = (updatedCourse: Course) => {
    const themed = createCourseWithTheme({
      id: updatedCourse.id,
      code: updatedCourse.code,
      name: updatedCourse.name,
      color: updatedCourse.color,
      instructor: updatedCourse.instructor,
      location: updatedCourse.location,
    });
    setCourses(prev => prev.map(c => (c.id === updatedCourse.id ? themed : c)));
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    // If selected course filter was this course, reset to all
    if (selectedCourseFilter === courseId) {
      setSelectedCourseFilter('all');
    }
  };

  // Compute active reminders (due within 24 hours or overdue)
  const upcomingRemindersCount = useMemo(() => {
    const now = new Date().getTime();
    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      const due = new Date(t.dueDate).getTime();
      const diffHours = (due - now) / (1000 * 60 * 60);
      return diffHours <= 48; // within 48h or overdue
    }).length;
  }, [tasks]);

  // General statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = total - completed;
    const urgent = tasks.filter(t => t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalEstimatedMinutes = tasks
      .filter(t => t.status !== 'completed')
      .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const totalEstimatedHours = Math.round((totalEstimatedMinutes / 60) * 10) / 10;

    return {
      total,
      completed,
      pending,
      urgent,
      completionRate,
      totalEstimatedHours,
    };
  }, [tasks]);

  return (
    <AppContext.Provider
      value={{
        courses,
        tasks,
        studyGroups,
        activeTab,
        setActiveTab,
        selectedCourseFilter,
        setSelectedCourseFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        searchQuery,
        setSearchQuery,
        soundEnabled,
        setSoundEnabled,
        notificationPermission,
        requestDesktopNotifications,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        setTaskStatus,
        toggleSubtask,
        addSubtaskToTask,
        deleteSubtaskFromTask,
        snoozeTaskReminder,
        importTasks,
        activeGroup,
        setActiveGroupId,
        createStudyGroup,
        inviteFriendToGroup,
        removeFriendFromGroup,
        joinGroupByCode,
        inviteModalGroupId,
        setInviteModalGroupId,
        addGroupTask,
        toggleGroupTaskStatus,
        addGroupNote,
        addFlashcard,
        sendChatMessage,
        updatePomodoro,
        resetPomodoro,
        addCourse,
        updateCourse,
        deleteCourse,
        activeModal,
        setActiveModal,
        editingTask,
        setEditingTask,
        showReminderDrawer,
        setShowReminderDrawer,
        upcomingRemindersCount,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
