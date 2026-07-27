package com.jerry.springbootmall.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface ProductImageService {

    String store(MultipartFile file) throws IOException;

    Resource load(String fileName) throws IOException;

    String getContentType(String fileName);
}
