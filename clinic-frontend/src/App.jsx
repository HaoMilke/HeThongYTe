import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiSymptomModal from './components/AiSymptomModal';
import AppRoutes from './routes/AppRoutes';

export function AppContent() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* STICKY HEADER */}
      <Navbar onOpenAiModal={() => setAiModalOpen(true)} />
      
      {/* CENTER MAIN BODY */}
      <main className="flex-grow w-full">
        <AppRoutes onOpenAiModal={() => setAiModalOpen(true)} />
      </main>

      {/* FOOTER */}
      <Footer onOpenAiModal={() => setAiModalOpen(true)} />

      {/* GLOBAL AI MODAL */}
      <AiSymptomModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
