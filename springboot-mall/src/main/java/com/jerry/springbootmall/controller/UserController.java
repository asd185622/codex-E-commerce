package com.jerry.springbootmall.controller;

import com.jerry.springbootmall.dto.UserRegisterRequest;
import com.jerry.springbootmall.dto.UserSessionResponse;
import com.jerry.springbootmall.model.User;
import com.jerry.springbootmall.security.MallUserPrincipal;
import com.jerry.springbootmall.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @Autowired
    UserService userService;

    @PostMapping("/users/register")
    public ResponseEntity<User> register(@RequestBody @Valid UserRegisterRequest userRegisterRequest){
        Integer userId = userService.register(userRegisterRequest);

        User user = userService.getUserById(userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(user);

    }

    @GetMapping("/users/me")
    public UserSessionResponse me(@AuthenticationPrincipal MallUserPrincipal principal) {
        return new UserSessionResponse(principal.getUserId(), principal.getEmail());
    }
}
