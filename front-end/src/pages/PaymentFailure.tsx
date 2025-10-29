import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { XCircle, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

const PaymentFailure = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const error = searchParams.get('error');

  // Clean up payment data on mount
  useEffect(() => {
    localStorage.removeItem('payment_data');
  }, []);

  // Calculate error message using useMemo to avoid re-renders
  const errorMessage = useMemo(() => {
    switch (error) {
      case 'missing_params':
        return t('payment.errors.missingParams');
      case 'order_not_found':
        return t('payment.errors.orderNotFound');
      case 'verification_failed':
        return t('payment.errors.verificationFailed');
      case 'processing_error':
        return t('payment.errors.processingError');
      case 'initiation_failed':
        return t('payment.errors.initiationFailed');
      case 'network_error':
        return t('payment.errors.networkError');
      default:
        return t('payment.failure.message');
    }
  }, [error, t]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <XCircle className="w-20 h-20 mx-auto mb-6 text-destructive" />
        <h1 className="text-3xl mb-4">{t('payment.failure.title')}</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {errorMessage}
        </p>
        
        {orderNumber && (
          <div className="bg-muted/50 p-6 mb-8 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('payment.failure.orderNumber')}
              </span>
            </div>
            <p className="text-xl font-mono font-bold">{orderNumber}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate(orderNumber ? `/payment?order=${orderNumber}` : '/cart')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('payment.failure.tryAgain')}
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/cart')}
          >
            {t('cart.continueShopping')}
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/')}
          >
            {t('payment.failure.backToHome')}
          </Button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <CreditCard className="w-4 h-4" />
            <span>{t('payment.failure.contactSupport')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
