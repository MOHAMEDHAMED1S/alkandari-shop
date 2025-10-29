# إصلاح استدعاء API من Front-end

## 🐛 المشكلة

كان الطلب يتم من Front-end مباشرة باستخدام `fetch` مع رابط خاطئ:

```
http://localhost:8080/admin/undefined/api/v1/admin/chatbot/conversations/YFetAtMmmWHbvTHyf1iT1Me4kSPaNEz3
```

### سبب المشكلة:
1. استخدام `fetch` مباشرة بدلاً من دوال `api.ts`
2. الاعتماد على `import.meta.env.VITE_API_URL` الذي كان `undefined`
3. الرابط النسبي تم إضافته للمسار الحالي `/admin/chatbot`

---

## ✅ الحل

### 1. تحديث دالة `getChatbotConversationDetails` في `api.ts`

#### قبل:
```typescript
export const getChatbotConversationDetails = async (token: string, sessionId: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      conversation: ChatbotConversation;
      messages: Array<{
        id: number;
        sender: 'user' | 'bot';
        message: string;
        timestamp: string;
      }>;
    };
  }>(`/admin/chatbot/conversations/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

#### بعد:
```typescript
export const getChatbotConversationDetails = async (token: string, sessionId: string) => {
  const response = await api.get<{
    success: boolean;
    data: {
      id: number;
      session_id: string;
      status: string;
      message_count: number;
      created_at: string;
      last_activity_at: string;
      messages: Array<{
        id: number;
        conversation_id: number;
        role: 'user' | 'assistant';
        content: string;
        metadata: any;
        sent_at: string;
      }>;
    };
  }>(`/admin/chatbot/conversations/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

**التغييرات**:
- ✅ تحديث interface ليطابق شكل الاستجابة الحقيقي
- ✅ تغيير `conversation` object إلى بيانات مباشرة
- ✅ تغيير `sender` إلى `role`
- ✅ تغيير `message` إلى `content`
- ✅ تغيير `timestamp` إلى `sent_at`
- ✅ إضافة `metadata`

---

### 2. تحديث `AdminChatbot.tsx`

#### إضافة Import:
```typescript
import {
  getChatbotSettings,
  updateChatbotSettings,
  getChatbotStatistics,
  getChatbotConversations,
  getChatbotConversationDetails,  // ✅ تم إضافتها
  testChatbotConfiguration,
  clearOldChatbotConversations,
  deleteChatbotConversation,
  type ChatbotSettings,
  type ChatbotStatistics,
  type ChatbotConversation
} from '@/lib/api';
```

#### قبل (باستخدام fetch):
```typescript
const loadConversationDetails = async (sessionId: string) => {
  try {
    setLoadingDetails(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/chatbot/conversations/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load conversation details');
    }
    
    const data = await response.json();
    setConversationDetails(data.data);
  } catch (error) {
    console.error('Error loading conversation details:', error);
    toast.error('فشل في تحميل تفاصيل المحادثة');
  } finally {
    setLoadingDetails(false);
  }
};
```

#### بعد (باستخدام api.ts):
```typescript
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
```

**المميزات**:
- ✅ رابط API صحيح تلقائياً
- ✅ معالجة أخطاء موحدة
- ✅ TypeScript type safety
- ✅ كود أقصر وأوضح
- ✅ سهولة الصيانة

---

## 🔧 كيف يعمل api.ts

### الإعداد الأساسي:
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

### عند استدعاء:
```typescript
api.get('/admin/chatbot/conversations/123', {
  headers: { Authorization: 'Bearer token' }
});
```

**ينتج عنه**:
```
GET http://localhost:8080/api/v1/admin/chatbot/conversations/123
```

**لماذا يعمل؟**
1. `baseURL` مضبوط بشكل صحيح
2. المسار يبدأ بـ `/` لذلك يتم دمجه مع `baseURL`
3. لا حاجة لـ `undefined` أو روابط نسبية

---

## 🎯 الفوائد

### 1. **مركزية الإعدادات**
جميع طلبات API تستخدم نفس الإعداد:
- Base URL
- Headers افتراضية
- Interceptors للأخطاء
- Timeout settings

### 2. **Type Safety**
TypeScript يتحقق من:
- نوع البيانات المرسلة
- نوع البيانات المستقبلة
- الأخطاء المحتملة

### 3. **معالجة الأخطاء الموحدة**
```typescript
api.interceptors.response.use(
  response => response,
  error => {
    // معالجة موحدة للأخطاء
    if (error.response?.status === 401) {
      // إعادة توجيه لتسجيل الدخول
    }
    return Promise.reject(error);
  }
);
```

### 4. **سهولة الصيانة**
لتغيير Base URL، فقط عدل ملف `.env`:
```env
VITE_API_URL=https://api.production.com
```

---

## 📋 قائمة التحقق

### للمطورين:
- ✅ **لا تستخدم `fetch` مباشرة**
- ✅ استخدم دوال من `api.ts`
- ✅ تأكد من وجود الدالة في `api.ts`
- ✅ إذا لم تكن موجودة، أنشئها
- ✅ تأكد من صحة TypeScript interfaces

### للمراجعة:
```typescript
// ❌ خطأ
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/...`);

// ✅ صحيح
const response = await apiFunction(token, params);
```

---

## 🔍 الأخطاء الشائعة وحلولها

### 1. **`undefined` في الرابط**
**السبب**: استخدام `import.meta.env.VITE_API_URL` مباشرة
**الحل**: استخدام `api.ts`

### 2. **CORS errors**
**السبب**: طلب من domain مختلف
**الحل**: `api.ts` يضبط Headers صحيحة

### 3. **401 Unauthorized**
**السبب**: عدم إرسال Token
**الحل**: دوال `api.ts` تستقبل token كـ parameter

### 4. **Type errors**
**السبب**: interface غير متطابق مع API
**الحل**: تحديث interface في `api.ts`

---

## 📚 دوال API المتاحة للـ Chatbot

### الإعدادات:
```typescript
getChatbotSettings(token: string)
updateChatbotSettings(token: string, settings: ChatbotSettings)
testChatbotConfiguration(token: string, testMessage: string)
```

### الإحصائيات:
```typescript
getChatbotStatistics(token: string, days: number)
```

### المحادثات:
```typescript
getChatbotConversations(token: string, params: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
})

getChatbotConversationDetails(token: string, sessionId: string)

deleteChatbotConversation(token: string, sessionId: string)

clearOldChatbotConversations(token: string, daysOld: number)
```

### المنتجات:
```typescript
getChatbotProducts(token: string, params: {
  search?: string;
  per_page?: number;
  page?: number;
})
```

---

## 🚀 أفضل الممارسات

### 1. **دائماً استخدم api.ts**
```typescript
// ✅ جيد
import { getResource } from '@/lib/api';
const data = await getResource(token, id);

// ❌ سيء
const response = await fetch('/api/resource');
```

### 2. **أضف types صحيحة**
```typescript
export const getResource = async (token: string, id: number) => {
  const response = await api.get<{
    success: boolean;
    data: ResourceType;
  }>(`/resources/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### 3. **معالجة الأخطاء**
```typescript
try {
  const data = await getResource(token, id);
  // استخدم البيانات
} catch (error) {
  console.error('Error:', error);
  toast.error('فشل في تحميل البيانات');
}
```

### 4. **استخدم environment variables**
```env
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.production.com
```

---

## 📝 الخلاصة

تم إصلاح المشكلة بنجاح من خلال:

1. ✅ تحديث `getChatbotConversationDetails` في `api.ts`
2. ✅ استخدام الدالة في `AdminChatbot.tsx` بدلاً من `fetch`
3. ✅ تحديث TypeScript interfaces لتطابق الاستجابة الفعلية
4. ✅ إزالة الاعتماد المباشر على `import.meta.env.VITE_API_URL`

**النتيجة**:
```
✅ http://localhost:8080/api/v1/admin/chatbot/conversations/YFetAtMmmWHbvTHyf1iT1Me4kSPaNEz3
❌ http://localhost:8080/admin/undefined/api/v1/admin/chatbot/conversations/YFetAtMmmWHbvTHyf1iT1Me4kSPaNEz3
```

---

تم التحديث بتاريخ: 22 أكتوبر 2025
الإصدار: 1.0

