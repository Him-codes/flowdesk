import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout'
import { NotificationsProvider } from './context/NotificationsContext'
import { PreferencesProvider } from './context/PreferencesContext'
import { TasksProvider } from './context/TasksContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import AnalyticsPage from './pages/AnalyticsPage'
import CustomersPage from './pages/CustomersPage'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import TasksPage from './pages/TasksPage'
import TransactionsPage from './pages/TransactionsPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <PreferencesProvider>
          <TasksProvider>
            <NotificationsProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="customers" element={<CustomersPage />} />
                    <Route path="transactions" element={<TransactionsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationsProvider>
          </TasksProvider>
        </PreferencesProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
