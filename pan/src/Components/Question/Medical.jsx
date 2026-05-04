import React from 'react';
import { useState,useEffect ,useRef,navigate} from 'react';
import BASE_URL from '../../Base';
import { toast,ToastContainer } from 'react-toastify';
import {  BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
const intialAddform ={
text:"",
section:"",
question_type:"",
choices:[],
}


const Medical = () => {
  const [Data,setData]=useState([]);
  const[Error,setError]=useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const[Loading,setLoading]=useState(true);
  const[Addform,setAddform]=useState(intialAddform);
  const[AddformModal,setAddformModal]=useState(false);
  const[DeleteModal,setDeleteModal]=useState(false);
  const[SelectedQuestionId,setSelectedQuestionId]=useState(null);
  const[EditformModal,setEditformModal]=useState(false);
  const [Editform, setEditform] = useState(intialAddform);
  const fetchOnce = useRef();
  const Navigate =useNavigate();

  
  const getAllMedicalQuestion = async()=>{
try{
  const token =sessionStorage.getItem("superadmin_token")
const response = await fetch(`${BASE_URL}/healthcare/health-questions`,{
  method:'GET',
  headers:{
    Accept :'application/json',
    "content-Type":"application/json",
    Authorization:`Bearer ${token}`
  }
})
const Data = await response.json();
setData(Data)
}

catch(Error){
  toast.error("Something Went Wrong while fetching the data")

}
finally{
setLoading(false)
}
  }

  useEffect(()=>{
   if(!fetchOnce.current){
    getAllMedicalQuestion();
    fetchOnce.current=true
   }
  },[])

  const handleEditInputChange = (e) => {
  const { name, value } = e.target;

  setEditform((prev) => ({
    ...prev,
    [name]: value,

    ...(name === "question_type" && value === "text"
      ? { choices: [] }
      : name === "question_type"
      ? { choices: [{ text: "" }] }
      : {}),
  }));
};
const handleEditChoiceChange = (index, value) => {
  const updated = [...Editform.choices];
  updated[index].text = value;
  setEditform({ ...Editform, choices: updated });
};

const addEditChoice = () => {
  setEditform({
    ...Editform,
    choices: [...Editform.choices, { text: "" }],
  });
};

const removeEditChoice = (index) => {
  const updated = Editform.choices.filter((_, i) => i !== index);
  setEditform({ ...Editform, choices: updated });
};


 const handleInputChange = (e) => {
  const { name, value } = e.target;

  setAddform((prev) => ({
    ...prev,
    [name]: value,

    
    ...(name === "question_type" && value === "text"
      ? { choices: [] }
      : name === "question_type"
      ? { choices: [{ text: "" }] }
      : {}),
  }));
};
const handleChoiceChange = (index, value) => {
  const updated = [...Addform.choices];
  updated[index].text = value;

  setAddform({ ...Addform, choices: updated });
};

const addChoice = () => {
  setAddform({
    ...Addform,
    choices: [...Addform.choices, { text: "" }],
  });
};

const removeChoice = (index) => {
  const updated = Addform.choices.filter((_, i) => i !== index);

  setAddform({ ...Addform, choices: updated });
};
const handleSubmit = async () => {
  try {
    const token = sessionStorage.getItem("superadmin_token");
    const payload = {
      text: Addform.text,
      section: Addform.section,
      question_type: Addform.question_type,
      choices:
        Addform.question_type === "text"
          ? []
          : Addform.choices.filter((c) => c.text.trim() !== ""),
    };

    const res = await fetch(`${BASE_URL}/healthcare/bulk-questions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([payload]),
    });

   const data = await res.json();  

if (!res.ok) {
  const errorMsg =
    data?.errors?.questions?.non_field_errors?.[0] ||
    "Error adding question ❌";

  toast.error(errorMsg);
  return;
}

    toast.success("Question Added Successfully ✅");

    setAddformModal(false);
    setAddform(intialAddform);
    getAllMedicalQuestion();
  } catch (err) {
    toast.error("Error adding question ❌");
  }
};

const handleDelete = async (id) => {
 const token = sessionStorage.getItem("superadmin_token")
 if(!token){
  toast.error("session expired ! Login Again");
  return
 }
  try {
    const res = await fetch(`${BASE_URL}/healthcare/questions-delete/${id}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

   
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!res.ok) {
      toast.error("Failed to delete Question");
      return;
    }

    
    setData((prev) => prev.filter((v) => v.id !== id));
    toast.success("Question deleted successfully");

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while deleting Question");
  }
};
const handleUpdate = async () => {
  try {
    const token = sessionStorage.getItem("superadmin_token");

    const payload = {
      text: Editform.text,
      section: Editform.section,
      question_type: Editform.question_type,
      choices:
        Editform.question_type === "text"
          ? []
          : Editform.choices.filter((c) => c.text.trim() !== ""),
    };

    const res = await fetch(
      `${BASE_URL}/healthcare/questions-update/${SelectedQuestionId}/`,
      {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data?.errors?.questions?.non_field_errors?.[0] ||
        "Error updating question ❌";

      toast.error(errorMsg);
      return;
    }

    toast.success("Question Updated Successfully ✅");

    setEditformModal(false);
    getAllMedicalQuestion();
  } catch (err) {
    toast.error("Error updating question ❌");
  }
};

  return (
    <>
    
  <div className="page-header">
         <h1> Medical Questions</h1>
       </div>
 
       <div>
         
       </div>
        <div className="Question-controls">
       
 
         <div className="filter-controls">
        <button
   className="add-customer-btn"
   onClick={() => {
     setAddformModal(true);
     setAddform(intialAddform);
     
   }}
 >
   + Add Question
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
                     <th>Index</th>
                     <th>Question</th>
                     <th>Category</th>
                     <th> 
                      Type</th>
                      <th>Chocies</th>
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
                       <td colSpan="6" style={{ color: "red" }}>
                         {Error}
                       </td>
                     </tr>
                   ) : Data?.length > 0 ? (
                     Data?.map((question,index) =>
                     (
                       <tr key={question.id}>
        
                         <td>{index+1}</td>
                         <td>{question.text} </td>
                         <td>{question.section}</td>
                         <td>{question.question_type}</td>

                         <td>
   {question.choices && question.choices.length > 0
     ? question.choices?.map(choice => choice.text).join(", ")
     : "No Choices"}
 </td>
                       
       
   <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
   
     <button
       className="action-menu-toggle"
       onClick={() =>
         setOpenMenuId(openMenuId ===question.id ? null : question.id)
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
   
   
   
    
     {openMenuId === question.id && (
       <div
         className="action-buttons-modal"
          
       >
   
         
        
   <button
  className="action-btn1"
  onClick={() => {
    setEditformModal(true);
    setSelectedQuestionId(question.id);

    setEditform({
      text: question.text,
      section: question.section,
      question_type: question.question_type,
      choices:
        question.question_type === "text"
          ? []
          : question.choices?.length
          ? question.choices
          : [{ text: "" }],
    });
  }}
>
  ✏️ Edit Detail
</button>
           <button
                           className="action-btn1"
                           title="Delete Customer"
                        onClick={()=>{
                    setDeleteModal(true)
                    setSelectedQuestionId(question.id)
 
                        }}
                       
                 
                           >
     <span className="icon"
    >🗑</span>
     <span>Delete</span>
         </button>
   
        
   
         
       </div>
     )}
   </td>
                       </tr>
                     )
                     )
                   ) : (
                     <tr>
                       <td colSpan="6" style={{ textAlign: "center" }}>
                         No Data Found
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
        {
  AddformModal && (
    <div className="modal">
      <form
        className="customer-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <h2>Add New Question</h2>

        <label>Question</label>
        <input
          type="text"
          name="text"
          value={Addform.text}
          onChange={handleInputChange}
        />

        <label>Section</label>
        <select
          name="section"
          value={Addform.section}
          onChange={handleInputChange}
        >
          <option value="">Select Your Category</option>
          <option value="medical_history">Medical History</option>
          <option value="important_info">Important Health Information</option>
          <option value="gut_health">Gut Health Assessment</option>
          <option value="bowel_pattern">Bowel Pattern(Kostha)</option>
          <option value="digestion">Digestion</option>
          <option value="diet">Diet & Nutrition</option>
          <option value="supplements">Supplements</option>
          <option value="activity">Physical Activity</option>
          <option value="sleep">Sleep</option>
          <option value="mental"> Mental Well being</option>
        </select>

        <label>Question Type</label>
        <select
          name="question_type"
          value={Addform.question_type}
          onChange={handleInputChange}
        >
          <option value="">Select Type</option>
          <option value="single">Single</option>
          <option value="multi">Multiple</option>
          <option value="text">Text</option>
        </select>

       
        {(Addform.question_type === "single" ||
          Addform.question_type === "multi") && (
          <>
            <label>Choices</label>

            {Addform.choices.map((choice, index) => (
              <div key={index} className="choice-input-wrapper">
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) =>
                    handleChoiceChange(index, e.target.value)
                  }
                  placeholder={`Choice ${index + 1}`}
                />

                <button
                  type="button"
                  onClick={() => removeChoice(index)}
                   className="removebtn1"
                >
                     🗑
                </button>
              </div>
            ))}

            <button type="button" onClick={addChoice}
              className="AddButton"
            >
              + Add Choice
            </button>
          </>
        )}

        <div className="form-buttons">
          <button type="submit">Save</button>

          <button
            type="button"
            onClick={() => setAddformModal(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

{
  DeleteModal && (
    <div className='modal'> 
     <div className="modal-content">
              <h3>Are you sure you want to delete this vendor?</h3>
              <div className="form-buttons">
                <button
                  className="otp-btn verify-btn"
                  onClick={() => {
                    handleDelete(SelectedQuestionId)
                    setDeleteModal(false)
                  }}
                >
                  Yes
                </button>
                <button onClick={() => setDeleteModal(false)}>No</button>
              </div>
            </div>
    </div>

  )
}

{
  EditformModal && (
    <div className="modal">
      <form
        className="customer-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        <h2>Edit Question</h2>

        <label>Question</label>
        <input
          type="text"
          name="text"
          value={Editform.text}
          onChange={handleEditInputChange}
        />

        <label>Section</label>
        <select
          name="section"
          value={Editform.section}
          onChange={handleEditInputChange}
        >
          <option value="">Select Category</option>
          <option value="medical_history">Medical History</option>
          <option value="important_info">Important Info</option>
          <option value="gut_health">Gut Health</option>
          <option value="bowel_pattern">Bowel Pattern</option>
          <option value="digestion">Digestion</option>
          <option value="diet">Diet & Nutrition</option>
          <option value="supplements">Supplements</option>
          <option value="activity">Physical Activity</option>
           <option value="sleep">Sleep</option>
        
        
          <option value="mental">Mental well being</option>
        </select>

        <label>Question Type</label>
        <select
          name="question_type"
          value={Editform.question_type}
          onChange={handleEditInputChange}
        >
          <option value="">Select Type</option>
          <option value="single">Single</option>
          <option value="multi">Multiple</option>
          <option value="text">Text</option>
        </select>

        {(Editform.question_type === "single" ||
          Editform.question_type === "multi") && (
          <>
            <label>Choices</label>

            {Editform.choices.map((choice, index) => (
              <div key={index} className="choice-input-wrapper">
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) =>
                    handleEditChoiceChange(index, e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => removeEditChoice(index)}
                  className="removebtn1"
                >
                  🗑
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addEditChoice}
              className="AddButton"
            >
              + Add Choice
            </button>
          </>
        )}

        <div className="form-buttons">
          <button type="submit">Update</button>

          <button
            type="button"
            onClick={() => setEditformModal(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

    </div>


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

  )
}

export default Medical