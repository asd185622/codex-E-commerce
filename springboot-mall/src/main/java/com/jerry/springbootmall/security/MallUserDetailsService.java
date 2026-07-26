package com.jerry.springbootmall.security;

import com.jerry.springbootmall.dao.UserDao;
import com.jerry.springbootmall.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** 依 Email 載入商城會員，提供 Spring Security 登入流程所需的帳號資料。 */
@Service
public class MallUserDetailsService implements UserDetailsService {

    private final UserDao userDao;

    public MallUserDetailsService(UserDao userDao) {
        this.userDao = userDao;
    }

    /** 將登入表單的 username 欄位視為 Email，並轉換成安全驗證身分。 */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userDao.getUserByEmail(email);

        if (user == null) {
            throw new UsernameNotFoundException("找不到會員");
        }

        return new MallUserPrincipal(user);
    }
}
