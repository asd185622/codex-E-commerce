package com.jerry.springbootmall.controller;

import com.jerry.springbootmall.dto.ProductImageResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "mall.product-image.storage-dir=target/test-product-images")
@AutoConfigureMockMvc
class ProductImageControllerTest {

    private static final byte[] PNG_CONTENT = {
            (byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1
    };

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void uploadSupportedImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "product.png", "image/png", PNG_CONTENT
        );

        MvcResult result = mockMvc.perform(multipart("/product-images").file(file).with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imageUrl", matchesPattern(
                        "^/product-images/[0-9a-f-]+\\.png$"
                )))
                .andReturn();

        ProductImageResponse response = objectMapper.readValue(
                result.getResponse().getContentAsByteArray(), ProductImageResponse.class
        );
        mockMvc.perform(get(response.imageUrl()))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"))
                .andExpect(content().bytes(PNG_CONTENT));
    }

    @Test
    void uploadRequiresCsrfToken() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "product.png", "image/png", PNG_CONTENT
        );

        mockMvc.perform(multipart("/product-images").file(file))
                .andExpect(status().isForbidden());
    }

    @Test
    void rejectUnsupportedImage() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "product.gif", "image/gif", new byte[]{1, 2, 3}
        );

        mockMvc.perform(multipart("/product-images").file(file).with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("僅支援 JPG、PNG 或 WebP 圖片。"));
    }
}
