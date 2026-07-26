package com.jerry.springbootmall.service;

import com.jerry.springbootmall.dto.CreateOrderRequest;
import com.jerry.springbootmall.dto.OrderQueryParam;
import com.jerry.springbootmall.model.Order;

import java.util.List;

public interface OrderService {

    Integer createOrder(Integer userId, CreateOrderRequest createOrderRequest);
    Order getOrderById(Integer orderId);
    List<Order> getOrders(OrderQueryParam orderQueryParam);
    Integer countOrders(OrderQueryParam orderQueryParam);
}
