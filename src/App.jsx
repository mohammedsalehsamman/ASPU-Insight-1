import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import ResearchReview from './pages/ResearchReview';
import PaperDetail from './pages/PaperDetail';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Auth from './pages/Auth/Auth';
import VerifyEmailPage from './pages/Auth/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/Auth/ResetPasswordPage';
import Submit from './pages/Submit';
import EditorAssistant from './pages/A-editor/EditorAssistant';
import Editor from './pages/Editor/Editor';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPapers from './pages/admin/Papers';
import AdminReviews from './pages/admin/Reviews';
import AdminSettings from './pages/admin/Settings';
import EditPaper from './pages/EditPaper';
import AllNotifications from "./pages/AllNotifications";
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <ToastProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/research_review" element={<ResearchReview />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route
              path="/papers/:id/edit"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <EditPaper />
                </ProtectedRoute>
              }
            />

            <Route
              path="/Profile"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EditorAssistant"
              element={
                <ProtectedRoute redirectTo="/auth" requiredRole="assistant_editor">
                  <EditorAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Editor"
              element={
                <ProtectedRoute redirectTo="/auth" requiredRole="editor">
                  <Editor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/submit"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <Submit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/papers"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPapers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReviews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<AllNotifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
      </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;