package com.jerry.springbootmall.controller;

import com.jerry.springbootmall.dto.ProductImageResponse;
import com.jerry.springbootmall.service.ProductImageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.FileNotFoundException;
import java.util.Map;

@RestController
public class ProductImageController {

    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @PostMapping(path = "/product-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImageResponse> uploadProductImage(@RequestParam("file") MultipartFile file)
            throws IOException {
        String fileName = productImageService.store(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ProductImageResponse("/product-images/" + fileName));
    }

    @GetMapping("/product-images/{fileName}")
    public ResponseEntity<Resource> getProductImage(@PathVariable String fileName) throws IOException {
        Resource image = productImageService.load(fileName);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(productImageService.getContentType(fileName)))
                .body(image);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidImage(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(FileNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleMissingImage(FileNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", exception.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleImageIoError() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "目前無法儲存商品圖片，請稍後再試。"));
    }
}
