package com.jerry.springbootmall.dto;

/** 傳給前端的登入會員摘要，只包含 Session 操作所需資料，不回傳敏感欄位。 */
public record UserSessionResponse(Integer userId, String email) {
}
