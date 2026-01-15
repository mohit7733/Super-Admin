import React,  { useState, useEffect, useRef }  from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../Base";

const initialProductForm = {
  title: "",
  vendor: "",
  form: "",
  category: "",
  brand: "",
  short_description: "",
  image: null,
};

const Product = () => {
  const [productSearch, setProductSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productEditing, setProductEditing] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [categoryOption, setCategoryOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const[Currentpage,setCurrentpage]=useState(1);
  const[Productperpage,setProductperpage]=useState(5);
 const fetchedOnce = useRef(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/product/`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.results)) {
        setProducts(data.results);
      } else {
        setProducts([]);
      }
    } catch {
      setError("Something went wrong while fetching data.");
        toast.error(" Failed to fetch Product list", {
        position: "top-center",
        autoClose: 2000,
      })
    } finally {
      setLoadingProduct(false);
    }
  };

  
  const fetchCategoryOptions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/productcategory/`);
      const data = await response.json();
      setCategoryOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  
  useEffect(() => {
    if (!fetchedOnce.current) {
     fetchProducts();
    fetchCategoryOptions();
      fetchedOnce.current = true; 
    }
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const confirmDelete = (id) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      const response = await fetch(
       `${BASE_URL}/ecom/product/${deleteProductId}/`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteProductId));
        toast.success("Product deleted successfully!");
      } else {
        toast.error("Failed to delete product.");
      }
    } catch {
      toast.error("Error deleting product. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };
  

const validateForm = () => {
  let errors = {};
  const alphaNumRegex = /^[a-zA-Z0-9\s]+$/; 

  if (!productForm.title.trim()) {
    errors.title = "Product name is required";
  } else if (!alphaNumRegex.test(productForm.title.trim())) {
    errors.title = "Product name can only contain letters and numbers";
  }

  if (!productForm.brand.trim()) {
    errors.brand = "Brand is required";
  } else if (!alphaNumRegex.test(productForm.brand.trim())) {
    errors.brand = "Brand can only contain letters and numbers";
  }

  if (!productForm.form.trim()) {
    errors.form = "Form is required";
  } else if (!alphaNumRegex.test(productForm.form.trim())) {
    errors.form = "Form can only contain letters and numbers";
  }

  if (!productForm.short_description.trim())
    errors.short_description = "Short description is required";

  if (!productForm.category) errors.category = "Category is required";

  if (!productEditing && !productForm.image)
    errors.image = "Product image is required";

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // const method = productEditing ? "PUT" : "POST";
    // const url = productEditing
    //   ? `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/product/${productEditing}/`
    //   : "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/product/";
    const method = productEditing ? "PUT" : "POST";
const url = productEditing
  ? `${BASE_URL}/ecom/product/${productEditing}/`
  : `${BASE_URL}/ecom/product/`;


    const formData = new FormData();
    formData.append("title", productForm.title);
    formData.append("form", productForm.form);
    formData.append("short_description", productForm.short_description);
    formData.append("brand", productForm.brand);
    formData.append("category", productForm.category);

    if (productForm.image instanceof File) {
      formData.append("image", productForm.image);
    }

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save product");
      const savedProduct = await response.json();
console.log("response",response)
      setProducts((prev) =>
        productEditing
          ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
          : [...prev, savedProduct]
      );

      toast.success(productEditing ? "Product updated successfully!" : "Product added successfully!");
      handleProductCloseModal();
    } catch {
      toast.error("Failed to submit product");
    }
  };

  const handleProductCloseModal = () => {
    setShowProductModal(false);
    setProductEditing(null);
    setProductForm(initialProductForm);
    setPreviewImage(null);
    setValidationErrors({});
  };

  const handleViewProduct = (product) => {
    setViewProduct(product);
  };

  const filteredProducts = () => {
    return products.filter((product) => {
      const matchesSearch =
        product?.title?.toLowerCase().includes(productSearch.toLowerCase()) ?? false;
      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "true" && product.in_stock) ||
        (stockFilter === "false" && !product.in_stock);
      return matchesSearch && matchesStock;
    });
  };
  // const indexoflastorder = Currentpage*Productperpage;
  // const indexoffirstorder=indexoflastorder - Productperpage;
  // const Currentproduct =  filteredProducts.slice(indexoffirstorder,indexoflastorder);
  // const totalpages = Math.ceil( filteredProducts.length/Productperpage);

  return (
    <>
     
      <div className="page-header">
        <h1>Product</h1>
      </div>

   
      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search product by product name..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <button className="add-customer-btn" onClick={() => setShowProductModal(true)}>
            + Add Product
          </button>
        </div>
      </div>

      {/* <div className="customers-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div>{products.length}</div>
        </div>
      </div> */}

   
      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Short Description</th>
            <th>Form</th>
            <th>Image</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loadingProduct ? (
            <tr>
              <td colSpan="9">Loading...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="9" style={{ color: "red" }}>
                {error}
              </td>
            </tr>
          ) : (
            filteredProducts().map((product,index) => (
              <tr key={product.id}>
                <td>{index+1}</td>
                <td>{product.title}</td>
                <td>{product.brand}</td>
                <td>{product.short_description}</td>
                <td>{product.form}</td>
                <td>
                  {product.image ? <img src={product.image} alt={product.title} width="50" /> : "No image"}
                </td>
                <td>{product?.category_detail?.name ?? ""}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view"  title="View Product Details"onClick={() => handleViewProduct(product)}>👁</button>
                    <button
                      className="action-btn edit"
                      title="Edit Product Details"
                      onClick={() => {
                        setProductEditing(product.id);
                        setProductForm({
                          ...product,
                          category: product.category || product?.category_detail?.id || "",
                          image: null,
                        });
                        setPreviewImage(product.image);
                        setShowProductModal(true);
                      }}
                    >
                      ✏️
                    </button>
                    <button  title="Delete Product"className="action-btn delete"  tittle="Delete Product"onClick={() => confirmDelete(product.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

  
      {showProductModal && (
        <div className="modal">
          <form onSubmit={handleProductSubmit} className="product-form">
            <h3>{productEditing ? "Edit Product" : "Add Product"}</h3>
            <div className="form-grid">
              <div className="form-column-1">
                <div className="form-field">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Product Name"
                    value={productForm.title}
                    onChange={handleInputChange}
                  />
                  {validationErrors.title && <span className="error-msg">{validationErrors.title}</span>}
                </div>
                <div className="form-field">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={productForm.brand}
                    onChange={handleInputChange}
                  />
                  {validationErrors.brand && <span className="error-msg">{validationErrors.brand}</span>}
                </div>
                <div className="form-field">
                  <label>Short Description</label>
                  <input
                    type="text"
                    name="short_description"
                    placeholder="Write your description"
                    value={productForm.short_description}
                    onChange={handleInputChange}
                  />
                  {validationErrors.short_description && (
                    <span className="error-msg">{validationErrors.short_description}</span>
                  )}
                </div>
                <div className="form-field">
                 <label>Category</label>
            <select  name="category" value={productForm.category} onChange={handleInputChange}>
              <option value="">Select Category</option>
              {categoryOption.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {validationErrors.category && <span className="error-msg">{validationErrors.category}</span>}
</div>
              </div>
              <div className="form-column-2">
                <div className="form-field">
                  <label>Form</label>
                  <input
                    type="text"
                    name="form"
                    placeholder="Form"
                    value={productForm.form}
                    onChange={handleInputChange}
                  />
                  {validationErrors.form && <span className="error-msg">{validationErrors.form}</span>}
                </div>
                <div className="form-field">
                  <label>Product Image:</label>
                  <input
                    type="file"
                    name="image"
                    onChange={(e) => setProductForm((prev) => ({ ...prev, image: e.target.files[0] }))}
                    // required={!productEditing}
                  />
                  {validationErrors.image && <span className="error-msg">{validationErrors.image}</span>}
                </div>
                {previewImage && !productForm.image && (
                  <div className="image-preview">
                    <p>Current Image:</p>
                    <img src={previewImage} alt="Current" width="100" />
                  </div>
                )}

              </div>
            </div>


            <div className="form-buttons">
              <button type="submit">{productEditing ? "Edit Product" : "Add Product"}</button>
              <button type="button" onClick={handleProductCloseModal}>Cancel</button>
            </div>
          </form>
        </div>
      )}

     
      {viewProduct && (
        <div className="modal">
          <div className="modal-content">
            <h3>Product Details</h3>
            <p><strong>Title:</strong> {viewProduct.title}</p>
            <p><strong>Brand :</strong> {viewProduct.brand}</p>
            <p><strong>Short Description:</strong> {viewProduct.short_description}</p>
            <p><strong>Form:</strong> {viewProduct.form}</p>
            <p><strong>Image:</strong></p>
            {viewProduct.image ? (
              <img src={viewProduct.image} alt={viewProduct.title} width="120" />
            ) : (
              <span>No Image</span>
            )}
            <div className="form-buttons">
              <button className="close-btn" onClick={() => setViewProduct(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete this product?</p>
            <div className="form-buttons">
              <button className="otp-btn verify-btn" onClick={handleDelete}>Yes</button>
              <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {filteredProducts.length > Productperpage && (
        <div className="pagination"> 
      
        </div>
      )}
 <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton
      />

    </>
  );
};

export default Product;
