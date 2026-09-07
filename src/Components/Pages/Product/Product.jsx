
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import BASE_URL from "../../../Base";
import { apiFetch } from "../../../fetchapi";
import { BsDownload, BsPlus, BsSearch, BsThreeDotsVertical } from "react-icons/bs";

import { MdEditLocationAlt } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaEdit}from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";

  


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


  const [products,setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productEditing, setProductEditing] = useState(null);
   const [searchTerm, setSearchTerm] = useState("")
  
 

 const [currentPage, setCurrentPage] = useState(1);
 const pageSize = 5;
const [totalCount, setTotalCount] = useState(0);
const totalPages = Math.ceil(totalCount / pageSize);
const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
const [Nextpage, setNextPage] = useState(null);
const [previousPage, setPreviousPage] = useState(null);
 const [openMenuId, setOpenMenuId] = useState(null);
 const navigate = useNavigate();
 const[ProductId,setProductId]=useState(null);
 const[SelectedStatus,setSelectedStatus]=useState("");
 const[showReasonModal,setShowReasonModal]=useState(false);
 const[RejectReason,setRejectReason]=useState("")
 const fetchedOnce = useRef(false);
 

 const fetchProducts = async (page = 1) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoadingProduct(true); 

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product/?page=${page}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");

      toast.error("Session expired. Please login again");

      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Product API Response:", data);

     setProducts(data.data.results);
setTotalCount(data.data.count);
setNextPage(data.data.next);
setPreviousPage(data.data.previous);
setCurrentPage(page);
  } catch (error) {
    console.error("Product Fetch Error:", error);

    setError("Something went wrong while fetching data.");

    toast.error("Failed to fetch product data");

    
  } finally {
    setLoadingProduct(false);
  }
};



const handleNavigate = (id) => {
    navigate(`/Productdetail/${id}`)
  }

 
 

 

 const handleRejectClick = (ProductId, statusType) => {
    setProductId(ProductId);
    setSelectedStatus(statusType);
    setShowReasonModal(true);
  };
 const handleStatusChange = async (
  productId,
  newStatus,
  reason = ""
) => {
  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product/status/`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          product_id: productId,
          status: newStatus,
          reason: reason,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, status: newStatus }
          : product
      )
    );

    toast.success("Status updated successfully");
  } catch (err) {
    console.error(err);
    toast.error("Error updating product status");
  }
};
 
 const submitRejection = async (e) => {
  e.preventDefault();

  await handleStatusChange(
    ProductId,
    SelectedStatus,
    RejectReason
  );

  setShowReasonModal(false);
  setRejectReason("");
  setProductId("");
  setSelectedStatus("");
};

useEffect(()=>{
  fetchProducts();
},[])


  return (
    <>

      <div className="page-header">
        <h1>Product</h1>
      </div>


      <div className="customers-controls">
       
         <div className="search-wrapper">
          <BsSearch className="search-icon" />
           <input
            type="text"
            placeholder="Search product by product name ..."
            // value={productSearch}
            // onChange={(e) => setProductSearch(e.target.value)}
            className="search-input"
          /> 
        </div>
        <div className="filter-controls">
         
          {/* <button
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
</button> */}

        </div>
      </div>


<div className="table-wrapper">
     <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Brand</th>
               <th> Action</th>

          </tr>
        </thead>
        <tbody>
{loadingProduct ? (
  Array(3)
    .fill(0)
    .map((_, i) => (
      <tr key={i}>
        <td colSpan="10">
          <div className="skeleton-row"></div>
        </td>
      </tr>
    ))
) : error ? (
  <tr>
    <td colSpan="10" style={{ color: "red" }}>
      {error}
    </td>
  </tr>
) : products.length > 0 ? (
  products.map((product, index) => (
   <tr key={product.id}>
  <td>{index + 1}</td>

  <td>{product?.name}</td>

  <td>{product?.brand_name}</td>
  
  <td>
<div className="action-buttons">
     <button className="action-btn view" title=" View product details " onClick={() => handleNavigate(product.id)}>
       <FaEye/>
     </button>
       

</div>
      
  </td>

   

</tr>
  ))
) : (
  <tr>
    <td colSpan="10" style={{ textAlign: "center" }}>
      No Data Found
    </td>
  </tr>
)}
        </tbody>
      </table>

      {totalPages > 1 && (
    <div className="pagination">
      <button
        onClick={() =>  fetchProducts(currentPage - 1, searchTerm)}
        disabled={!previousPage}
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() =>  fetchProducts(page, searchTerm)}
          style={{
            fontWeight:currentPage === page ? "bold" : "normal",
            background:
              currentPage === page ? "#0D614E" : "#fff",
            color:
              currentPage === page ? "#fff" : "#0D614E",
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() =>  fetchProducts(currentPage + 1, searchTerm)}
        disabled={!Nextpage}
      >
        Next
      </button>
    </div>
  )}
      
</div>

   
    

  {showReasonModal && (
        <div className=" modal">

          <form className="customer-form">
            <h3>
            {SelectedStatus === "rejected"
                ? "Enter Rejected Reason"
                : "Enter Suspended Reason"}
            </h3>
            <textarea
              value={RejectReason}
              placeholder={
                SelectedStatus === "rejected"
                  ? "Enter the reason for rejection..."
                  : "Enter the reason for suspension..."
              }
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="form-buttons">
              <button onClick={submitRejection} type="submit">   Submit  </button>
              <button type="button" onClick={() => setShowReasonModal(false)}> Cancel </button>
            </div>

          </form>
        </div>

      )} 

      {/* {showProductModal && (


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
      )} */}



      {/* {
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
      } */}


     

      {/* {showPreviewModal && (
        <div className="image-preview-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewimage} alt="Preview" />

          </div>
        </div>
      )} */}
      {/* {
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
      } */}

      {/* {showDeleteModal && (
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
      )} */}
      <ToastContainer position="top-center" autoClose={2000} />
      </>
  );
};

export default Product;