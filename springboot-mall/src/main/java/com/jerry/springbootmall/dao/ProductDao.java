package com.jerry.springbootmall.dao;

import com.jerry.springbootmall.constant.ProductCategory;
import com.jerry.springbootmall.dto.ProductQueryParams;
import com.jerry.springbootmall.dto.ProductRequest;
import com.jerry.springbootmall.model.Product;

import java.util.List;

public interface ProductDao {

    Integer countProducts(ProductQueryParams productQueryParams);
    Product getProductById(Integer productId);
    Integer createProduct(ProductRequest productRequest);
    void updateProduct(Integer productId,ProductRequest productRequest);
    void deleteProduct(Integer productId);
    List<Product> getProducts(ProductQueryParams productQueryParams);
    void updateStock(Integer productId,Integer stock);
}
