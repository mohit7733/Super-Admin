
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import {  BsThreeDotsVertical } from "react-icons/bs";
import { apiFetch } from "../../../fetchapi";

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
  model_number: "",
  sin_number: "",
  benefits: "",
  how_to_use: "",
  meta_title: "",
  meta_description: "",
  ayush_license_number:"",
  return_days:"",
  side_effects:"",
  treatment:"",
 price:"",
 is_returnable:true,
full_description:"",
composition:"",
treatment:"",


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
  const [galleryImages, setGalleryImages] = useState([]);
  const [BankDetailModal, setBankDetailModal] = useState(false)
  const [error, setError] = useState(null);
  const [vendorDetail, setVendorDetail] = useState([])
  const [VendorProductRejectionModal, setVendorProductRejectionModal] = useState(false);
  const [VendorProductReason, setVendorProductReason] = useState("")
  const [VendorProductId, setSelectedVendorProductId] = useState(null)
  const [viewProductModal, setViewProductModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const[HealthCategoryForm,setHealthCategoryForm]=useState(false);
  const[healthcategoryname,setHealthcategory]=useState();
  const[healthcategoryImage,setHealthCategoryImage]=useState(null);
  const[Slug,setSlug]=useState("")
  const [filter, setFilter] = useState("all");
  const params = useParams();
  const[HealthCategoryOption,setHealthCategoryOption]=useState([]);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
   const [selectedHealthConcerns, setSelectedHealthConcerns] = useState([]);
 

  const { vendorId } = params;

   const selectedHealthConcernNames = HealthCategoryOption
    ?.filter((hc) => selectedHealthConcerns?.includes(hc.id))
    ?.map((hc) => hc.name);


  const handleDeleteProduct = async (id) => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/catalogs/vendorproduct/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }

      })
      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }



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

  const submitRejection = async (e) => {
    e.preventDefault();

    await handleStatusChange(VendorProductId, 'rejected', VendorProductReason);
    setVendorProductRejectionModal(false);
    setVendorProductReason("");
    setSelectedVendorProductId(null);

  };

  const handleRejectClick = (VendorProductId) => {
    setSelectedVendorProductId(VendorProductId);
    setVendorProductRejectionModal(true);
  };

  const removeImage = (index) => {
    const updated = [...galleryImages];
    updated.splice(index, 1);
    setGalleryImages(updated);
  };

  const replaceImage = (index, e) => {
    const newFile = e.target.files[0];
    if (!newFile) return;

    const updated = [...galleryImages];
    updated[index] = newFile;
    setGalleryImages(updated);
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
    return Object.keys(errors)?.length === 0;
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
    return Object.keys(newErrors)?.length === 0;
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
    return Object.keys(newErrors) ?.length === 0;
  };
  const handleEditView = (product) => {
    if (!product || !product.id) return;

    setformData({
      product: product.product || "",
      category: product.category?.id || "",
      variant: product.variant_details?.id || "",
      form: product.form || "",
      selling_price: product.selling_price || "",
      is_low_stock: product.is_low_stock ?? false,
      productName: product.title || "",
      brand: product.brand || "",
      image: product.image || "",
      discount_percentage: product.discount_percentage ?? "",
      quantity_per_pack: product.variant_details?.quantity_per_pack || "",
      mrp: product.variant_details?.mrp || "",
      stock: product.stock || "",
      how_to_use: product.how_to_use || "",
      benefits: product.benefits || "",
      sin_number: product.sin_number || "",
      model_number: product.model_number || "",
      short_description: product.short_description || "",
      meta_description: product.meta_description || "",
      meta_title: product.meta_title || "",
      benefits:product.benefits ||"",
      ayush_license_number:product.ayush_license_number||"",
      gallery_images: product.gallery_images || [],


    });
  setGalleryImages(product.gallery_images || []);
    setISEditing(product.id);
    setShowform(true);
    setViewProductModal(false);
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
    return Object.keys(newErrors)?.length === 0;
  };

  const handleGalleryImages = (e) => {
    const files = Array.from(e.target.files);

    setGalleryImages((prevImages) => [
      ...prevImages,
      ...files
    ]);
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
        benefits: selectedProduct ? selectedProduct.benefits : "",
        how_to_use: selectedProduct ? selectedProduct.how_to_use : "",
        meta_title: selectedProduct ? selectedProduct.meta_title : "",
        meta_description: selectedProduct ? selectedProduct.meta_description : "",
        model_number: selectedProduct ? selectedProduct.model_number : "",
        shortDescription: selectedProduct?.short_description || "",
        sin_number: selectedProduct ? selectedProduct.sin_number : "",
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
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(

        `${BASE_URL}/catalogs/productvariant/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      if (response.status === 401 || response.status === 403) {

        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

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
      is_low_stock: product.is_low_stock ?? false,
      productName: product.title || "",
      brand: product.brand || "",
      shortDescription: product.short_description || "",
      image: product.image || "",
      discount_percentage: product.discount_percentage ?? "",
      quantity_per_pack: product.variant_details?.quantity_per_pack || "",
      mrp: product.variant_details?.mrp || "",
      stock: product.stock || "",
      how_to_use: product.how_to_use || "",
      benefits: product.benefits || "",
      meta_title:product.meta_title || "",
      meta_description:product.meta_description || "",
    });
     
    setISEditing(product.id);
    setShowform(true);
  };


 const fetchProductOptions = async (categoryID) => {
  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(
      `${BASE_URL}/catalogs/productscategory/${categoryID}/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.log("Product API failed:", response.status);
      return;
    }

    const data = await response.json();

    console.log("Products by category ", data);

    setProductOptions(data.data || []); 
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
};
;




 const handleVendorProductSubmit = async (e) => {
  e.preventDefault();
  if (!validateVendorForm()) return;

  const token = sessionStorage.getItem("superadmin_token");

  
  const formDataPayload = new FormData();

  formDataPayload.append("vendor", vendorId);
  formDataPayload.append("product", formData.product);
  formDataPayload.append("category", formData.category);
  formDataPayload.append("variant", formData.variant);
  formDataPayload.append("form", formData.form);
  formDataPayload.append("stock", formData.stock);
  formDataPayload.append("discount_percentage", formData.discount_percentage);
  formDataPayload.append("selling_price", formData.selling_price);
  formDataPayload.append("sin_number", formData.sin_number);
  formDataPayload.append("model_number", formData.model_number);
  formDataPayload.append("benefits", formData.benefits || "");
  formDataPayload.append("how_to_use", formData.how_to_use || "");
  formDataPayload.append("is_low_stock", formData.is_low_stock || false);

  if (!isEditing) {
    formDataPayload.append("is_variant", false);
  }

 galleryImages.forEach((image) => {
  if (image instanceof File) {
    formDataPayload.append("upload_gallery_images", image);
  }
});

    

  let url = `${BASE_URL}/catalogs/vendorproduct/`;
  let method = "POST";

  if (isEditing) {
    url = `${BASE_URL}/catalogs/vendorproduct/${isEditing}/`;
    method = "PUT";
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      body: formDataPayload,
    });

    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData?.error || "Something went wrong");
      return;
    }

    toast.success(
      isEditing
        ? "Vendor product updated successfully!"
        : "Vendor product added successfully!"
    );

    fetchVendorProducts();
    setformData(intialvendorProductform);
    setISEditing(null);
    setShowform(false);
    setGalleryImages([]);

  } catch (error) {
    console.error("Error saving vendor product:", error);
    toast.error("Error saving vendor product.");
  }
};

  const fetchCategoryOptions = async () => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/catalogs/productcategory/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: ` Bearer ${token}`,
        },
      });


      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }
      const data = await response.json();
      setCategoryOptions(data);


    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error("Something went wrong!");
    }
  };

  const filteredProducts = ProductData?.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(productVendorSearch.toLowerCase());

    const matchesStock =
      Stockvendorfilter === "All"
        ? true
        : Stockvendorfilter === "true"
          ? product.is_low_stock === true
          : product.is_low_stock === false;
    const matchesStatus =
      filter === "all"
        ? true
        : product.approval_status === filter;


    return matchesSearch && matchesStock && matchesStatus;


  });


  const handleStatusChange = async (ProductID, newStatus, VendorProductReason) => {

    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/vendors/approvevendorproduct/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `bearer${token}`
        },
        body: JSON.stringify({
          approval_status: newStatus,
          reject_reason: VendorProductReason,
          vendor_product_id: ProductID
        }),
      })
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      setProductData((prev) =>
        prev?.map((Product) =>
          Product.id === ProductID ? { ...Product, approval_status: newStatus } : Product,
        ),
      )
    } catch (err) {
      console.error(err)
      toast.error("Error updating vendor status")
    }
  }

  const handleAddNewSubmit = async (e) => {
    e.preventDefault();
    if (!validateProductAddForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    const method = "POST";
    const url = `${BASE_URL}/catalogs/product/`;

    const formData = new FormData();
    formData.append("title", productAddForm.title);
    formData.append("form", productAddForm.form);
    formData.append("short_description", productAddForm.short_description);
    formData.append("how_to_use", productAddForm.how_to_use);
    formData.append("model_number", productAddForm.model_number);
    formData.append("sin_number", productAddForm.sin_number)
    formData.append("benefits", productAddForm.benefits)
    formData.append("brand", productAddForm.brand);
    formData.append("category", productAddForm.category);
    formData.append("meta_description", productAddForm.meta_description);
    formData.append("meta_title", productAddForm.meta_title)
    formData.append("manufacturer", productAddForm.manufacturer);
   formData.append("ayush_license_number",productAddForm.ayush_license_number);
   formData.append("origin",productAddForm.origin);
   formData.append("price",productAddForm.price);
   formData.append("full_description",productAddForm.full_description);
   formData.append("composition",productAddForm.composition);
formData.append("side_effects",productAddForm.side_effects);

formData.append("treatment",productAddForm.treatment)
formData.append("return_days",productAddForm.return_days)
 selectedHealthConcerns.forEach((id) => {
  formData.append("health_concerns", id);
});

    

    if (productAddForm.image instanceof File) {
      formData.append("image", productAddForm.image);
    }
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(url, {
        method,
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }


      if (!response.ok) throw new Error("Failed to add product");

      const newProduct = await response.json();

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
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/catalogs/variantbyproduct/${productID}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      const data = await response.json();
      console.log("varinattttttttttttttt-->", data);
      setVariantOptions(data?.variants ?? []);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    }
  };


  const handleAddCategory = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", newCategoryName);
    formData.append("image", categoryImage);
    formData.append("slug", "milk");


    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/catalogs/productcategory/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,


      });

      console.log("formdaatat", response);
      const Dataresponse = await response.json();

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }
      if (!response.ok) {

        toast.error(Dataresponse.message || "Category  not Added");
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
    const token = sessionStorage.getItem("superadmin_token");
    try {
      const response = await fetch(`${BASE_URL}/catalogs/vendorproductsbyvendorid/${vendorId}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`

        },
      });
     
      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      const data = await response.json();
      console.log("vendorproductdea>", data.products);
      setProductData(data.products);
      setVendorDetail(data.vendor);
    }

    catch (err) {
      console.error(err.message);
      setError('Something went wrong while fetching data.');
    }
    finally {
      setLoading(false);
    }
  }
  const allImages = [
  selectedProduct?.image,
  ...(selectedProduct?.gallery_images || [])
]?.filter(Boolean);


  useEffect(() => {
    fetchVendorProducts();
    fetchCategoryOptions();
    fetchVariantOptions();
    fetchhealthconcerncategory();
  }, []);


const fetchhealthconcerncategory = async()=>{
  try{
    const response = await apiFetch(`${BASE_URL}/catalogs/healthconcernscategory/`);
    setHealthCategoryOption(Array.isArray(response) ? response : []);
  }
  catch(error){
    console.error("Failed to fetch Health Concern Category:",error)
  }
};

const handleAddHealthCategory = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", healthcategoryname);
  formData.append("slug", Slug);
  formData.append("icon", healthcategoryImage);
 const token= sessionStorage.getItem("superadmin_token")
  try {
    const response = await apiFetch(
      `${BASE_URL}/catalogs/healthconcernscategory/`,
      {
        method: "POST",
        body: formData,
        headers:{
             Authorization: `Bearer ${token}`,
             
        }
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

 const generateSlug = (text) => {
  return text
    .toLowerCase()              
    .trim()                    
    .replace(/\s+/g, "_")       
    .replace(/[^a-z0-9_]/g, ""); 
};

const handleHealthConcernChange = (id) => {
    setSelectedHealthConcerns((prev) =>
      prev.includes(id)
        ? prev?.filter((item) => item !== id)
        : [...prev, id]
    );
  };




  return (
    <div>
      <div className="page-header">
        <h1>Vendor Product</h1>
      </div>


      <div className="customer-detail-card">
        <div className='customer-detail'>
          <div className="customer-header">
            <img
              src={
                vendorDetail?.profile_picture ||
                "https://via.placeholder.com/100"
              }
              alt="Profile"
              className="customer-profile-img"
            />
            <div className="customer-header-info">
              <h3 className="customer-name">
                {vendorDetail?.first_name || "N/A"}{" "}
                {vendorDetail?.last_name || ""}
              </h3>
              <p className="customer-role">Vendor</p>
            </div>
          </div>

          <div className="three-dots" onClick={() => setBankDetailModal(true)}>
            <BsThreeDotsVertical size={22} />
          </div>

        </div>

        <div className="customer-info-grid">

          <div className="info-item">
            <label>Store Name:</label>
            <span>{vendorDetail?.store_name || "N/A"}</span>
          </div>

          <div className="info-item">
            <label>GST Number:</label>
            <span>{vendorDetail?.gst_number || "N/A"}</span>
          </div>

          <div className="info-item">
            <label>Phone Number:</label>
            <span>{vendorDetail?.verified_phone_number || "N/A"}</span>
          </div>

          <div className="info-item">
            <label>Email:</label>
            <span>{vendorDetail?.email || "N/A"}</span>
          </div>

        </div>
      </div>
      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search  Vendor products by title of product......"
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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className='status-filter'
          >
            <option value="all">All</option>
            <option value="pending">Pending </option>
            <option value="approved">Approved</option>
            <option value="rejected"> Rejected</option>

          </select>
          <button
            className="add-customer-btn"
            onClick={() => {
              setformData(intialvendorProductform);
              setFormvariant(intialvariantform);
              setISEditing(null);
              setShowform(true);
              setErrors({});
              setGalleryImages([]);
            }}
          >
            + Add Product
          </button>


        </div>
      </div>


      <div className="customers-stats">

        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{ProductData?.length}</div>
        </div>

        <div className="stat-card">
          <h3>In Stock</h3>
          <div className="stat-value">{ProductData?.filter((v) => v.is_low_stock === true)?.length}</div>
        </div>

        <div className="stat-card">
          <h3>Out of Stock</h3>
          <div className="stat-value">{ProductData?.filter((v) => v.is_low_stock === false)?.length}</div>
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
            <th>Status</th>
            <th>Action</th>

          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
                <div className="circular-loader"></div>
              </td>
            </tr>
          ) : error ? (
            <tr><td colSpan="9" style={{ color: 'red' }}>{error}</td></tr>
          ) : (
            filteredProducts?.length > 0 ? (
              filteredProducts?.map(product => (
                <tr key={product?.id}>
                  <td>
                    <img src={product?.image} alt={product?.title} width="50" />
                  </td>
                  <td>{product?.title}</td>
                  <td>{product?.brand}</td>
                  <td>{product?.category.name}</td>
                  <td>{product?.form} </td>
                  <td>{product?.is_low_stock ? "In Stock" : "Out of stock"}</td>
                  <td>{product?.stock}</td>
                  <td>{product?.selling_price}</td>
                  <td>{product?.discount_percentage}%</td>
                  <td>
                    <select
                      value={product?.approval_status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        if (newStatus === "rejected") {
                          handleRejectClick(product.id, newStatus);
                        } else {
                          handleStatusChange(product.id, newStatus);
                        }
                      }}
                      className="status-dropdown"
                    >
                       <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      
                      <option value="rejected">Rejected</option>

                    </select>
                  </td>

                  <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>

                    <button
                      className="action-menu-toggle"
                      onClick={() =>
                        setOpenMenuId(openMenuId === product.id ? null : product.id)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                      }}
                    >
                      <BsThreeDotsVertical />
                    </button>




                    {openMenuId === product.id && (
                      <div
                        className="action-buttons-modal"

                      >

                        <button
                          className="action-btn1"
                          title="View Product Details"
                          onClick={() => {
                            setSelectedVendorProductId(product.id);
                            setSelectedProduct(product);
                            setViewProductModal(true);
                          }}
                        >
                          <span className="icon">👁</span>
                          <span>Detail Page</span>
                        </button>

                        <button
                          className='action-btn1'
                          tittle="Edit Product Details"
                          onClick={() => handleEditProduct(product)}
                        >
                          <span className="icon">✏️</span>
                          <span>Edit Product</span>

                        </button>


                        <button
                          className="action-btn1"
                          title="Delete"
                          onClick={() => {
                            setDeleteProductId(product.id);
                            setShowDeleteModal(true);
                          }}
                        >


                          <span className="icon" > 🗑</span>
                          <span> Delete Product</span>

                        </button>





                      </div>
                    )}
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
        <div className='modal1'>
          <div className="vendor-product-container1">
            <form className="vendor-product-form1" onSubmit={handleVendorProductSubmit} >
              <div className="form-title1">
                <span>{isEditing ? "Edit vendor Product" : "Add vendor Product"}</span>

                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowform(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="form-grid1">

                <div className="form-column1">


                  <label className="form-label1">Category<span className='required'> * </span></label>
                  <div className="form-group-inline1">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select1"
                    >
                      <option value="">Select Category</option>
                      {categoryOptions?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary1"
                      onClick={() => {
                        setShowAddCategoryForm(true);
                        setCategoryErrors({});
                      }}
                    >
                      + Add
                    </button>
                  </div>
                  {errors.category && <p className="error-text1">{errors.category}</p>}



                  <label className="form-label1">Select Product<span className='required'>* </span></label>
                  <div className="form-group-inline1">
                    <select
                      name="product"
                      value={formData.product}
                      onChange={handleInputChange}
                      className="form-select1"
                    >
                      <option value="">Select Product</option>
                      {productOptions?.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-secondary1"
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

                  </div>
                  {errors.product && <p className="error-text1">{errors.product}</p>}





                  <label className="form-label1">Variant<span className='required'>*</span></label>
                  <div className="form-group-inline1">
                    <select
                      name="variant"
                      value={formData.variant}
                      onChange={handleInputChange}
                      className="form-select1"
                    >
                      <option value="">Select Variant</option>
                      {variantOptions?.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.weight} grams
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      className="btn-secondary1"
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


                  </div>
                  {errors.variant && <p className="error-text1">{errors.variant}</p>}



                  <label className="form-label1">Product Name<span className='required'> * </span></label>
                  <input type="text" name="productName" value={formData.productName || ""} readOnly className="form-input1" />
                  {errors.productName && <p className="error-text1">{errors.productName}</p>}

                  <label className="form-label1">Brand Name <span className='required'>
                    *</span></label>
                  <input type="text" name="brand" value={formData.brand || ""} readOnly className="form-input1" />
                  {errors.brand && <p className="error-text1">{errors.brand}</p>}

                  <label className="form-label1">Product Image<span className='required'> *</span></label>
                  <input type="text" name="image" value={formData.image || ""} readOnly className="form-input1" />
                  {errors.image && <p className="error-text1">{errors.image}</p>}

                  <label className="form-label1">Form <span className='required'>*</span></label>
                  <input type="text" name="form" value={formData.form || ""} readOnly className="form-input1" />
                  {errors.form && <p className="error-text1">{errors.form}</p>}

                  <label className="form-label1">Meta Title<span className='required'> *</span></label>
                  <input type="text" name="form" value={formData.meta_title || ""} readOnly className="form-input1" />
                  {errors.meta_title && <p className="error-text1">{errors.meta_title}</p>}



                  <label className='form-label1'>Stock<span className='required'>* </span></label>
                  <input
                    type="text"
                    name="stock"
                    value={formData.stock || ""}
                    onChange={handleInputChange}
                    className='form-input1'
                  />

                  {errors.stock && <p className="error-text1">{errors.stock}</p>}
                  <label className="form-label1">MRP<span className='required'>* </span></label>
                  <input type="text" name="mrp" value={formData.mrp} onChange={handleInputChange} disabled className="form-input1" />


                  <label className="form-label1">
                    Gallery Images(multiple Images) <span className='required'>*</span>
                  </label>

                  <div className="gallery-upload-box">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      id="galleryUpload"
                      onChange={handleGalleryImages}
                      hidden
                    />

                    <label htmlFor="galleryUpload" className="upload-btn">
                      + Upload Images
                    </label>
                  </div>
{/* 
                  {galleryImages?.length > 0 && (
                    <div className="gallery-preview-grid">
                      {galleryImages?.map((file, index) => (
                        <div className="gallery-card" key={index}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                          />

                          <div className="gallery-actions">
                            <button
                              type="button"
                              className="remove-btn"
                              onClick={() => removeImage(index)}
                            >
                              ✕
                            </button>

                            <label className="replace-btn">
                              Replace
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => replaceImage(index, e)}
                              />
                            </label>
                          </div>

                          <p className="image-name">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )} */}
{Array.isArray(galleryImages) && galleryImages.length > 0 && (
  <div className="gallery-preview-grid">
    {galleryImages.map((file, index) => {
      if (!file) return null;

      let src = "";

      if (file instanceof File || file instanceof Blob) {
        src = URL.createObjectURL(file);
      } else if (typeof file === "string") {
        src = file;
      } else {
        return null; // unknown type
      }

      return (
        <div className="gallery-card" key={index}>
          <img src={src} alt={file.name || "gallery"} />

          <div className="gallery-actions">
            <button
              type="button"
              className="remove-btn"
              onClick={() => removeImage(index)}
            >
              ✕
            </button>

            <label className="replace-btn">
              Replace
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => replaceImage(index, e)}
              />
            </label>
          </div>

          <p className="image-name">
            {file.name || (typeof file === "string" ? file.split("/").pop() : "")}
          </p>
        </div>
      );
    })}
  </div>
)}


                </div>



                <div className="form-column1">


                  <label className="form-label1"> Discount% <span className='required'> *</span></label>
                  <input
                    type="text"
                    name="discount_percentage"
                    value={formData.discount_percentage || ""}
                    onChange={handleInputChange}
                    className="form-input1"
                  />
                  {errors.discount_percentage && <p className="error-text1">{errors.discount_percentage}</p>}

                  <label className="form-label1">Selling Price<span className='required'> *</span></label>
                 <input
  type="text"
  name="selling_price"
  value={formData.selling_price || ""}
  disabled
  className="form-input1"
/>

                  {errors.selling_price && <p className="error-text1">{errors.selling_price}</p>}


                  <label className='form-label1'> SIN Number<span className='required'> *</span> </label>
                  <input
                    name="sin_number"
                    placeholder="Enter the SIN Number"
                    value={formData?.sin_number}
                    onChange={handleProductInputChange}
                    className='form-input1'

                  />

                  {errors.sin_number && <p className="error-text1">{errors.sin_number}</p>}



                  <label className="form-label1">Quantity per Pack<span className='required'> </span></label>
                  <input type="text" name="quantity_per_pack" value={formData.quantity_per_pack || ""} readOnly className="form-input1" />
                  {errors.quantity_per_pack && <p className="error-text1">{errors.quantity_per_pack}</p>}


                  <label className="form-label1">Short Description<span className='required'> *</span></label>
                  <textarea type="text" name="shortDescription" value={formData.shortDescription || ""} maxLength={150} readOnly className="form-input1" />


                  <label className="form-label1">How to use<span className='required'> </span></label>
                  <textarea type="text" name="how_to_use" value={formData.how_to_use || ""} maxLength={150} readOnly className="form-input1" />
                  {errors.how_to_use && <p className="error-text1">{errors.how_to_use}</p>}
                  <label className="form-label1">
                    Benefits <span className='required'> </span></label>
                  <textarea type="text" name="benefits" value={formData.benefits || ""} maxLength={150} readOnly className="form-input1" />
                  {errors.benefits && <p className="error-text1">{errors.benefits}</p>}
                  <label className="form-label1">Meta Description<span className='required'> </span></label>
                  <textarea type="text" name="meta_description" value={formData.meta_description || ""} maxLength={150} readOnly className="form-input1" />

                  {errors.meta_description && <p className="error-text1">{errors.meta_description}</p>}


                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      {isEditing ? "Edit Vendor Product" : "Add Vendor Product"}
                    </button>
                    <button
                      type="button"
                      className="btn-cancel1"
                      onClick={() => {
                        setShowform(false);
                        setGalleryImages([]);
                      }}
                    >
                      Cancel
                    </button>

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
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setCategoryImage(e.target.files[0])}
              name='image'
            />
            {categoryErrors.image && (
              <p style={{ color: "red", fontSize: "13px", margin: "4px 0 0" }}>
                {categoryErrors.image}
              </p>
            )}


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
                {productOptions?.map((prod) => (
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



      {
      ShowAddProductModal && (


        <div className='modal1'>
          <div className="vendor-product-container1">
            <form className="vendor-product-form1" onSubmit={handleAddNewSubmit} >
              <div className="form-title1">
                <span>{isEditing ? "Edit Product" : "Add Product"}</span>

                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setShowAddproductModal(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="form-grid1">


                <div className="form-column1">


                  <label className='form-label1'>Product Name<span className="required"> *</span></label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Product Name"
                    value={productAddForm.title}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.title}
                  </div>



                  <label className='form-label1'>Brand<span className="required">*</span></label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={productAddForm.brand}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.brand}
                  </div>


                  <label className='form-label1'>Form <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="form"
                    placeholder="Form"
                    value={productAddForm.form}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.form}
                  </div>




       <label className='form-label1'>Manufacture <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="manufacturer"
                    placeholder="Enter the company name of product"
                    value={productAddForm.manufacturer}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.manufacture}
                  </div>

                   <label className='form-label1'>Ayush license Number <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="ayush_license_number"
                    placeholder="Enter Ayush License Number"
                    value={productAddForm.ayush_license_number}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.ayush_license_number}
                  </div>

     <label className='form-label1'>Category<span className="required"> *</span></label>
                  <select
                    name="category"
                    value={productAddForm.category}
                    onChange={handleProductInputChange}
                    className='form-input1'

                  >
                    <option value="">Select Category</option>
                    {categoryOptions?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="error-msg">
                    {productAddErrors.category}
                  </div>



                 



                  <label className='form-label1'>Benefits <span className="required"> *</span></label>
                  <textarea
                    type="text"
                    name="benefits"
                    placeholder="write Benefits of Product"
                    value={productAddForm.benefits}
                    onChange={handleProductInputChange}

                  />
                  <div className="error-msg">
                    {productAddErrors.benefits}
                  </div>




                  <label className='form-label1'>How to Use<span className='required'> *</span></label>
                  <textarea
                    name="how_to_use"
                    placeholder="Write how to use this product"
                    value={productAddForm.how_to_use}
                    onChange={handleProductInputChange}

                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.how_to_use}
                  </div>

                  <label className='form-label1'>Meta Description <span className="required">* </span></label>
                  <textarea
                    name="meta_description"
                    placeholder="Write the meta description  of Product"
                    value={productAddForm.meta_description}
                    onChange={handleProductInputChange}

                    className='form-input1'
                  />
                    <label className='form-label1'> Side Effetcs <span className="required">* </span></label>
                  <textarea
                    name="side_effects"
                    placeholder="Enter the Side Effects of Product"
                    value={productAddForm.side_effects}
                    onChange={handleProductInputChange}

                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.side_effects}
                  </div>


  <label className='form-label1'> Full Description <span className="required">* </span></label>
                  <textarea
                    name="full_description"
                    placeholder="Enter the full description of Product"
                    value={productAddForm.full_description}
                    onChange={handleProductInputChange}

                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.full_description}
                  </div>


                </div>
                <div className="form-column-1">


                  <label className='form-label1'>Model Number<span className="required"> * </span></label>
                  <input
                    type="text"
                    name="model_number"
                    placeholder="Enter the Model Number"
                    value={productAddForm.model_number}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                  
                  </div>

                  <label className='form-label1'>SIN Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="sin_number"
                    placeholder="Enter the SIN Number"
                    value={productAddForm.sin_number}
                    onChange={handleProductInputChange}
                    className='form-input1'


                  />
                  <div className="error-msg">
                    {productAddErrors.sin_number}
                  </div>

 <label className='form-label1'>Return Days <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="return_days"
                    placeholder="Enter Return Days for Product"
                    value={productAddForm.return_days}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.return_days}
                  </div>

 

 <label className='form-label1'> Price <span className="required"> *</span></label>
                  <input
                    type="text"
                    name="price"
                    placeholder="Enter the Price of Product"
                    value={productAddForm.price}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.price}
                  </div>



                  <label className='form-label1'>Meta Title <span className="required">* </span></label>
                  <input
                    type="text"
                    name="meta_title"
                    placeholder="SEO Meta Title"
                    value={productAddForm.meta_title}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.meta_title}
                  </div>


                    <label className='form-label1'>Treatment <span className="required">* </span></label>
                  <input
                    type="text"
                    name="treatment"
                    placeholder="Enter the Diseases this product cure"
                    value={productAddForm.treatment}
                    onChange={handleProductInputChange}
                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.treatment}
                  </div>

<label className="form-label1"> Health Concern Category</label>
      <div className="form-group-inline1">
                    <div className="custom-dropdown1">

                      <div
                        className="form-select1"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        {selectedHealthConcernNames?.length > 0
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


<label className='form-label1'>Product Image <span className="required"> *</span></label>
                <input
                    type="file"
                    name="image"
                    onChange={(e) => setProductAddform((prev) => ({ ...prev, image: e.target.files[0] }))}
                  className="form-input1"
                  />
                



                  <label className='form-label1'>Short Description<span className='required'> *</span></label>
                  <textarea
                    type="text"
                    name="short_description"
                    placeholder="Write Short Description of Products"
                    value={productAddForm.short_description}
                    onChange={handleProductInputChange}
                    classsName="form-input1"
                  />
                  <div className="error-msg">
                    {productAddErrors.short_description}
                  </div>




                 
   
                  

                  <label className='form-label1'>Composition <span className='required'> *</span></label>
                  <textarea
                    name="composition"
                    placeholder="Write Composition of Product"
                    value={productAddForm.composition}
                    onChange={handleProductInputChange}

                    className='form-input1'
                  />
                  <div className="error-msg">
                    {productAddErrors.composition}
                  </div>

<label className="form-label1">Is Returnable</label>
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <input
    type="checkbox"
    name="is_returnable"
    checked={productAddForm.is_returnable}
    onChange={(e) =>
      setProductAddform((prev) => ({
        ...prev,
        is_returnable: e.target.checked, 
      }))
    }
  />
  <span>Product can be returned</span>
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
      {BankDetailModal && (
        <div
          className="modal"
          onClick={() => setBankDetailModal(false)}
        >

          <form className="customer-form">


            <h3>Bank Details</h3>

            <div >
              <label>Bank Name:</label>
              <span>{vendorDetail?.bank_name || "Not Provided"}</span>
            </div>

            <div>
              <label>Account Number:</label>
              <span>{vendorDetail?.bank_account_number || "Not Provided"}</span>
            </div>

            <div >
              <label>IFSC Code:</label>
              <span>{vendorDetail?.bank_ifsc_code || "Not Provided"}</span>
            </div>

            <div >
              <label>UPI ID:</label>
              <span>{vendorDetail?.upi_id || "Not Provided"}</span>
            </div>



          </form>
        </div>
      )}


      {viewProductModal && selectedProduct && (

        <div className="vp-overlay">
          <div className="vp-modal">

            <div className="vp-header">
              <div className="vp-header-left">
                <span
                  className="vp-back"
                  onClick={() => setViewProductModal(false)}
                >
                  ←
                </span>
                <h3>Product Detail</h3>
              </div>

              <div className='vp-header-right'>
                <button className="viewEditbtn" onClick={() => handleEditView(selectedProduct)}>Edit</button>
                
              


              </div>
            </div>

            <div className="vp-content">


              <div className="vp-images">
      <div className="vp-main-image">
        <img
          src={selectedProduct.image || "/placeholder.svgy"}
          alt={selectedProduct.title}
          style={{ cursor: "pointer", maxWidth: "400px" }}
        />
      </div>
      <div className="vp-thumbnails" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        {selectedProduct?.gallery_images?.map((img, index) => (
          <img
            key={index}
            src={img || "/placeholder.svg"}
            alt="gallery"
            onClick={() => {
              const currentMainImage = selectedProduct.image
              const newGalleryImages = [...selectedProduct?.gallery_images]
              newGalleryImages[index] = currentMainImage
              setSelectedProduct((prev) => ({
                ...prev,
                image: img,
                gallery_images: newGalleryImages,
              }))
            }}
            style={{ cursor: "pointer", width: "100px", height: "100px" }}
          />
        ))}
      </div>
    </div>


              <div className="vp-details">
                <h4>Product detail</h4>
                <p className="vp-subtitle">
                  Key info to describe and display your product
                </p>

                <div className="vp-grid">
                  <div>
                    <label>Product Name</label>
                    <p>{selectedProduct.title}</p>
                  </div>

                  <div>
                    <label>Brand Name</label>
                    <p>{selectedProduct.brand || "-"}</p>
                  </div>

                  <div>
                    <label>Category</label>
                    <p>{selectedProduct.category?.name}</p>
                  </div>

                  <div>
                    <label>MRP</label>
                    <p>₹{selectedProduct.variant_details?.mrp}</p>
                  </div>

                  <div>
                    <label>Discount</label>
                    <p>{selectedProduct.discount_percentage || 0}%</p>
                  </div>

                  <div>
                    <label>SKU Number</label>
                    <p>{selectedProduct.variant_details?.sku}</p>
                  </div>

                  <div>
                    <label>Quantity</label>
                    <p>{selectedProduct.variant_details?.quantity_per_pack}</p>
                  </div>

                  <div>
                    <label>Selling Price</label>
                    <p>₹{selectedProduct.selling_price}</p>
                  </div>
                </div>

                <div className="vp-text">
                  <label>Description</label>
                  <p>{selectedProduct.short_description}</p>
                </div>

                <div className="vp-text">
                  <label>How to Use</label>
                  <p>{selectedProduct.how_to_use || "-"}</p>
                </div>

              </div>
            </div>
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



      {
        VendorProductRejectionModal && (
          <div className='modal'>
            <div className='modal-content'>
              <form classsName="customer-form">
                <h3> Enter Rejection Reason </h3>
                <textarea
                  value={VendorProductReason}
                  placeholder="enter the reason "
                  onChange={(e) => setVendorProductReason(e.target.value)}
                />
                <div className="form-buttons">
                  <button onClick={submitRejection} type="submit">   Submit  </button>
                  <button type="button" onClick={() => setVendorProductRejectionModal(false)}> Cancel </button>
                </div>

              </form>
            </div>
          </div>
        )
      }


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