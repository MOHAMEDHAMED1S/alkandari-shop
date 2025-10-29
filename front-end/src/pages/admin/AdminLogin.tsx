import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Shield, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRTL } from '@/hooks/useRTL';

const AdminLogin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAdmin();
  const { isRTL } = useRTL();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Get the intended destination from location state
      const from = location.state?.from || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        toast.success(t('admin.login.loginSuccess', 'تم تسجيل الدخول بنجاح'));
        // Get the intended destination from location state
        const from = location.state?.from || '/admin/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(t('admin.login.invalidCredentials'));
      }
    } catch (err) {
      setError(t('admin.login.loginError', 'خطأ في تسجيل الدخول'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-200/20 dark:border-slate-700/20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            {t('admin.common.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Minimal background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-sm mx-auto">
            {/* Modern Login Card with Integrated Logo */}
            <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden">
              {/* Logo Header Section */}
              <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 px-2 py-2 text-center">
                <div className="w-20 h-20 mx-auto mb-2 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-200/30 dark:border-slate-700/30">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-12 h-12 object-contain"
                  />
                </div>

              </div>
              
              <CardContent className="p-8 space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="border-red-200/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className={cn(
                      "text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2",
                      isRTL ? "flex-row justify-end" : "flex-row"
                    )}>
                      {isRTL ? (
                        <>
                          {t('admin.login.email')}
                          <Mail className="w-4 h-4 text-primary" />
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 text-primary" />
                          {t('admin.login.email')}
                        </>
                      )}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@example.com"
                      dir="ltr"
                      className="h-12 rounded-xl border-slate-300/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className={cn(
                      "text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2",
                      isRTL ? "flex-row justify-end" : "flex-row"
                    )}>
                      {isRTL ? (
                        <>
                          {t('admin.login.password')}
                          <Lock className="w-4 h-4 text-primary" />
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-primary" />
                          {t('admin.login.password')}
                        </>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={cn(
                          "h-12 rounded-xl border-slate-300/50 dark:border-slate-600/50 bg-slate-50/50 dark:bg-slate-700/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200",
                          isRTL ? "pl-12" : "pr-12"
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-600/30 transition-colors",
                          isRTL ? "left-3" : "right-3"
                        )}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-8"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t('admin.login.loggingIn')}
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        {t('admin.login.login')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminLogin;