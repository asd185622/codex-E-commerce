package com.jerry.springbootmall.dao;

import com.jerry.springbootmall.dto.UserRegisterRequest;
import com.jerry.springbootmall.model.User;

public interface UserDao {

    Integer createUser(UserRegisterRequest userRegisterRequest);
    User getUserById(Integer userId);
    User getUserByEmail(String email);
}
