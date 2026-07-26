package com.jerry.springbootmall.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** 提供前端取得 Spring Security 驗證流程所需的公開資訊。 */
@RestController
public class SecurityController {

    /** 回傳目前 Session 對應的 CSRF Token，供前端送出需防偽驗證的請求。 */
    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }
}
