
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const intialvendorProductform = {
  product: '',
  category: '',
  mrp: '',
  variant: '',
  selling_price: '',
  discount_percentage: '',
  is_active: false,
}
const intialvariantform = {
  product: "",
  mrp: "",
  sku: "",
  quantity_per_pack: "",
  weight: "",
}

const initalnewproductform = {
  title: "",
  vendor: "",
  form: "",
  category: "",
  brand: "",
  short_description: "",
  image: null,
}
const Vendorproduct = () => {
  const [productVendorSearch, setProductVendorSearch] = useState("");
  const [Stockvendorfilter, setStockVendorFilter] = useState("All");
  const [ProductData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setISEditing] = useState(null);
  const [formData, setformData] = useState(intialvendorProductform);
  const [showForm, setShowform] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [formvariant, setFormvariant] = useState(intialvariantform)
  const [showAddvariant, setShowAddvariant] = useState(false);
  const [ShowAddProductModal, setShowAddproductModal] = useState(false);

  const [productAddForm, setProductAddform] = useState(initalnewproductform);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const [errors, setErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  const [productAddErrors, setProductAddErrors] = useState({});
  const [categoryErrors, setCategoryErrors] = useState({

  });


  const [error, setError] = useState(null);
  const params = useParams();
  const { vendorId } = params;
  console.log("vendorID", vendorId)

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendorproduct/${id}/`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      toast.success("Product deleted successfully!");
      fetchVendorProducts();
    } catch (error) {

      console.error(error);
      toast.error('Failed to delete product');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;


    setFormvariant(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const validateCategoryForm = () => {
    let errors = {};
    if (!newCategoryName.trim()) {
      errors.name = "Category name is required";
    }

    if (!categoryImage) {
      errors.image = "Category image is required";
    }
    setCategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };



  const validateVendorForm = () => {
    let newErrors = {};
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.product) newErrors.product = "Product is required";
    if (!formData.variant) newErrors.variant = "Variant is required";

    if (!formData.stock) newErrors.stock = "Stock is required";
    else if (isNaN(formData.stock)) newErrors.stock = "Stock must be a number";

    if (!formData.discount_percentage) newErrors.discount_percentage = "Discount % is required";
    else if (isNaN(formData.discount_percentage))
      newErrors.discount_percentage = "Discount % must be a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validateProductAddForm = () => {
    let newErrors = {};


    if (!productAddForm.title) {
      newErrors.title = "Product title is required";
    } else if (!/^[A-Za-z0-9\s]+$/.test(productAddForm.title)) {
      newErrors.title = "Title must contain only alphabets and number";
    }


    if (!productAddForm.brand) {
      newErrors.brand = "Brand is required";
    } else if (!/^[A-Za-z0-9\s]+$/.test(productAddForm.brand)) {
      newErrors.brand = "Brand must contain only alphabets and number";
    }


    if (!productAddForm.form) {
      newErrors.form = "Form is required";
    } else if (!/^[A-Za-z0-9\s]+$/.test(productAddForm.brand)) {
      newErrors.form = "Brand must contain only alphabets and number";
    }


    if (!productAddForm.category) {
      newErrors.category = "Category is required";
    }

    if (!productAddForm.image) {
      newErrors.image = "Product image is required";
    }

    setProductAddErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const validateVariantForm = () => {
    let newErrors = {};
    if (!formvariant.product) newErrors.product = "Product is required";

    if (!formvariant.mrp) newErrors.mrp = "MRP is required";
    else if (isNaN(formvariant.mrp)) newErrors.mrp = "MRP must be a number";

    if (!formvariant.sku) newErrors.sku = "SKU is required";

    if (!formvariant.quantity_per_pack) newErrors.quantity_per_pack = "Quantity is required";
    else if (isNaN(formvariant.quantity_per_pack))
      newErrors.quantity_per_pack = "Quantity must be a number";

    if (!formvariant.weight) newErrors.weight = "Weight is required";

    setVariantErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "product") {
      fetchVariantOptions(value);

      const selectedProduct = productOptions.find((p) => p.id === value);

      setformData({
        ...formData,
        product: value,
        productName: selectedProduct ? selectedProduct.title : "",
        brand: selectedProduct ? selectedProduct.brand : "",
        shortDescription: selectedProduct?.short_description || "",
        image: selectedProduct ? selectedProduct.image : "",
        form: selectedProduct ? selectedProduct.form : "",
      });
    }
    else if (name === "variant") {
      const selectedVariant = variantOptions.find((v) => v.id === value);
      setformData({
        ...formData,
        variant: value,
        quantity_per_pack: selectedVariant?.quantity_per_pack || "",
        mrp: selectedVariant?.mrp || "",
        rating: selectedVariant?.rating || "",
      });
    }
    else if (name === "category") {
      fetchProductOptions(value);
      setformData({
        ...formData,
        category: value,
      });
    }



    else if (name === "discount_percentage") {
      const discount = parseFloat(value);
      const original = parseFloat(formData.mrp);

      let sellingPrice = "";

      if (!isNaN(discount) && !isNaN(original)) {
        const discountedPrice = original - (original * discount) / 100;
        sellingPrice = discountedPrice.toFixed(2);
      }

      setformData({
        ...formData,
        discount_percentage: value,
        selling_price: sellingPrice,
      });

    }

    else {

      setformData({
        ...formData,
        [name]: value,
      });
    }



  };


  const handlevariantsubmit = async (e) => {
    e.preventDefault();

    if (!validateVariantForm()) {
      toast.error("Please fix form errors before submitting");
      return;
    }

    const payload = {
      product: formvariant.product,
      mrp: formvariant.mrp,
      sku: formvariant.sku,
      quantity_per_pack: formvariant.quantity_per_pack,
      weight: formvariant.weight,
    };

    try {
      const response = await fetch(
        "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/productvariant/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("responsevariant--->", data);

        toast.success("Variant added successfully!");
        fetchVariantOptions(formvariant.product);
        setFormvariant(intialvariantform);
        setVariantErrors({});
        setShowAddvariant(false);
      } else {
        const errorData = await response.json();
        console.log("errorData", errorData);


        if (errorData.sku) {
          setVariantErrors({ sku: errorData.sku[0] });
        }

        toast.error("Failed to add variant");
      }
    } catch (error) {
      console.error("Error adding variant:", error);
      toast.error("Something went wrong");
    }
  };



  const handleEditProduct = async (product) => {

    await fetchProductOptions(product.category?.id);


    await fetchVariantOptions(product.product);

    setformData({
      product: product.product || "",
      category: product.category?.id || "",
      variant: product.variant_details?.id || "",
      form: product.form || "",
      selling_price: product.selling_price || "",
      is_active: product.is_active ?? false,
      productName: product.title || "",
      brand: product.brand || "",
      shortDescription: product.short_description || "",
      image: product.image || "",
      discount_percentage: product.discount_percentage ?? "",
      quantity_per_pack: product.variant_details?.quantity_per_pack || "",
      mrp: product.variant_details?.mrp || "",
      stock: product.stock || ""
    });

    setISEditing(product.id);
    setShowform(true);
  };



  const fetchProductOptions = async (categoryID) => {
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/productscategory/${categoryID}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log("responsecatgeoryy", response);
      const data = await response.json();
      console.log("productbycategoryy--->", data.data);
      setProductOptions(data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleVendorProductSubmit = async (e) => {
    e.preventDefault();
    if (!validateVendorForm()) return;

    let payload;

    if (isEditing) {
      payload = {
        vendor: vendorId,
        product: formData.product,
        category: formData.category,
        variant: formData.variant,
        form: formData.form,
        discount_percentage: formData.discount_percentage,
        is_active: formData.is_active || false,
        stock: formData.stock,
        selling_price: formData.selling_price
      
      };
    } else {
      payload = {
        vendor: vendorId,
        product: formData.product,
        category: formData.category,
        variant: formData.variant,
        is_variant: false,
        form: formData.form,
        selling_price: formData.selling_price,
        is_active: formData.is_active || false,
        stock: formData.stock,
        discount_percentage: formData.discount_percentage,
      };
    }


    console.log("Vendorpoduct", payload);

    try {
      let url = "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendorproduct/";
      let method = "POST";

      if (isEditing) {
        url = `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendorproduct/${isEditing}/`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

    
      console.log("responsevendor", response);


      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error);
         toast.error(errorData.non_field_errors[0])
         
        return;
      }

      toast.success(isEditing ? "Vendor product updated successfully!" : "Vendor product added successfully!");
      fetchVendorProducts();
      setformData(intialvendorProductform);
      setISEditing(null);
      setShowform(false);


    } catch (error) {
      console.error("Error saving vendor product:", error);
      toast.error("Error saving vendor product.");

    }
  };

  const fetchCategoryOptions = async () => {

    try {
      const response = await fetch('https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/productcategory/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setCategoryOptions(data);

    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error("Something went wrong!");
    }
  };

  const handleAddNewSubmit = async (e) => {
  e.preventDefault();
  if (!validateProductAddForm()) {
    toast.error("Please fix the form errors before submitting");
    return;
  }

  const method = "POST";
  const url = "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/product/";

  const formData = new FormData();
  formData.append("title", productAddForm.title);
  formData.append("form", productAddForm.form);
  formData.append("short_description", productAddForm.short_description);
  formData.append("brand", productAddForm.brand);
  formData.append("category", productAddForm.category);

  if (productAddForm.image instanceof File) {
    formData.append("image", productAddForm.image);
  }

  try {
    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to add product");

    const newProduct = await res.json(); 

    toast.success("Product added successfully!");

   
    setProductOptions((prev) => [...prev, newProduct]);

    setShowAddproductModal(false);
    setProductAddform(initalnewproductform); 
    setShowform(true);
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit product");
  }
};

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductAddform(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const fetchVariantOptions = async (productID) => {
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/variantbyproduct/${productID}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log("varinattttttttttttttt-->", data);
      setVariantOptions(data?.variants ?? []);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    }
  };


  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (validateCategoryForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }
    const formData = new FormData();
    formData.append("name", newCategoryName);
    formData.append("image", categoryImage);
    formData.append("slug", "milk");

    try {
      const response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/productcategory/", {
        method: "POST",
        body: formData,
      });

      console.log("formdaatat", response);
      const Dataresponse = await response.json();

      console.log("formjsin", Dataresponse)

      if (!response.ok) {

        toast.error(Dataresponse.message || "Category already exists");
        return;

      }

      else {
        toast.success("Category added successfully!");

        const newCategoryId = Dataresponse.id;


        setformData((prev) => ({
          ...prev,
          category: newCategoryId,
        }));


        fetchCategoryOptions();
        setShowAddCategoryForm(false);
        setNewCategoryName("");
        setCategoryImage(null);
      }

    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Error adding category.");
    }
  };

  const fetchVendorProducts = async () => {
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendorproductsbyvendorid/${vendorId}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log("vendorproduct---->", data.products);
      setProductData(data.products);
    }

    catch (err) {
      console.error(err.message);
      setError('Something went wrong while fetching data.');
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendorProducts();
    fetchCategoryOptions();
    fetchVariantOptions();
  }, []);


  return (
    <div>
      <div className="page-header">
        <h1>Vendor Product</h1>
      </div>

      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search  Vendor products..."
            value={productVendorSearch}
            onChange={(e) => setProductVendorSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={Stockvendorfilter}
            onChange={(e) => setStockVendorFilter(e.target.value)}
            className="status-filter"
          >
            <option value="All">All</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>

          <button
            className="add-customer-btn"
            onClick={() => {
              setformData(intialvendorProductform);
              setFormvariant(intialvariantform);
              setISEditing(null);
              setShowform(true);
              setErrors({});
            }}
          >
            + Add Product
          </button>

        </div>
      </div>
      <div className="customers-stats">

        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{ProductData.length}</div>
        </div>

        <div className="stat-card">
          <h3>In Stock</h3>
          <div className="stat-value">{ProductData.filter((v) => v.is_active === true).length}</div>
        </div>

        <div className="stat-card">
          <h3>Out of Stock</h3>
          <div className="stat-value">{ProductData.filter((v) => v.is_active === false).length}</div>
        </div>
      </div>
      <table className="vendors-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Form</th>
            <th>Stock Status</th>


            <th>Stock</th>
            <th>Price (₹)</th>
            <th>Discount (%)</th>

            <th>Action</th>

          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="9">loading Vendor Product.......</td></tr>
          ) : error ? (
            <tr><td colSpan="9" style={{ color: 'red' }}>{error}</td></tr>
          ) : (
            ProductData.length > 0 ? (
          ProductData.map(product => (
                <tr key={product.id}>
                  <td>
                    <img src={product.image} alt={product.title} width="50" />
                  </td>
                  <td>{product.title}</td>
                  <td>{product.brand}</td>
                  <td>{product.category.name}</td>
                  <td>{product.form} </td>
                  <td>{product.is_active ? "In Stock" : "Out of stock"}</td>
                  <td>{product.stock}</td>
                  <td>{product.selling_price}</td>
                  <td>{product.discount_percentage}%</td>
  <td>
                    <div className='action-buttons'>
                      <button
                        className='action-btn edit'
                        tittle="Edit Product Details"
                        onClick={() => handleEditProduct(product)}
                      >
                        ✏️
                      </button>

                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => {
                          setDeleteProductId(product.id);
                          setShowDeleteModal(true);
                        }}
                      >
                        🗑
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            ) :

              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td>
              </tr>


          )}


        </tbody>
      </table>

     


 
 {showForm && (
  <div className='modal'>
    <div className="vendor-product-container">
      <form className="vendor-product-form" onSubmit={handleVendorProductSubmit} >
        <h2 className="form-title">{isEditing ? "Edit Vendor Product" : "Add Vendor Product"}</h2>

        <div className="form-grid">

          <div className="form-column">

      
            <label className="form-label">Category</label>
            <div className="form-group-inline">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <p className="error-text">{errors.category}</p>}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowAddCategoryForm(true);
                setCategoryErrors({});
              }}
            >
              + Add
            </button>


            <label className="form-label">Select Product:</label>
            <div className="form-group-inline">
              <select
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Product</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
            {errors.product && <p className="error-text">{errors.product}</p>}
            {/* <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowAddproductModal(true);
                setProductAddErrors({});
              }}
            >
              + Add
            </button> */}
            <button
  type="button"
  className="btn-secondary"
  onClick={() => {
    setShowAddproductModal(true);
    setProductAddErrors({});
    setProductAddform((prev) => ({
      ...prev,
      category: formData.category || ""
    }));
  }}
>
  + Add
</button>



            <label className="form-label">Variant</label>
            <div className="form-group-inline">
              <select
                name="variant"
                value={formData.variant}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Variant</option>
                {variantOptions.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.weight} tablets
                  </option>
                ))}
              </select>
            </div>
            {errors.variant && <p className="error-text">{errors.variant}</p>}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFormvariant((prev) => ({
                  ...prev,
                  product: formData.product || ""
                }));
                setShowAddvariant(true);
                setVariantErrors({});
              }}
            >
              + Add
            </button>


       
            <label className="form-label">Product Name:</label>
            <input type="text" name="productName" value={formData.productName || ""} readOnly className="form-input" />

            <label className="form-label">Brand Name:</label>
            <input type="text" name="brand" value={formData.brand || ""} readOnly className="form-input" />

            <label className="form-label">Product Image:</label>
            <input type="text" name="image" value={formData.image || ""} readOnly className="form-input" />
          </div>


         
          <div className="form-column">
            <label className="form-label">Form:</label>
            <input type="text" name="form" value={formData.form || ""} readOnly className="form-input" />

            <label className="form-label">Short Description:</label>
            <input type="text" name="shortDescription" value={formData.shortDescription || ""} maxLength={150} readOnly className="form-input" />

            <label className="form-label">Quantity per Pack:</label>
            <input type="text" name="quantity_per_pack" value={formData.quantity_per_pack || ""} readOnly className="form-input" />

            <label className="form-label">MRP:</label>
            <input type="text" name="mrp" value={formData.mrp} onChange={handleInputChange} disabled className="form-input" />

            <label> Discount%</label>
            <input
              type="text"
              name="discount_percentage"
              value={formData.discount_percentage || ""}
              onChange={handleInputChange}
              className="form-input"
            />
            {errors.discount_percentage && <p className="error-text">{errors.discount_percentage}</p>}

            <label className="form-label">Selling Price:</label>
            <input
              type="text"
              name="selling_price"
              disabled={true}
              style={{ backgroundColor: '#d4ccccff' }}
              value={formData.selling_price}
              onChange={handleInputChange}
              className="form-input"
            />

            <label className='form-label'>Stock:</label>
            <input
              type="text"
              name="stock"
              value={formData.stock || ""}
              onChange={handleInputChange}
              className='form-input'
            />
            {errors.stock && <p className="error-text">{errors.stock}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {isEditing ? "Edit Vendor Product" : "Add Vendor Product"}
              </button>
              <button type="button" className="btn-cancel" onClick={() => setShowform(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
)}




      {showAddCategoryForm && (
        <div className='modal'>
          <form className='customer-form' onSubmit={handleAddCategory}>
            <h2>Add New Category</h2>

            <div>
              <input
                type="text"
                placeholder="Enter your category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                name='name'
              />
              {categoryErrors.name && (
                <p style={{ color: "red", fontSize: "13px", margin: "4px 0 0" }}>
                  {categoryErrors.name}
                </p>
              )} 
            </div>


            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCategoryImage(e.target.files[0])}
                name='image'
              />
               {categoryErrors.image && (
                <p style={{ color: "red", fontSize: "13px", margin: "4px 0 0" }}>
                  {categoryErrors.image}
                </p>
              )} 
            </div>

            <div className='form-buttons'>
              <button type="submit">Add Category</button>
              <button type="button" onClick={() => setShowAddCategoryForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}




      {showAddvariant && (
        <div className="modal">
          <form className="customer-form" onSubmit={handlevariantsubmit}>
            <h2>Add New Variant</h2>

            <label>Product:</label>
            <div className="input-wrapper">
              <select
                name="product"
                value={formvariant.product}
                onChange={handleChange}
                required
              >
                <option value="">Select Product</option>
                {productOptions.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.title}
                  </option>
                ))}
              </select>
              {variantErrors.product && (
                <span className="error-text">{variantErrors.product}</span>
              )}
            </div>

            <label>MRP:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="mrp"
                value={formvariant.mrp}
                onChange={handleChange}
                placeholder="Enter MRP"
              />
              {variantErrors.mrp && (
                <span className="error-text">{variantErrors.mrp}</span>
              )}
            </div>

            <label>SKU:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="sku"
                value={formvariant.sku}
                onChange={handleChange}
                placeholder="Enter SKU"
              />
              {variantErrors.sku && (
                <span className="error-text">{variantErrors.sku}</span>
              )}
            </div>

            <label>Quantity per Pack:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="quantity_per_pack"
                value={formvariant.quantity_per_pack}
                onChange={handleChange}
                placeholder="e.g. 60"
              />
              {variantErrors.quantity_per_pack && (
                <span className="error-text">{variantErrors.quantity_per_pack}</span>
              )}
            </div>

            <label>Weight:</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="weight"
                value={formvariant.weight}
                onChange={handleChange}
                placeholder="Enter weight"
              />
              {variantErrors.weight && (
                <span className="error-text">{variantErrors.weight}</span>
              )}
            </div>

            <div className="form-buttons">
              <button type="submit">Add variant</button>
              <button type="button" onClick={() => setShowAddvariant(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      {ShowAddProductModal && (
        <div className="modal">

          <form onSubmit={handleAddNewSubmit} className="product-form">
            <h3>Add New Product</h3>
            <div className="form-grid">

              <div className="form-column-1">
                <div className="form-field">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Product Name"
                    value={productAddForm.title}
                    onChange={handleProductInputChange}

                  />
                  <div className="error-msg">
                    {productAddErrors.title}
                  </div>
                </div>

                <div className="form-field">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={productAddForm.brand}
                    onChange={handleProductInputChange}

                  />
                  <div className="error-msg">
                    {productAddErrors.brand}
                  </div>
                </div>

                <div className="form-field">
                  <label>Short Description</label>
                  <input
                    type="text"
                    name="short_description"
                    placeholder="Write your description"
                    value={productAddForm.short_description}
                    onChange={handleProductInputChange}
                  />
                  <div className="error-msg">
                    {productAddErrors.short_description}
                  </div>
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <select
                    name="category"
                    value={productAddForm.category}
                    onChange={handleProductInputChange}

                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="error-msg">
                    {productAddErrors.category}
                  </div>
                </div>




              </div>


              <div className="form-column-2">
                <div className="form-field">
                  <label>Form</label>
                  <input
                    type="text"
                    name="form"
                    placeholder="Form"
                    value={productAddForm.form}
                    onChange={handleProductInputChange}

                  />
                  <div className="error-msg">
                    {productAddErrors.form}
                  </div>
                </div>

                <div className="form-field">
                  <label>Product Image:</label>
                  <input
                    type="file"
                    name="image"
                    onChange={(e) =>
                      setProductAddform((prev) => ({
                        ...prev,
                        image: e.target.files[0],
                      }))
                    }

                  />
                  <div className="error-msg">
                    {productAddErrors.image}
                  </div>

                </div>
              </div>
            </div>

           

            <div className="form-buttons">
              <button title="Add New Product" type="submit">Add New Product</button>
              <button
                type="button"
                onClick={() => setShowAddproductModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this product?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => {
                  handleDeleteProduct(deleteProductId);
                  setShowDeleteModal(false);
                }}
              >
                Yes
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                No
              </button>
            </div>
          </div>
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



    </div>

  );
};

export default Vendorproduct;