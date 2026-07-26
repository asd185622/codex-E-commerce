package com.jerry.springbootmall.controller;

import com.jerry.springbootmall.dao.UserDao;
import com.jerry.springbootmall.dto.UserRegisterRequest;
import com.jerry.springbootmall.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@SpringBootTest
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void register_success() throws Exception {
        UserRegisterRequest request = registration("test1@gmail.com", "12345678");

        mockMvc.perform(post("/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").isNumber())
                .andExpect(jsonPath("$.email").value(request.getEmail()))
                .andExpect(jsonPath("$.createdDate").isNotEmpty())
                .andExpect(jsonPath("$.lastModifiedDate").isNotEmpty());

        User storedUser = userDao.getUserByEmail(request.getEmail());
        assertTrue(passwordEncoder.matches("12345678", storedUser.getPassword()));
    }

    @Test
    void register_withoutCsrf_isForbidden() throws Exception {
        UserRegisterRequest request = registration("csrf@gmail.com", "12345678");

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void register_invalidEmailFormat() throws Exception {
        UserRegisterRequest request = registration("not-an-email", "12345678");

        mockMvc.perform(post("/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_emailAlreadyExists() throws Exception {
        UserRegisterRequest request = registration("test2@gmail.com", "12345678");
        register(request);

        mockMvc.perform(post("/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_createsSessionAndMeReturnsCurrentUser() throws Exception {
        UserRegisterRequest request = registration("test3@gmail.com", "12345678");
        register(request);

        MvcResult loginResult = mockMvc.perform(post("/users/login")
                        .with(csrf())
                        .param("email", request.getEmail())
                        .param("password", request.getPassword()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").isNumber())
                .andExpect(jsonPath("$.email").value(request.getEmail()))
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(get("/users/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").isNumber())
                .andExpect(jsonPath("$.email").value(request.getEmail()));
    }

    @Test
    void login_wrongPassword_isUnauthorized() throws Exception {
        UserRegisterRequest request = registration("test4@gmail.com", "12345678");
        register(request);

        mockMvc.perform(post("/users/login")
                        .with(csrf())
                        .param("email", request.getEmail())
                        .param("password", "wrong-password"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email 或密碼不正確"));
    }

    @Test
    void login_emailNotFound_isUnauthorized() throws Exception {
        mockMvc.perform(post("/users/login")
                        .with(csrf())
                        .param("email", "unknown@gmail.com")
                        .param("password", "12345678"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void me_withoutSession_isUnauthorized() throws Exception {
        mockMvc.perform(get("/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_invalidatesSession() throws Exception {
        UserRegisterRequest request = registration("test5@gmail.com", "12345678");
        register(request);

        MvcResult loginResult = mockMvc.perform(post("/users/login")
                        .with(csrf())
                        .param("email", request.getEmail())
                        .param("password", request.getPassword()))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);

        mockMvc.perform(post("/users/logout").session(session).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/users/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    private UserRegisterRequest registration(String email, String password) {
        UserRegisterRequest request = new UserRegisterRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private void register(UserRegisterRequest request) throws Exception {
        mockMvc.perform(post("/users/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
