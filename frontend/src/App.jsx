import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetails from './pages/CourseDetails';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import CourseBuilder from './pages/CourseBuilder';
import CourseLearning from './pages/CourseLearning';
import CreateQuiz from './pages/CreateQuiz';
import QuizBuilder from './pages/QuizBuilder';
import QuizPage from './pages/QuizPage';
import QuizResult from './pages/QuizResult';
import PerformanceDashboard from './pages/PerformanceDashboard';
import Recommendations from './pages/Recommendations';
import './App.css';
import './Performance.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/:courseId" 
            element={
              <ProtectedRoute>
                <CourseLearning />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quizzes/:id" 
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quizzes/result/:attemptId" 
            element={
              <ProtectedRoute>
                <QuizResult />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/performance" 
            element={
              <ProtectedRoute>
                <PerformanceDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses" 
            element={
              <ProtectedRoute>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses/new" 
            element={
              <ProtectedRoute>
                <CreateCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses/:id/edit" 
            element={
              <ProtectedRoute>
                <EditCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses/:id/build" 
            element={
              <ProtectedRoute>
                <CourseBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/quizzes/new" 
            element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/quizzes/:id/build" 
            element={
              <ProtectedRoute>
                <QuizBuilder />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
