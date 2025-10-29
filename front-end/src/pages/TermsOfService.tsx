import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Scale, Shield } from 'lucide-react';

const TermsOfService = () => {
  const { t } = useTranslation();

  const sections = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: t('terms.acceptance.title', 'قبول الشروط'),
      content: t('terms.acceptance.content', 'باستخدام موقعنا، فإنك توافق على هذه الشروط والأحكام.')
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: t('terms.orders.title', 'الطلبات والدفع'),
      content: t('terms.orders.content', 'جميع الطلبات تخضع للموافقة. الأسعار قابلة للتغيير. الدفع مطلوب عند الطلب.')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('terms.shipping.title', 'الشحن والتسليم'),
      content: t('terms.shipping.content', 'نقدم الشحن داخل الكويت. أوقات التسليم تقديرية.')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('terms.title', 'شروط الخدمة')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('terms.subtitle', 'الشروط والأحكام لاستخدام موقع Soapy Bubbles')}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t('terms.lastUpdated', 'آخر تحديث: يناير 2025')}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}


            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 sm:p-8 border border-primary/20"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {t('terms.contact.title', 'تواصل معنا')}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {t('terms.contact.content', 'إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى التواصل معنا:')}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('terms.contact.email', 'البريد الإلكتروني')}
                        </p>
                        <a href="mailto:info@soapyshop.com" className="text-sm text-primary hover:underline">
                          info@soapyshop.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {t('terms.contact.phone', 'الهاتف')}
                        </p>
                        <a href="tel:+96551620660" className="text-sm text-primary hover:underline" dir="ltr">
                          +965 5162 0660
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
