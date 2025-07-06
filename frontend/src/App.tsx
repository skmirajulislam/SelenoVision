import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { MessageCircle } from "lucide-react";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Processing from "./pages/Processing";
import Profile from "./pages/Profile";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import LunarChatbot from "./components/LunarChatbot";

// Create a client
const queryClient = new QueryClient();

function App() {
  const [chatbotOpen, setChatbotOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/processing" element={<Processing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/results/:jobId" element={<Results />} />
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* Chatbot Toggle Button */}
              <button
                onClick={() => setChatbotOpen(!chatbotOpen)}
                className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                aria-label="Open Lunar Chatbot"
              >
                <MessageCircle className="w-6 h-6" />
              </button>

              {/* Chatbot Component */}
              <LunarChatbot
                isOpen={chatbotOpen}
                onClose={() => setChatbotOpen(false)}
              />
            </div>
            <Toaster />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
