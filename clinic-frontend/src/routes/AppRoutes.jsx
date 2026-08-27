import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import { ROLES } from '../constants/roles';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BookAppointment from '../pages/BookAppointment';
import AiConsultation from '../pages/patient/AiConsultation';

import PatientDashboard from '../pages/PatientDashboard';
import DoctorDashboard from '../pages/DoctorDashboard';
import ExaminationPage from '../pages/doctor/ExaminationPage';
import ReceptionistDashboard from '../pages/ReceptionistDashboard';
import AdminDashboard from '../pages/AdminDashboard';

import Unauthorized from '../pages/errors/Unauthorized';
import NotFound from '../pages/errors/NotFound';

export const AppRoutes = ({ onOpenAiModal }) => {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home onOpenAiModal={onOpenAiModal} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book" element={<BookAppointment />} />
      <Route path="/403" element={<Unauthorized />} />

      {/* PATIENT ROUTES */}
      <Route
        path="/patient/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/patient"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/ai-consultation"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <AiConsultation />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/book"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <BookAppointment />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/medical-records"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/prescriptions"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/invoices"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/patient/payments"
        element={
          <RoleRoute allowedRoles={[ROLES.PATIENT, ROLES.ADMIN]}>
            <PatientDashboard />
          </RoleRoute>
        }
      />

      {/* DOCTOR ROUTES */}
      <Route
        path="/doctor/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}>
            <DoctorDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <RoleRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}>
            <DoctorDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/doctor/examination/:appointmentId"
        element={
          <RoleRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}>
            <ExaminationPage />
          </RoleRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <RoleRoute allowedRoles={[ROLES.DOCTOR, ROLES.ADMIN]}>
            <DoctorDashboard />
          </RoleRoute>
        }
      />

      {/* RECEPTIONIST ROUTES */}
      <Route
        path="/receptionist/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
            <ReceptionistDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/receptionist"
        element={
          <RoleRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.ADMIN]}>
            <ReceptionistDashboard />
          </RoleRoute>
        }
      />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/admin/doctors"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/specialties"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/medicines"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </RoleRoute>
        }
      />
      {/* 404 NOT FOUND */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
