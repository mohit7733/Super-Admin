
import React, { useState, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import { apiFetch } from "../../../fetchapi";


const initialProductForm = {
  title: "",
  vendor: "",
  form: "",
  category: "",
  brand: "",
  short_description: "",
  image: null,
  how_to_use: "",
  sin_number: "",
  model_number: "",
  treatment: "",
  composition: "",
  benefits: "",
  meta_description: "",
  meta_title: "",
  manufacturer: "",
  side_effects: "",
  treatment: "",
  full_description: "",
  return_days: "",
  treatment: "",
  dosage: "",
  side_effect: "",
  ayush_license_number: "",
  is_returnable: true,
  price: "",
  origin: "",
  safety_information:"",
}

const Product = () => {
  const [productSearch, setProductSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productEditing, setProductEditing] = useState(null);
  
  const [categoryOption, setCategoryOptions] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [Currentpage, setCurrentpage] = useState(1);
  const [Productperpage, setProductperpage] = useState(5);
  const [Newcategoryform, setNewCategoryform] = useState(false);
  const [Categoryname, setCategoryname] = useState("");
  const [CategoryImage, setCategoryImage] = useState(null);
  const [categoryValidationErrors, setCategoryValidationErrors] = useState({});
  const [CategoryLoading, setCategoryLoading] = useState(true);
  const [Healthconcerncatergory, setHealthconcerncategory] = useState([]);
  const [previewimage, setPreviewimage] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [HealthCategoryOption, setHealthCategoryOption] = useState([]);
  const [HealthCategoryForm, setHealthCategoryForm] = useState(false);
  const [healthcategoryname, setHealthcategory] = useState();
  const [healthcategoryImage, setHealthCategoryImage] = useState(null);
  const [Slug, setSlug] = useState("");
  const [selectedHealthConcerns, setSelectedHealthConcerns] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);




  const fetchedOnce = useRef(false);

  const fetchProducts = async () => {
    try {
      const response = await apiFetch(`${BASE_URL}/catalogs/product/`);
      console.log("productdata", response)
      if (Array.isArray(response)) {
        setProducts(response);
      } else if (Array.isArray(response.results)) {
        setProducts(response.results);
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
      const response = await apiFetch(`${BASE_URL}/catalogs/productcategory/`);

      setCategoryOptions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchhealthconcerncategory = async () => {
    try {
      const response = await apiFetch(`${BASE_URL}/catalogs/healthconcernscategory/`);
      setHealthCategoryOption(Array.isArray(response) ? response : []);
    }
    catch (error) {
      console.error("Failed to fetch Health Concern Category:", error)
    }
  };

  useEffect(() => {
    if (!fetchedOnce.current) {
      fetchProducts();
      fetchCategoryOptions();
      fetchhealthconcerncategory();
      fetchedOnce.current = true;
    }
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;


    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };



  const handleAddHealthCategory = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", healthcategoryname);
    formData.append("slug", Slug);
    formData.append("icon", healthcategoryImage);

    try {
      const response = await apiFetch(
        `${BASE_URL}/catalogs/healthconcernscategory/`,
        {
          method: "POST",
          body: formData,
        }
      );

      setHealthCategoryOption((prev) => [...prev, response]);
      setHealthCategoryForm(false);
      setHealthcategory("");
      setHealthCategoryImage(null);
      setSlug("");

      toast.success("Category added successfully!");
    } catch (err) {
      console.error(err);

      if (err?.name) {
        toast.error(err.name[0]);
      } else {
        toast.error("Failed to add category.");
      }
    }
  };

  const confirmDelete = (id) => {
    setDeleteProductId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {

    if (!deleteProductId) return;

    try {
      const response = await apiFetch(
        `${BASE_URL}/catalogs/product/${deleteProductId}/`,
        {
          method: "DELETE",

        }
      );


      if (!response || response?.success === false || response?.detail) {
        throw new Error("Unauthorized or failed");
      }


      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteProductId)
      );
      toast.success("Product deleted successfully!");

    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting product. Please try again.");
    } finally {
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };

  const handleHealthConcernChange = (id) => {
    setSelectedHealthConcerns((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const validateForm = () => {
    let errors = {};
    const alphaNumRegex = /^[a-zA-Z0-9\s]+$/;
    const ayushRegex = /^[A-Za-z0-9\/-]{5,30}$/;

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
    if (!productForm.meta_title.trim()) {
      errors.meta_title = "Meta Title is required"
    }



    if (!productForm.form.trim()) {
      errors.form = "Form is required";
    } else if (!alphaNumRegex.test(productForm.form.trim())) {
      errors.form = "Form can only contain letters and numbers";
    }

    if (!productForm.short_description.trim())
      errors.short_description = "Short description is required";

    if (!productForm.category) errors.category = "Category is required";


    if (!productForm.ayush_license_number?.trim()) {
      errors.ayush_license_number = "AYUSH license number is required";
    }
    else if (!ayushRegex.test(productForm.ayush_license_number.trim())) {
      errors.ayush_license_number =
        "Invalid Ayush license number. Example: DL-25-AYU-12345 ";
    }



    if (productForm.return_days === "" || productForm.return_days === null) {
      errors.return_days = "Return days is required";
    } else if (isNaN(productForm.return_days)) {
      errors.return_days = "Return days must be a number";
    } else if (Number(productForm.return_days) < 0) {
      errors.return_days = "Return days cannot be negative";
    } else if (!Number.isInteger(Number(productForm.return_days))) {
      errors.return_days = "Return days must be a whole number";
    } else if (Number(productForm.return_days) > 7) {
      errors.return_days = "Return days cannot be more than 7 days";
    }


    if (!productForm.price?.trim()) {
      errors.price = "price is required"
    }
    if (!productEditing && !productForm.image)
      errors.image = "Product image is required";
    setValidationErrors(errors);
    console.log(errors, 'errors')
    return Object.keys(errors).length === 0;
  };


  const handleProductSubmit = async (e) => {
    e.preventDefault();
    console.log('clicked')
    if (!validateForm()) return;
    console.log('clicked 2')
    const method = productEditing ? "PUT" : "POST";
    const url = productEditing
      ? `${BASE_URL}/catalogs/product/${productEditing}/`
      : `${BASE_URL}/catalogs/product/`;

    const formData = new FormData();
    formData.append("title", productForm.title);
    formData.append("form", productForm.form);
    formData.append("short_description", productForm.short_description);
    formData.append("brand", productForm.brand);
    formData.append("category", productForm.category);
    formData.append("sin_number", productForm.sin_number);
    formData.append("model_number", productForm.model_number);
    formData.append("how_to_use", productForm.how_to_use);
    formData.append("benefits", productForm.benefits)
    formData.append("composition", productForm.composition)
    formData.append("manufacturer", productForm.manufacturer);
  selectedHealthConcerns.forEach((id) => {
  formData.append("health_concern", id);
});
   formData.append("safety_information", productForm.safety_information);
    formData.append("treatment", productForm.treatment);
    formData.append("dosage", productForm.dosage);
    formData.append("side_effect", productForm.side_effects);
    formData.append("ayush_license_number", productForm.ayush_license_number)
    formData.append("is_returnable", true);
    formData.append("price", productForm.price);
    formData.append("meta_title", productForm.meta_title);
    formData.append("meta_description", productForm.meta_description)
    formData.append("full_description", productForm.full_description);
    formData.append("return_days", productForm.return_days);
    formData.append("origin", productForm.origin);


    if (productForm.image instanceof File) {
      formData.append("image", productForm.image);
    }

    try {
      const response = await apiFetch(url, {
        method,
        body: formData,
      });

      if (!response) throw new Error("Invalid response");

      const savedProduct = response;

      setProducts((prev) =>
        productEditing
          ? prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
          : [...prev, savedProduct]
      );

      toast.success(
        productEditing
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      handleProductCloseModal();
    } catch (err) {
      console.error("Error submitting product:", err);
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

 

  const selectedHealthConcernNames = HealthCategoryOption
    .filter((hc) => selectedHealthConcerns.includes(hc.id))
    .map((hc) => hc.name);


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

  const validateCategoryForm = () => {
    let errors = {};
    const alphaNumRegex = /^[a-zA-Z0-9\s]+$/;


    if (!Categoryname.trim()) {
      errors.name = "Category name is required";
    } else if (!alphaNumRegex.test(Categoryname.trim())) {
      errors.name = "Category name can only contain letters and numbers";
    }

    if (!CategoryImage) {
      errors.image = "Category image is required";
    }

    setCategoryValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();


    const formData = new FormData();
    formData.append("name", Categoryname);

    if (CategoryImage instanceof File) {
      formData.append("image", CategoryImage);
    }

    try {
      setCategoryLoading(true);
      const response = await apiFetch(`${BASE_URL}/catalogs/productcategory/`, {
        method: "POST",
        body: formData,
      });


      setCategoryOptions((prev) => [...prev, response]);
      setNewCategoryform(false);
      setHealthcategory("");
      setHealthCategoryImage(null);


      toast.success("Category added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

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
         
          <button
  className="add-customer-btn"
  onClick={() => {
    setProductEditing(null);       
    setProductForm(initialProductForm); 
    setValidationErrors({});
    setShowProductModal(true);
      setSelectedHealthConcerns([]); 
  }}
>
  + Add Product
</button>

        </div>
      </div>




      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Brand</th>
            <th>Short Description</th>
            <th>Form</th>
            <th>Treatment </th>
          <th>Health Category </th>
            <th>Image</th>
            <th>Category</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {loadingProduct ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                <div className="circular-loader"></div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="9" style={{ color: "red" }}>
                {error}
              </td>
            </tr>
          ) : (
            filteredProducts().map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product?.title}</td>
                <td>{product?.brand}</td>
                <td>{product?.short_description}</td>
                <td>{product?.form}</td>
                <td>{product?.treatment}</td>
              <td>
  {product?.healthconcerncategory_detail && product.healthconcerncategory_detail.length > 0
    ? product.healthconcerncategory_detail.map(hc => hc.name).join(", ")
    : "—"}
</td>


                <td>
                  {product?.image ? (
                    <img
                      src={product?.image}
                      alt={product?.title}
                      width="50"
                      style={{ cursor: "pointer", borderRadius: "4px" }}
                      onClick={() => {
                        setPreviewimage(product.image);
                        setShowPreviewModal(true);
                      }}
                    />
                  ) : (
                    "No image"
                  )}
                </td>

                <td>{product?.category_detail?.name ?? ""}</td>
                <td>
                  <div className="action-buttons">
             
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setProductEditing(product.id);

                        setProductForm({
                          title: product.title || "",
                          brand: product.brand || "",
                          treatment: product.treatment || "",
                          form: product.form || "",
                          manufacturer: product.manufacturer || "",
                          ayush_license_number: product.ayush_license_number || "",
                          health_concern: product.health_concern || "",
                          side_effects: product.side_effects || "",
                          benefits: product.benefits || "",
                          how_to_use: product.how_to_use || "",
                          meta_description: product.meta_description || "",
                          price: product.price || "",
                          model_number: product.model_number || "",
                          return_days: product.return_days || "",
                          dosage: product.dosage || "",
                          sin_number: product.sin_number || "",
                          meta_title: product.meta_title || "",
                          origin: product.origin || "India",
                          category: product.category || product?.category_detail?.id || "",
                          short_description: product.short_description || "",
                          full_description: product.full_description || "",
                          composition: product.composition || "",
                          is_returnable: product.is_returnable ?? false,
                          image: null,
                        });
                         setSelectedHealthConcerns(
      product.healthconcerncategory_detail
        ? product.healthconcerncategory_detail.map(hc => hc.id)
        : []
    );

                        setPreviewImage(product.image);
                        setShowProductModal(true);
                      }}
                    >
                      ✏️
                    </button>

                    <button title="Delete Product" className="action-btn delete" tittle="Delete Product" onClick={() => confirmDelete(product.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>



      {showProductModal && (


        <div className='modal1'>
          <div className="vendor-product-container1">
            <form className="vendor-product-form1" onSubmit={handleProductSubmit} >
              <div className="form-title1">
                <span>{productEditing ? "Edit Product" : "Add Product"}</span>

                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowProductModal(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="form-grid1">


                <div className="form-column1">


                  <label className='form-label1'>Product Name<span className="required"> *</span> </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Product Name"
                    value={productForm.title}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.title && <span className="error-msg">{validationErrors.title}</span>}


                  <label className='form-label1'>Brand <span className="required">*</span>  </label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={productForm.brand}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.brand && <span className="error-msg">{validationErrors.brand}</span>}

                  <label className='form-label1'>Treatment <span className="required">*</span>  </label>
                  <input
                    type="text"
                    name="treatment"
                    placeholder="Enter the name of disease which this product cure "
                    value={productForm.treatment}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.treatment && <span className="error-msg">{validationErrors.treatment}</span>}


                  <label className='form-label1'>Form <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="form"
                    placeholder="Form"
                    value={productForm.form}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.form && <span className="error-msg">{validationErrors.form}</span>}

                  <label className='form-label1'>Product Image <span className="required"> *</span></label>
                  <input
                    type="file"
                    name="image"
                    onChange={(e) => setProductForm((prev) => ({ ...prev, image: e.target.files[0] }))}
                    className="form-input1"
                  />
                  {validationErrors.image && <span className="error-msg">{validationErrors.image}</span>}

                  <label className="form-label1">Manufacturer<span className="required"></span> </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={productForm.manufacturer}
                    onChange={handleInputChange}
                    placeholder="Enter the Company Name"
                    className="form-input1"
                  />


                  <label className="form-label1">Ayush License Number<span className="required">* </span> </label>
                  <input
                    type="text"
                    name="ayush_license_number"
                    value={productForm.ayush_license_number}
                    onChange={handleInputChange}
                    placeholder="Enter the Ayush License Number"
                    className="form-input1"
                  />
                  {validationErrors.ayush_license_number && <span className="error-msg">{validationErrors.ayush_license_number}</span>}




                  <label className="form-label1">
                    Health Concern Category <span className="required">*</span>
                  </label>

                  <div className="form-group-inline1">
                    <div className="custom-dropdown1">

                      <div
                        className="form-select1"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        {selectedHealthConcernNames.length > 0
                          ? selectedHealthConcernNames.join(", ")
                          : "Select Health Concern"}
                      </div>

                      {showDropdown && (
                        <div className="dropdown-menu1">
                          {HealthCategoryOption.map((hc) => (
                            <label key={hc.id} className="checkbox-item1">
                              <input
                                type="checkbox"
                                checked={selectedHealthConcerns.includes(hc.id)}
                                onChange={() => handleHealthConcernChange(hc.id)}
                              />
                              {hc.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-secondary1"
                      onClick={() => setHealthCategoryForm(true)}
                    >
                     <span>+Add</span>
                    </button>
                  </div>









                  <label className='form-label1'>Side- Effects </label>
                  <textarea
                    type="text"
                    name="side_effects"
                    placeholder="write side effects of the Product"
                    value={productForm.side_effects}
                    onChange={handleInputChange}
                    classsName="form-input1"
                  />



                  <label className='form-label1'>Benefits </label>
                  <textarea
                    type="text"
                    name="benefits"
                    placeholder="write Benefits of Product"
                    value={productForm.benefits}
                    onChange={handleInputChange}
                    classsName="form-input1"
                  />

                  <label className='form-label1'>How to Use </label>
                  <textarea
                    name="how_to_use"
                    placeholder="Write how to use this product"
                    value={productForm.how_to_use}
                    onChange={handleInputChange}

                    className='form-input1'
                  />

                  <label className='form-label1'>Meta Description </label>
                  <textarea
                    name="meta_description"
                    placeholder="Write the meta description  of Product"
                    value={productForm.meta_description}
                    onChange={handleInputChange}

                    className='form-input1'
                  />

                </div>
                <div className="form-column-1">

                  <label className='form-label1'>Price <span className="required">*</span>  </label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Enter the price of Product "
                    value={productForm.price}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.price && <span className="error-msg">{validationErrors.price}</span>}
                  <label className='form-label1'>Model Number <span className="required"> *</span> </label>
                  <input
                    type="text"
                    name="model_number"
                    placeholder="Enter the Model Number"
                    value={productForm.model_number}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.model_number && <span className="error-msg">{validationErrors.model_number}</span>}

                  <label className="form-label1">Return Days<span className="required">* </span> </label>
                  <input
                    type="number"
                    name="return_days"
                    value={productForm.return_days}
                    onChange={handleInputChange}
                    placeholder="Enter Days for Return"
                    className="form-input1"
                  />
                  {validationErrors.return_days && <span className="error-msg">{validationErrors.return_days}</span>}



                  <label className='form-label1'>Dosage </label>
                  <input
                    type="text"
                    name="dosage"
                    placeholder="write the dosage of the medicine"
                    value={productForm.dosage}
                    onChange={handleInputChange}
                    className="form-input1"
                  />



                  <label className='form-label1'>SIN Number <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="sin_number"
                    placeholder="Enter the SIN Number"
                    value={productForm.sin_number}
                    onChange={handleInputChange}
                    className='form-input1'


                  />
                  {validationErrors.sin_number && <span className="error-msg">{validationErrors.sin_number}</span>}



                  <label className='form-label1'>Meta Title<span className="required"> *</span></label>
                  <input
                    type="text"
                    name="meta_title"
                    placeholder="SEO Meta Title"
                    value={productForm.meta_title}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
                  {validationErrors.meta_title && <span className="error-msg">{validationErrors.meta_title}</span>}
                  <label className='form-label1'>Origin <span className="required">*</span></label>
                  <select
                    name="origin"
                    value={productForm.origin}
                    onChange={handleInputChange}
                    className='form-input1'
                  >
                    <option value="India">India</option>
                  </select>

                  <label className="form-label1"> Category <span className="required"> *</span> </label>
                  <div className="form-group-inline1">
                    <select name="category" value={productForm.category} onChange={handleInputChange}
                      className="form-select1"
                    >
                      <option value="">Select Category</option>
                      {categoryOption.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}

                    </select>
                    <button
                      type="button"
                      className="btn-secondary1"

                      onClick={() => setNewCategoryform(true)}
                    > <span>+Add</span></button>




                  </div>
                  {validationErrors.category && <span className="error-msg">{validationErrors.category}</span>}





                  <label className='form-label1'>Short Description<span className="required"> *</span> </label>
                  <textarea
                    type="text"
                    name="short_description"
                    placeholder="Write Short Description of Products"
                    value={productForm.short_description}
                    onChange={handleInputChange}
                    className="form-input1"
                  />


                  {validationErrors.short_description && <span className="error-msg">{validationErrors.short_description}</span>}



                  <label className='form-label1'>Full Description </label>
                  <textarea
                    name="full_description"
                    placeholder="Write full description of product"
                    value={productForm.full_description}
                    onChange={handleInputChange}
                    className='form-input1'
                  />
  <label className='form-label1'>Benefits </label>
                  <textarea
                    type="text"
                    name="a"
                    placeholder="write Benefits of Product"
                    value={productForm.benefits}
                    onChange={handleInputChange}
                    classsName="form-input1"
                  />



                  <label className='form-label1'>Composition </label>
                  <textarea
                    name="composition"
                    placeholder="Write Composition of Product"
                    value={productForm.composition}
                    onChange={handleInputChange}
                    className='form-input1'
                  />

                  <label className="form-label1">Is Returnable</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      name="is_returnable"
                      checked={true}

                    />
                    <span>Product can be returned</span>
                  </div>


                </div>
              </div>
              <div className="form-buttons">
<button type="submit">
  {productEditing ? "Update Product" : "Add New Product"}
</button>


                <button
                  type="button"
                  onClick={() => {
                    setValidationErrors({});
                    setProductForm(initialProductForm);
                    setShowProductModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>


            </form>
          </div>
        </div>
      )}



      {
        Newcategoryform && (
          <div className="modal">
            <form className="customer-form" onSubmit={handleAddCategory} >
              <h1>Add New Category</h1>
              <label>Category Name<span className="required">*</span></label>
              <input
                type="text"
                name="name"
                placeholder="Enter the New Category"
                value={Categoryname}
                onChange={(e) => {
                  setCategoryname(e.target.value);
                  setCategoryValidationErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {categoryValidationErrors.name && (
                <span className="error-msg">{categoryValidationErrors.name}</span>
              )}

              <label> Category Image<span className="required"> *</span> </label>
              <input
                type="file"
                name="image"
                accept="image/*"

                onChange={(e) => {
                  setCategoryImage(e.target.files[0]);
                  setCategoryValidationErrors((prev) => ({ ...prev, image: "" }));
                }}
              />
              {categoryValidationErrors.image && (
                <span className="error-msg">{categoryValidationErrors.image}</span>
              )}

              <div className="form-buttons">
                <button type="submit"> Add </button>
                <button type="button" onClick={(e) => {
                  setNewCategoryform(false);
                  setCategoryname("");
                  setCategoryImage(null);
                  setCategoryValidationErrors({});
                }}> Cancel</button>
              </div>

            </form>


          </div>
        )
      }


     

      {showPreviewModal && (
        <div className="image-preview-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewimage} alt="Preview" />

          </div>
        </div>
      )}
      {
        HealthCategoryForm && (
          <div className="modal">
            <form className="customer-form" onSubmit={handleAddHealthCategory} >
              <h1>Add Health  Category</h1>
              <label>
                Health Category Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter the New Category"
                value={healthcategoryname}
                onChange={(e) => {
                  const value = e.target.value;
                  setHealthcategory(value);
                  setSlug(generateSlug(value));
                }}

              />
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={Slug}
                disabled
              />

              <input
                type="file"
                name="icon"
                accept="image/*"
                onChange={(e) => setHealthCategoryImage(e.target.files[0])}
              />



              <div className="form-buttons">
                <button type="submit"> Add </button>
                <button type="button" onClick={(e) => {
                  setHealthCategoryForm(false);
                  setHealthcategory("");
                  setHealthCategoryImage(null);
                  setSlug("");

                }}> Cancel</button>
              </div>

            </form>


          </div>
        )
      }

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