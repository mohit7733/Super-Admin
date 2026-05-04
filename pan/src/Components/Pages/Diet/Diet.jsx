import React from "react";
import "./Diet.css";
import { useState,useEffect } from "react";
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { FaSmileBeam } from "react-icons/fa";
import { data } from "react-router-dom";
import {  BsThreeDotsVertical } from "react-icons/bs";



// const dietPlans = [
//   {
//     id: 1,
//     name: "Weight Loss Diet Plan",
//     desc: "Healthy & balanced diet for weight loss",
//     category: "Weight Loss",
//     duration: "30 Days",
//     meals: "4 Meals/Day",
//     users: 120,
//     status: "Active",
//     date: "15 May 2024",
//     image: "https://source.unsplash.com/50x50/?salad",
//   },
//   {
//     id: 2,
//     name: "Weight Gain Diet Plan",
//     desc: "High protein diet for weight gain",
//     category: "Weight Gain",
//     duration: "30 Days",
//     meals: "5 Meals/Day",
//     users: 68,
//     status: "Active",
//     date: "10 May 2024",
//     image: "https://source.unsplash.com/50x50/?healthy-food",
//   },
//   {
//     id: 3,
//     name: "PCOS Diet Plan",
//     desc: "Special diet for PCOS management",
//     category: "Medical",
//     duration: "30 Days",
//     meals: "4 Meals/Day",
//     users: 35,
//     status: "Active",
//     date: "05 May 2024",
//     image: "https://source.unsplash.com/50x50/?diet",
//   },
// ];



// const getCategoryClass = (category) => {
//   return `category ${category.toLowerCase().replace(" ", "-")}`;
// };

const Diet = () => {

    const [PlanModal,setPlanModal]=useState(false);
    const [ingredients, setIngredients] = useState([
  { name: "", qty: "" }
]);

const [DietplanData,setDietPlanData]=useState([]);
const[Loading,setLoading]=useState(true);
const[Error,setError]=useState(null);
const[OpenthreedotId,setOpenthreedotId] =useState(null);

const [images, setImages] = useState([]);
const [previewIndex, setPreviewIndex] = useState(null);

const [steps, setSteps] = useState([""]);

const addIngredient = () => {
  setIngredients([...ingredients, { name: "", qty: "" }]);
};
const removeIngredient = (index) => {
  const updated = ingredients.filter((_, i) => i !== index);
  setIngredients(updated);
};
const handleIngredientChange = (index, field, value) => {
  const updated = [...ingredients];
  updated[index][field] = value;
  setIngredients(updated);
};
  const addStep = () => {
  setSteps([...steps, ""]);
};
const removeStep = (index) => {
  const updated = steps.filter((_, i) => i !== index);
  setSteps(updated);
};
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);

  const imageFiles = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }));

  setImages((prev) => [...prev, ...imageFiles]);
};
const removeImage = (index) => {
  const updated = images.filter((_, i) => i !== index);
  setImages(updated);
};

const handleStepChange = (index, value) => {
  const updated = [...steps];
  updated[index] = value;
  setSteps(updated);
};

useEffect(() => {
  return () => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
  };
}, [images]);

const getallDietPlan = async()=>{
  try{
    const token = sessionStorage.getItem("superadmin_token")
    if(!token)return;
    const response = await fetch(`${BASE_URL}/healthcare/diet`,{
      method:'GET',
      headers:{
Authorization :`Bearer ${token}`,
Accept: "application/json",
"Content-Type": "application/json",
      },

    })

    const data = await response.json();
    setDietPlanData(data)

  }
  catch(error){
console.log("error ",error)
toast.error("something went wrong ehile fetching the data");
  }
finally{
  setLoading(false)
}
}
useEffect(()=>{
  getallDietPlan();
},[])
  return (
   <>
       <div className="page-header">
        <h1>Diet plans</h1>
      </div>

   <div className="Question-controls">
       <div className="filter-controls">
          <button
            className="add-customer-btn"
            onClick={()=>setPlanModal(true)}
          >
            + Add New Diet Plans
          </button>

          <button className="export-btn" >
            Export Details
          </button>
        </div>
        </div>
    
       <div className="table-container">
      <table className="customers-table" >
        <thead>
          <tr>
            <th>#</th>
            <th>Plan Name</th>
            <th>Category</th>
            <th>Duration</th>
            <th>Meals</th>
          
            <th>Action</th>
          </tr>
        </thead>

     <tbody>
  {Loading ? (
    <tr>
      <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
        <div className="circular-loader"></div>
      </td>
    </tr>
  ) : Error ? (
    <tr>
      <td colSpan="6" style={{ color: "red", textAlign: "center" }}>
        {Error}
      </td>
    </tr>
  ) : DietplanData.length > 0 ? (
    DietplanData.map((plan, index) => (
      <tr key={plan.id}>
        <td>{index + 1}</td>

        <td className="plan-info">
          <img src={plan.image} alt="" />
          <div>
            <p className="plan-name">{plan.title}</p>
          </div>
        </td>

        <td>
          <span >
            {plan.category}
          </span>
        </td>

        <td>{plan.duration}</td>
        <td>{plan.meals}</td>

       <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
       
         <button
           className="action-menu-toggle"
           

           style={{
             background: "transparent",
             border: "none",
             cursor: "pointer",
             fontSize: "20px",
           }}
         >
           <BsThreeDotsVertical />
         </button>
       
       
       
        
         {OpenthreedotId === plan.id && (
           <div
             className="action-buttons-modal"
             
           >
              
              
            
       
          <button
         className="action-btn1"
         title="Edit Doctor Details"
        
        >
          <span className="icon">✏️</span>
         <span>Edit Detail</span>
       </button>
       
                           
       
          <button
                               className="action-btn1"
                               title="Delete"
                             
                             >
          <span className="icon">🗑</span>
         <span>Delete </span>
                             </button>  
           </div>
         )}
       </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" style={{ textAlign: "center" }}>
        No diet plans found
      </td>
    </tr>
  )}
</tbody>
      </table>
      </div>

      {
        PlanModal &&(
         <div className="modal-overlay">
           <div className="modal1-content1">
             <div className="modal-header">
               <button className="close-btn" onClick={() => setPlanModal(false)}>×</button>
               <h2>Create Diet Plan</h2>
               
             </div>

             <form className="diet-form">
              
               <div className="form-row1">
                 <div className="form-group1">
                   <label>Title <span className="required">*</span></label>
                   <input type="text" placeholder="Enter diet title" />
                 </div>

                 <div className="form-group1">
                   <label>Meal Type <span className="required">*</span></label>
                   <select>
                     <option>Select meal type</option>
                     <option>Breakfast</option>
                     <option>Lunch</option>
                     <option>Dinner</option>
                     <option>Snack</option>
                   </select>
                 </div>
               </div>

         
               <div className="form-row2">
                 <div className="form-group1">
                   <label>Calories (kcal) <span className="required">*</span></label>
                   <input type="text" placeholder="e.g. 250" />
                 </div>

                 <div className="form-group1">
                   <label>Carbs (g) <span className="required">*</span></label>
                   <input type="text" placeholder="e.g. 30" />
                 </div>

                 <div className="form-group1">
                   <label>Protein (g) <span className="required">*</span></label>
                   <input type="text" placeholder="e.g. 20" />
                 </div>

                 <div className="form-group1">
                   <label>Fat (g) <span className="required">*</span></label>
                   <input type="text" placeholder="e.g. 10" />
                 </div>
               </div>

            
               <div className="form-row1">
                 <div className="form-group1">
                   <label>Prep Time</label>
                   <input type="text" placeholder="e.g. 15 mins" />
                 </div>

                 <div className="form-group1">
                   <label>Serving Size <span className="required">*</span></label>
                   <input type="text" placeholder="e.g. 2 servings" />
                 </div>
               </div>

             
               <div className="form-group1 full-width">
                 <label>Short Description <span className="required">*</span></label>
                 <textarea placeholder="Enter short description about this diet plan..." rows="3"></textarea>
               </div>

              
               <div className="form-row1">
              <div className="form-group1">
  <label>Category <span className="required">*</span></label>

  <div className="category-row">
    <select>
      <option>Select category</option>
      <option>Weight Loss</option>
      <option>Weight Gain</option>
      <option>Medical</option>
      <option>Sports</option>
    </select>

    <button
      type="button"
      className="add-category-btn"
      
    >
      + Add category
    </button>
  </div>
</div>

                 <div className="form-group1">
                   <label>Tags</label>
                   <input type="text" placeholder="Enter tags and press Enter" />
                 </div>
               </div>
<div className="image-upload-section">
  <h3>Upload Images</h3>

  <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageUpload}
  />

  <div className="image-preview-container">
    {images.map((img, index) => (
      <div className="image-preview" key={index}>
     <img
  src={img.preview}
  alt="preview"
  onClick={() => setPreviewIndex(index)}
  style={{ cursor: "pointer" }}
/>

        <button
          type="button"
          className="delete-btn"
          onClick={() => removeImage(index)}
        >
          🗑
        </button>
      </div>
    ))}
  </div>
</div>
              
         <div className="ingredients-section">
  <h3>Ingredients</h3>

  {ingredients.map((item, index) => (
    <div className="form-row ingredient-row" key={index}>
      <input
        type="text"
        placeholder="e.g. Oats"
        value={item.name}
        onChange={(e) =>
          handleIngredientChange(index, "name", e.target.value)
        }
      />

      <input
        type="text"
        placeholder="e.g. 50g"
        value={item.qty}
        onChange={(e) =>
          handleIngredientChange(index, "qty", e.target.value)
        }
      />

     <button
  type="button"
  className="delete-btn"
  onClick={() => removeIngredient(index)}
>
🗑

</button>
    </div>
  ))}

  <button type="button" className="add-button" onClick={addIngredient}>
    + Add Ingredient
  </button>
</div>
              
             <div className="steps-section">
  <h3>Steps</h3>

  {steps.map((step, index) => (
    <div className="form-row step-row" key={index}>
      <input
        type="text"
        placeholder={`Enter step ${index + 1}`}
        value={step}
        onChange={(e) => handleStepChange(index, e.target.value)}
      />

       <button
    type="button"
    className="delete-btn"
    onClick={() => removeStep(index)}
  >
   🗑
  </button>
    </div>
  ))}

  <button type="button" className="add-button" onClick={addStep}>
    + Add Step
  </button>
</div>

               
               <div className="form-buttons">
              <button type="submit">Create Diet Plan</button>
              <button type="button" onClick={()=>setPlanModal(false)}>
                Cancel
              </button>
              </div>
             </form>
           </div>
           
         </div>
       
        )
      }
     
{previewIndex !== null && (
  <div
    className="image-preview-overlay"
    onClick={() => setPreviewIndex(null)}  
  >
    <div
      className="image-preview-modal"
      onClick={(e) => e.stopPropagation()} 
    >
      <img src={images[previewIndex].preview} alt="full-preview" />
    </div>
  </div>
)}
   <ToastContainer position="top-center" autoClose={1000} />
  </>
 

  );
};

export default Diet;