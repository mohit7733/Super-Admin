import React from 'react'
import { useEffect, useState, useRef } from 'react'
import * as XLSX from "xlsx";
import BASE_URL from '../../Base';
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { FaTimes } from 'react-icons/fa';

const initialAddForm = {
  experience_type: "prakriti",
  question: "",
  choices: [],
};

const Prakriti = () => {
  const [editForm, setEditForm] = useState({
    
  experience_type: "prakriti",
  question: "",
  choices: []

  });



  const [SearchQuestion, setSearchQuestion] = useState("");
  const [Loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [QuestionData, setQuestionData] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [DeleteModal, setDeleteModal] = useState(false);
  const [questionId, setQuestionId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [AddQuestionModal, setAddQuestinModal] = useState(false)
  const [Addform, setAddForm] = useState(initialAddForm);
  const [AddError, setAddError] = useState({});
  const [EditError, setEditError] = useState({});
  const bulktableRef = useRef(null);
  const [isAdding, setIsAdding] = useState(false);
  const[IsEditing,setIsEditing]=useState(false);
  const[IsDeleting,setIsDeleting]=useState(false);
  const [previewImage, setPreviewImage] = useState(null);


const pagesize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);

  const [previousPage, setPreviousPage] = useState(null);



  const fetchedOnce = useRef();

  const navigate = useNavigate()


const uploadImage = async (file) => {
  const token = sessionStorage.getItem("superadmin_token");

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

    const data = await response.json();

    console.log("Upload Response:", data);

   return data?.data?.url;
  } catch (error) {
    console.error(error);
    toast.error("Image upload failed");

    return null;
  }
};


 const getQuestionData = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?experience_type=prakriti`,
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

    console.log("Question API Response:", data);

    // New API response:
    // {
    //   success: true,
    //   message: "...",
    //   data: [...]
    // }

    setQuestionData(Array.isArray(data?.data) ? data.data : []);

  } catch (error) {
    console.error("Question Error:", error);

    setError("Something went wrong while fetching data.");
    toast.error("Failed to fetch Question Data");
  } finally {
    setLoading(false);
  }
};




  useEffect(() => {
    if (!fetchedOnce.current) {
      getQuestionData();
      fetchedOnce.current = true;
    }
  }, [])


  const handleDelete = async (id) => {
    if(IsDeleting)return;
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?id=${id}`, {
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
    finally{
      setIsDeleting(false);
    }
  };

 const handleEditChange = (e) => {
  const { name, value } = e.target;

  setEditForm({
    ...editForm,
    [name]: value,
  });

  setEditError((prev) => ({
    ...prev,
    [name]: "",
  }));
};
 const handleChoiceChange = (
  index,
  field,
  value
) => {
  const updatedChoices = [
    ...editForm.choices,
  ];

  updatedChoices[index][field] =
    value;

  setEditForm({
    ...editForm,
    choices: updatedChoices,
  });

  setEditError((prev) => {
    const updatedErrors = [
      ...(prev.choiceErrors || []),
    ];

    updatedErrors[index] = null;

    return {
      ...prev,
      choiceErrors:
        updatedErrors,
    };
  });
};

 const handleEditSubmit = async (e) => {
  e.preventDefault();
 if(IsEditing) return;
  let errors = {};

  if (!editForm.question?.trim()) {
    errors.question = "Question cannot be empty";
  } else if (editForm.question.length < 5) {
    errors.question = "Question must be at least 5 characters";
  }

  if (!editForm.experience_type) {
    errors.experience_type = "Experience type is required";
  }

  if (!editForm.choices) {
    errors.choices = "Choices required";
  }

 const choiceErrors = editForm.choices?.map((choice) => {
  if (!choice.value?.trim()) {
    return "Choice value required";
  }

  if (!choice.image && !choice.image_path) {
    return "Choice image required";
  }

  return null;
});

if (choiceErrors?.some((err) => err !== null)) {
  errors.choiceErrors = choiceErrors;
}

setEditError(errors);

if (Object.keys(errors).length > 0) {
  toast.error("Please fix errors before submitting");
  return;
}

  const token = sessionStorage.getItem("superadmin_token");

  const updatedChoices = await Promise.all(
    (editForm.choices || []).map(async (choice, index) => {
      let imageUrl = choice.image_path || "";

      if (choice.image instanceof File) {
        imageUrl = await uploadImage(choice.image);
      }

      return {
        index,
        value: choice.value,
        image_path: imageUrl,
      };
    })
  );

  
  const payload = {
    experience_type: editForm.experience_type,
    question: editForm.question,
    choices: updatedChoices,
  };

  try {
    setIsEditing(true);
    const res = await fetch(
      `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?id=${editForm.id}`,
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
      toast.error(data?.message || "Update failed ❌");
      return;
    }

    toast.success("Question updated successfully ✅");

    setEditModalOpen(false);
    getQuestionData();

  }  catch (err) {
  console.error(err);
  toast.error("Something went wrong ❌");
} finally {
  setIsEditing(false);
}

};


const handleAddChoiceChange = (
  index,
  field,
  value
) => {
  setAddForm((prev) => {

    const updatedChoices = [
      ...prev.choices,
    ];

    updatedChoices[index] = {
      ...updatedChoices[index],
      [field]: value,
    };

    return {
      ...prev,
      choices: updatedChoices,
    };
  });

  setAddError((prev) => {

    const updatedErrors = [
      ...(prev.choiceErrors || []),
    ];

    
    const currentChoiceErrors =
      Array.isArray(updatedErrors[index])
        ? [...updatedErrors[index]]
        : [];

    if (field === "value") {

      // Value enter karne par
      // value error remove karo
      const filteredErrors =
        currentChoiceErrors.filter(
          (err) =>
            err !== "Choice value required"
        );

      updatedErrors[index] =
        filteredErrors.length > 0
          ? filteredErrors
          : null;
    }

    if (field === "image") {

      // Image select karne par
      // image error remove karo
      const filteredErrors =
        currentChoiceErrors.filter(
          (err) =>
            err !== "Choice image required"
        );

      updatedErrors[index] =
        filteredErrors.length > 0
          ? filteredErrors
          : null;
    }

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
    setAddError((prev) => ({
      ...prev, [name]: "",
    }))
  };

 const addNewChoice = () => {
  setAddForm({
    ...Addform,
    choices: [
      ...Addform.choices,
      {
        index: Addform.choices.length,
        value: "",
        image: null,
        image_path: "",
      },
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

  if (isAdding) return;

  let errors = {};

  if (!Addform.question?.trim()) {
    errors.question = "Question is required";
  } else if (Addform.question.trim().length < 5) {
    errors.question =
      "Question must be at least 5 characters";
  }



  if (
    !Addform.choices ||
    Addform.choices.length === 0
  ) {
    errors.choices =
      "At least one choice is required";
  } else {

    const choiceErrors = Addform.choices.map(
      (choice) => {

        const choiceErrorMessages = [];

    
        if (!choice.value?.trim()) {
          choiceErrorMessages.push(
            "Choice value required"
          );
        }

       
        if (!choice.image) {
          choiceErrorMessages.push(
            "Choice image required"
          );
        }

    
        return choiceErrorMessages.length > 0
          ? choiceErrorMessages
          : null;
      }
    );

    if (
      choiceErrors.some(
        (err) => err !== null
      )
    ) {
      errors.choiceErrors = choiceErrors;
    }
  }


  setAddError(errors);



  if (Object.keys(errors).length > 0) {
    toast.error(
      "Please fix the errors before submitting"
    );
    return;
  }



  const token =
    sessionStorage.getItem(
      "superadmin_token"
    );

  if (!token) {
    toast.error(
      "Session expired. Please login again"
    );

    navigate("/login");
    return;
  }

  try {

    setIsAdding(true);

   

    const updatedChoices =
      await Promise.all(
        Addform.choices.map(
          async (choice, index) => {

            let imageUrl = "";

            if (
              choice.image instanceof File
            ) {
              imageUrl =
                await uploadImage(
                  choice.image
                );
            }

            return {
              index: index,
              value:
                choice.value.trim(),
              image_path:
                imageUrl || "",
            };
          }
        )
      );

    console.log(
      "Uploaded Choices:",
      updatedChoices
    );



    const imageUploadFailed =
      updatedChoices.some(
        (choice) =>
          !choice.image_path
      );

    if (imageUploadFailed) {
      toast.error(
        "Choice image upload failed"
      );
      return;
    }



    const payload = {
      experience_type:
        Addform.experience_type,

      questions: [
        {
          question:
            Addform.question.trim(),

          choices:
            updatedChoices,
        },
      ],
    };

    console.log(
      "FINAL PAYLOAD:",
      payload
    );

 

    const res = await fetch(
      `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,

          "ngrok-skip-browser-warning":
            "true",
        },

        body:
          JSON.stringify(payload),
      }
    );

    const data =
      await res.json();

    console.log(
      "FINAL RESPONSE:",
      data
    );


    if (
      res.status === 401 ||
      res.status === 403
    ) {

      sessionStorage.removeItem(
        "superadmin_token"
      );

      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");

      return;
    }

  

    if (!res.ok) {

      toast.error(
        data?.message ||
        data?.error ||
        "Failed to add question"
      );

      return;
    }

 

    toast.success(
      "Question added successfully ✅"
    );

    setAddQuestinModal(false);

    setAddForm({
      experience_type: "prakriti",
      question: "",
      choices: [],
    });

    setAddError({});

    getQuestionData(1);

  } catch (error) {

    console.error(
      "Add Question Error:",
      error
    );

    toast.error(
      "Something went wrong while adding question"
    );

  } finally {

    setIsAdding(false);

  }
};
  const handleDownload = () => {
    const exportData = QuestionData?.map((c) => ({
      Name: c.text,
      Category: c.category,
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

        <div className="filter-question">
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

          {/* <button className="btn-secondary" onClick={handleDownload}>
            Export Details
          </button> */}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table" ref={bulktableRef} >
          <thead>
            <tr>
              <th>Index</th>
              <th>Question</th>
           
              <th>Chocies</th>

              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="10"><div className="skeleton-row"></div></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : QuestionData?.length > 0 ? (
              QuestionData?.map((question, index) =>
              (
                <tr key={question.id}>
                  <td>{index + 1}</td>
                  <td>{question.question} </td>
             
                  <td>
                    {question.choices && question.choices.length > 0
                      ? question.choices?.map(choice => choice.value).join(", ")
                      : "No Choices"}
                  </td>
                  <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-menu-toggle"
                      onClick={() =>
                        setOpenMenuId(openMenuId === question.id ? null : question.id)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                      }}
                    >
                  <span className='icon'>
                    <BsThreeDotsVertical />
                    </span>    
                    </button>




                    {openMenuId === question.id && (
                      <div
                        className="action-buttons-modal"

                      >


<button
  className="action-btn1"
  onClick={() => {

    setEditingQuestion(question);

    setEditForm({
      id: question.id,

      experience_type:
        question.experience_type ||
        "prakriti",

      question:
        question.question || "",

      choices:
        question.choices?.length
          ? question.choices.map(
              (
                choice,
                index
              ) => ({
                index,

                value:
                  choice.value ||
                  "",

                image: null,

                image_path:
                  choice.image_path ||
                  "",
              })
            )
          : [],
    });

    setEditError({});

    setEditModalOpen(true);
  }}
>
  <span className="icon">
    <FaEdit />
  </span>

  <span>Edit Detail</span>
</button>
                       

                        <button
                          className="action-btn1"
                          title="Delete Customer"
                          onClick={() => {
                            setQuestionId(question.id);
                            setDeleteModal(true);


                          }}


                        >
                          <span className="icon-delete"
                          ><FiTrash2/></span>
                          <span className='delete-text'>Delete</span>
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
{totalPages > 1 && (
  <div className="pagination">

    <button
      onClick={() => getQuestionData(currentpage - 1)}
      disabled={!previousPage}
    >
      Prev
    </button>

    {pages.map((page) => (
      <button
        key={page}
        onClick={() => getQuestionData(page)}
        style={{
          fontWeight: currentpage === page ? "bold" : "normal",
          background: currentpage === page ? "#0D614E" : "#fff",
          color: currentpage === page ? "#fff" : "#0D614E",
        }}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() => getQuestionData(currentpage + 1)}
      disabled={!Nextpage}
    >
      Next
    </button>

  </div>
)}
        

      </div>


  {editModalOpen && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal">

      <div className="prakriti-modal-header">
        <div>
          <h2>Edit Question</h2>
          <p>Edit Prakriti Question</p>
        </div>

        <button
          type="button"
          className="modal-close-btn"
          onClick={() => {
            setEditModalOpen(false);
            setEditError({});
          }}
        >
          <FaTimes />
        </button>
      </div>

      <form
        className="prakriti-form"
        onSubmit={handleEditSubmit}
      >

        {/* QUESTION */}
        <div className="form-group">
          <label>Question</label>

          <input
            type="text"
            name="question"
            placeholder="Enter Your Question"
            value={editForm.question}
            onChange={handleEditChange}
          />

          {EditError.question && (
            <p className="error">
              {EditError.question}
            </p>
          )}
        </div>

        {/* CHOICES */}
        <div className="form-group">

          <div>
            <h4>Choices</h4>

            {EditError.choices && (
              <p className="error">
                {EditError.choices}
              </p>
            )}
          </div>

          <div className="choice-header">
            <button
              type="button"
              className="AddButton"
              onClick={() => {
                setEditForm({
                  ...editForm,
                  choices: [
                    ...editForm.choices,
                    {
                      index: editForm.choices.length,
                      value: "",
                      image: null,
                      image_path: "",
                    },
                  ],
                });
              }}
            >
              + Add Choice
            </button>
          </div>

          {editForm.choices?.map((choice, index) => (

            <div
              key={index}
              className="choice-card"
            >

              {/* CHOICE HEADER */}
              <div className="choice-card-header">

                <span className="choice-title">
                  Choice {index + 1}
                </span>

                <button
                  type="button"
                  className="remove-choice-btn"
                  onClick={() => {

                    const updatedChoices =
                      editForm.choices.filter(
                        (_, i) => i !== index
                      );

                    setEditForm({
                      ...editForm,
                      choices: updatedChoices,
                    });

                  }}
                >
                  <FiTrash2 />
                </button>

              </div>

              {/* CHOICE FIELDS */}
              <div className="choice-fields">

                {/* CHOICE VALUE */}
                <input
                  type="text"
                  placeholder="Choice Value"
                  value={choice.value || ""}
                  onChange={(e) =>
                    handleChoiceChange(
                      index,
                      "value",
                      e.target.value
                    )
                  }
                  className="choice-input"
                />

              
                <input
                  type="file"
                  accept="image/*"
                  id={`edit-choice-image-${index}`}
                  className="hidden-file-input"
                  onChange={(e) => {

                    const file =
                      e.target.files?.[0];

                    if (file) {
                      handleChoiceChange(
                        index,
                        "image",
                        file
                      );
                    }

                  }}
                />

                {/* IMAGE */}
                {choice.image ? (

                  /* NEWLY SELECTED IMAGE */
                  <div className="selected-image-box">

                    <img
                      src={URL.createObjectURL(choice.image)}
                      alt="Selected"
                      className="choice-preview-image"
                      onClick={() =>
                        setPreviewImage(
                          URL.createObjectURL(choice.image)
                        )
                      }
                      style={{
                        cursor: "pointer"
                      }}
                    />

                    <span className="choice-image-name">
                      {choice.image.name}
                    </span>

                    <button
                      type="button"
                      className="delete-image-btn"
                      onClick={() => {

                        handleChoiceChange(
                          index,
                          "image",
                          null
                        );

                        const input =
                          document.getElementById(
                            `edit-choice-image-${index}`
                          );

                        if (input) {
                          input.value = "";
                        }

                      }}
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                ) : choice.image_path ? (

                  /* EXISTING BACKEND IMAGE */
                  <div className="selected-image-box">

                    <img
                      src={choice.image_path}
                      alt="Choice"
                      className="choice-preview-image"
                      onClick={() =>
                        setPreviewImage(
                          choice.image_path
                        )
                      }
                      style={{
                        cursor: "pointer"
                      }}
                    />

                    <span className="choice-image-name">
                      Existing Image
                    </span>

                    <button
                      type="button"
                      className="delete-image-btn"
                      onClick={() => {

                        handleChoiceChange(
                          index,
                          "image_path",
                          ""
                        );

                      }}
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                ) : (

                  /* UPLOAD BOX */
                  <label
                    htmlFor={`edit-choice-image-${index}`}
                    className="upload-image-btn"
                  >
                    <span>📷</span>
                    <span>
                      Click here to upload image
                    </span>
                  </label>

                )}

              </div>

              {/* ERROR */}
              {EditError.choiceErrors &&
                EditError.choiceErrors[index] && (
                  <p className="errortext">
                    {EditError.choiceErrors[index]}
                  </p>
                )}

            </div>

          ))}

        </div>

        {/* BUTTONS */}
        <div className="form-buttons">

          <button
            type="submit"
            disabled={IsEditing}
          >
            {IsEditing
              ? "Updating..."
              : "Update Question"}
          </button>

          <button
            type="button"
            onClick={() => {
              setEditModalOpen(false);
              setEditError({});
            }}
          >
            Cancel
          </button>

        </div>

      </form>

    </div>
  </div>
)}



   {AddQuestionModal && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal">

      <div className="prakriti-modal-header">
        <div>
          <h2>Add Question</h2>
          <p>Create New Prakriti Question</p>
        </div>
      </div>

      <form
        className="prakriti-form"
        onSubmit={handleAddSubmit}
      >

      
        <div className="form-group">
          <label>Question</label>

          <input
            type="text"
            name="question"
            placeholder="Enter Your Question"
            value={Addform.question}
            onChange={handleAddChange}
          />

          {AddError.question && (
            <p className="error">
              {AddError.question}
            </p>
          )}
        </div>

        
        <div className="form-group">
          <div>
            <h4>Choices</h4>

          {AddError.choices && (
            <p className="error">
              {AddError.choices}
            </p>
          )}
          </div>
          

          <div className="choice-header">
            <button
              type="button"
              onClick={addNewChoice}
              className="AddButton"
            >
              + Add Choice
            </button>
          </div>

          {Addform.choices.map((choice, index) => (
            <div
              key={index}
              className="choice-card"
            >

              <div className="choice-card-header">
                <span className="choice-title">
                  Choice {index + 1}
                </span>

                <button
                  type="button"
                  className="remove-choice-btn"
                  onClick={() => deleteNewChoice(index)}
                >
                  <FiTrash2 />
                </button>
              </div>

    <div className="choice-fields">

  

  <input
    type="text"
    placeholder="Choice Value"
    value={choice.value}
    onChange={(e) =>
      handleAddChoiceChange(
        index,
        "value",
        e.target.value
      )
    }
    className="choice-input"
  />

<input
  type="file"
  accept="image/*"
  id={`choice-image-${index}`}
  className="hidden-file-input"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    console.log("Selected image:", file);

    handleAddChoiceChange(index, "image", file);
  }}
/>

  {/* IMAGE AREA */}
 {choice.image ? (
  <div className="selected-image-box">

    <img
      src={URL.createObjectURL(choice.image)}
      alt="Selected"
      className="choice-preview-image"
      onClick={() =>
        setPreviewImage(URL.createObjectURL(choice.image))
      }
      style={{
        cursor: "pointer",
      }}
    />

    <span className="choice-image-name">
      {choice.image.name}
    </span>

    <button
      type="button"
      className="delete-image-btn"
      onClick={() => {
        handleAddChoiceChange(index, "image", null);

        const input = document.getElementById(
          `choice-image-${index}`
        );

        if (input) {
          input.value = "";
        }
      }}
    >
      <FiTrash2 />
    </button>

  </div>
) : (
  <label
    htmlFor={`choice-image-${index}`}
    className="upload-image-btn"
  >
    <span>📷</span>
    <span>Click here to upload image</span>
  </label>
)}
</div>
{AddError.choiceErrors?.[index]?.map(
  (errorMessage, errorIndex) => (
    <span
      key={errorIndex}
      className="errortexts"
    >
      {errorMessage}
    </span>
  )
)}
            </div>
          ))}

          {/* Buttons */}
          <div className="form-buttons">

            <button
              type="submit"
              disabled={isAdding}
            >
              {isAdding
                ? "Adding..."
                : "Add Question"}
            </button>

            <button
              type="button"
              onClick={() => setAddQuestinModal(false)}
            >
              Cancel
            </button>

          </div>

        </div>

      </form>

    </div>
  </div>
)}
      {DeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this Question?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => {
                  handleDelete(questionId)
                  setDeleteModal(false)
                }}
              >
   {IsDeleting ? "Deleting..." : "Yes"}
              </button>
              <button onClick={() => setDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {previewImage && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setPreviewImage("")}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Image Preview</h2>

        <button
          type="button"
          className="modal-close-btn"
          onClick={() => setPreviewImage("")}
        >
          <FaTimes />
        </button>
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "20px",
        }}
      >
        <img
          src={previewImage}
          alt="Preview"
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "80vh",
            width: "auto",
            height: "auto",
            margin: "0 auto",
            objectFit: "contain",
            borderRadius: "10px",
          }}
        />
      </div>

      <div className="modal-footer">
        <button
          type="button"
          className="cancel-btn"
          onClick={() => setPreviewImage("")}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}




      </>



  )
}

export default Prakriti;