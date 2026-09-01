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


 const getQuestionData = async (page = 1) => {
  const token = sessionStorage.getItem(
    "superadmin_token"
  );

  if (!token) {
    toast.error(
      "Session expired. Please login again"
    );

    navigate("/login");

    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?experience_type=prakriti&page=${page}`,
      {
        method: "GET",

        headers: {
          Accept: "application/json",

          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,

          "ngrok-skip-browser-warning":
            "true",
        },
      }
    );



    if (
      response.status === 401 ||
      response.status === 403
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

    const data = await response.json();

    console.log(
      "Question API Response:",
      data
    );

    setQuestionData(
      data?.data?.results || []
    );

    setCurrentPage(page);

    setTotalCount(
      data?.data?.count || 0
    );

    setNextpage(data?.data?.next);

    setPreviousPage(
      data?.data?.previous
    );

  } catch (error) {
    console.error(
      "Question Error:",
      error
    );

    setError(
      "Something went wrong while fetching data."
    );

    toast.error(
      "Failed to fetch Question Data"
    );
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

  const choiceErrors = editForm.choices?.map((choice) =>
    !choice.value?.trim() ? "Choice value required" : null
  );

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

  if (!Addform.question.trim()) {
    errors.question = "Question is required";
  } else if (Addform.question.length < 5) {
    errors.question = "Question must be at least 5 characters";
  }

  if (!Addform.choices.length) {
    errors.choices = "At least one choice is required";
  } else {
    const choiceErrors = Addform.choices.map((choice) => {
      if (!choice.value.trim()) {
        return "Choice value required";
      }
      return null;
    });

    if (choiceErrors.some((err) => err !== null)) {
      errors.choiceErrors = choiceErrors;
    }
  }

  setAddError(errors);

  if (Object.keys(errors).length > 0) {
    toast.error("Please fix the errors before submitting");
    return;
  }

  try {
     setIsAdding(true);
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      navigate("/login");
      return;
    }

    
    const updatedChoices = await Promise.all(
      Addform.choices.map(async (choice, index) => {
        let imageUrl = "";

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

    // STEP 2: JSON Payload
    const payload = {
      experience_type: Addform.experience_type,
      questions: [
        {
          question: Addform.question,
          choices: updatedChoices,
        },
      ],
    };

    console.log("FINAL PAYLOAD", payload);

    
    const res = await fetch(
      `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/`,
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

    const data = await res.json();

    console.log("FINAL RESPONSE", data);

    if (res.ok) {
      toast.success("Question added");

      setAddQuestinModal(false);

      setAddForm(initialAddForm);

      getQuestionData();
    } else {
      toast.error(data?.message || "Failed to add question");
    }
  } catch (error) {
    console.log(error);

    toast.error("Something went wrong");
  }
  finally{
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
  <div className="modal">
    <form
      className="customer-form"
      onSubmit={handleEditSubmit}
    >
      <h2>Edit Question</h2>

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

      <h4>Choices</h4>

      {EditError.choices && (
        <p className="error">
          {EditError.choices}
        </p>
      )}

      <div className="choice-header">
        <button
          type="button"
          onClick={() =>
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
            })
          }
          className="AddButton"
        >
          + Add Choice
        </button>
      </div>

      {editForm.choices?.map(
        (choice, index) => (
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
                onClick={() => {
                  const updatedChoices =
                    editForm.choices.filter(
                      (_, i) =>
                        i !== index
                    );

                  setEditForm({
                    ...editForm,
                    choices:
                      updatedChoices,
                  });
                }}
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
                onChange={(e) =>
                  handleChoiceChange(
                    index,
                    "image",
                    e.target.files[0]
                  )
                }
                className="choice-file"
              />
            </div>

            {choice.image_path && (
              <div className="preview-image-wrapper">
                <img
                  src={
                    choice.image_path
                  }
                  alt="choice"
                  className="preview-image"
                />
              </div>
            )}

            {EditError.choiceErrors &&
              EditError
                .choiceErrors[
                index
              ] && (
                <p className="errortext">
                  {
                    EditError
                      .choiceErrors[
                      index
                    ]
                  }
                </p>
              )}
          </div>
        )
      )}

      <div className="form-buttons">
      
      <button
  type="submit"
  disabled={IsEditing}
>
  {IsEditing ? "Updating..." : "Update"}
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

        {/* Question */}
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

        {/* Choices */}
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

  {/* Choice Value */}
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

  {/* Hidden File Input */}
  <input
    type="file"
    accept="image/*"
    id={`choice-image-${index}`}
    className="hidden-file-input"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        handleAddChoiceChange(
          index,
          "image",
          file
        );
      }
    }}
  />

  {/* IMAGE AREA */}
  {choice.image ? (
    <div className="selected-image-box">

      <img
        src={URL.createObjectURL(choice.image)}
        alt="Selected"
        className="choice-preview-image"
      />

      <span className="choice-image-name">
        {choice.image.name}
      </span>

      <button
        type="button"
        className="delete-image-btn"
        onClick={() => {
          handleAddChoiceChange(
            index,
            "image",
            null
          );

          // file input reset
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
              {AddError.choiceErrors &&
                AddError.choiceErrors[index] && (
                  <p className="errortext">
                    {AddError.choiceErrors[index]}
                  </p>
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




      </>



  )
}

export default Prakriti;