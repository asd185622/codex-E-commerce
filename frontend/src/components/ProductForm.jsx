// 提供新增與編輯頁共用的商品欄位、錯誤關聯與圖片預覽。
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { categories, getCategoryLabel } from "../utils/categories";
import { formatPrice } from "../utils/formatters";
import ProductImage from "./ProductImage";

const fieldOrder = ["productName", "category", "imageUrl", "price", "stock"];

function ProductForm({ values, errors, submitError, isSubmitting, submitLabel, onChange, onSubmit }) {
  const fieldRefs = useRef({});

  useEffect(() => {
    const firstError = fieldOrder.find((field) => errors[field]);
    if (firstError) fieldRefs.current[firstError]?.focus();
  }, [errors]);

  function registerField(name) {
    return (element) => {
      fieldRefs.current[name] = element;
    };
  }

  function fieldProps(name) {
    return {
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
      className: errors[name] ? "input-error" : "",
    };
  }

  return (
    <form className="admin-product-form" noValidate onSubmit={onSubmit}>
      <div className="admin-form-fields">
        <div className="form-field">
          <label htmlFor="productName">商品名稱</label>
          <input
            {...fieldProps("productName")}
            ref={registerField("productName")}
            id="productName"
            value={values.productName}
            onChange={(event) => onChange("productName", event.target.value)}
            autoComplete="off"
            required
          />
          {errors.productName ? <p className="field-error" id="productName-error">{errors.productName}</p> : null}
        </div>

        <div className="form-field">
          <label htmlFor="category">商品分類</label>
          <select
            {...fieldProps("category")}
            ref={registerField("category")}
            id="category"
            value={values.category}
            onChange={(event) => onChange("category", event.target.value)}
            required
          >
            <option value="">請選擇分類</option>
            {categories.map((category) => (
              <option value={category.value} key={category.value}>{category.label}</option>
            ))}
          </select>
          {errors.category ? <p className="field-error" id="category-error">{errors.category}</p> : null}
        </div>

        <div className="form-field admin-field-wide">
          <label htmlFor="imageUrl">商品圖片網址</label>
          <input
            {...fieldProps("imageUrl")}
            ref={registerField("imageUrl")}
            id="imageUrl"
            type="url"
            value={values.imageUrl}
            onChange={(event) => onChange("imageUrl", event.target.value)}
            placeholder="https://example.com/product.jpg"
            autoComplete="url"
            required
          />
          {errors.imageUrl ? <p className="field-error" id="imageUrl-error">{errors.imageUrl}</p> : null}
        </div>

        <div className="form-field">
          <label htmlFor="price">價格（新台幣）</label>
          <input
            {...fieldProps("price")}
            ref={registerField("price")}
            id="price"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.price}
            onChange={(event) => onChange("price", event.target.value)}
            required
          />
          {errors.price ? <p className="field-error" id="price-error">{errors.price}</p> : null}
        </div>

        <div className="form-field">
          <label htmlFor="stock">庫存數量</label>
          <input
            {...fieldProps("stock")}
            ref={registerField("stock")}
            id="stock"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.stock}
            onChange={(event) => onChange("stock", event.target.value)}
            required
          />
          {errors.stock ? <p className="field-error" id="stock-error">{errors.stock}</p> : null}
        </div>

        <div className="form-field admin-field-wide">
          <label htmlFor="description">商品說明（選填）</label>
          <textarea
            id="description"
            rows="6"
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            placeholder="補充商品特色、規格或使用情境。"
          />
        </div>

        {submitError ? <p className="form-error admin-field-wide" role="alert">{submitError}</p> : null}

        <div className="admin-form-actions admin-field-wide">
          <Link className="button button-secondary" to="/admin/products">取消</Link>
          <button className="button button-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "儲存中…" : submitLabel}
          </button>
        </div>
      </div>

      <aside className="admin-product-preview" aria-label="商品預覽">
        <p className="eyebrow">LIVE PREVIEW</p>
        <div className="admin-preview-image">
          <ProductImage key={values.imageUrl} src={values.imageUrl} alt={values.productName || "商品預覽"} />
        </div>
        <p className="product-category">{getCategoryLabel(values.category) || "尚未分類"}</p>
        <h2>{values.productName || "商品名稱將顯示在這裡"}</h2>
        <strong>{values.price === "" ? "價格尚未設定" : formatPrice(values.price)}</strong>
        <span>{values.stock === "" ? "庫存尚未設定" : `庫存 ${values.stock} 件`}</span>
      </aside>
    </form>
  );
}

export default ProductForm;
