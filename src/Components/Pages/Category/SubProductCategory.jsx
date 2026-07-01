
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaEdit,

} from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';
import { FiEye, FiUpload } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify"
import BASE_URL from "../../../Base";

const SubProductCategory = () => {
  const [Data, setData] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);
  const [ShowCategoryModal, setShowCategoryModal] = useState(false);
  const navigate = useNavigate();

  const [SubCategoryForm, setSubCategoryForm] = useState({
    name: "",
    description: "",
    is_active: false,
    category_id: "",
    product_id: "",
    image_url: "",
    hsn_code: "",
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ServiceCategoryData, setServiceCategoryData] = useState([]);
  const [ServiceCategoryLoading, setServiceCategoryLoading] = useState(false);
  const [ServiceCategoryError, setServiceCategoryError] = useState(null);
  const [SubCategoryData, SetSubCategoryData] = useState([]);
  const [SubCategoryLoading, setSubCategoryLoading] = useState(false);
  const [SubCategoryError, setSubCategoryError] = useState(null);
  const [AddError, setAddError] = useState({});
  const [SubCategoryImage, setSubCategoryImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [SubproductcategoryPreviewimage, setSubProductCategoryPreviewImage] = useState("");
  const [SubproductCategoryStatusModal, setProductSubCategoryStatusModal] = useState(false);
  const [selectedSubProductCategory, setSelectedSubProductCategory] = useState(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [TaxClassData, setTaxClassData] = useState([]);
  const [TaxClassLoading, setTaxClassLoading] = useState(false);
  const [TaxClassError, setTaxClassError] = useState(null);


  const [EditForm, setEditForm] = useState({
    name: "",
    description: "",
    is_active: false,
    category_id: "",
    product_id: "",
    image_url: "",
    hsn_code: "",
  });
  const fileInputRef = useRef(null);
  const editFileRef = useRef(null);

  const [EditImage, setEditImage] = useState(null);


  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSubCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));


    setAddError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const uploadImage = async (file) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {

      toast.error("Session Expired, Please Login Again");
      navigate("/login");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("image", file);

      formData.append("dir", "health_issues");

      const response = await fetch(
        `${BASE_URL}/user/upload/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return null;
      }
      const data = await response.json();

      console.log("Upload Response:", data);

      return data?.data?.url;
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");

      return null;
    }
  };
  const handleToggle = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsStatusChanging(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/?id=${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            is_active: !currentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data?.message || "Failed to update status");
        return;
      }

      toast.success(
        !currentStatus
          ? "Category Activated Successfully"
          : "Category Deactivated Successfully"
      );

      await getSubSubProductCategoryList();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsStatusChanging(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setEditErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  // const getCategoryList = async () => {
  // const token = sessionStorage.getItem("superadmin_token");

  //   if (!token) {
  //     toast.error("Session expired. Please login again");
  //     navigate("/login");
  //     return;
  //   }

  // setServiceCategoryLoading(true);


  //   try {
  //     const response = await fetch(
  //       `${BASE_URL}/user/admin/categories/`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //           "ngrok-skip-browser-warning": "true",
  //         },
  //       }
  //     );

  //     if (response.status === 401 || response.status === 403) {
  //       sessionStorage.removeItem("superadmin_token");

  //       toast.error("Session expired. Please login again");

  //       navigate("/login");

  //       return;
  //     }

  //     const data = await response.json();

  //     console.log("Category API Response:", data);

  //     if (data.success) {
  //       setServiceCategoryData(data.data);



  //     } else {
  //       toast.error(data.message || "Failed to get categories");
  //     }

  //   } catch (error) {

  //     console.error("Category Fetch Error:", error);

  //     setError("Something went wrong while fetching data.");

  //     toast.error("Failed to fetch category data");

  //   } finally {
  //     setServiceCategoryLoading(false);
  //   }
  // };
  const handleEdit = (item) => {
    setEditId(item.id);

    setEditForm({
      name: item.name || "",
      description: item.description || "",
      is_active: item.is_active || false,
      product_id: item.product_category_id || "",
      image_url: item.image_url || "",
      tax_class_id: item.tax_class_id || "",

    });

    setEditImage(null);
    setEditErrors({});

    setShowEditModal(true);
  };

  const validateEdit = () => {
    let errors = {};

    if (!EditForm.product_id) {
      errors.product_id = "Product category is required";
    }

    if (!EditForm.name || !EditForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!EditForm.image_url && !EditImage) {
      errors.image_url = "Image is required";
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };;

  const handleUpdateSubSubCategory = async (e) => {
    e.preventDefault();

    if (!validateEdit()) return;

    const token = sessionStorage.getItem("superadmin_token");
    setIsSubmitting(true);

    try {
      let imageUrl = EditForm.image_url;

      if (EditImage) {
        imageUrl = await uploadImage(EditImage);
        if (!imageUrl) return toast.error("Image upload failed");
      }

      const payload = {
        product_category_id: EditForm.product_id,
        name: EditForm.name,
        description: EditForm.description,
        image_url: imageUrl,
        is_active: EditForm.is_active,
        tax_class_id: EditForm.tax_class_id,
      };

      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/?id=${editId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Updated successfully");
        setShowEditModal(false);
        getSubSubProductCategoryList();
      } else {
        toast.error(data.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAddSubSubCategory = async (e) => {
    e.preventDefault();

    let errors = {};



    if (!SubCategoryForm.product_id) {
      errors.product_id = "Please select product category";
      toast.error("Please select product category");
    }

    if (!SubCategoryForm.tax_class_id) {
      errors.tax_class_id = "Please select tax  class";
      toast.error("Please select tax Class");
    }

    if (!SubCategoryForm.name.trim()) {
      errors.name = "Name is required";
      toast.error("Name is required");
    }

    if (!SubCategoryImage) {
      errors.image_url = "Please upload image";
      toast.error("Please upload image");
    }
    const hsnCode = SubCategoryForm.hsn_code.trim();

    if (!hsnCode) {
      errors.hsn_code = "HSN Code is required";
    } else if (hsnCode.length !== 8) {
      errors.hsn_code = "HSN Code must be exactly 8 characters";
    }

    const code = SubCategoryForm.code;
    if (!code) {
      errors.code = "Please enter category code";
    }
    else if (!/^[A-Z]{5}$/.test(code)) {
      errors.code = "Code must be exactly 5 letters (A–Z only)";
    }

    setAddError(errors);

    if (Object.keys(errors).length > 0) return;

    const token = sessionStorage.getItem("superadmin_token");

    try {
      setIsSubmitting(true);

      let imageUrl = "";

      // Upload image first
      if (SubCategoryImage) {
        imageUrl = await uploadImage(SubCategoryImage);

        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        product_category_id: SubCategoryForm.product_id,
        tax_class_id: SubCategoryForm.tax_class_id,
        name: SubCategoryForm.name,
        description: SubCategoryForm.description,
        image_url: imageUrl,
        is_active: SubCategoryForm.is_active,
        hsn_code: SubCategoryForm.hsn_code,
        code: SubCategoryForm.code,

      };

      console.log("Payload:", payload);

      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Sub Sub Category added successfully");

        setShowCategoryModal(false);

        setSubCategoryForm({
          name: "",
          description: "",
          is_active: false,
          category_id: "",
          product_id: "",
          image_url: "",
        });

        setSubCategoryImage(null);

        getSubSubProductCategoryList();
      } else {
        toast.error(data.message || "Failed to add category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubCategoryForm({
      name: "",
      description: "",
      is_active: false,
      product_id: "",
      image_url: "",
      hsn_code: "",
      code: "",
      tax_class_id: "",
    });
    setSubCategoryImage(null);
    setAddError({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSubSubProductCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/`,
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

      console.log("Product Categorysub API Response:", data);

      setData(data.data);


    } catch (err) {
      console.error("Product Category Fetch Error:", err);
      setError("Something went wrong while fetching categories.");
      toast.error("Failed to fetch product categories");
    } finally {
      setLoading(false);
    }
  };
  const getSubProductCategoryList = async (categoryId) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setSubCategoryLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-category/`,
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

      const data = await response.json();

      console.log("Product Category API Response:", data);

      SetSubCategoryData(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSubCategoryLoading(false);
    }
  };
  useEffect(() => {
    getSubProductCategoryList();
    getTaxClasslist();
  }, [])

  const getTaxClasslist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setTaxClassLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/unicommerce-tax-class/`,
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

      console.log("Product Categorysub API Response:", data);

      setTaxClassData(data.data);


    } catch (err) {
      console.error("Product Category Fetch Error:", err);
      setTaxClassError("Something went wrong while fetching categories.");
      toast.error("Failed to fetch product categories");
    } finally {
      setTaxClassLoading(false);
    }
  };
  return (
    <>
      <div className="page-header">
        <h1> Sub Product Category </h1>
        <p className="page-paragraph"> Manage Sub Service Category  and their details</p>
      </div>

      <div className="filter-category">
        <button
          className="add-customer-btn"
          onClick={() => {
            setShowCategoryModal(true);
            setSubCategoryForm(
              {
                name: "",
                description: "",
                is_active: false,
                category_id: "",
                product_id: "",
                image_url: "",
              }
            );
            setAddError({});
            setSubCategoryImage(null);
          }}



        >
          + Add Sub Product Category
        </button>
      </div>
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Total Category</h3>
            <div className="stat2-value">0</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaChartLine size={24} />
          </div>
          <div className="stat2-info">
            <h3>This Year</h3>
            <div className="stat2-value">0</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaCalendarAlt size={24} />
          </div>
          <div className="stat2-info">
            <h3>This Month</h3>
            <div className="stat2-value">0</div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table" >
          <thead>
            <tr>
              <th>ID</th>
              <th>Name </th>
              <th  > HSN Code</th>
              <th> Code</th>
              <th>Image</th>


              <th> Status</th>
              <th> Action</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : Error ? (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {Error}
                </td>
              </tr>
            ) : Data?.length > 0 ? (
              Data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>


                  <td>{item.name}</td>
                  <td>{item.hsn_code}</td>
                  <td>{item.code}</td>
                  <td>
                    <img
                      src={item.image_url}
                      alt="sub-category"
                      width="60"
                      height="60"
                      style={{
                        objectFit: "cover",
                        borderRadius: "6px"
                      }}
                      onClick={() => setSubProductCategoryPreviewImage(item.image_url)}
                    />
                  </td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={() => {
                          setSelectedSubProductCategory(item);
                          setProductSubCategoryStatusModal(true);
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(item)}
                      >
                        <FaEdit />
                      </button>




                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>





      </div>

      {ShowCategoryModal && (

        <div
          className="prakriti-modal-overlay"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Add Sub Product Category</h2>
              <button
                className="close-btn"
                onClick={() => setShowCategoryModal(false)}
              >
                ×
              </button>
            </div>

            <form className="prakriti-form"
              onSubmit={handleAddSubSubCategory} >

              {/* <div className="form-group">
                                                              <label>Select Service Category</label>
                                                  
                                                              <div className="category-row">
                                                  
                                                               <select
  name="category_id"
  value={SubCategoryForm.category_id}
  onChange={(e) => {
    console.log("Selected ID:", e.target.value);

    handleCategoryChange(e);

    getSubProductCategoryList(e.target.value);
  }}
>
  <option value="">Select Service Category</option>

  {ServiceCategoryData?.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
                                                  
                                                              </div>
                                                  
                                                              {AddError.category_id && (
                                                                <p className="error-text">
                                                                  {AddError.category_id}
                                                                </p>
                                                              )}
                                                            </div> */}
              <div className="form-group">
                <label>Select Product Category</label>

                <div className="category-row">

                  <select
                    name="product_id"
                    value={SubCategoryForm.product_id}
                    onChange={handleCategoryChange}
                  >
                    <option value="">
                      Select  Service Category
                    </option>

                    {SubCategoryData?.length > 0 ? (
                      SubCategoryData.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                        >
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Product Category Found
                      </option>
                    )}
                  </select>

                </div>

                {AddError.product_id && (
                  <p className="error-text">{AddError.product_id}</p>
                )}

              </div>

              <div className="form-group">
                <label>Select tax Class</label>

                <div className="category-row">

                  <select
                    name="tax_class_id"
                    value={SubCategoryForm.tax_class_id}
                    onChange={handleCategoryChange}
                  >
                    <option value="">
                      Select Tax Class
                    </option>

                    {TaxClassData?.length > 0 ? (
                      TaxClassData.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                        >
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Tax Class Found
                      </option>
                    )}
                  </select>

                </div>

                {AddError.tax_class_id && (
                  <p className="error-text">{AddError.tax_class_id}</p>
                )}

              </div>

              <div className="form-group">
                <label>Product Sub Category  Name</label>
                <input
                  type="text"
                  name="name"
                  value={SubCategoryForm.name}
                  onChange={(e) => {
                    handleCategoryChange(e);

                    setAddError((prev) => ({
                      ...prev,
                      name: "",
                    }));
                  }}
                  placeholder="Enter category name"
                />

                {AddError.name && (
                  <p className="error-text">{AddError.name}</p>
                )}
              </div>


              <div className="form-group">
                <label> HSN Code</label>
                <input
                  type="text"
                  name="hsn_code"
                  value={SubCategoryForm.hsn_code}
                  onChange={(e) => {
                    let value = e.target.value;

                    value = value.slice(0, 8);

                    setSubCategoryForm((prev) => ({
                      ...prev,
                      hsn_code: value,
                    }));

                    setAddError((prev) => ({
                      ...prev,
                      hsn_code: "",
                    }));
                  }}
                  placeholder="Enter Category Code (Max 8 Characters)"
                />



                {AddError.hsn_code && (
                  <p className="error-text">{AddError.hsn_code}</p>
                )}
              </div>

              <div className="form-group">
                <label> Product sub Category Code</label>
                <input
                  type="text"
                  name="code"
                  value={SubCategoryForm.code}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();


                    value = value.replace(/[^A-Z]/g, "");

                    setSubCategoryForm((prev) => ({
                      ...prev,
                      code: value,
                    }));

                    setAddError((prev) => ({
                      ...prev,
                      code: "",
                    }));
                  }}
                  placeholder="Enter Category Code (A-Z, Max 5 Letters)"
                />
                {AddError.code && (
                  <p className="error-text">{AddError.code}</p>
                )}
              </div>


              <div className="form-group">
                <label> Upload Image</label>
                <div className="upload-box1">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="categoryUpload"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setSubCategoryImage(file);

                        setAddError((prev) => ({
                          ...prev,
                          image_url: "",
                        }));
                      }
                    }}
                  />


                  {SubCategoryImage ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={URL.createObjectURL(SubCategoryImage)}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(URL.createObjectURL(SubCategoryImage), "_blank")
                          }
                        >
                          <FiEye />

                        </button>

                        <button
                          type="button"
                          className="delete-btn-preview"
                          onClick={() => {
                            setSubCategoryImage(null);

                            setSubCategoryForm((prev) => ({
                              ...prev,
                              image_url: "",
                            }));


                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <FiTrash2 />

                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="categoryUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload Sub Product Category image</p>

                      </div>
                    </label>
                  )}
                </div>

                {AddError.image_url && (
                  <p className="error-text">{AddError.image_url}</p>
                )}
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={SubCategoryForm.description}
                  onChange={handleCategoryChange}
                  placeholder="Enter description"
                  rows="4"

                />
              </div>






              <div className="form-group">
                <label>Is Active</label>

                <div className="checkbox-row">

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={SubCategoryForm.is_active}
                    onChange={handleCategoryChange}
                  />



                </div>
              </div>


              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setSubCategoryForm(
                      {
                        name: "",
                        description: "",
                        is_active: false,
                        tax_class_id: "",
                        product_id: "",
                        image_url: "",
                        hsn_code: "",
                        code: "",

                      }
                    );
                    setAddError({});
                    setSubCategoryImage(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Product Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Edit Sub Product Category</h2>

              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>

            <form
              className="prakriti-form"
              onSubmit={handleUpdateSubSubCategory}
            >
              {/* Service Category */}

              {/* <div className="form-group">
          <label>Select Service Category</label>

          <div className="category-row">
            <select
              name="category_id"
              value={EditForm.category_id}
              onChange={(e) => {
                handleEditChange(e);

                getSubProductCategoryList(e.target.value);
              }}
            >
              <option value="">
                Select Product Category
              </option>

              {ServiceCategoryData?.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div> */}

              {/* Sub Service Category */}

              <div className="form-group">
                <label>Select Product Category</label>

                <div className="category-row">
                  <select
                    name="product_id"
                    value={EditForm.product_id}
                    onChange={handleEditChange}
                  >
                    <option value="">
                      Select Product  Category
                    </option>

                    {SubCategoryData?.length > 0 ? (
                      SubCategoryData.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                        >
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option
                        value=""
                        disabled
                      >
                        No Product Category Found
                      </option>
                    )}
                  </select>
                </div>
                {editErrors.product_id && (
                  <p className="error-text">{editErrors.product_id}</p>
                )}
              </div>
              <div className="form-group">
                <label>Select Tax Class</label>

                <div className="category-row">
                  <select
                    name="tax_class_id"
                    value={EditForm.tax_class_id}
                    onChange={handleEditChange}
                  >
                    <option value="">
                      Select tax Class
                    </option>

                    {TaxClassData?.length > 0 ? (
                      TaxClassData.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                        >
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option
                        value=""
                        disabled
                      >
                        No Tax Class found
                      </option>
                    )}
                  </select>
                </div>
                {editErrors.tax_class_id && (
                  <p className="error-text">{editErrors.tax_class_id}</p>
                )}
              </div>
              {/* Name */}

              <div className="form-group">
                <label>Sub Product Category Name</label>

                <input
                  type="text"
                  name="name"
                  value={EditForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter category name"
                />
                {editErrors.name && (
                  <p className="error-text">{editErrors.name}</p>
                )}
              </div>

              {/* Image Upload */}

              <div className="form-group">
                <label>Upload Image</label>

                <div className="upload-box1">

                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    id="editBannerUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setEditImage(file);

                        // ✅ error remove instantly
                        setEditErrors((prev) => ({
                          ...prev,
                          image_url: "",
                        }));
                      }
                    }}
                  />

                  {(EditImage || EditForm.image_url) ? (
                    <div className="banner-preview-wrapper">

                      <div className="banner-preview-left">
                        <img
                          src={
                            EditImage
                              ? URL.createObjectURL(EditImage)
                              : EditForm.image_url
                          }
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(
                              EditImage
                                ? URL.createObjectURL(EditImage)
                                : EditForm.image_url,
                              "_blank"
                            )
                          }
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            document.getElementById("editBannerUpload").click()
                          }
                        >
                          <FiUpload />
                        </button>

                        <button
                          type="button"
                          className="delete-btn-preview"

                          onClick={() => {
                            setEditImage(null);

                            setEditForm((prev) => ({
                              ...prev,
                              image_url: "",
                            }));

                            setEditErrors((prev) => ({
                              ...prev,
                              image_url: "",
                            }));

                            if (editFileRef.current) {
                              editFileRef.current.value = "";
                            }
                          }}        >
                          <FiTrash2 />
                        </button>

                      </div>

                    </div>
                  ) : (
                    <label
                      htmlFor="editBannerUpload"
                      className="upload-label"
                    >
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload sub product image</p>
                        <small>PNG, JPG up to 2MB</small>
                      </div>
                    </label>
                  )}

                </div>
                {editErrors.image_url && (
                  <p className="error-text">{editErrors.image_url}</p>
                )}
              </div>

              {/* Description */}

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={EditForm.description}
                  onChange={handleEditChange}
                  placeholder="Enter description"
                  rows="4"
                />
              </div>

              {/* Status */}

              <div className="form-group">
                <label>Is Active</label>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={EditForm.is_active}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              {/* Footer */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {SubproductcategoryPreviewimage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setSubProductCategoryPreviewImage("")}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>
            </div>

            <div style={{ textAlign: "center" }}>
              <img
                src={SubproductcategoryPreviewimage}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setSubProductCategoryPreviewImage("")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      

      {SubproductCategoryStatusModal && selectedSubProductCategory && (
        <div
          className="activeModal-overlay"
          onClick={() => {
            setProductSubCategoryStatusModal(false);
            setSelectedSubProductCategory(null);
          }}
        >
          <div
            className="activeModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="activeModal-close"
              onClick={() => {
                setProductSubCategoryStatusModal(false);
                setSelectedSubProductCategory(null);
              }}
            >
              ×
            </button>

            <div className="activeModal-icon">
              ⚠️
            </div>

            <h2 className="activeModal-title">
              Confirm Status Change
            </h2>

            <p className="activeModal-text">
              Are you sure you want to
              <span
                className={
                  selectedSubProductCategory.is_active
                    ? "inactive-text"
                    : "active-text"
                }
              >
                {selectedSubProductCategory.is_active
                  ? " Inactive "
                  : " Active "}
              </span>
              this Product Category?
            </p>

            <div className="activeModal-card">
              <h4>{selectedSubProductCategory.name}</h4>
            </div>

            <div className="activeModal-footer">
              <button
                className="activeModal-cancel"
                onClick={() => {
                  setProductSubCategoryStatusModal(false);
                  setSelectedSubProductCategory(null);
                }}
              >
                Cancel
              </button>

              <button
                disabled={isStatusChanging}
                className={`activeModal-confirm ${selectedSubProductCategory.is_active
                  ? "deactivate-btn"
                  : "activate-btn"
                  }`}
                onClick={async () => {
                  await handleToggle(
                    selectedSubProductCategory.id,
                    selectedSubProductCategory.is_active
                  );

                  setProductSubCategoryStatusModal(false);
                  setSelectedSubProductCategory(null);
                }}
              >
                {isStatusChanging
                  ? "Updating..."
                  : `Yes, ${selectedSubProductCategory.is_active
                    ? "Deactivate"
                    : "Activate"
                  }`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default SubProductCategory;