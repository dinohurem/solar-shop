import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap, tap } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { EmailService } from '../../../../services/email.service';
import * as OrdersActions from './orders.actions';
import { Order } from '../../../../shared/models/order.model';
import { Review } from '../../../../shared/models/review.model';

@Injectable()
export class OrdersEffects {

    constructor(
        private actions$: Actions,
        private supabaseService: SupabaseService,
        private toastService: ToastService,
        private translationService: TranslationService,
        private emailService: EmailService
    ) { }

    loadOrders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadOrders),
            switchMap(() =>
                this.supabaseService.getTable('orders').then(async (ordersData) => {
                    // Load orders with related data
                    const ordersWithItems: Order[] = [];

                    for (const orderData of ordersData || []) {
                        try {
                            // Load order items
                            const orderItemsData = await this.supabaseService.getTable('order_items', {
                                order_id: orderData.id
                            });

                            // Convert database order to Order model
                            const order: Order = {
                                id: orderData.id,
                                orderNumber: orderData.order_number,
                                userId: orderData.user_id,
                                customerEmail: orderData.customer_email,
                                customerName: orderData.customer_name,
                                customerPhone: orderData.customer_phone,
                                totalAmount: orderData.total_amount,
                                subtotal: orderData.subtotal,
                                taxAmount: orderData.tax_amount || 0,
                                shippingCost: orderData.shipping_cost || 0,
                                discountAmount: orderData.discount_amount || 0,
                                status: orderData.status,
                                paymentStatus: orderData.payment_status,
                                shippingStatus: orderData.shipping_status,
                                paymentMethod: orderData.payment_method,
                                orderDate: orderData.order_date,
                                shippingAddress: orderData.shipping_address,
                                billingAddress: orderData.billing_address,
                                trackingNumber: orderData.tracking_number,
                                notes: orderData.notes,
                                adminNotes: orderData.admin_notes,
                                is_b2b: (orderData as any).is_b2b,
                                items: (orderItemsData || []).map((itemData: any) => ({
                                    id: itemData.id,
                                    orderId: itemData.order_id,
                                    productId: itemData.product_id,
                                    productName: itemData.product_name,
                                    productSku: itemData.product_sku,
                                    quantity: itemData.quantity,
                                    unitPrice: itemData.unit_price,
                                    totalPrice: itemData.total_price,
                                    productImageUrl: itemData.product_image_url,
                                    productSpecifications: itemData.product_specifications,
                                    createdAt: itemData.created_at
                                })),
                                createdAt: orderData.created_at,
                                updatedAt: orderData.updated_at
                            };

                            ordersWithItems.push(order);
                        } catch (itemError) {
                            console.error('Error loading order items:', itemError);
                            // Continue with order but empty items
                            const order: Order = {
                                id: orderData.id,
                                orderNumber: orderData.order_number,
                                userId: orderData.user_id,
                                customerEmail: orderData.customer_email,
                                customerName: orderData.customer_name,
                                customerPhone: orderData.customer_phone,
                                totalAmount: orderData.total_amount,
                                subtotal: orderData.subtotal,
                                taxAmount: orderData.tax_amount || 0,
                                shippingCost: orderData.shipping_cost || 0,
                                discountAmount: orderData.discount_amount || 0,
                                status: orderData.status,
                                paymentStatus: orderData.payment_status,
                                shippingStatus: orderData.shipping_status,
                                paymentMethod: orderData.payment_method,
                                orderDate: orderData.order_date,
                                shippingAddress: orderData.shipping_address,
                                billingAddress: orderData.billing_address,
                                trackingNumber: orderData.tracking_number,
                                notes: orderData.notes,
                                adminNotes: orderData.admin_notes,
                                is_b2b: (orderData as any).is_b2b,
                                items: [],
                                createdAt: orderData.created_at,
                                updatedAt: orderData.updated_at
                            };
                            ordersWithItems.push(order);
                        }
                    }

                    return OrdersActions.loadOrdersSuccess({ orders: ordersWithItems });
                }).catch(error =>
                    OrdersActions.loadOrdersFailure({ error: error.message })
                )
            )
        )
    );

    loadUserOrders$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadUserOrders),
            switchMap(({ userEmail }) =>
                this.supabaseService.getTable('orders', { customer_email: userEmail }).then(async (ordersData) => {
                    console.log('Loading orders for user email:', userEmail, 'Found orders:', ordersData?.length || 0);

                    const ordersWithItems: Order[] = [];

                    for (const orderData of ordersData || []) {
                        try {
                            // Load order items
                            const orderItemsData = await this.supabaseService.getTable('order_items', {
                                order_id: orderData.id
                            });

                            // Convert database order to Order model
                            const order: Order = {
                                id: orderData.id,
                                orderNumber: orderData.order_number,
                                userId: orderData.user_id,
                                customerEmail: orderData.customer_email,
                                customerName: orderData.customer_name,
                                customerPhone: orderData.customer_phone,
                                totalAmount: orderData.total_amount,
                                subtotal: orderData.subtotal,
                                taxAmount: orderData.tax_amount || 0,
                                shippingCost: orderData.shipping_cost || 0,
                                discountAmount: orderData.discount_amount || 0,
                                status: orderData.status,
                                paymentStatus: orderData.payment_status,
                                shippingStatus: orderData.shipping_status,
                                paymentMethod: orderData.payment_method,
                                orderDate: orderData.order_date,
                                shippingAddress: orderData.shipping_address,
                                billingAddress: orderData.billing_address,
                                trackingNumber: orderData.tracking_number,
                                notes: orderData.notes,
                                adminNotes: orderData.admin_notes,
                                is_b2b: (orderData as any).is_b2b,
                                items: (orderItemsData || []).map((itemData: any) => ({
                                    id: itemData.id,
                                    orderId: itemData.order_id,
                                    productId: itemData.product_id,
                                    productName: itemData.product_name,
                                    productSku: itemData.product_sku,
                                    quantity: itemData.quantity,
                                    unitPrice: itemData.unit_price,
                                    totalPrice: itemData.total_price,
                                    discountAmount: itemData.discount_amount,
                                    discountPercentage: itemData.discount_percentage,
                                    productImageUrl: itemData.product_image_url,
                                    productSpecifications: itemData.product_specifications,
                                    createdAt: itemData.created_at
                                })),
                                createdAt: orderData.created_at,
                                updatedAt: orderData.updated_at
                            };

                            ordersWithItems.push(order);
                        } catch (itemError) {
                            console.error('Error loading order items for user order:', itemError);
                            // Continue with order but empty items
                            const order: Order = {
                                id: orderData.id,
                                orderNumber: orderData.order_number,
                                userId: orderData.user_id,
                                customerEmail: orderData.customer_email,
                                customerName: orderData.customer_name,
                                customerPhone: orderData.customer_phone,
                                totalAmount: orderData.total_amount,
                                subtotal: orderData.subtotal,
                                taxAmount: orderData.tax_amount || 0,
                                shippingCost: orderData.shipping_cost || 0,
                                discountAmount: orderData.discount_amount || 0,
                                status: orderData.status,
                                paymentStatus: orderData.payment_status,
                                shippingStatus: orderData.shipping_status,
                                paymentMethod: orderData.payment_method,
                                orderDate: orderData.order_date,
                                shippingAddress: orderData.shipping_address,
                                billingAddress: orderData.billing_address,
                                trackingNumber: orderData.tracking_number,
                                notes: orderData.notes,
                                adminNotes: orderData.admin_notes,
                                is_b2b: (orderData as any).is_b2b,
                                items: [],
                                createdAt: orderData.created_at,
                                updatedAt: orderData.updated_at
                            };
                            ordersWithItems.push(order);
                        }
                    }

                    console.log('User orders loaded successfully:', ordersWithItems.length);
                    return OrdersActions.loadUserOrdersSuccess({ orders: ordersWithItems });
                }).catch(error => {
                    console.error('Error loading user orders:', error);
                    return OrdersActions.loadUserOrdersFailure({ error: error.message });
                })
            )
        )
    );

    loadOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadOrder),
            switchMap(({ orderId }) =>
                this.supabaseService.getTableById('orders', orderId).then(async (orderData: any) => {
                    if (!orderData) {
                        throw new Error('Order not found');
                    }

                    // Load order items
                    const orderItemsData = await this.supabaseService.getTable('order_items', {
                        order_id: orderData.id
                    });

                    // Convert database order to Order model
                    const order: Order = {
                        id: orderData.id,
                        orderNumber: orderData.order_number,
                        userId: orderData.user_id,
                        customerEmail: orderData.customer_email,
                        customerName: orderData.customer_name,
                        customerPhone: orderData.customer_phone,
                        totalAmount: orderData.total_amount,
                        subtotal: orderData.subtotal,
                        taxAmount: orderData.tax_amount || 0,
                        shippingCost: orderData.shipping_cost || 0,
                        discountAmount: orderData.discount_amount || 0,
                        status: orderData.status,
                        paymentStatus: orderData.payment_status,
                        shippingStatus: orderData.shipping_status,
                        paymentMethod: orderData.payment_method,
                        orderDate: orderData.order_date,
                        shippingAddress: orderData.shipping_address,
                        billingAddress: orderData.billing_address,
                        trackingNumber: orderData.tracking_number,
                        notes: orderData.notes,
                        adminNotes: orderData.admin_notes,
                        is_b2b: orderData.is_b2b,
                        items: (orderItemsData || []).map((itemData: any) => ({
                            id: itemData.id,
                            orderId: itemData.order_id,
                            productId: itemData.product_id,
                            productName: itemData.product_name,
                            productSku: itemData.product_sku,
                            quantity: itemData.quantity,
                            unitPrice: itemData.unit_price,
                            totalPrice: itemData.total_price,
                            productImageUrl: itemData.product_image_url,
                            productSpecifications: itemData.product_specifications,
                            createdAt: itemData.created_at
                        })),
                        createdAt: orderData.created_at,
                        updatedAt: orderData.updated_at
                    };

                    return OrdersActions.loadOrderSuccess({ order });
                }).catch(error =>
                    OrdersActions.loadOrderFailure({ error: error.message })
                )
            )
        )
    );

    updateOrderStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.updateOrderStatus),
            switchMap(({ orderId, status }) =>
                this.supabaseService.updateRecord('orders', orderId, { status: status as any }).then(async () => {
                    // Handle stock restoration for cancelled orders
                    if (status === 'cancelled') {
                        try {
                            console.log('Order cancelled, restoring stock for order:', orderId);
                            // Get order items to restore stock
                            const orderItems = await this.supabaseService.getTable('order_items', { order_id: orderId });

                            if (orderItems && orderItems.length > 0) {
                                // Restore stock for all items (increment = false for decrement, true for increment)
                                await this.supabaseService.processOrderStockAdjustment(orderItems, false);
                                console.log('Stock restored successfully for cancelled order:', orderId);
                            }
                        } catch (error) {
                            console.error('Error restoring stock for cancelled order:', error);
                            // Don't fail the status update if stock restoration fails
                        }
                    }

                    return OrdersActions.updateOrderStatusSuccess({ orderId, status });
                }).catch((error: any) =>
                    OrdersActions.updateOrderStatusFailure({ error: error.message })
                )
            )
        )
    );

    // Send order status change emails when order status is updated
    sendOrderStatusChangeEmails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.updateOrderStatusSuccess),
            switchMap(async ({ orderId, status }) => {
                try {
                    console.log('Sending order status change emails for order:', orderId, 'new status:', status);

                    // Get the updated order data
                    const orderData = await this.supabaseService.getTable('orders', { id: orderId });
                    const order = orderData && orderData.length > 0 ? orderData[0] : null;

                    if (!order) {
                        console.error('Order not found for status change email:', orderId);
                        return { success: false, error: 'Order not found' };
                    }

                    const emailData = {
                        to: order.customer_email,
                        orderNumber: order.order_number,
                        orderId: order.id,
                        orderDate: new Date(order.order_date).toLocaleDateString('hr-HR'),
                        customerName: order.customer_name || 'Kupac',
                        customerEmail: order.customer_email,
                        newStatus: status
                    };

                    // Send email to customer
                    const customerEmailSent = await this.emailService.sendOrderStatusChangeEmail(emailData);
                    console.log('Customer order status change email sent:', customerEmailSent);

                    // Send email to admin
                    const adminEmailSent = await this.emailService.sendOrderStatusChangeNotificationToAdmin(emailData);
                    console.log('Admin order status change notification email sent:', adminEmailSent);

                    return { success: true };
                } catch (error) {
                    console.error('Error sending order status change emails:', error);
                    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
                }
            })
        ),
        { dispatch: false }
    );

    updatePaymentStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.updatePaymentStatus),
            switchMap(({ orderId, paymentStatus }) =>
                this.supabaseService.updateRecord('orders', orderId, { payment_status: paymentStatus as any }).then(() =>
                    OrdersActions.updatePaymentStatusSuccess({ orderId, paymentStatus })
                ).catch((error: any) =>
                    OrdersActions.updatePaymentStatusFailure({ error: error.message })
                )
            )
        )
    );

    confirmPurchase$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.confirmPurchase),
            switchMap(({ orderId }) =>
                this.supabaseService.updateRecord('orders', orderId, { payment_status: 'paid' }).then(() =>
                    OrdersActions.confirmPurchaseSuccess({ orderId })
                ).catch(error =>
                    OrdersActions.confirmPurchaseFailure({ error: error.message })
                )
            )
        )
    );

    deleteOrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.deleteOrder),
            switchMap(({ orderId }) =>
                // First delete order items, then delete the order
                this.supabaseService.getTable('order_items', { order_id: orderId }).then(async (orderItems) => {
                    // Delete all order items first
                    if (orderItems && orderItems.length > 0) {
                        for (const item of orderItems) {
                            await this.supabaseService.adminDeleteRecord('order_items', item.id);
                        }
                    }

                    // Then delete the order
                    await this.supabaseService.adminDeleteRecord('orders', orderId);

                    return OrdersActions.deleteOrderSuccess({ orderId });
                }).catch(error => {
                    return OrdersActions.deleteOrderFailure({ error: error.message });
                })
            )
        )
    );

    createB2COrder$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.createB2COrder),
            switchMap(({ orderData, cartItems }) => {
                console.log('B2C Order creation started in effect');
                return this.createOrderWithStockManagement(orderData, cartItems).then((result) => {
                    console.log('B2C Order creation successful in effect:', result);
                    return OrdersActions.createB2COrderSuccess({ order: result.order, orderNumber: result.orderNumber });
                }).catch((error: any) => {
                    console.error('B2C Order creation failed in effect:', error);
                    return OrdersActions.createB2COrderFailure({ error: error.message });
                });
            })
        )
    );

    private async createOrderWithStockManagement(orderData: any, cartItems: any[]): Promise<{ order: Order; orderNumber: string }> {
        try {
            // First, check and decrement stock for all items
            console.log('Processing stock adjustment for order items...');
            const stockAdjustmentSuccess = await this.supabaseService.processOrderStockAdjustment(cartItems, true);

            if (!stockAdjustmentSuccess) {
                throw new Error('Insufficient stock for one or more items');
            }

            // Create order in database
            const orderRecord = await this.supabaseService.createRecord('orders', orderData);

            if (!orderRecord) {
                // Rollback stock if order creation fails
                await this.supabaseService.processOrderStockAdjustment(cartItems, false);
                throw new Error('Failed to create order');
            }

            // Create order items
            console.log('Creating order items for order:', orderRecord.id);
            for (const item of cartItems) {
                const orderItemData = {
                    order_id: orderRecord.id,
                    product_id: item.productId === '00000000-0000-0000-0000-000000000001' ? null : item.productId,
                    product_name: item.name,
                    product_sku: item.sku || `SKU-${item.productId}`,
                    product_image_url: item.image,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                    created_at: new Date().toISOString()
                };

                console.log('Creating order item:', orderItemData);
                await this.supabaseService.createRecord('order_items', orderItemData);
            }

            // Convert database order to Order model
            const order: Order = {
                id: orderRecord.id,
                orderNumber: orderRecord.order_number,
                userId: orderRecord.user_id,
                customerEmail: orderRecord.customer_email,
                customerName: orderRecord.customer_name,
                customerPhone: orderRecord.customer_phone,
                totalAmount: orderRecord.total_amount,
                subtotal: orderRecord.subtotal,
                taxAmount: orderRecord.tax_amount || 0,
                shippingCost: orderRecord.shipping_cost || 0,
                discountAmount: orderRecord.discount_amount || 0,
                status: orderRecord.status,
                paymentStatus: orderRecord.payment_status,
                shippingStatus: orderRecord.shipping_status,
                paymentMethod: orderRecord.payment_method,
                orderDate: orderRecord.order_date,
                shippingAddress: orderRecord.shipping_address,
                billingAddress: orderRecord.billing_address,
                trackingNumber: orderRecord.tracking_number,
                notes: orderRecord.notes,
                adminNotes: orderRecord.admin_notes,
                items: [], // Items will be loaded separately if needed
                createdAt: orderRecord.created_at,
                updatedAt: orderRecord.updated_at
            };

            return {
                order,
                orderNumber: orderRecord.order_number
            };
        } catch (error) {
            console.error('Error in createOrderWithStockManagement:', error);
            throw error;
        }
    }

    // Show success toast when B2C order is created
    showB2COrderSuccessToast$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.createB2COrderSuccess),
            tap(({ order, orderNumber }) => {
                console.log('Showing success toast for order:', orderNumber);
                const message = this.translationService.translate('checkout.orderCreated', { number: orderNumber });
                this.toastService.showSuccess(message, 4000);
            })
        ),
        { dispatch: false }
    );

    // Send order confirmation emails when B2C order is created
    sendOrderConfirmationEmails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.createB2COrderSuccess),
            switchMap(async ({ order, orderNumber }) => {
                try {
                    console.log('Sending order confirmation emails for order:', orderNumber);

                    // Prepare order items for email
                    const orderItems = await this.supabaseService.getTable('order_items', {
                        order_id: order.id
                    });

                    const emailData = {
                        to: order.customerEmail,
                        orderNumber: order.orderNumber,
                        orderDate: new Date(order.orderDate).toLocaleDateString('hr-HR'),
                        customerName: order.customerName || 'Kupac',
                        customerEmail: order.customerEmail,
                        items: (orderItems || []).map((item: any) => ({
                            productName: item.product_name,
                            productSku: item.product_sku || 'SKU-N/A',
                            quantity: item.quantity,
                            unitPrice: item.unit_price,
                            totalPrice: item.total_price
                        })),
                        subtotal: order.subtotal,
                        taxAmount: order.taxAmount,
                        shippingCost: order.shippingCost,
                        totalAmount: order.totalAmount
                    };

                    // Send email to customer
                    const customerEmailSent = await this.emailService.sendOrderConfirmationEmail(emailData);
                    console.log('Customer order confirmation email sent:', customerEmailSent);

                    // Send email to admin
                    const adminEmailSent = await this.emailService.sendOrderNotificationToAdmin(emailData);
                    console.log('Admin order notification email sent:', adminEmailSent);

                    return { success: true };
                } catch (error) {
                    console.error('Error sending order confirmation emails:', error);
                    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
                }
            })
        ),
        { dispatch: false }
    );

    loadUserReviews$ = createEffect(() =>
        this.actions$.pipe(
            ofType(OrdersActions.loadUserReviews),
            switchMap(({ userId }) =>
                this.supabaseService.getTable('reviews', { user_id: userId }).then(async (reviewsData) => {
                    console.log('Loading reviews for user ID:', userId, 'Found reviews:', reviewsData?.length || 0);

                    const reviewsWithProducts: Review[] = [];

                    for (const reviewData of reviewsData || []) {
                        try {
                            // Load product data for each review
                            const productData = await this.supabaseService.getTable('products', {
                                id: reviewData.product_id
                            });

                            const review: Review = {
                                id: reviewData.id,
                                userId: reviewData.user_id,
                                productId: reviewData.product_id,
                                orderId: reviewData.order_id,
                                orderItemId: reviewData.order_item_id,
                                rating: reviewData.rating,
                                title: reviewData.title,
                                comment: reviewData.comment,
                                isVerifiedPurchase: reviewData.is_verified_purchase,
                                isApproved: reviewData.is_approved,
                                adminResponse: reviewData.admin_response,
                                helpfulCount: reviewData.helpful_count,
                                reportedCount: reviewData.reported_count,
                                status: reviewData.status,
                                createdAt: reviewData.created_at,
                                updatedAt: reviewData.updated_at,
                                product: productData && productData.length > 0 ? {
                                    name: productData[0].name,
                                    imageUrl: productData[0].images?.[0]?.url
                                } : undefined
                            };
                            reviewsWithProducts.push(review);
                        } catch (productError) {
                            console.error('Error loading product for user review:', productError);
                            // Continue with review but without product data
                            const review: Review = {
                                id: reviewData.id,
                                userId: reviewData.user_id,
                                productId: reviewData.product_id,
                                orderId: reviewData.order_id,
                                orderItemId: reviewData.order_item_id,
                                rating: reviewData.rating,
                                title: reviewData.title,
                                comment: reviewData.comment,
                                isVerifiedPurchase: reviewData.is_verified_purchase,
                                isApproved: reviewData.is_approved,
                                adminResponse: reviewData.admin_response,
                                helpfulCount: reviewData.helpful_count,
                                reportedCount: reviewData.reported_count,
                                status: reviewData.status,
                                createdAt: reviewData.created_at,
                                updatedAt: reviewData.updated_at,
                                product: undefined
                            };
                            reviewsWithProducts.push(review);
                        }
                    }

                    console.log('User reviews loaded successfully:', reviewsWithProducts.length);
                    return OrdersActions.loadUserReviewsSuccess({ reviews: reviewsWithProducts });
                }).catch(error => {
                    console.error('Error loading user reviews:', error);
                    return OrdersActions.loadUserReviewsFailure({ error: error.message });
                })
            )
        )
    );
}
