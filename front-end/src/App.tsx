import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/contexts/CartContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { PageTransition } from "@/components/Layout/PageTransition";
import { FloatingChatbot } from "@/components/chatbot/FloatingChatbot";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import VisitTracker from "@/components/VisitTracker";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import OrderTracking from "./pages/OrderTracking";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import InvoicePrint from "./pages/admin/InvoicePrint";
import InvoiceBulkPrint from "./pages/admin/InvoiceBulkPrint";
import AdminDiscounts from "./pages/admin/AdminDiscounts";
import AdminProductDiscounts from "./pages/admin/AdminProductDiscounts";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminWhatsAppSettings from "./pages/admin/AdminWhatsAppSettings";
import AdminOrdersControl from "./pages/admin/AdminOrdersControl";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminReports from "./pages/admin/AdminReports";
import AdminVisitAnalytics from "./pages/admin/AdminVisitAnalytics";
import AdminChatbot from "./pages/admin/AdminChatbot";
import AdminPaymentVerification from "./pages/admin/AdminPaymentVerification";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPaymentMethods from "./pages/admin/AdminPaymentMethods";
import AdminShippingSettings from "./pages/admin/AdminShippingSettings";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import { useRTL } from "@/hooks/useRTL";
import facebookPixel from "@/services/facebookPixel";
import "./i18n/config";

const queryClient = new QueryClient();

// مكون لإدارة عرض الـ chatbot
const ChatbotWrapper = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  return !isAdminPage ? <FloatingChatbot /> : null;
};

const App = () => {
  useRTL(); // Initialize RTL support

  // Initialize Facebook Pixel
  useEffect(() => {
    facebookPixel.init();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <AdminProvider>
            <ChatbotProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                {/* <VisitTracker /> */}
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Home />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/products" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Products />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/categories" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Categories />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/category/:slug" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Category />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/product/:slug" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <ProductDetail />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/cart" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Cart />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/checkout" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Checkout />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/payment" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <Payment />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/payment/success" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <PaymentSuccess />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/payment-success" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <PaymentSuccess />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/payment/failure" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <PaymentFailure />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/track-order" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <OrderTracking />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/track-order/:orderNumber" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <OrderTracking />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/privacy-policy" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <PrivacyPolicy />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />
                <Route path="/terms-of-service" element={
                  <div className="flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1">
                      <PageTransition>
                        <TermsOfService />
                      </PageTransition>
                    </main>
                    <Footer />
                  </div>
                } />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/invoice/:orderId" element={<InvoicePrint />} />
                  <Route path="orders/bulk-invoice" element={<InvoiceBulkPrint />} />
                  <Route path="payment-verification" element={<AdminPaymentVerification />} />
                  <Route path="discounts" element={<AdminDiscounts />} />
                  <Route path="product-discounts" element={<AdminProductDiscounts />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="whatsapp-settings" element={<AdminWhatsAppSettings />} />
                  <Route path="orders-control" element={<AdminOrdersControl />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="marketing" element={<AdminMarketing />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="analytics" element={<AdminVisitAnalytics />} />
                  <Route path="chatbot" element={<AdminChatbot />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="settings/payment-methods" element={<AdminPaymentMethods />} />
                  <Route path="settings/shipping" element={<AdminShippingSettings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatbotWrapper />
            </BrowserRouter>
          </TooltipProvider>
        </ChatbotProvider>
      </AdminProvider>
    </CartProvider>
  </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;
