import React from 'react'
import { useEffect,useState,useRef } from 'react'
import * as XLSX from "xlsx";
import BASE_URL from '../../Base';
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import {  BsThreeDotsVertical } from "react-icons/bs";
const initialAddForm = {
  text: "",
  category: "",
  choices: [],
};

const Prakriti= () => {
   const [editForm, setEditForm] = useState({
    text: "",
    category: "",
    choices: [],
  });
 
 

  const [SearchQuestion,setSearchQuestion]=useState("");
  const[Loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const[QuestionData,setQuestionData]=useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const[DeleteModal,setDeleteModal]= useState(false);
 const [questionId, setQuestionId] = useState(null);
 const [editModalOpen, setEditModalOpen] = useState(false);
const [editingQuestion, setEditingQuestion] = useState(null);
const[AddQuestionModal,setAddQuestinModal]=useState(false)
const [Addform, setAddForm] = useState(initialAddForm);
const[AddError,setAddError] = useState({});
const[EditError,setEditError] = useState({});
  const bulktableRef = useRef(null);


const fetchedOnce = useRef();

 const navigate = useNavigate()

 
  const getQuestionData = async()=>{
    try{
       const token = sessionStorage.getItem("superadmin_token");
        if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
  setLoading(true);

   const response = await fetch(
        `${BASE_URL}/healthcare/ayurveda/questions/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
  
      console.log("Question API Response:", data);
  
setQuestionData(data|| []);
console.log("questionsssss",data)
  
     
    }
    catch(error){
 console.error(" Question Error:", error);
      setError("Something went wrong while fetching data.");
      toast.error("Failed to fetch Question Data");
    }
    finally{
setLoading(false);
    }
  }


 

  useEffect(()=>{
if (!fetchedOnce.current){
  getQuestionData();
  fetchedOnce.current = true;
}
  },[])


const handleDelete = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");
  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/healthcare/ayurveda/questions/${id}/`, {
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

    
    setQuestionData((prev) => prev.filter((v) => v.id !== id));
    toast.success("Question deleted successfully");

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while deleting Question");
  }
};

const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;
  setEditForm({
    ...editForm,
    [name]: type === "checkbox" ? checked : value,
  });
};
const handleChoiceChange = (index, field, value) => {
  const updatedChoices = [...editForm.choices];
  updatedChoices[index][field] = value;
  setEditForm({ ...editForm, choices: updatedChoices });
};

const handleEditSubmit = async (e) => {
  e.preventDefault();
 
  let errors = {};

  if(!editForm.text.trim()){
    errors.text = " This Field not be blank"
  }else if (Addform.text.length < 5) {
    errors.text = "Question must be at least 5 characters";
  }

  if(!editForm.category){
    errors.category = "Category is Required"

  }
  
 
  if(!editForm.choices.length){
    errors.choices = "At least one Choice is required";

  }
else{
   const choiceErrors = editForm.choices.map((choice) =>
      !choice.text.trim() ? "Choice required" : null
    );

    if (choiceErrors.some((err) => err !== null)) {
      errors.choiceErrors = choiceErrors;
    }
}
  setEditError(errors);

  if (Object.keys(errors).length > 0) {
  toast.error("Please fix the errors before submitting");
  return;
}

  const token = sessionStorage.getItem("superadmin_token");

  const res = await fetch(
    `${BASE_URL}/healthcare/ayurveda/questions/${editingQuestion.id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    }
  );

  if (res.ok) {
    toast.success("Question is updated sucessfully");
    setEditModalOpen(false);
    getQuestionData();

  } else {
    toast.error("Update failed");
  }
};



useEffect(() => {
  if (editingQuestion) {
    setEditForm({
      text: editingQuestion.text || "",
      category: editingQuestion.category || "",
      is_active: editingQuestion.is_active ?? true,
      order: editingQuestion.order || 1,
      choices: editingQuestion.choices
        ? editingQuestion.choices.map(choice => ({
            id: choice.id,
            text: choice.text || "",
           
          }))
        : [],
    });
  }
}, [editingQuestion]);
const handleAddChoiceChange = (index, field, value) => {
  const updated = [...Addform.choices];
  updated[index][field] = value;

  setAddForm({
    ...Addform,
    choices: updated,
  });

  setAddError((prev) => {
    const updatedErrors = [...(prev.choiceErrors || [])];
    updatedErrors[index] = null;

    return {
      ...prev,
      choiceErrors: updatedErrors,
    };
  });

};
const handleAddChange = (e) => {
  const { name, value } = e.target;
  setAddForm({
    ...Addform,
    [name]: value,
  });
  setAddError((prev)=>({
    ...prev,[name]:"",
  }))
};

const addNewChoice = () => {
  setAddForm({
    ...Addform,
    choices: [
      ...Addform.choices,
      { text: "" }   
    ],
  });

  setAddError((prev) => ({
    ...prev,
    choices: "",
  }));
};

const deleteNewChoice = (index) => {
  const updated = Addform.choices.filter((_, i) => i !== index);
  setAddForm({
    ...Addform,
    choices: updated,
  });
};

const handleAddSubmit = async (e) => {
  e.preventDefault();

  let errors = {};

  if (!Addform.text.trim()) {
    errors.text = "Question is required ,This field is not be blank";
  } else if (Addform.text.length < 5) {
    errors.text = "Question must be at least 5 characters";
  }

  if (!Addform.category) {
    errors.category = "Category is required";
  }

  if (!Addform.choices.length) {
    errors.choices = "At least one choice is required";
  } else {

    const choiceErrors = Addform.choices.map((choice) =>
      !choice.text.trim() ? "Choice required" : null
    );

    if (choiceErrors.some((err) => err !== null)) {
      errors.choiceErrors = choiceErrors;
    }
  }

  setAddError(errors);

  if (Object.keys(errors).length > 0) {
  toast.error("Please fix the errors before submitting");
  return;
}

 
  const token = sessionStorage.getItem("superadmin_token");

  const res = await fetch(`${BASE_URL}/healthcare/ayurveda/questions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(Addform),
  });

  if (res.ok) {
    toast.success("Question added");
    setAddQuestinModal(false);
    getQuestionData();
  } else {
    toast.error("Failed to add question");
  }
};
const handleDownload= ()=>{
  const exportData = QuestionData?.map((c)=>({
    Name:c.text,
    Category:c.category,
    Choices: c.choices.map((choice) => choice.text)
  }));
   const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Question");
  
      XLSX.writeFile(wb, "Question.xlsx");
}


  return (
    <>
      <div className="page-header">
        <h1> Prakirti Questions</h1>
      </div>

      <div>
        
      </div>
       <div className="Question-controls">
    
        <div className="filter-controls">
       <button
  className="add-customer-btn"
  onClick={() => {
    setAddForm(initialAddForm);   
    setAddQuestinModal(true);
    setAddError({});
  }}
>
  + Add Question
</button>

          <button className="export-btn" onClick={handleDownload}>
            Export Details
          </button>
        </div>
      </div>

       <div className="table-container">
              <table className="customers-table"ref={bulktableRef} >
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>Question</th>
                    <th>Category</th>
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
                  ) : error ? (
                    <tr>
                      <td colSpan="6" style={{ color: "red" }}>
                        {error}
                      </td>
                    </tr>
                  ) : QuestionData?.length > 0 ? (
                    QuestionData?.map((question,index) =>
                    (
                      <tr key={question.id}>
       
                        <td>{index+1}</td>
                        <td>{question.text} </td>
                        <td>{question.category}</td>
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
    setEditingQuestion(question);
    setEditModalOpen(true);
  }}
>
  <span className="icon">✏️</span>
  <span>Edit Detail</span>
</button>
  
          <button
                          className="action-btn1"
                          title="Delete Customer"
                       onClick={()=>{
                      setQuestionId(question.id);
                      setDeleteModal(true);


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
          
      
            </div>


  {editModalOpen&& (
        <div className="modal">
          <form className="customer-form" onSubmit={handleEditSubmit}>
           <h2>Edit Question</h2>
           
             
           
 <label>Question </label>
        <input
          type="text"
          name="text"
          value={editForm.text}
          onChange={handleEditChange}
        />

     {EditError.text && <p className="error">{EditError.text}</p>} 
          



            <label htmlFor="category">Category</label>
           <select 
           name="category"
          
           value={editForm.category}
              onChange={handleEditChange}
           >
              <option value="">Select category</option>
          <option value="vata">Vata</option>
              <option value="pitta">Pitta</option>
              <option value="kapha">Kapha</option>
           </select>
             {EditError.category && <p className="error">{EditError.category}</p>}

          <h4>Choices</h4>

{editForm.choices?.map((choice, index) => (
  <div key={index} className="choice-row">
    
    
    <span className="choice-number">{index + 1}.</span>

    <input
      className="input-field"
      type="text"
      value={choice.text}
      onChange={(e) =>
        handleChoiceChange(index, "text", e.target.value)
      }
    />
  </div>
))}
            
            


            <div className="form-buttons">
               <button type="submit">Save</button>
          <button type="button" onClick={() => {setEditModalOpen(false);setEditError({})}}>
            Cancel
          </button>
            </div>
          </form>
        </div>
      )}



{AddQuestionModal && (
  <div className="modal">
    <form className="customer-form" onSubmit={handleAddSubmit}>
      <h2>Add New Question</h2>

    
      <label>Question</label>
      <input
        type="text"
        name="text"
        placeholder="Enter Your Question"
        value={Addform.text}
        onChange={handleAddChange}
      />
      {AddError.text && <p className="error">{AddError.text}</p>}

      <label>Category</label>
      <select
        name="category"
        value={Addform.category}
        onChange={handleAddChange}
      >
        <option value="">Select Category</option>
        <option value="vata">Vata</option>
        <option value="pitta">Pitta</option>
        <option value="kapha">Kapha</option>
      </select>
      {AddError.category && <p className="error">{AddError.category}</p>}

      <h4>Choices</h4>

      

      {AddError.choices && <p className="error">{AddError.choices}</p>}

      {Addform.choices.map((choice, index) => (
        <div className="choice-input-wrapper" key={index}>
          
          <input
            type="text"
            placeholder="Choice text"
            value={choice.text}
            onChange={(e) =>
              handleAddChoiceChange(index, "text", e.target.value)
            }
          />

          <button
            type="button"
            className="removebtn1"
            onClick={() => deleteNewChoice(index)}
          >
            🗑
          </button>

       
          {AddError.choiceErrors &&
            AddError.choiceErrors[index] && (
              <p className="errortext">
                {AddError.choiceErrors[index]}
              </p>
            )}
        </div>
      ))}

      <button
        type="button"
        onClick={addNewChoice}
        className="AddButton"
      >
        + Add Choice
      </button>

      <div className="form-buttons">
        <button type="submit">Save</button>
        <button
          type="button"
          onClick={() => setAddQuestinModal(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}
              {DeleteModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Are you sure you want to delete this vendor?</h3>
              <div className="form-buttons">
                <button
                  className="otp-btn verify-btn"
                  onClick={() => {
                    handleDelete(questionId)
                    setDeleteModal(false)
                  }}
                >
                  Yes
                </button>
                <button onClick={() => setDeleteModal(false)}>No</button>
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
    </>



  )
}

export default Prakriti;