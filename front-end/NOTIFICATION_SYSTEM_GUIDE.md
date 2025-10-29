# نظام الإشعارات الجديد

## نظرة عامة

تم إنشاء نظام إشعارات جديد يعتمد على **مقارنة عدد الإشعارات** بدلاً من Pusher للكشف عن الإشعارات الجديدة. هذا النظام يوفر:

- ✅ إشعارات Toast مع صوت
- ✅ إشعارات المتصفح للجهاز
- ✅ تحديث تلقائي كل 8 ثوانٍ
- ✅ صوت إشعارات محسن
- ✅ دعم اللغة العربية

## المكونات الجديدة

### 1. `useNotificationPolling` Hook

```typescript
// src/hooks/useNotificationPolling.ts
const { stats, refreshNotifications } = useNotificationPolling({
  token,
  interval: 8000, // 8 seconds
  onNewNotification: (notification) => {
    // Handle new notification
  }
});
```

**الميزات:**
- فحص تلقائي كل 8 ثوانٍ
- مقارنة عدد الإشعارات غير المقروءة
- إشعارات Toast تلقائية
- إشعارات المتصفح مع صوت
- إحصائيات محدثة

### 2. `NotificationBell` المحدث

تم تحديث مكون `NotificationBell` لاستخدام النظام الجديد:

- إزالة اعتماد Pusher/Echo
- استخدام `useNotificationPolling` Hook
- تحديث تلقائي للإحصائيات
- إشعارات فورية عند وصول إشعارات جديدة

### 3. `TestNotificationForm` مكون تجريبي

مكون جديد لاختبار نظام الإشعارات:

```typescript
<TestNotificationForm token={token} />
```

**الميزات:**
- إنشاء إشعارات تجريبية
- أنواع مختلفة من الإشعارات
- مستويات أولوية مختلفة
- واجهة سهلة الاستخدام

## كيفية العمل

### 1. آلية الكشف عن الإشعارات الجديدة

```typescript
// مقارنة عدد الإشعارات غير المقروءة
if (currentUnreadCount > lastNotificationCount && lastNotificationCount > 0) {
  const newNotifications = currentNotifications.slice(0, currentUnreadCount - lastNotificationCount);
  
  // عرض الإشعارات الجديدة
  newNotifications.forEach(notification => {
    showToastNotification(notification);
    showBrowserNotification(notification);
  });
}
```

### 2. إشعارات Toast

```typescript
toast.success(title, {
  description: message,
  duration: priority === 'high' ? 8000 : 4000,
  style: {
    direction: 'rtl',
    textAlign: 'right',
  },
  className: 'rtl-toast',
});
```

### 3. إشعارات المتصفح

```typescript
showNotification(title, message, type);
```

**الميزات:**
- صوت إشعارات محسن (ألحان موسيقية)
- إشعارات فريدة لكل إشعار
- تفاعل مع النقر للتركيز على النافذة
- دعم اللغة العربية

## الإعدادات

### متغيرات البيئة المطلوبة

```env
# لا حاجة لمتغيرات Pusher
# النظام يعمل بدون Pusher
```

### تخصيص الفترة الزمنية

```typescript
const { stats } = useNotificationPolling({
  token,
  interval: 5000, // 5 seconds (افتراضي: 8 seconds)
});
```

## الاستخدام

### 1. في مكون الإشعارات

```typescript
import { useNotificationPolling } from '@/hooks/useNotificationPolling';

const { stats, refreshNotifications } = useNotificationPolling({
  token,
  onNewNotification: (notification) => {
    console.log('New notification:', notification);
  }
});
```

### 2. في لوحة الإدارة

```typescript
import { NotificationBell, TestNotificationForm } from '@/components/admin/notifications';

// في التطوير فقط
{process.env.NODE_ENV === 'development' && (
  <TestNotificationForm token={token} />
)}
```

## المزايا

### ✅ مقارنة Pusher

| الميزة | النظام الجديد | Pusher |
|--------|-------------|--------|
| التكلفة | مجاني | مدفوع |
| التعقيد | بسيط | معقد |
| الاعتمادية | عالية | متوسطة |
| الصوت | محسن | أساسي |
| العربية | مدعومة | محدود |

### ✅ الميزات الجديدة

1. **صوت إشعارات محسن**: ألحان موسيقية بدلاً من صوت بسيط
2. **إشعارات فريدة**: كل إشعار له معرف فريد
3. **تفاعل محسن**: النقر على الإشعار يفتح النافذة
4. **دعم عربي كامل**: اتجاه النص والترتيب
5. **اختبار سهل**: مكون تجريبي مدمج

## استكشاف الأخطاء

### 1. الإشعارات لا تظهر

```typescript
// تحقق من وجود التوكن
if (!token) {
  console.error('No token provided');
  return;
}

// تحقق من صلاحيات الإشعارات
if (Notification.permission !== 'granted') {
  console.warn('Notification permission not granted');
}
```

### 2. الصوت لا يعمل

```typescript
// تحقق من دعم Web Audio API
if (!window.AudioContext && !window.webkitAudioContext) {
  console.warn('Web Audio API not supported');
}
```

### 3. الإشعارات لا تحدث

```typescript
// تحقق من الاتصال بالخادم
try {
  const response = await getAdminNotifications(token);
  console.log('API Response:', response);
} catch (error) {
  console.error('API Error:', error);
}
```

## التطوير المستقبلي

### ميزات مقترحة

1. **إشعارات مخصصة**: إعدادات صوت ولون مختلفة
2. **تصفية الإشعارات**: حسب النوع والأولوية
3. **تاريخ الإشعارات**: عرض الإشعارات السابقة
4. **إشعارات المجموعات**: تجميع الإشعارات المتشابهة
5. **إشعارات خارجية**: Telegram, Discord, إلخ

### تحسينات الأداء

1. **تخزين مؤقت**: حفظ الإشعارات محلياً
2. **ضغط البيانات**: تقليل حجم الاستجابات
3. **تحسين الشبكة**: استخدام WebSocket عند الحاجة
4. **ذاكرة محسنة**: تنظيف الإشعارات القديمة

## الخلاصة

النظام الجديد يوفر حلاً بسيطاً وفعالاً للإشعارات بدون الحاجة لخدمات خارجية مثل Pusher. النظام يعتمد على مقارنة عدد الإشعارات ويوفر تجربة مستخدم محسنة مع صوت وإشعارات متصفح.
