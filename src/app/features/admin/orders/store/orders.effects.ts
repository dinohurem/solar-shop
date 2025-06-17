import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from '../../../../services/supabase.service';
import * as OrdersActions from './orders.actions';
import { Order } from '../../../../shared/models/order.model';

@Injectable()
export class OrdersEffects {

    constructor(
        private actions$: Actions,
        private supabaseService: SupabaseService
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
                this.supabaseService.updateRecord('orders', orderId, { status: status as any }).then(() =>
                    OrdersActions.updateOrderStatusSuccess({ orderId, status })
                ).catch((error: any) =>
                    OrdersActions.updateOrderStatusFailure({ error: error.message })
                )
            )
        )
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
                this.supabaseService.deleteRecord('orders', orderId).then(() =>
                    OrdersActions.deleteOrderSuccess({ orderId })
                ).catch(error =>
                    OrdersActions.deleteOrderFailure({ error: error.message })
                )
            )
        )
    );
}
