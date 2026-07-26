package com.jerry.springbootmall.dao;

import com.jerry.springbootmall.dto.OrderQueryParam;
import com.jerry.springbootmall.model.Order;
import com.jerry.springbootmall.model.OrderItem;

import java.util.List;

public interface OrderDao {

    Integer createOrder(Integer userId,Integer totalAmount);
    void createOrderItems(Integer orderId, List<OrderItem> orderItems);
    Order getOrderById(Integer orderId);
    List<OrderItem> getOrderItemsByOrderId(Integer orderId);
    List<Order> getOrders(OrderQueryParam orderQueryParam);
    Integer countOrders(OrderQueryParam orderQueryParam);
}
