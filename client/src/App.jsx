import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { UserLayout } from './layouts/UserLayout';
import { CounselorLayout } from './layouts/CounselorLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public & Auth Pages
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { UserLogin } from './pages/auth/UserLogin';
import { UserRegister } from './pages/auth/UserRegister';
import { CounselorLogin } from './pages/auth/CounselorLogin';
import { AdminLogin } from './pages/auth/AdminLogin';

// User Pages
import { UserDashboard } from './pages/user/UserDashboard';
import { FamilyList } from './pages/user/FamilyList';
import { FamilyBuilder } from './pages/user/FamilyBuilder';
import { PedigreeView } from './pages/user/PedigreeView';
import { AssessmentView } from './pages/user/AssessmentView';
import { AssessmentHistory } from './pages/user/AssessmentHistory';
import { UserProfile } from './pages/user/UserProfile';

// Counselor Pages
import { CounselorDashboard } from './pages/counselor/CounselorDashboard';
import { AssignedCases } from './pages/counselor/AssignedCases';
import { CaseReview } from './pages/counselor/CaseReview';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { CounselorManagement } from './pages/admin/CounselorManagement';
import { ConditionCatalog } from './pages/admin/ConditionCatalog';
import { RuleManagement } from './pages/admin/RuleManagement';
import { CaseAssignments } from './pages/admin/CaseAssignments';
import { AuditLogViewer } from './pages/admin/AuditLogViewer';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* Public Layout Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/counselor/login" element={<CounselorLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
              </Route>

              {/* Patient / User Routes (Protected: USER, COUNSELOR, ADMIN) */}
              <Route
                path="/user"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'COUNSELOR', 'ADMIN']}>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/user/dashboard" replace />} />
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="families" element={<FamilyList />} />
                <Route path="families/new" element={<FamilyList />} />
                <Route path="families/:id/builder" element={<FamilyBuilder />} />
                <Route path="families/:id/pedigree" element={<PedigreeView />} />
                <Route path="assessments/:id" element={<AssessmentView />} />
                <Route path="history" element={<AssessmentHistory />} />
                <Route path="profile" element={<UserProfile />} />
              </Route>

              {/* Genetic Counselor Routes (Protected: COUNSELOR, ADMIN) */}
              <Route
                path="/counselor"
                element={
                  <ProtectedRoute allowedRoles={['COUNSELOR', 'ADMIN']}>
                    <CounselorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/counselor/dashboard" replace />} />
                <Route path="dashboard" element={<CounselorDashboard />} />
                <Route path="cases" element={<AssignedCases />} />
                <Route path="cases/:familyId" element={<CaseReview />} />
              </Route>

              {/* Administrator Routes (Protected: ADMIN) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="counselors" element={<CounselorManagement />} />
                <Route path="conditions" element={<ConditionCatalog />} />
                <Route path="rules" element={<RuleManagement />} />
                <Route path="assignments" element={<CaseAssignments />} />
                <Route path="audit-logs" element={<AuditLogViewer />} />
              </Route>

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
