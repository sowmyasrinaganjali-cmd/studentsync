/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ReminderBanner } from './components/Reminders/ReminderBanner';
import { ReminderDrawer } from './components/Reminders/ReminderDrawer';
import { TaskList } from './components/TaskManagement/TaskList';
import { TaskModal } from './components/TaskManagement/TaskModal';
import { ManageCoursesModal } from './components/TaskManagement/ManageCoursesModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { IcsImportModal } from './components/Calendar/IcsImportModal';
import { GroupStudyHub } from './components/GroupStudy/GroupStudyHub';
import { RemindersView } from './components/Reminders/RemindersView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {activeTab === 'tasks' && <TaskList />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'groups' && <GroupStudyHub />}
      {activeTab === 'reminders' && <RemindersView />}

      {/* Global Modals & Drawers */}
      <TaskModal />
      <ManageCoursesModal />
      <IcsImportModal />
      <ReminderDrawer />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <ReminderBanner />
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}
