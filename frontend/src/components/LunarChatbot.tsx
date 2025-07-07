import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Settings, X, Moon, Stars, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface LunarChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const LunarChatbot: React.FC<LunarChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  useEffect(() => {
    // Check if API key exists in cookies
    const savedApiKey = Cookies.get(STORAGE_KEYS.GEMINI_API_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  useEffect(() => {
    // Poll for API key changes every 2 seconds to stay in sync with AI Settings
    const pollApiKey = () => {
      const currentApiKey = Cookies.get(STORAGE_KEYS.GEMINI_API_KEY);
      if (currentApiKey && currentApiKey !== apiKey) {
        setApiKey(currentApiKey);
        setShowApiKeyInput(false);
      } else if (!currentApiKey && apiKey) {
        setApiKey('');
        setShowApiKeyInput(true);
      }
    };

    const interval = setInterval(pollApiKey, 2000);
    return () => clearInterval(interval);
  }, [apiKey]);

  useEffect(() => {
    // Add welcome message only once
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: "🌙 Hello! I'm your Lunar Assistant. I can help you with questions about the Moon, Solar System, and Universe. What would you like to know?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const saveApiKey = () => {
    if (apiKey.trim()) {
      // Update the cookie with a 1-year expiry to match AI Settings
      Cookies.set(STORAGE_KEYS.GEMINI_API_KEY, apiKey.trim(), {
        expires: 365, // 1 year to match AI Settings
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax'
      });
      setShowApiKeyInput(false);
      toast.success('API key saved successfully! This will also update AI Settings.');
    } else {
      toast.error('Please enter a valid API key');
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: '1',
      text: "🌙 Hello! I'm your Lunar Assistant. I can help you with questions about the Moon, Solar System, and Universe. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }]);
    toast.success('Chat messages cleared');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Always check for the latest API key from cookies to ensure sync
    const currentApiKey = Cookies.get(STORAGE_KEYS.GEMINI_API_KEY);
    if (!currentApiKey) {
      toast.error('Gemini API key not found. Please configure it in AI Settings or add it here.');
      setShowApiKeyInput(true);
      return;
    }

    // Update local state if different
    if (currentApiKey !== apiKey) {
      setApiKey(currentApiKey);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          api_key: currentApiKey
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I couldn\'t generate a response.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error('Failed to get response from chatbot');
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px]">
      <Card className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 border-purple-400/20 shadow-2xl flex flex-col">
        <CardHeader className="p-3 border-b border-purple-400/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Moon className="w-5 h-5 text-blue-400" />
              Lunar Assistant
              <Stars className="w-4 h-4 text-yellow-400" />
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMessages}
                className="text-white hover:bg-purple-800/30"
                title="Clear Messages"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-white hover:bg-purple-800/30"
                title="API Settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-purple-800/30"
                title="Close"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showApiKeyInput && (
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-purple-800/30 border-purple-400/20 text-white placeholder-gray-300"
                type="password"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveApiKey}
                  disabled={!apiKey.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save API Key
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowApiKeyInput(false)}
                  className="border-purple-400/20 text-white hover:bg-purple-800/30"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-blue-300">
                This will sync with your AI Settings and enable all AI features
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-800/30 text-gray-100 border border-purple-400/20'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-800/30 text-gray-100 border border-purple-400/20 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-purple-400/20 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask about the Moon, Solar System, or Universe..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-purple-800/30 border-purple-400/20 text-white placeholder-gray-300 flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LunarChatbot;