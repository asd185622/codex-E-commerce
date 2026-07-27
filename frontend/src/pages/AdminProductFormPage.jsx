// 共用新增與編輯商品流程，依路由參數決定載入與送出的 API。
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { createProduct, getProduct, updateProduct, uploadProductImage } from "../api/products";
import ProductForm from "../components/ProductForm";
import StatusPanel from "../components/StatusPanel";
import {
  getErrorMessage,
  getProductImageUploadErrorMessage,
  getProductWriteErrorMessage,
} from "../utils/errors";
import { validateProduct } from "../utils/validation";

function createEmptyProduct() {
  return {
    productName: "",
    category: "",
    imageUrl: "",
    price: "",
    stock: "",
    description: "",
  };
}

function AdminProductFormPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(productId);
  const [values, setValues] = useState(createEmptyProduct);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    if (!isEditing) return undefined;

    const controller = new AbortController();

    async function loadProduct() {
      setIsLoading(true);
      setLoadError("");

      try {
        const product = await getProduct(productId, controller.signal);
        setImageFile(null);
        setValues({
          productName: product.productName ?? "",
          category: product.category ?? "",
          imageUrl: product.imageUrl ?? "",
          price: String(product.price ?? ""),
          stock: String(product.stock ?? ""),
          description: product.description ?? "",
        });
      } catch (requestError) {
        const message = getErrorMessage(requestError, "目前無法載入商品資料，請稍後再試。");
        if (message) setLoadError(message);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadProduct();
    return () => controller.abort();
  }, [isEditing, productId, requestKey]);

  function handleChange(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  }

  function handleImageChange(file) {
    setImageFile(file);
    setErrors((current) => ({ ...current, imageFile: "" }));
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateProduct(values, imageFile);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      let imageUrl = values.imageUrl.trim();
      if (imageFile) {
        try {
          const uploadedImage = await uploadProductImage(imageFile);
          imageUrl = uploadedImage.imageUrl;
        } catch (requestError) {
          setSubmitError(getProductImageUploadErrorMessage(requestError));
          return;
        }
      }

      const payload = {
        productName: values.productName.trim(),
        category: values.category,
        imageUrl,
        price: Number(values.price),
        stock: Number(values.stock),
        description: values.description.trim() || null,
      };

      const savedProduct = isEditing
        ? await updateProduct(productId, payload)
        : await createProduct(payload);

      navigate("/admin/products", {
        replace: true,
        state: {
          successMessage: isEditing
            ? `已儲存「${savedProduct.productName}」的變更。`
            : `已建立「${savedProduct.productName}」。`,
        },
      });
    } catch (requestError) {
      setSubmitError(getProductWriteErrorMessage(requestError, isEditing ? "update" : "create"));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page page-width">
        <StatusPanel title="正在載入商品資料" message="欄位準備完成後即可開始編輯。" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="admin-page page-width">
        <StatusPanel
          title="無法開啟商品"
          message={loadError}
          actionLabel="重新載入"
          onAction={() => setRequestKey((key) => key + 1)}
        />
        <Link className="text-link centered-link" to="/admin/products">返回商品管理</Link>
      </div>
    );
  }

  return (
    <div className="admin-page page-width">
      <header className="admin-form-heading">
        <nav className="breadcrumbs" aria-label="頁面路徑">
          <Link to="/admin/products">商品管理</Link>
          <span aria-hidden="true">/</span>
          <span>{isEditing ? "編輯商品" : "新增商品"}</span>
        </nav>
        <p className="eyebrow">{isEditing ? "EDIT PRODUCT" : "NEW PRODUCT"}</p>
        <h1>{isEditing ? "編輯商品" : "新增商品"}</h1>
        <p>{isEditing ? "調整商品內容後儲存，商城會立即使用最新資料。" : "填寫商品資料並建立新的商城項目。"}</p>
      </header>

      <ProductForm
        values={values}
        imageFile={imageFile}
        errors={errors}
        submitError={submitError}
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "儲存變更" : "建立商品"}
        onChange={handleChange}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AdminProductFormPage;
