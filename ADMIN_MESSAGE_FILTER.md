# فلترة رسائل النظام في لوحة الأدمن

## 📋 المشكلة

عند عرض المحادثات في لوحة الأدمن، كانت رسائل المستخدم تحتوي على نص النظام التالي:

```
معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في  قاعده البيانات
```

هذا النص يتم إضافته تلقائياً من النظام لكل رسالة مستخدم، لكنه لا يجب أن يظهر في واجهة الأدمن.

---

## ✅ الحل المطبق

### التنفيذ في `AdminChatbot.tsx`:

```typescript
{conversationDetails.messages?.map((message: any) => {
  // إزالة نص النظام من رسائل المستخدم
  const cleanContent = message.role === 'user' 
    ? message.content.replace(/معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g, '').trim()
    : message.content;
  
  return (
    <div key={message.id}>
      <p className="text-sm whitespace-pre-wrap">{cleanContent}</p>
    </div>
  );
})}
```

---

## 🔧 كيف يعمل

### 1. **الفحص حسب الدور**:
```typescript
message.role === 'user'
```
- يتم تطبيق الفلترة فقط على رسائل المستخدم
- رسائل البوت (assistant) تبقى كما هي

### 2. **استخدام Regex**:
```typescript
/معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g
```
- `\s+` يطابق مسافة واحدة أو أكثر (للتعامل مع المسافات المختلفة)
- `g` flag لإزالة جميع التطابقات (global)

### 3. **تنظيف النص**:
```typescript
.replace(...).trim()
```
- `replace()` يزيل النص المطابق
- `trim()` يزيل المسافات الزائدة من البداية والنهاية

---

## 📊 أمثلة

### قبل:
```
كيف حالكممعلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في  قاعده البيانات
```

### بعد:
```
كيف حالكم
```

---

## 🎯 متى يتم التطبيق

### يتم الفلترة في:
- ✅ Dialog تفاصيل المحادثة في لوحة الأدمن
- ✅ عند عرض جميع رسائل المحادثة

### لا يتم الفلترة في:
- ❌ قاعدة البيانات (الرسالة الأصلية تبقى كما هي)
- ❌ الـ API responses (البيانات الخام تبقى كما هي)
- ❌ واجهة العملاء (العميل لا يرى هذه الرسائل أصلاً)

---

## 🔍 تفاصيل تقنية

### الكود الكامل:

```typescript
{conversationDetails.messages?.map((message: any) => {
  // إزالة نص النظام من رسائل المستخدم
  const cleanContent = message.role === 'user' 
    ? message.content.replace(
        /معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g, 
        ''
      ).trim()
    : message.content;
  
  return (
    <div
      key={message.id}
      className={`flex ${
        message.role === 'user' 
          ? (isRTL ? 'justify-start' : 'justify-end') 
          : (isRTL ? 'justify-end' : 'justify-start')
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-gray-700 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{cleanContent}</p>
        <p className="text-xs mt-1 opacity-70">
          {new Date(message.sent_at).toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US')}
        </p>
      </div>
    </div>
  );
})}
```

---

## 🧪 الاختبار

### سيناريو 1: رسالة عادية
**المدخل**:
```json
{
  "role": "user",
  "content": "مرحباً"
}
```

**المخرج**:
```
مرحباً
```

### سيناريو 2: رسالة مع نص النظام
**المدخل**:
```json
{
  "role": "user",
  "content": "كيف حالكممعلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في  قاعده البيانات"
}
```

**المخرج**:
```
كيف حالكم
```

### سيناريو 3: رسالة البوت
**المدخل**:
```json
{
  "role": "assistant",
  "content": "أهلاً بك! معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في  قاعده البيانات"
}
```

**المخرج** (بدون تغيير):
```
أهلاً بك! معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في  قاعده البيانات
```

---

## 📍 موقع التعديل

**الملف**: `front-end/src/pages/admin/AdminChatbot.tsx`

**الأسطر**: 1138-1164

**الدالة**: عرض تفاصيل المحادثة في Dialog

---

## 🔄 التحسينات المستقبلية

### 1. **فلترة متعددة**:
إذا كان هناك نصوص نظام أخرى:
```typescript
const systemTexts = [
  /معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g,
  /نص نظام آخر/g,
  // المزيد...
];

let cleanContent = message.content;
if (message.role === 'user') {
  systemTexts.forEach(regex => {
    cleanContent = cleanContent.replace(regex, '').trim();
  });
}
```

### 2. **دالة منفصلة**:
```typescript
const cleanSystemText = (content: string, isUserMessage: boolean): string => {
  if (!isUserMessage) return content;
  
  return content
    .replace(/معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g, '')
    .trim();
};

// الاستخدام
const cleanContent = cleanSystemText(message.content, message.role === 'user');
```

### 3. **تخزين في constants**:
```typescript
// constants/systemMessages.ts
export const SYSTEM_MESSAGE_PATTERNS = {
  PRODUCT_WARNING: /معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g,
};

// الاستخدام
import { SYSTEM_MESSAGE_PATTERNS } from '@/constants/systemMessages';

const cleanContent = message.role === 'user' 
  ? message.content.replace(SYSTEM_MESSAGE_PATTERNS.PRODUCT_WARNING, '').trim()
  : message.content;
```

---

## 🚨 ملاحظات مهمة

### 1. **البيانات الأصلية**:
- الفلترة تحدث فقط عند العرض (Client-side)
- البيانات في قاعدة البيانات تبقى كما هي
- الـ API responses تحتوي على النص الكامل

### 2. **الأداء**:
- Regex يتم تطبيقه على كل رسالة عند العرض
- لا يؤثر على الأداء إلا في المحادثات الطويلة جداً (>1000 رسالة)
- يمكن تحسينه باستخدام useMemo إذا لزم الأمر

### 3. **التوافقية**:
- يعمل مع جميع المتصفحات الحديثة
- Regex في JavaScript مدعوم بشكل كامل
- لا حاجة لـ polyfills

---

## 🎨 البدائل

### البديل 1: فلترة في Backend
```php
// في Laravel Controller
public function show($sessionId) {
    $conversation = Conversation::with('messages')->find($sessionId);
    
    $conversation->messages = $conversation->messages->map(function($message) {
        if ($message->role === 'user') {
            $message->content = preg_replace(
                '/معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/',
                '',
                $message->content
            );
        }
        return $message;
    });
    
    return response()->json($conversation);
}
```

**المميزات**:
- ✅ فلترة مركزية
- ✅ يقلل حجم البيانات المنقولة

**العيوب**:
- ❌ يغير البيانات قبل الإرسال
- ❌ صعب تتبع البيانات الأصلية

### البديل 2: استخدام useMemo
```typescript
const cleanedMessages = useMemo(() => {
  return conversationDetails?.messages?.map(message => ({
    ...message,
    content: message.role === 'user'
      ? message.content.replace(/معلومات من النظام: يجب دائما عدم ذكر اي منتج غير موجود في\s+قاعده البيانات/g, '').trim()
      : message.content
  }));
}, [conversationDetails?.messages]);

// ثم استخدام cleanedMessages في العرض
```

**المميزات**:
- ✅ أداء أفضل (لا يعيد الحساب إلا عند التغيير)
- ✅ كود أنظف

**العيوب**:
- ❌ أكثر تعقيداً قليلاً

---

## 📝 الخلاصة

تم تطبيق فلترة بسيطة وفعالة لإزالة نص النظام من رسائل المستخدم عند عرضها في لوحة الأدمن:

- ✅ يعمل فقط على رسائل المستخدم
- ✅ لا يؤثر على البيانات الأصلية
- ✅ كود بسيط وواضح
- ✅ لا يؤثر على الأداء
- ✅ سهل الصيانة والتحديث

---

تم التحديث بتاريخ: 22 أكتوبر 2025
الإصدار: 1.0

