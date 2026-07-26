package com.jerry.springbootmall.security;

import com.jerry.springbootmall.model.User;
import org.springframework.security.core.CredentialsContainer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * 將商城會員資料轉換成 Spring Security 可辨識的登入身分，
 * 同時保留會員編號與 Email，供登入成功後建立安全的前端回應。
 */
public class MallUserPrincipal implements UserDetails, CredentialsContainer {

    private final Integer userId;
    private final String email;
    private String password;

    /** 從資料庫會員實體建立 Spring Security 使用的 Principal。 */
    public MallUserPrincipal(User user) {
        this(user.getUserId(), user.getEmail(), user.getPassword());
    }

    public MallUserPrincipal(Integer userId, String email, String password) {
        this.userId = userId;
        this.email = email;
        this.password = password;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 目前不建立 RBAC，因此會員登入後不附加角色或權限。
        return List.of();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public void eraseCredentials() {
        // 驗證完成後清除記憶體中的密碼雜湊，縮短敏感資料停留時間。
        password = null;
    }
}
