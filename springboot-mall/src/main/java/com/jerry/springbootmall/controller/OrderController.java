package com.jerry.springbootmall.controller;

import com.jerry.springbootmall.dto.CreateOrderRequest;
import com.jerry.springbootmall.dto.OrderQueryParam;
import com.jerry.springbootmall.model.Order;
import com.jerry.springbootmall.security.MallUserPrincipal;
import com.jerry.springbootmall.service.OrderService;
import com.jerry.springbootmall.util.Page;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@Validated
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/users/{userId}/orders")
    public ResponseEntity<Order> createOrder(@PathVariable Integer userId,
                                             @RequestBody @Valid CreateOrderRequest createOrderRequest,
                                             @AuthenticationPrincipal MallUserPrincipal principal){
        ensureCurrentUser(userId, principal);

        Integer orderId = orderService.createOrder(userId,createOrderRequest);

        Order order = orderService.getOrderById(orderId);

        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/users/{userId}/orders")
    public ResponseEntity<Page<Order>> getOrders(@PathVariable Integer userId,
                                                 @RequestParam(defaultValue = "10") @Max (1000) @Min(0) Integer limit,
                                                 @RequestParam(defaultValue = "0") @Min(0) Integer offset,
                                                 @AuthenticationPrincipal MallUserPrincipal principal){
        ensureCurrentUser(userId, principal);

        OrderQueryParam orderQueryParam = new OrderQueryParam();
        orderQueryParam.setUserId(userId);
        orderQueryParam.setLimit(limit);
        orderQueryParam.setOffset(offset);

        //取得Order列表
        List<Order> orderList = orderService.getOrders(orderQueryParam);

        //取得符合查詢條件的Order總數
        int total = orderService.countOrders(orderQueryParam);

        //分頁
        Page<Order> page = new Page<>();
        page.setLimit(limit);
        page.setOffset(offset);
        page.setTotal(total);
        page.setResults(orderList);

        return ResponseEntity.status(HttpStatus.OK).body(page);
    }

    private void ensureCurrentUser(Integer requestedUserId, MallUserPrincipal principal) {
        if (!principal.getUserId().equals(requestedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "無法存取其他會員的訂單");
        }
    }
}
