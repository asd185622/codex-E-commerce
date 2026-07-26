package com.jerry.springbootmall.service.impl;

import com.jerry.springbootmall.dao.OrderDao;
import com.jerry.springbootmall.dao.ProductDao;
import com.jerry.springbootmall.dao.UserDao;
import com.jerry.springbootmall.dto.CreateOrderRequest;
import com.jerry.springbootmall.dto.BuyItem;
import com.jerry.springbootmall.dto.OrderQueryParam;
import com.jerry.springbootmall.model.Order;
import com.jerry.springbootmall.model.OrderItem;
import com.jerry.springbootmall.model.Product;
import com.jerry.springbootmall.model.User;
import com.jerry.springbootmall.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Component
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);
    @Autowired
    private OrderDao orderDao;

    @Autowired
    private ProductDao productDao;
    @Autowired
    private UserDao userDao;

    @Transactional
    @Override
    public Integer createOrder(Integer userId, CreateOrderRequest createOrderRequest) {

        User user = userDao.getUserById(userId);

        if(user == null){
            log.warn("該userId {} 不存在", userId);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }

        int totalAmt = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for(BuyItem buyItem : createOrderRequest.getBuyItemList()){
            Product product = productDao.getProductById(buyItem.getProductId());
            //檢查商品是否存在，庫存是否足夠。
            if(product == null){
                log.warn("商品 {} 不存在",buyItem.getProductId());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            }else if(product.getStock() < buyItem.getQuantity()){
                log.warn("商品 {} 庫存不足，無法購買。剩餘庫存 {}，欲購買數量 {}",
                        buyItem.getProductId(),product.getStock(),buyItem.getQuantity());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
            }
            //扣除商品庫存
            productDao.updateStock(product.getProductId(),product.getStock() - buyItem.getQuantity());

            //計算Order的totalAmount
            int amount = buyItem.getQuantity() * product.getPrice();
            totalAmt += amount;

            //轉換
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(buyItem.getProductId());
            orderItem.setQuantity(buyItem.getQuantity());
            orderItem.setAmount(amount);

            orderItems.add(orderItem);
        }

        Integer orderId = orderDao.createOrder(userId,totalAmt);

        orderDao.createOrderItems(orderId,orderItems);

        return orderId;
    }

    @Override
    public Order getOrderById(Integer orderId) {
        Order order = orderDao.getOrderById(orderId);

        List<OrderItem> orderItemList = orderDao.getOrderItemsByOrderId(orderId);

        order.setOrderItemList(orderItemList);

        return order;
    }

    @Override
    public List<Order> getOrders(OrderQueryParam orderQueryParam) {
        List<Order> orderList = orderDao.getOrders(orderQueryParam);

        for(Order order: orderList){
            List<OrderItem> orderItemList = orderDao.getOrderItemsByOrderId(order.getOrderId());

            order.setOrderItemList(orderItemList);
        }
        return orderList;
    }

    @Override
    public Integer countOrders(OrderQueryParam orderQueryParam) {
        return orderDao.countOrders(orderQueryParam);
    }
}
