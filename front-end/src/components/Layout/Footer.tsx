import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, MessageCircle, Facebook, X } from 'lucide-react';
import { useRTL } from '@/hooks/useRTL';
import { cn } from '@/lib/utils';

export const Footer = () => {
  const { t } = useTranslation();
  const { isRTL } = useRTL();
  const currentYear = new Date().getFullYear();
  const [showCompaniesPopup, setShowCompaniesPopup] = useState(false);

  return (
    <footer className="border-t border-border/50 mt-auto bg-gradient-to-br from-muted/20 to-muted/40 dark:from-gray-900/30 dark:to-gray-800/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
          isRTL && "direction-rtl"
        )}>
          {/* Brand Section */}
          <div className={cn(
            "space-y-3 sm:col-span-2 lg:col-span-1",
            isRTL && "lg:order-4"
          )}>
            <div className={cn(
              "flex items-center gap-2",
              isRTL ? "flex-row justify-end lg:justify-start" : "flex-row"
            )}>
              <img 
                src="/logo.png" 
                alt="Al-Kandari" 
                className={cn(
                  "w-8 h-8 rounded-full object-cover shadow-md",
                  isRTL ? "order-2 lg:order-1" : "order-1"
                )}
              />
              <h3 className={cn(
                "text-lg font-bold tracking-wide uppercase text-gray-900 dark:text-white",
                isRTL ? "text-right order-1 lg:order-2" : "text-left order-2"
              )}>
                AL-KANDARI
              </h3>
            </div>
            <p className={cn(
              "text-xs text-muted-foreground leading-relaxed max-w-xs",
              isRTL ? "text-right ml-auto lg:ml-0" : "text-left"
            )}>
              {t('footer.description', 'Premium skincare and beauty products for your daily routine')}
            </p>
          </div>
          
           {/* Quick Links */}
           <div className={cn(
             "space-y-3",
             isRTL && "lg:order-3"
           )}>
             <h3 
               className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white"
               style={{ textAlign: isRTL ? 'right' : 'left' }}
             >
               {t('footer.quickLinks', 'Quick Links')}
             </h3>
             <ul className="space-y-2" style={{ textAlign: isRTL ? 'right' : 'left' }}>
               <li>
                 <Link 
                   to="/categories" 
                   className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 block"
                   style={{ textAlign: isRTL ? 'right' : 'left' }}
                 >
                   {t('nav.categories', 'Categories')}
                 </Link>
               </li>
               <li>
                 <Link 
                   to="/products" 
                   className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 block"
                   style={{ textAlign: isRTL ? 'right' : 'left' }}
                 >
                   {t('nav.products', 'Products')}
                 </Link>
               </li>
               <li>
                 <Link 
                   to="/track-order" 
                   className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 block"
                   style={{ textAlign: isRTL ? 'right' : 'left' }}
                 >
                   {t('nav.trackOrder', 'Track Order')}
                 </Link>
               </li>
             </ul>
           </div>

         {/* Contact Info */}
<div className={cn(
  "space-y-3",
  isRTL && "lg:order-2"
)}>
  <h3
    className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white"
    style={{ textAlign: isRTL ? 'right' : 'left' }}
  >
    {t('footer.contact', 'Contact')}
  </h3>
  <ul 
    className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white"
    style={{ textAlign: isRTL ? 'right' : 'left' }}
  >
     <li 
       className={cn("text-xs text-muted-foreground", isRTL ? "flex justify-end" : "flex justify-start")}
       style={{
         justifyContent: isRTL ? 'flex-end !important' : 'flex-start !important',
         textAlign: isRTL ? 'right' as const : 'left' as const
       }}
     >
       {isRTL ? (
         // Arabic Layout: Text first, then icon
         <a 
           href="tel:+96551620660"
           className="flex items-center gap-2 hover:text-primary transition-colors duration-200 group"
           style={{
             flexDirection: 'row-reverse' as const,
             textAlign: 'right' as const
           }}
         >
           <span dir="ltr">+965 5162 0660</span>
           <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
             <Phone className="w-3 h-3 text-primary" />
           </div>
         </a>
       ) : (
         // English Layout: Icon first, then text
         <a 
           href="tel:+96551620660"
           className="flex items-center gap-2 hover:text-primary transition-colors duration-200 group flex-row"
           style={{
             flexDirection: 'row' as const,
             textAlign: 'left' as const
           }}
           dir="ltr"
         >
           <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
             <Phone className="w-3 h-3 text-primary" />
           </div>
           <span>+965 5162 0660</span>
         </a>
       )}
     </li>
     <li 
       className={cn("text-xs text-muted-foreground", isRTL ? "flex justify-end" : "flex justify-start")}
       style={{
         justifyContent: isRTL ? 'flex-end !important' : 'flex-start !important',
         textAlign: isRTL ? 'right' as const : 'left' as const
       }}
     >
       {isRTL ? (
         // Arabic Layout: Text first, then icon
         <a 
           href="https://www.google.com/maps/place/29%C2%B022'32.1%22N+47%C2%B058'38.3%22E/@29.3755821,47.9773173,17z/data=!3m1!4b1!4m4!3m3!8m2!3d29.3755821!4d47.9773173?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D"
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center gap-2 hover:text-primary transition-colors duration-200 hover:underline group flex-row-reverse"
           style={{
             flexDirection: 'row-reverse' as const,
             textAlign: 'right' as const
           }}
         >
           <span>{t('footer.address', 'Kuwait City, Kuwait')}</span>
           <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
             <MapPin className="w-3 h-3 text-primary" />
           </div>
         </a>
       ) : (
         // English Layout: Icon first, then text
         <a 
           href="https://www.google.com/maps/place/29%C2%B022'32.1%22N+47%C2%B058'38.3%22E/@29.3755821,47.9773173,17z/data=!3m1!4b1!4m4!3m3!8m2!3d29.3755821!4d47.9773173?entry=ttu&g_ep=EgoyMDI1MTAwMS4wIKXMDSoASAFQAw%3D%3D"
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center gap-2 hover:text-primary transition-colors duration-200 hover:underline group flex-row"
           style={{
             flexDirection: 'row' as const,
             textAlign: 'left' as const
           }}
         >
           <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
             <MapPin className="w-3 h-3 text-primary" />
           </div>
           <span>{t('footer.address', 'Kuwait City, Kuwait')}</span>
         </a>
       )}
     </li>
  </ul>
</div>
          {/* Social Media */}
          <div className={cn(
            "space-y-3",
            isRTL && "lg:order-1"
          )}>
             <h3 
               className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-white"
               style={{ textAlign: isRTL ? 'right' : 'left' }}
             >
               {t('footer.followUs', 'Follow Us')}
             </h3>
            <div className={cn(
              "flex flex-wrap gap-2",
              isRTL ? "justify-end" : "justify-start"
            )}>
              <a 
                href="https://www.instagram.com/soapy.bubble/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm border border-border/50 hover:border-primary"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://www.snapchat.com/@soapybubble90" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm border border-border/50 hover:border-primary"
                aria-label="Snapchat"
              >
                <i className="fa-brands fa-snapchat text-base font-bold"></i>
              </a>
              <a 
                href="https://www.tiktok.com/@soapy.bubble90" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm border border-border/50 hover:border-primary"
                aria-label="TikTok"
              >
                <i className="fa-brands fa-tiktok text-base font-bold"></i>
              </a>
              <a 
                href="https://wa.me/96551620660" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm border border-border/50 hover:border-primary"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp text-base font-bold"></i>
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61581714755460" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-sm border border-border/50 hover:border-primary"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>



        {/* Bottom Bar */}
        <div className="border-t border-border/50 mt-3 pt-4">
               {/* Powered By - moved to bottom */}
               <div className="flex items-center justify-center mb-3">
             <button 
               onClick={() => setShowCompaniesPopup(true)}
               className="inline-flex items-center gap-3 text-xs hover:text-white/90 transition-all duration-300 group px-4 py-2 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 dark:from-gray-800 dark:to-gray-900 border border-slate-700/50 hover:border-primary/60 shadow-lg hover:shadow-xl cursor-pointer backdrop-blur-sm" 
               aria-label="Powered by Media Trend"
             >
               <span className="font-medium tracking-wide text-white/90 dark:text-white-300">{isRTL ? "بدعم من" : "Powered by"}</span>
               <img src="/media-trend.png" alt="Media Trend" className="h-4 w-auto opacity-90 group-hover:opacity-100 transition-all" />
             </button>
           </div>
          <div className={cn(
            "flex flex-col sm:flex-row justify-between items-center gap-3"
          )}>
            <p className={cn(
              "text-xs text-muted-foreground",
              isRTL ? "text-right sm:order-2" : "text-left sm:order-1"
            )}>
              © {currentYear} Al-Kandari. {t('footer.rights', 'All rights reserved.')}
            </p>
            


            <div className={cn(
              "flex gap-4 text-xs text-muted-foreground",
              isRTL ? "flex-row-reverse sm:order-1" : "sm:order-3"
            )}>
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                {t('footer.privacy', 'Privacy Policy')}
              </Link>
              <Link to="/terms-of-service" className="hover:text-primary transition-colors">
                {t('footer.terms', 'Terms of Service')}
              </Link>
            </div>
          </div>
          
    
        </div>
      </div>
      
      {/* Companies Popup */}
      {showCompaniesPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-border/20 popup-scrollbar">
            {/* Header */}
            <div className={cn("flex items-center p-6 border-b border-border/30 bg-gradient-to-r from-muted/30 to-muted/10", isRTL ? "justify-between" : "justify-between")}>
              <div className={cn("flex items-center gap-3", isRTL ? "order-2" : "order-1")}>
                <h3 className="text-xl font-bold text-foreground">
                  {isRTL ? "شركاؤنا" : "Our Partners"}
                </h3>
              </div>
              <button
                onClick={() => setShowCompaniesPopup(false)}
                className={cn("p-2 hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all duration-200 group", isRTL ? "order-1" : "order-2")}
              >
                <X className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Company 1 - Media Trend */}
              <div className="border border-border/30 rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-white to-muted/20 dark:from-gray-800 dark:to-gray-900/50">
                {/* Company Header with Logo */}
                <div className="relative mb-4">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl"></div>
                  
                  {/* Content */}
                  <div className="relative p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      {/* Company Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-18 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <img src="/media-trend.png" alt="Media Trend" className="h-6 w-auto" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-foreground">Media Trend</h4>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{isRTL ? "شركة التسويق الإلكتروني " : "Digital Marketing"}</p>
                      </div>
                      
                   
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {isRTL 
                    ? "شركة متخصصة في التسويق الإلكتروني والبرمجة، تم إنشائها في جمهورية مصر العربية عام 2015، وتمتد خدماتها من خلال فروعها في الكويت والمملكة العربية السعودية، لتغطي شريحة واسعة من الأسواق العربية باحترافية عالية." 
                    : "Specialized in digital marketing and programming, established in Egypt in 2015, with branches in Kuwait and Saudi Arabia, serving a wide range of Arab markets with high professionalism."
                  }
                </p>
                <div className="flex gap-3">
                  <a 
                    href="https://mediatrendkw.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isRTL ? "الموقع" : "Website"}
                  </a>
                  <a 
                    href="https://api.whatsapp.com/message/XXA3BD5BCUOXN1?autoload=1&app_absent=0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              
              {/* Company 2 - Tech Solutions */}
              <div className="border border-border/30 rounded-2xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 bg-gradient-to-br from-white to-muted/20 dark:from-gray-800 dark:to-gray-900/50">
                {/* Company Header with Logo */}
                <div className="relative mb-4">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-2xl"></div>
                  
                  {/* Content */}
                  <div className="relative p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      {/* Company Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                             <img src="/codemz.png" alt="CodeMZ" className="h-full w-full object-cover" />
                           </div>
                          <div>
                            <h4 className="font-bold text-lg text-foreground">CodeMZ </h4>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">{isRTL ? "  شركة البرمجة المسؤولة  عن الموقع" : "The programming company responsible for the website "}</p>
                      </div>
                      
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {isRTL 
                    ? "شركة رائدة في خدمات البرمجة تشمل: تصميم وتطوير المواقع الإلكترونية الجذابة وسهلة الاستخدام، برمجة تطبيقات الهاتف لتوسيع الوصول للعملاء، تحسين محركات البحث لزيادة الظهور، تصميم هويات بصرية مميزة تعكس هوية العلامة، ودعم فني متواصل لضمان أفضل أداء وتجربة للمستخدمين." 
                    : "Leading company in programming services including: designing and developing attractive and user-friendly websites, mobile app development to expand customer reach, search engine optimization to increase visibility, distinctive visual identity design that reflects brand identity, and continuous technical support to ensure optimal performance and user experience."
                  }
                </p>
                <div className="flex gap-3">
                  <a 
                    href="https://codemz.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isRTL ? "الموقع" : "Website"}
                  </a>
                  <a 
                    href="https://api.whatsapp.com/send/?phone=201125270148&text&type=phone_number&app_absent=0" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-border/30 bg-gradient-to-r from-muted/30 to-muted/10 rounded-b-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-primary/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="h-2 w-2 bg-primary/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
               <p className="text-sm text-center text-muted-foreground font-medium">
                 {isRTL 
                   ? (
                     <>
                       تم تطوير هذا الموقع بواسطة{" "}
                       <a 
                         href="https://codemz.com/" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-primary hover:text-primary/80 transition-colors duration-200 font-semibold"
                       >
                         CodeMZ
                       </a>
                     </>
                   )
                   : (
                     <>
                       This website was developed by{" "}
                       <a 
                         href="https://codemz.com/" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-primary hover:text-primary/80 transition-colors duration-200 font-semibold"
                       >
                         CodeMZ
                       </a>
                     </>
                   )
                 }
               </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};