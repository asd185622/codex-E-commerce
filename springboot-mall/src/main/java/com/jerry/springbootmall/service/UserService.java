package com.jerry.springbootmall.service;

import com.jerry.springbootmall.dto.UserRegisterRequest;
import com.jerry.springbootmall.model.User;

public interface UserService {

    Integer register(UserRegisterRequest userRegisterRequest);
    User getUserById(Integer userId);
}
