import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Bot, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Save, 
  Loader2,
  TestTube,
  Power,
  Brain,
  Package,
  Trash2,
  Eye,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  MessageCircle,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  getChatbotSettings,
  updateChatbotSettings,
  getChatbotStatistics,
  getChatbotConversations,
  getChatbotConversationDetails,
  testChatbotConfiguration,
  clearOldChatbotConversations,
  deleteChatbotConversation,
  type ChatbotSettings,
  type ChatbotStatistics,
  type ChatbotConversation
} from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminChatbot: React.FC = () => {
  const { i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  // Settings
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  
  // Statistics
  const [statistics, setStatistics] = useState<ChatbotStatistics | null>(null);
  const [statsDays, setStatsDays] = useState(30);
  
  // Conversations
  const [conversations, setConversations] = useState<ChatbotConversation[]>([]);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsTotal, setConversationsTotal] = useState(0);
  const [conversationsPerPage, setConversationsPerPage] = useState(10);
  const [conversationsSearch, setConversationsSearch] = useState('');
  const [conversationsStatus, setConversationsStatus] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversationDetails, setConversationDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const token = localStorage.getItem('admin_token') || '';

  // Load initial data
  useEffect(() => {
    loadSettings();
    loadStatistics();
    loadConversations();
  }, []);

  // Reload conversations when filters change
  useEffect(() => {
    loadConversations();
  }, [conversationsPage, conversationsPerPage, conversationsSearch, conversationsStatus]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await getChatbotSettings(token);
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await getChatbotStatistics(token, statsDays);
      if (response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('فشل في تحميل الإحصائيات');
    }
  };

  const loadConversations = async () => {
    try {
      const response = await getChatbotConversations(token, {
        page: conversationsPage,
        per_page: conversationsPerPage,
        search: conversationsSearch || undefined,
        status: conversationsStatus !== 'all' ? conversationsStatus : undefined
      });
      setConversations(response.data?.data || []);
      setConversationsTotal(response.data?.total || 0);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('فشل في تحميل المحادثات');
      setConversations([]);
      setConversationsTotal(0);
    }
  };

  const loadConversationDetails = async (sessionId: string) => {
    try {
      setLoadingDetails(true);
      const response = await getChatbotConversationDetails(token, sessionId);
      setConversationDetails(response.data);
    } catch (error) {
      console.error('Error loading conversation details:', error);
      toast.error('فشل في تحميل تفاصيل المحادثة');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await updateChatbotSettings(token, settings);
      toast.success('تم حفظ الإعدادات بنجاح');
      await loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConfiguration = async () => {
    try {
      setTesting(true);
      const response = await testChatbotConfiguration(token, 'مرحباً، هذه رسالة اختبار');
      
      if (response.data.settings_valid) {
        toast.success('اختبار ناجح! جميع المكونات تعمل بشكل صحيح');
      } else {
        toast.warning('هناك مشاكل في التكوين');
      }
    } catch (error) {
      console.error('Error testing configuration:', error);
      toast.error('فشل في اختبار التكوين');
    } finally {
      setTesting(false);
    }
  };

  const handleClearOldConversations = async (days: number) => {
    try {
      const response = await clearOldChatbotConversations(token, days);
      toast.success(`تم حذف ${response.deleted_count} محادثة قديمة`);
      await loadConversations();
      await loadStatistics();
    } catch (error) {
      console.error('Error clearing conversations:', error);
      toast.error('فشل في حذف المحادثات');
    }
  };

  const handleDeleteConversation = async (sessionId: string) => {
    try {
      await deleteChatbotConversation(token, sessionId);
      toast.success('تم حذف المحادثة');
      await loadConversations();
      await loadStatistics();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('فشل في حذف المحادثة');
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRTL = i18n.language === 'ar';

  return (
    <div className="space-y-6 p-1" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
      >
        {isRTL ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end order-1 lg:order-2"
            >
              <div>
                <h1 className="pb-2 text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
                  <Bot className="h-8 w-8" />
                  إدارة الشات بوت
                </h1>
          
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-1"
            >
              {settings && (
                <div className="flex items-center gap-2">
                  <Badge variant={settings.is_active ? "default" : "secondary"} className="flex items-center gap-1">
                    <Power className="h-3 w-3" />
                    {settings.is_active ? 'نشط' : 'متوقف'}
                  </Badge>
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left order-1 lg:order-1"
            >
              <div>
                <h1 className="pb-2 text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
                  <Bot className="h-8 w-8" />
                  Chatbot Management
                </h1>
            
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-2"
            >
              {settings && (
                <div className="flex items-center gap-2">
                  <Badge variant={settings.is_active ? "default" : "secondary"} className="flex items-center gap-1">
                    <Power className="h-3 w-3" />
                    {settings.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              )}
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 p-1">
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            {isRTL ? (
              <>
                {isRTL ? 'الإعدادات' : 'Settings'}
                <Settings className="h-4 w-4" />
              </>
            ) : (
              <>
                <Settings className="h-4 w-4" />
                {isRTL ? 'الإعدادات' : 'Settings'}
              </>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="statistics" 
            className="flex items-center gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            {isRTL ? (
              <>
                {isRTL ? 'الإحصائيات' : 'Statistics'}
                <BarChart3 className="h-4 w-4" />
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4" />
                {isRTL ? 'الإحصائيات' : 'Statistics'}
              </>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="conversations" 
            className="flex items-center gap-2 rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            {isRTL ? (
              <>
                {isRTL ? 'المحادثات' : 'Conversations'}
                <MessageSquare className="h-4 w-4" />
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                {isRTL ? 'المحادثات' : 'Conversations'}
              </>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {settings && (
            <>
              {/* Basic Settings */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/50 dark:border-blue-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative p-6">
                  <div className="flex items-center justify-between">
                    {isRTL ? (
                      <>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-right flex-1 mr-4">
                          <CardTitle className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                            {isRTL ? 'الإعدادات الأساسية' : 'Basic Settings'}
                          </CardTitle>
                          <CardDescription className="text-blue-700 dark:text-blue-300">
                            {isRTL ? 'الإعدادات العامة للشات بوت' : 'General chatbot settings'}
                          </CardDescription>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-left flex-1">
                          <CardTitle className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                            {isRTL ? 'الإعدادات الأساسية' : 'Basic Settings'}
                          </CardTitle>
                          <CardDescription className="text-blue-700 dark:text-blue-300">
                            {isRTL ? 'الإعدادات العامة للشات بوت' : 'General chatbot settings'}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                        {isRTL ? 'اسم الشات بوت' : 'Chatbot Name'}
                      </Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        placeholder={isRTL ? "مثال: مساعد المتجر الذكي" : "Example: Smart Store Assistant"}
                        className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    <div className={`flex items-center justify-between space-y-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {isRTL ? (
                        <>
                          <Switch
                            id="is_active"
                            checked={settings.is_active}
                            onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
                          />
                          <div className="text-right">
                            <Label htmlFor="is_active" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                              {isRTL ? 'حالة التفعيل' : 'Activation Status'}
                            </Label>
                            <p className="text-sm text-slate-500">
                              {settings.is_active ? (isRTL ? 'الشات بوت نشط' : 'Chatbot is active') : (isRTL ? 'الشات بوت متوقف' : 'Chatbot is inactive')}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                            <Label htmlFor="is_active" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                              {isRTL ? 'حالة التفعيل' : 'Activation Status'}
                            </Label>
                            <p className="text-sm text-slate-500">
                              {settings.is_active ? (isRTL ? 'الشات بوت نشط' : 'Chatbot is active') : (isRTL ? 'الشات بوت متوقف' : 'Chatbot is inactive')}
                            </p>
                          </div>
                          <Switch
                            id="is_active"
                            checked={settings.is_active}
                            onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome_message" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                      {isRTL ? 'رسالة الترحيب' : 'Welcome Message'}
                    </Label>
                    <Textarea
                      id="welcome_message"
                      value={settings.welcome_message}
                      onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                      placeholder={isRTL ? "مرحباً! كيف يمكنني مساعدتك اليوم؟" : "Hello! How can I help you today?"}
                      rows={2}
                      className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="system_prompt" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                      {isRTL ? 'تعليمات النظام ' : 'System Instructions '}
                    </Label>
                    <Textarea
                      id="system_prompt"
                      value={settings.system_prompt}
                      onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                      placeholder={isRTL ? "أنت مساعد ذكي لمتجر الصابون..." : "You are an intelligent assistant for a soap store..."}
                      rows={6}
                      className={`font-mono text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                    <p className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'التعليمات الأساسية التي يستخدمها الذكاء الاصطناعي لفهم دوره' : 'Basic instructions that the AI uses to understand its role'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Settings */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200/50 dark:border-purple-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative p-6">
                  <div className="flex items-center justify-between">
                    {isRTL ? (
                      <>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-right flex-1 mr-4">
                          <CardTitle className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                            {isRTL ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings'}
                          </CardTitle>
                          <CardDescription className="text-purple-700 dark:text-purple-300">
                            {isRTL ? 'تحكم في سلوك الذكاء الاصطناعي' : 'Control AI behavior'}
                          </CardDescription>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-left flex-1">
                          <CardTitle className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                            {isRTL ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings'}
                          </CardTitle>
                          <CardDescription className="text-purple-700 dark:text-purple-300">
                            {isRTL ? 'تحكم في سلوك الذكاء الاصطناعي' : 'Control AI behavior'}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                        {isRTL ? 'نموذج الذكاء الاصطناعي' : 'AI Model'}
                      </Label>
                      <Select
                        value={settings.ai_settings.model}
                        onValueChange={(value) => setSettings({
                          ...settings,
                          ai_settings: { ...settings.ai_settings, model: value }
                        })}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                          <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                          <SelectItem value="gemini-2.0-flash-001">Gemini 2.0 Flash (001)</SelectItem>
                          <SelectItem value="gemini-2.0-flash-lite-001">Gemini 2.0 Flash Lite (001)</SelectItem>
                          <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_tokens" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                        {isRTL ? 'الحد الأقصى للرموز' : 'Max Tokens'}
                      </Label>
                      <Input
                        id="max_tokens"
                        type="number"
                        value={settings.ai_settings.max_tokens}
                        onChange={(e) => setSettings({
                          ...settings,
                          ai_settings: { ...settings.ai_settings, max_tokens: parseInt(e.target.value) }
                        })}
                        min={100}
                        max={4000}
                        className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Label htmlFor="temperature" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                        {isRTL ? 'درجة الحرارة (Creativity)' : 'Temperature (Creativity)'}
                      </Label>
                      <span className="text-sm text-slate-600">{settings.ai_settings.temperature}</span>
                    </div>
                    <Slider
                      id="temperature"
                      value={[settings.ai_settings.temperature]}
                      onValueChange={([value]) => setSettings({
                        ...settings,
                        ai_settings: { ...settings.ai_settings, temperature: value }
                      })}
                      min={0}
                      max={1}
                      step={0.1}
                      className="w-full"
                    />
                    <p className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL ? 'قيمة أعلى = إبداع أكثر، قيمة أقل = إجابات أكثر دقة' : 'Higher value = more creative, lower value = more accurate answers'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_conversation_length" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                        {isRTL ? 'طول المحادثة' : 'Conversation Length'}
                      </Label>
                      <Input
                        id="max_conversation_length"
                        type="number"
                        value={settings.max_conversation_length}
                        onChange={(e) => setSettings({ ...settings, max_conversation_length: parseInt(e.target.value) })}
                        min={10}
                        max={200}
                        className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                      />
                      <p className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'الحد الأقصى لعدد الرسائل' : 'Maximum number of messages'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="token_limit_per_message" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                        {isRTL ? 'رموز كل رسالة' : 'Tokens per Message'}
                      </Label>
                      <Input
                        id="token_limit_per_message"
                        type="number"
                        value={settings.token_limit_per_message}
                        onChange={(e) => setSettings({ ...settings, token_limit_per_message: parseInt(e.target.value) })}
                        min={100}
                        max={4000}
                        className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                      />
                      <p className={`text-xs text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'الحد الأقصى لكل رسالة' : 'Maximum per message'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Access */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200/50 dark:border-orange-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative p-6">
                  <div className="flex items-center justify-between">
                    {isRTL ? (
                      <>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-right flex-1 mr-4">
                          <CardTitle className="text-xl font-semibold text-orange-900 dark:text-orange-100">
                            {isRTL ? 'الوصول للمنتجات' : 'Product Access'}
                          </CardTitle>
                          <CardDescription className="text-orange-700 dark:text-orange-300">
                            {isRTL ? 'تحديد المنتجات التي يمكن للشات بوت اقتراحها' : 'Define products the chatbot can suggest'}
                          </CardDescription>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-left flex-1">
                          <CardTitle className="text-xl font-semibold text-orange-900 dark:text-orange-100">
                            {isRTL ? 'الوصول للمنتجات' : 'Product Access'}
                          </CardTitle>
                          <CardDescription className="text-orange-700 dark:text-orange-300">
                            {isRTL ? 'تحديد المنتجات التي يمكن للشات بوت اقتراحها' : 'Define products the chatbot can suggest'}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_access_type" className={`text-sm font-medium ${isRTL ? 'text-right block w-full' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : {}}>
                      {isRTL ? 'نوع الوصول' : 'Access Type'}
                    </Label>
                    <Select
                      value={settings.product_access_type}
                      onValueChange={(value: 'all' | 'specific' | 'none') => setSettings({
                        ...settings,
                        product_access_type: value
                      })}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{isRTL ? 'جميع المنتجات' : 'All Products'}</SelectItem>
                        <SelectItem value="specific">{isRTL ? 'منتجات محددة' : 'Specific Products'}</SelectItem>
                        <SelectItem value="none">{isRTL ? 'لا يوجد (معطل)' : 'None (Disabled)'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.product_access_type === 'specific' && (
                    <div className="space-y-2">
                      <Label className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'المنتجات المسموحة' : 'Allowed Products'}
                      </Label>
                      <p className={`text-sm text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isRTL ? 'قريباً: واجهة لاختيار المنتجات المحددة' : 'Coming soon: Interface to select specific products'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  variant="outline"
                  onClick={handleTestConfiguration}
                  disabled={testing}
                  className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto"
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  <span className="font-semibold">{isRTL ? 'اختبار التكوين' : 'Test Configuration'}</span>
                </Button>

                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span className="font-semibold">{isRTL ? 'حفظ الإعدادات' : 'Save Settings'}</span>
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          {statistics && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/50 dark:border-blue-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-4 lg:p-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 lg:w-12 lg:h-12">
                        <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {isRTL ? 'إجمالي المحادثات' : 'Total Conversations'}
                        </p>
                        <div className="text-2xl lg:text-3xl font-bold text-blue-800 dark:text-blue-200">
                          {statistics.total_conversations || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200/50 dark:border-green-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-4 lg:p-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 lg:w-12 lg:h-12">
                        <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {isRTL ? 'المحادثات النشطة' : 'Active Conversations'}
                        </p>
                        <div className="text-2xl lg:text-3xl font-bold text-green-800 dark:text-green-200">
                          {statistics.active_conversations || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200/50 dark:border-purple-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-4 lg:p-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 lg:w-12 lg:h-12">
                        <MessageSquare className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                          {isRTL ? 'إجمالي الرسائل' : 'Total Messages'}
                        </p>
                        <div className="text-2xl lg:text-3xl font-bold text-purple-800 dark:text-purple-200">
                          {statistics.total_messages || 0}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200/50 dark:border-orange-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-4 lg:p-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="w-10 h-10 lg:w-12 lg:h-12">
                        <BarChart3 className="h-5 w-5 lg:h-6 lg:w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          {isRTL ? 'متوسط الرسائل' : 'Avg Messages'}
                        </p>
                        <div className="text-2xl lg:text-3xl font-bold text-orange-800 dark:text-orange-200">
                          {(statistics.average_messages_per_conversation || 0).toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Stats */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative p-6">
                  <div className="flex items-center justify-between">
                    {isRTL ? (
                      <>
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="text-right flex-1 mr-4">
                          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {isRTL ? 'الإحصائيات اليومية' : 'Daily Statistics'}
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            {isRTL ? `آخر ${statsDays} يوم` : `Last ${statsDays} days`}
                          </CardDescription>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-left flex-1">
                          <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            {isRTL ? 'الإحصائيات اليومية' : 'Daily Statistics'}
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            {isRTL ? `آخر ${statsDays} يوم` : `Last ${statsDays} days`}
                          </CardDescription>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-xl flex items-center justify-center shadow-lg">
                          <Clock className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative p-6 pt-0">
                  <div className="space-y-2">
                    {(statistics.daily_stats || []).slice(-7).reverse().map((stat, index) => (
                      <div key={index} className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm">
                            {new Date(stat.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                        <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-slate-600 dark:text-slate-400">
                            {stat.conversations} {isRTL ? 'محادثة' : 'conversations'}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {stat.messages} {isRTL ? 'رسالة' : 'messages'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-6">
          {/* Header with Actions */}
          <div className={`flex flex-col lg:flex-row gap-4 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-lg font-semibold">{isRTL ? 'المحادثات' : 'Conversations'}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isRTL ? `إجمالي ${conversationsTotal} محادثة` : `Total ${conversationsTotal} conversations`}
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="group hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl flex items-center gap-2">
                  <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">{isRTL ? 'حذف القديمة' : 'Delete Old'}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{isRTL ? 'حذف المحادثات القديمة' : 'Delete Old Conversations'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL ? 'هل تريد حذف المحادثات الأقدم من 30 يوم؟' : 'Do you want to delete conversations older than 30 days?'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleClearOldConversations(30)}>
                    {isRTL ? 'حذف' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Search and Filter */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
            <CardContent className="p-4">
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={isRTL ? 'بحث في المحادثات...' : 'Search conversations...'}
                    value={conversationsSearch}
                    onChange={(e) => setConversationsSearch(e.target.value)}
                    className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  {conversationsSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`absolute top-1/2 -translate-y-1/2 h-6 w-6 p-0 ${isRTL ? 'left-2' : 'right-2'}`}
                      onClick={() => setConversationsSearch('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <Filter className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'} z-10`} />
                  <Select value={conversationsStatus} onValueChange={setConversationsStatus}>
                    <SelectTrigger className={`${isRTL ? 'pr-10' : 'pl-10'} rounded-xl`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isRTL ? 'جميع المحادثات' : 'All Conversations'}</SelectItem>
                      <SelectItem value="active">{isRTL ? 'النشطة' : 'Active'}</SelectItem>
                      <SelectItem value="ended">{isRTL ? 'المنتهية' : 'Ended'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="relative p-0">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                          <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'} className="rounded-xl w-fit">
                            {conversation.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'منتهي' : 'Ended')}
                          </Badge>
                          <span className="text-sm font-medium truncate">
                            {conversation.customer_name || conversation.session_id}
                          </span>
                        </div>
                        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-600 dark:text-slate-400 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{conversation.message_count} {isRTL ? 'رسالة' : 'messages'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(conversation.started_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</span>
                          </span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-2"
                          onClick={() => {
                            setSelectedConversation(conversation);
                            loadConversationDetails(conversation.session_id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        <span className="sr-only">{isRTL ? 'عرض التفاصيل' : 'View Details'}</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl p-2">
                              <Trash2 className="h-4 w-4 text-red-600" />
                              <span className="sr-only">{isRTL ? 'حذف المحادثة' : 'Delete Conversation'}</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{isRTL ? 'حذف المحادثة' : 'Delete Conversation'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {isRTL ? 'هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this conversation? This action cannot be undone.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteConversation(conversation.session_id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isRTL ? 'حذف' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}

                {conversations.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>{isRTL ? 'لا توجد محادثات بعد' : 'No conversations yet'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {conversationsTotal > 10 && (
            <div className={`flex items-center justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConversationsPage(p => Math.max(1, p - 1))}
                disabled={conversationsPage === 1}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">{isRTL ? 'السابق' : 'Previous'}</span>
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {isRTL ? `صفحة ${conversationsPage} من ${Math.ceil(conversationsTotal / 10)}` : `Page ${conversationsPage} of ${Math.ceil(conversationsTotal / 10)}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConversationsPage(p => p + 1)}
                disabled={conversationsPage >= Math.ceil(conversationsTotal / 10)}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">{isRTL ? 'التالي' : 'Next'}</span>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Conversation Details Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={(open) => !open && setSelectedConversation(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] w-[95vw] sm:w-full rounded-2xl shadow-2xl border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/95 dark:to-slate-800/95 backdrop-blur-xl" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className="relative p-6 pb-4">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
            <div className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
              <DialogTitle className={`text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                {isRTL ? (
                  <>
                    {isRTL ? 'تفاصيل المحادثة' : 'Conversation Details'}
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-6 w-6 text-primary" />
                    {isRTL ? 'تفاصيل المحادثة' : 'Conversation Details'}
                  </>
                )}
              </DialogTitle>
               <DialogDescription className={`text-slate-600 dark:text-slate-400 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                 {selectedConversation && (
                   <div className={`truncate font-medium ${isRTL ? 'text-right' : 'text-left'}`} style={isRTL ? { textAlign: 'right' } : { textAlign: 'left' }}>
                     {selectedConversation.customer_name || selectedConversation.customer_email || selectedConversation.session_id}
                   </div>
                 )}
               </DialogDescription>
            </div>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-slate-600 dark:text-slate-400">{isRTL ? 'جاري تحميل التفاصيل...' : 'Loading details...'}</p>
              </div>
            </div>
          ) : conversationDetails ? (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 p-6 pt-0">
                {/* Conversation Info */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/50 dark:border-blue-800/30 rounded-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-6">
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{isRTL ? 'الحالة' : 'Status'}</p>
                        <Badge variant={conversationDetails.status === 'active' ? 'default' : 'secondary'} className="rounded-xl">
                          {conversationDetails.status === 'active' ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'منتهي' : 'Ended')}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{isRTL ? 'عدد الرسائل' : 'Message Count'}</p>
                        <p className="font-bold text-lg text-slate-800 dark:text-slate-200">{conversationDetails.message_count}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{isRTL ? 'بدأت في' : 'Started At'}</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {new Date(conversationDetails.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{isRTL ? 'آخر نشاط' : 'Last Activity'}</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {new Date(conversationDetails.last_activity_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Messages */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative p-6 pb-4">
                    <CardTitle className={`text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      {isRTL ? 'الرسائل' : 'Messages'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative p-6 pt-0">
                    <div className="space-y-4">
                      {conversationDetails.messages?.map((message: any) => {
                        // إزالة نص النظام من رسائل المستخدم
                        const cleanContent = message.role === 'user' 
                          ? message.content.replace(/معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g, '').trim()
                          : message.content;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                          >
                            <div
                              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-br from-primary to-primary/90 text-white'
                                  : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{cleanContent}</p>
                              <p className="text-xs mt-2 opacity-70 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(message.sent_at).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChatbot;

