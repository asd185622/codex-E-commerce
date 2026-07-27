package com.jerry.springbootmall.service.impl;

import com.jerry.springbootmall.service.ProductImageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

/** 將商品圖片保存至可由環境變數指定的本機目錄。 */
@Service
public class ProductImageServiceImpl implements ProductImageService {

    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;
    private static final Map<String, String> EXTENSION_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path storageDirectory;

    public ProductImageServiceImpl(
            @Value("${mall.product-image.storage-dir:uploads/products}") String storageDirectory
    ) {
        this.storageDirectory = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("請選擇要上傳的圖片。");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("圖片大小不可超過 5 MB。");
        }

        String extension = EXTENSION_BY_CONTENT_TYPE.get(file.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("僅支援 JPG、PNG 或 WebP 圖片。");
        }

        byte[] content = file.getBytes();
        if (!hasExpectedSignature(content, file.getContentType())) {
            throw new IllegalArgumentException("圖片內容與檔案格式不符。");
        }

        Files.createDirectories(storageDirectory);
        String fileName = UUID.randomUUID() + extension;
        Path target = resolveFile(fileName);
        Files.write(target, content, StandardOpenOption.CREATE_NEW);

        return fileName;
    }

    @Override
    public Resource load(String fileName) throws IOException {
        Path file = resolveFile(fileName);
        if (!Files.isRegularFile(file) || !Files.isReadable(file)) {
            throw new FileNotFoundException("找不到商品圖片。");
        }
        return new FileSystemResource(file);
    }

    @Override
    public String getContentType(String fileName) {
        String normalizedName = fileName.toLowerCase();
        if (normalizedName.endsWith(".jpg")) return "image/jpeg";
        if (normalizedName.endsWith(".png")) return "image/png";
        if (normalizedName.endsWith(".webp")) return "image/webp";
        throw new IllegalArgumentException("不支援的圖片格式。");
    }

    private Path resolveFile(String fileName) {
        if (fileName == null || fileName.isBlank() || !Path.of(fileName).getFileName().toString().equals(fileName)) {
            throw new IllegalArgumentException("圖片檔名無效。");
        }

        Path resolved = storageDirectory.resolve(fileName).normalize();
        if (!resolved.startsWith(storageDirectory)) {
            throw new IllegalArgumentException("圖片路徑無效。");
        }
        return resolved;
    }

    private boolean hasExpectedSignature(byte[] content, String contentType) {
        if ("image/jpeg".equals(contentType)) {
            return content.length >= 3
                    && (content[0] & 0xff) == 0xff
                    && (content[1] & 0xff) == 0xd8
                    && (content[2] & 0xff) == 0xff;
        }
        if ("image/png".equals(contentType)) {
            byte[] signature = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
            return content.length >= signature.length
                    && Arrays.equals(Arrays.copyOf(content, signature.length), signature);
        }
        if ("image/webp".equals(contentType)) {
            return content.length >= 12
                    && new String(content, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                    && new String(content, 8, 4, StandardCharsets.US_ASCII).equals("WEBP");
        }
        return false;
    }
}
