# إعدادات الشات بوت في لوحة التحكم

## ✅ تم الإنجاز

تم إضافة صفحة شاملة لإدارة الشات بوت في لوحة التحكم (Admin Panel) مع جميع الميزات المطلوبة!

---

## 🎯 الميزات المضافة

### 1. واجهة إدارة شاملة

صفحة `/admin/chatbot` تحتوي على 3 تبويبات:

#### تبويب الإعدادات 🛠️
- **الإعدادات الأساسية:**
  - اسم الشات بوت
  - رسالة الترحيب
  - تفعيل/إيقاف الشات بوت
  - System Prompt (تعليمات النظام)

- **إعدادات الذكاء الاصطناعي:**
  - اختيار نموذج AI (Gemini 1.5/2.0)
  - درجة الحرارة (Creativity)
  - الحد الأقصى للرموز
  - طول المحادثة
  - رموز كل رسالة

- **الوصول للمنتجات:**
  - جميع المنتجات
  - منتجات محددة
  - معطل

#### تبويب الإحصائيات 📊
- إجمالي المحادثات
- المحادثات النشطة
- إجمالي الرسائل
- متوسط الرسائل لكل محادثة
- الإحصائيات اليومية (آخر 7 أيام)

#### تبويب المحادثات 💬
- قائمة بجميع المحادثات
- عرض حالة كل محادثة (نشط/منتهي)
- عدد الرسائل في كل محادثة
- تاريخ بدء المحادثة
- حذف محادثة محددة
- حذف المحادثات القديمة (أقدم من 30 يوم)
- Pagination

---

## 📁 الملفات المضافة/المحدثة

### 1. APIs في `lib/api.ts`

تم إضافة جميع الـ APIs المطلوبة:

```typescript
// الإعدادات
getChatbotSettings(token)
updateChatbotSettings(token, settings)

// الإحصائيات
getChatbotStatistics(token, days)

// المحادثات
getChatbotConversations(token, params)
getChatbotConversationDetails(token, sessionId)
deleteChatbotConversation(token, sessionId)
clearOldChatbotConversations(token, daysOld)

// المنتجات
getChatbotProducts(token, params)

// الاختبار
testChatbotConfiguration(token, testMessage)
```

### 2. صفحة `AdminChatbot.tsx`

صفحة كاملة مع:
- ✅ 3 تبويبات (إعدادات، إحصائيات، محادثات)
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ RTL support
- ✅ Animations مع Framer Motion
- ✅ Alert dialogs للحذف
- ✅ Pagination

### 3. تحديث `App.tsx`

```tsx
// إضافة المسار
<Route path="chatbot" element={<AdminChatbot />} />
```

### 4. تحديث `AdminLayout.tsx`

```tsx
// إضافة رابط في القائمة الجانبية
{
  name: i18n.language === 'ar' ? 'الشات بوت' : 'Chatbot',
  href: '/admin/chatbot',
  icon: Bot,
  current: location.pathname.startsWith('/admin/chatbot'),
}
```

---

## 🚀 كيفية الاستخدام

### الوصول للصفحة:

1. سجل الدخول إلى لوحة التحكم `/admin/login`
2. من القائمة الجانبية، اختر **"الشات بوت"** 🤖
3. أو اذهب مباشرة إلى `/admin/chatbot`

### تعديل الإعدادات:

#### الخطوة 1: الإعدادات الأساسية
```
1. اكتب اسم الشات بوت
2. اكتب رسالة الترحيب
3. اكتب System Prompt (التعليمات للـ AI)
4. فعّل/أوقف الشات بوت
```

#### الخطوة 2: إعدادات الذكاء الاصطناعي
```
1. اختر نموذج AI (Gemini 1.5 Flash مثلاً)
2. اضبط درجة الحرارة (0.7 للتوازن)
3. حدد الحد الأقصى للرموز (1000-2000)
4. اضبط طول المحادثة
```

#### الخطوة 3: الوصول للمنتجات
```
1. اختر "جميع المنتجات" للسماح بكل المنتجات
2. أو "منتجات محددة" لتحديد منتجات معينة
3. أو "معطل" لإيقاف اقتراح المنتجات
```

#### الخطوة 4: الحفظ والاختبار
```
1. اضغط "اختبار التكوين" للتأكد من صحة الإعدادات
2. اضغط "حفظ الإعدادات" لحفظ التغييرات
```

---

## 📊 مراجعة الإحصائيات

### في تبويب الإحصائيات:

**البطاقات العلوية:**
- إجمالي المحادثات
- المحادثات النشطة حالياً
- إجمالي الرسائل
- متوسط الرسائل لكل محادثة

**الإحصائيات اليومية:**
- عدد المحادثات لكل يوم
- عدد الرسائل لكل يوم
- آخر 7 أيام بشكل افتراضي

---

## 💬 إدارة المحادثات

### في تبويب المحادثات:

**القائمة الرئيسية:**
- عرض جميع المحادثات
- Badge يوضح الحالة (نشط/منتهي)
- اسم العميل أو Session ID
- عدد الرسائل
- تاريخ البدء

**الإجراءات:**
- 👁️ **عرض** - عرض تفاصيل المحادثة
- 🗑️ **حذف** - حذف محادثة محددة

**حذف المحادثات القديمة:**
- زر "حذف القديمة" في الأعلى
- يحذف جميع المحادثات الأقدم من 30 يوم
- Alert dialog للتأكيد قبل الحذف

---

## 🎨 التصميم

### المميزات:

- ✅ **تصميم أنيق** مع ألوان محايدة
- ✅ **RTL Support** كامل للغة العربية
- ✅ **Animations** سلسة مع Framer Motion
- ✅ **Loading States** واضحة
- ✅ **Error Handling** شامل
- ✅ **Toast Notifications** للتفاعل
- ✅ **Alert Dialogs** للإجراءات الحساسة
- ✅ **Responsive** على جميع الشاشات

### الألوان:

```css
الأزرار الرئيسية: bg-gray-800 hover:bg-gray-900
البطاقات: bg-white border-gray-200
النصوص: text-gray-800 / text-gray-600
الأيقونات: text-gray-500
```

---

## 🔌 الـ APIs المستخدمة

جميع الـ APIs موثقة في `ADMIN_CHATBOT_API_DOCUMENTATION.md`:

### الإعدادات:
```
GET  /api/v1/admin/chatbot/settings
PUT  /api/v1/admin/chatbot/settings
```

### الإحصائيات:
```
GET  /api/v1/admin/chatbot/statistics?days=30
```

### المحادثات:
```
GET    /api/v1/admin/chatbot/conversations
GET    /api/v1/admin/chatbot/conversations/{session_id}
DELETE /api/v1/admin/chatbot/conversations/{session_id}
DELETE /api/v1/admin/chatbot/conversations/clear-old
```

### الاختبار:
```
POST /api/v1/admin/chatbot/test
```

---

## ⚙️ النماذج (Types/Interfaces)

### ChatbotSettings:
```typescript
interface ChatbotSettings {
  name: string;
  system_prompt: string;
  welcome_message: string;
  is_active: boolean;
  product_access_type: 'all' | 'specific' | 'none';
  allowed_product_ids?: number[];
  ai_settings: {
    model: string;
    temperature: number;
    max_tokens: number;
    top_p?: number;
  };
  max_conversation_length: number;
  token_limit_per_message: number;
}
```

### ChatbotStatistics:
```typescript
interface ChatbotStatistics {
  total_conversations: number;
  active_conversations: number;
  total_messages: number;
  average_messages_per_conversation: number;
  daily_stats: Array<{
    date: string;
    conversations: number;
    messages: number;
  }>;
  hourly_distribution: Record<string, number>;
}
```

### ChatbotConversation:
```typescript
interface ChatbotConversation {
  id: number;
  session_id: string;
  customer_name?: string;
  customer_email?: string;
  status: 'active' | 'ended';
  message_count: number;
  started_at: string;
  last_activity: string;
  ended_at?: string;
}
```

---

## ✅ قائمة التحقق

- [x] إضافة APIs في `api.ts`
- [x] إنشاء `ChatbotSettings` interface
- [x] إنشاء `ChatbotStatistics` interface
- [x] إنشاء `ChatbotConversation` interface
- [x] إنشاء صفحة `AdminChatbot.tsx`
- [x] إضافة تبويب الإعدادات
- [x] إضافة تبويب الإحصائيات
- [x] إضافة تبويب المحادثات
- [x] إضافة المسار في `App.tsx`
- [x] إضافة الرابط في `AdminLayout.tsx`
- [x] إضافة `Bot` icon
- [x] دعم RTL كامل
- [x] Error handling شامل
- [x] Loading states
- [x] Toast notifications
- [x] Alert dialogs
- [x] Pagination
- [x] اختبار التكوين
- [x] بدون أخطاء برمجية

---

## 🔍 اختبار الوظائف

### اختبار 1: تحديث الإعدادات

```
1. اذهب إلى /admin/chatbot
2. عدّل اسم الشات بوت
3. اضغط "حفظ الإعدادات"
✓ يجب أن ترى toast notification "تم حفظ الإعدادات بنجاح"
```

### اختبار 2: اختبار التكوين

```
1. اذهب إلى تبويب الإعدادات
2. اضغط "اختبار التكوين"
✓ يجب أن ترى نتيجة الاختبار في toast
```

### اختبار 3: عرض الإحصائيات

```
1. اذهب إلى تبويب الإحصائيات
✓ يجب أن ترى البطاقات مع الأرقام
✓ يجب أن ترى الإحصائيات اليومية
```

### اختبار 4: إدارة المحادثات

```
1. اذهب إلى تبويب المحادثات
✓ يجب أن ترى قائمة المحادثات
✓ يمكنك حذف محادثة محددة
✓ يمكنك حذف المحادثات القديمة
```

---

## 🐛 حل المشاكل

### المشكلة: لا تظهر الصفحة

**الحل:**
1. تأكد من تسجيل الدخول كـ Admin
2. تحقق من وجود المسار في `App.tsx`
3. افحص Console للأخطاء

### المشكلة: فشل تحميل الإعدادات

**الحل:**
1. تحقق من اتصال Backend
2. تأكد من وجود token صحيح
3. افحص Network tab في DevTools

### المشكلة: لا يحفظ الإعدادات

**الحل:**
1. تحقق من صحة البيانات المدخلة
2. افحص Console للأخطاء
3. تأكد من صحة token

---

## 🎯 الخطوات التالية

### تحسينات مستقبلية:

1. **عرض تفاصيل المحادثة** 📝
   - صفحة منفصلة لعرض جميع رسائل محادثة محددة

2. **تصدير البيانات** 📊
   - تصدير الإحصائيات إلى Excel/PDF
   - تصدير المحادثات

3. **تحليل متقدم** 📈
   - رسوم بيانية للإحصائيات
   - تحليل المواضيع الشائعة
   - أوقات الذروة

4. **إشعارات** 🔔
   - تنبيهات عند بدء محادثة جديدة
   - تقارير دورية

5. **اختيار المنتجات المحددة** 🛍️
   - واجهة لاختيار منتجات محددة
   - معاينة المنتجات المختارة

---

## 📚 الملفات المرجعية

1. **`ADMIN_CHATBOT_API_DOCUMENTATION.md`** - توثيق كامل للـ APIs
2. **`CHATBOT_API_DOCUMENTATION.md`** - APIs الشات بوت العامة
3. **`AI_CHATBOT_INSTRUCTIONS.md`** - تعليمات الـ AI
4. **`CHATBOT_DESIGN_UPDATES.md`** - تحديثات التصميم
5. **`README_CHATBOT.md`** - دليل الشات بوت

---

## ✨ الخلاصة

تم إضافة صفحة شاملة لإدارة الشات بوت في لوحة التحكم مع:

- ✅ واجهة سهلة الاستخدام
- ✅ إعدادات كاملة للشات بوت
- ✅ إحصائيات مفصلة
- ✅ إدارة المحادثات
- ✅ دعم كامل للعربية (RTL)
- ✅ تصميم أنيق ومنظم
- ✅ بدون أخطاء برمجية

---

**تاريخ التحديث:** 21 أكتوبر 2025

**الإصدار:** 1.0

**الحالة:** ✅ جاهز للاستخدام

