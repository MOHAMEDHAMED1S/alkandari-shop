import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, CheckCircle, XCircle, Clock, Truck, Package, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateOrderStatus } from '@/lib/api';
import { toast } from 'sonner';

interface Order {
  id: number;
  order_number: string;
  status: string;
  admin_notes?: string;
  tracking_number?: string;
  shipping_date?: string;
  delivery_date?: string;
}

interface OrderStatusUpdateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onSuccess: () => void;
}

const statusSchema = z.object({
  status: z.string().min(1, 'Status is required'),
  admin_notes: z.string().optional(),
  tracking_number: z.string().optional(),
  shipping_date: z.string().optional(),
  delivery_date: z.string().optional(),
});

type StatusFormData = z.infer<typeof statusSchema>;

const OrderStatusUpdate: React.FC<OrderStatusUpdateProps> = ({
  open,
  onOpenChange,
  order,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: '',
      admin_notes: '',
      tracking_number: '',
      shipping_date: '',
      delivery_date: '',
    },
  });

  // Update form when order changes
  React.useEffect(() => {
    if (order) {
      form.reset({
        status: order.status,
        admin_notes: order.admin_notes || '',
        tracking_number: order.tracking_number || '',
        shipping_date: order.shipping_date ? order.shipping_date.split('T')[0] : '',
        delivery_date: order.delivery_date ? order.delivery_date.split('T')[0] : '',
      });
    }
  }, [order, form]);

  const handleSubmit = async (data: StatusFormData) => {
    if (!order || !token) return;

    try {
      setLoading(true);
      
      const updateData = {
        ...data,
        shipping_date: data.shipping_date ? `${data.shipping_date}T00:00:00Z` : undefined,
        delivery_date: data.delivery_date ? `${data.delivery_date}T00:00:00Z` : undefined,
      };

      const response = await updateOrderStatus(token, order.id, updateData);
      
      if (response.success) {
        toast.success(t('admin.orders.orderStatusUpdated'));
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || t('admin.orders.statusUpdateError'));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(t('admin.orders.statusUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'awaiting_payment': return AlertTriangle;
      case 'paid': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'awaiting_payment': return 'red';
      case 'paid': return 'green';
      case 'shipped': return 'blue';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const statusOptions = [
    { value: 'pending', label: t('admin.orders.statuses.pending'), icon: Clock },
    { value: 'awaiting_payment', label: t('admin.orders.statuses.awaiting_payment'), icon: AlertTriangle },
    { value: 'paid', label: t('admin.orders.statuses.paid'), icon: CheckCircle },
    { value: 'shipped', label: t('admin.orders.statuses.shipped'), icon: Truck },
    { value: 'delivered', label: t('admin.orders.statuses.delivered'), icon: Package },
    { value: 'cancelled', label: t('admin.orders.statuses.cancelled'), icon: XCircle },
  ];

  const currentStatus = form.watch('status');
  const StatusIcon = getStatusIcon(currentStatus);
  const statusColor = getStatusColor(currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 text-${statusColor}-600`} />
              {t('admin.orders.updateStatus')} - #{order?.order_number}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {t('admin.orders.updateStatusDescription')}
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Current Status Display */}
            {order && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">{t('admin.orders.currentStatus')}</p>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 text-${statusColor}-600`} />
                      <span className="font-medium">
                        {t(`admin.orders.statuses.${order.status}`)}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Status Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.orders.newStatus')} *</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.orders.orderStatus')} *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.orders.selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Tracking Information */}
            {currentStatus === 'shipped' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.orders.trackingInformation')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tracking_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.orders.trackingNumber')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('admin.orders.trackingNumberPlaceholder')} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.orders.trackingNumberHelp')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shipping_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.orders.shippingDate')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Delivery Information */}
            {currentStatus === 'delivered' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('admin.orders.deliveryInformation')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.orders.deliveryDate')}</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Admin Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.orders.adminNotes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="admin_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.orders.addNote')}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={t('admin.orders.adminNotesPlaceholder')}
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('admin.orders.adminNotesHelp')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status Change Warning */}
            {order && currentStatus !== order.status && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <p className="font-medium">{t('admin.orders.statusChangeWarning')}</p>
                  <p className="text-sm mt-1">
                    {t('admin.orders.statusChangeDescription', {
                      from: t(`admin.orders.statuses.${order.status}`),
                      to: t(`admin.orders.statuses.${currentStatus}`)
                    })}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('admin.orders.updateStatus')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusUpdate;
