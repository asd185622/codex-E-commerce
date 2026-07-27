package com.jerry.springbootmall.service;

import com.jerry.springbootmall.service.impl.ProductImageServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ProductImageServiceImplTest {

    @TempDir
    Path temporaryDirectory;

    @Test
    void storeAndLoadSupportedImage() throws Exception {
        ProductImageServiceImpl service = new ProductImageServiceImpl(temporaryDirectory.toString());
        byte[] content = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1};
        MockMultipartFile file = new MockMultipartFile("file", "product.png", "image/png", content);

        String fileName = service.store(file);

        assertEquals("image/png", service.getContentType(fileName));
        assertArrayEquals(content, service.load(fileName).getInputStream().readAllBytes());
    }

    @Test
    void rejectUnsupportedContentType() {
        ProductImageServiceImpl service = new ProductImageServiceImpl(temporaryDirectory.toString());
        MockMultipartFile file = new MockMultipartFile("file", "product.gif", "image/gif", new byte[]{1});

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> service.store(file));

        assertEquals("僅支援 JPG、PNG 或 WebP 圖片。", exception.getMessage());
    }

    @Test
    void rejectContentThatDoesNotMatchDeclaredType() {
        ProductImageServiceImpl service = new ProductImageServiceImpl(temporaryDirectory.toString());
        MockMultipartFile file = new MockMultipartFile(
                "file", "product.png", "image/png", "not-an-image".getBytes(StandardCharsets.UTF_8)
        );

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> service.store(file));

        assertEquals("圖片內容與檔案格式不符。", exception.getMessage());
    }

    @Test
    void rejectPathTraversalWhenLoading() {
        ProductImageServiceImpl service = new ProductImageServiceImpl(temporaryDirectory.toString());

        assertThrows(IllegalArgumentException.class, () -> service.load("../secret.png"));
    }
}
