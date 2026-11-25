import React from 'react';
import { useState, useEffect, useRef } from 'react';
import BASE_URL from '../../Base';
import { toast } from 'react-toastify';
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTimes } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
const initalAddForm = {
  experience_type: "medical_history",
  question: "",
  answer_type: "",
  choices: [],
};


const Medical = () => {
  const [Data, setData] = useState([]);
  const [Error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [Addform, setAddform] = useState(initalAddForm);
  const [AddformModal, setAddformModal] = useState(false);
  const [DeleteModal, setDeleteModal] = useState(false);
  const [SelectedQuestionId, setSelectedQuestionId] = useState(null);
  const [EditformModal, setEditformModal] = useState(false);
  const [Editform, setEditform] = useState(initalAddForm);
  const [previewImage, setPreviewImage] = useState(null);
  const fetchOnce = useRef();
  const [AddError, setAddError] = useState({});
  const [SearchQuestion, setSearchQuestion] = useState("");
  const [AnswerTypeFilter, setAnswerTypeFilter] = useState("");
  const Navigate = useNavigate();


 const getAllMedicalQuestion = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    Navigate("/login");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?experience_type=medical_history`,
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

      Navigate("/login");

      return;
    }

    const data = await response.json();

    console.log("Medical Questions:", data);


    setData(Array.isArray(data?.data) ? data.data : []);

  } catch (error) {
    console.error("Medical Question Error:", error);

    setError("Something went wrong while fetching data.");

    toast.error("Failed to fetch Medical Questions");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    if (!fetchOnce.current) {
      getAllMedicalQuestion();
      fetchOnce.current = true
    }
  }, [])

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditform((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "answer_type" &&
        value === "text"
        ? { choices: [] }
        : {}),
    }));
  };
  const handleEditChoiceChange = (index, field, value) => {
    setEditform((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) =>
        i === index ? { ...choice, [field]: value } : choice
      ),
    }));
  };

  const addEditChoice = () => {
    setEditform((prev) => ({
      ...prev,
      choices: [
        ...prev.choices,
        { value: "", image: null, image_path: "" },
      ],
    }));
  };

  const removeEditChoice = (index) => {
    setEditform((prev) => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
    }));
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAddform((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "answer_type" &&
        value === "text"
        ? { choices: [] }
        : name === "answer_type"
          ? {
            choices: [
              {
                value: "",
                image: null,
              },
            ],
          }
          : {}),
    }));
  };
  const handleChoiceChange = (
    index,
    field,
    value
  ) => {
    const updated = [...Addform.choices];

    updated[index][field] = value;

    setAddform((prev) => ({
      ...prev,
      choices: updated,
    }));
  };

  const addChoice = () => {
    setAddform((prev) => ({
      ...prev,

      choices: [
        ...prev.choices,
        {
          value: "",
          image: null,
        },
      ],
    }));
  };

  const removeChoice = (index) => {
    const updated = Addform.choices.filter((_, i) => i !== index);

    setAddform({ ...Addform, choices: updated });
  };


  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem(
        "superadmin_token"
      );

    if (!token) {
      Navigate("/login");
      return;
    }



      const updatedChoices = await Promise.all(
        Addform.choices.map(
          async (choice, index) => {
            let imageUrl = "";


            if (choice.image instanceof File) {
              imageUrl = await uploadImage(
                choice.image
              );
            }

            return {
              index,
              value: choice.value?.trim() || "",
              image_path: imageUrl || "",
            };
          }
        )
      );



      if (Addform.answer_type !== "text" && updatedChoices.some((choice) => !choice.image_path)) {
        toast.error("Please upload an image for every choice");
        return;
      }

      const payload = {
        experience_type: "medical_history",

        questions: [
          {
            question: Addform.question,

            answer_type:
              Addform.answer_type,

            choices:
              Addform.answer_type ===
                "text"
                ? []
                : updatedChoices,
          },
        ],
      };

      console.log(
        "FINAL PAYLOAD",
        payload
      );

      const res = await fetch(
        `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      console.log(
        "FINAL RESPONSE",
        data
      );

      if (!res.ok) {
        // const errorMsg =
        //   data?.errors?.questions?.[0]
        //     ?.non_field_errors?.[0] ||
        //   "Error adding question ❌";

        toast.error("something went wrong while fetching data");

        return;
      }

      toast.success(
        "Question Added Successfully ✅"
      );

      setAddformModal(false);

      setAddform(initalAddForm);

      getAllMedicalQuestion();
    } catch (err) {
      console.log(err);

      toast.error(
        "Error adding question ❌"
      );
    }
  };

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("superadmin_token")
    if (!token) {
      toast.error("session expired ! Login Again");
      return
    }
    try {
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
        Navigate("/login");
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

      if (!token) {
        toast.error("Session expired. Please login again");
        Navigate("/login");
        return;
      }

      const updatedChoices = await Promise.all(
        (Editform.choices || []).map(async (choice, index) => {
          let imagePath = choice.image_path || "";

          // Upload a newly selected image; otherwise retain the existing image.
          if (choice.image instanceof File) {
            imagePath = await uploadImage(choice.image);
          }

          return {
            index,
            value: choice.value?.trim() || "",
            image_path: imagePath || "",
          };
        })
      );

      if (
        Editform.answer_type !== "text" &&
        updatedChoices.some((choice) => !choice.image_path)
      ) {
        toast.error("Please upload an image for every choice");
        return;
      }

      const payload = {
        experience_type: Editform.experience_type || "medical_history",
        question: Editform.question,
        answer_type: Editform.answer_type,
        choices: Editform.answer_type === "text" ? [] : updatedChoices,
      };

      const res = await fetch(
        `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?id=${SelectedQuestionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        Navigate("/login");
        return;
      }

      if (!res.ok) {
        const errorMsg =
          data?.errors?.questions?.non_field_errors?.[0] ||
          data?.message ||
          "Error updating question";
        toast.error(errorMsg);
        return;
      }

      toast.success("Question Updated Successfully");
      setEditformModal(false);
      getAllMedicalQuestion();
    } catch (err) {
      console.error("Update Medical Question Error:", err);
      toast.error("Error updating question");
    }
  };

  const filteredQuestions = Data.filter((question) => {
    const questionText = (question.question || "").toLowerCase();
    const searchText = SearchQuestion.trim().toLowerCase();
    const matchesQuestion = questionText.includes(searchText);
    const matchesAnswerType =
      !AnswerTypeFilter || question.answer_type === AnswerTypeFilter;

    return matchesQuestion && matchesAnswerType;
  });

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

  return (
    <>
      {/*
        Search and answer-type filter styles
      */}
      <style>{`
        .medical-edit-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          background: rgba(25, 31, 43, 0.68);
          backdrop-filter: blur(3px);
        }
        .medical-edit-modal {
          width: min(940px, 96vw);
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 18px 55px rgba(0,0,0,.24);
        }
        .medical-edit-header {
          flex: 0 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px 15px;
          border-bottom: 1px solid #e8e8e8;
        }
        .medical-edit-header h2 {
          margin: 0;
          color: #172033;
          font-size: 21px;
          font-weight: 700;
        }
        .medical-edit-header p {
          margin: 8px 0 0;
          color: #60718c;
          font-size: 16px;
        }
        .medical-edit-close {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 10px;
          background: #f2f3f6;
          color: #697386;
          font-size: 23px;
          cursor: pointer;
        }
        .medical-edit-form {
          min-height: 0;
          overflow-y: auto;
          padding: 22px 25px 28px;
        }
        .medical-edit-form .form-group { margin-bottom: 20px; }
        .medical-edit-form .form-group > label {
          display: block;
          margin-bottom: 9px;
          color: #202938;
          font-weight: 600;
        }
        .medical-edit-form .form-group > input,
        .medical-edit-form .form-group > select {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          padding: 11px 14px;
          border: 1px solid #d9dce2;
          border-radius: 10px;
          background: #fff;
          color: #202938;
          font-size: 16px;
        }
        .medical-edit-form .choice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 6px;
        }
        .medical-edit-form .choice-header h4 {
          margin: 0;
          font-size: 16px;
          color: #111827;
        }
        .medical-edit-form .AddButton {
          border: 0;
          border-radius: 10px;
          padding: 13px 19px;
          background: #0d614e;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }
        .medical-edit-form .choice-card {
          margin: 7px 0 18px;
          padding: 13px;
          border: 1px solid #e0e0e0;
          border-radius: 13px;
          background: #fafafa;
        }
        .medical-edit-form .choice-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 13px;
        }
        .medical-edit-form .choice-title {
          font-size: 18px;
          font-weight: 600;
          color: #292929;
        }
        .medical-edit-form .remove-choice-btn,
        .medical-edit-form .delete-image-btn {
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border: 0;
          border-radius: 10px;
          background: #fff0f0;
          color: #ef3340;
          cursor: pointer;
          font-size: 16px;
        }
        .medical-edit-form .choice-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          align-items: center;
        }
        .medical-edit-form .choice-input {
          width: 100%;
          min-width: 0;
          height: 56px;
          box-sizing: border-box;
          padding: 12px 16px;
          border: 1px solid #dedede;
          border-radius: 11px;
          background: #fff;
          font-size: 16px;
          color: #172033;
        }
        .medical-edit-form .hidden-file-input { display: none; }
        .medical-edit-form .selected-image-box,
        .medical-edit-form .upload-image-btn {
          min-width: 0;
          min-height: 56px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 7px 8px 7px 12px;
          border: 1px solid #d7dce4;
          border-radius: 11px;
          background: #fff;
          color: #60718c;
        }
        .medical-edit-form .choice-preview-image {
          width: 38px;
          height: 38px;
          flex: 0 0 auto;
          object-fit: contain;
          border-radius: 6px;
        }
        .medical-edit-form .choice-image-name {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .medical-edit-form .upload-image-btn { cursor: pointer; }
        .medical-edit-form .form-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 38px;
        }
        .medical-edit-form .form-buttons button {
          min-height: 53px;
          border: 0;
          border-radius: 8px;
          background: #0d614e;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
        }
        .medical-edit-form .form-buttons button:last-child {
          background: #dedede;
          color: #333;
        }
        @media (max-width: 650px) {
          .medical-edit-overlay { padding: 10px; }
          .medical-edit-modal { width: 100%; max-height: 95vh; }
          .medical-edit-form .choice-fields,
          .medical-edit-form .form-buttons { grid-template-columns: 1fr; }
          .medical-edit-header { padding: 15px; }
          .medical-edit-form { padding: 18px 15px 22px; }
        }
        .medical-question-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .medical-question-filters .search-question-box {
          display: flex;
          align-items: center;
          position: relative;
        }
        .medical-question-filters .search-question-box input {
          min-width: 240px;
          padding: 10px 36px 10px 12px;
        }
        .medical-question-filters .search-question-box button {
          position: absolute;
          right: 8px;
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
        }
        .medical-question-filters .answer-type-filter {
          min-width: 170px;
          padding: 10px 12px;
          border: 1px solid #d5d5d5;
          border-radius: 6px;
          background: #fff;
        }
        @media (max-width: 600px) {
          .medical-question-filters { width: 100%; }
          .medical-question-filters .search-question-box,
          .medical-question-filters .search-question-box input,
          .medical-question-filters .answer-type-filter {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>

      <div className="page-header">
        <h1> Medical Questions</h1>
      </div>

      <div>

      </div>
  <div className="Question-controls">
  <div className="filter-question">
    <div className="medical-question-filters">

      {/* Search Question */}
      <div className="search-question-box">
        <input
          type="text"
          placeholder="Search by question..."
          value={SearchQuestion}
          onChange={(e) => setSearchQuestion(e.target.value)}
        />

        {SearchQuestion && (
          <button
            type="button"
            onClick={() => setSearchQuestion("")}
            title="Clear search"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Answer Type Filter */}
      <select
        value={AnswerTypeFilter}
        onChange={(e) => setAnswerTypeFilter(e.target.value)}
        aria-label="Filter by answer type"
        className="answer-type-filter"
      >
        <option value="">All Answer Types</option>
        <option value="choice">Single Choice</option>
        <option value="multi_choice">Multiple Choice</option>
        <option value="text">Text</option>
      </select>

    {(SearchQuestion || AnswerTypeFilter) && (
  <button
    type="button"
    className="clear-medical-filters"
    onClick={() => {
      setSearchQuestion("");
      setAnswerTypeFilter("");
    }}
  >
    Clear Filters
  </button>
)}

    </div>

    <button
      className="add-customer-btn"
      onClick={() => {
        setAddformModal(true);
        setAddform(initalAddForm);
      }}
    >
      + Add Question
    </button>
  </div>
</div>

      <div className="table-wrapper">
        <table className="data-table" >
          <thead>
            <tr>
              <th>Index</th>
              <th>Question</th>
              <th>Answer Type</th>

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
            ) : Error ? (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {Error}
                </td>
              </tr>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) =>
              (
                <tr key={question.id}>

                  <td>{index + 1}</td>
                  <td>{question.question} </td>
                  <td>{question.answer_type}</td>


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
                              experience_type:
                                question.experience_type || "",

                              question: question.question || "",

                              answer_type:
                                question.answer_type || "",

                              choices:
                                question.answer_type === "text"
                                  ? []
                                  : question.choices?.length
                                    ? question.choices.map((c) => ({
                                      value: c.value || "",
                                      image_path:
                                        c.image_path || "",
                                      image: null,
                                    }))
                                    : [
                                      {
                                        value: "",
                                        image: null,
                                        image_path: "",
                                      },
                                    ],
                            });
                          }}
                        >
                          <span className='icon'> <FaEdit /> </span>
                          <span> Edit</span>
                        </button>
                        <button
                          className="action-btn1"
                          title="Delete Customer"
                          onClick={() => {
                            setDeleteModal(true)
                            setSelectedQuestionId(question.id)

                          }}


                        >
                          <span className="icon-delete">
                            <FiTrash2 /> </span>
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






        {
          DeleteModal && (
            <div className='modal'>
              <div className="modal-content">
                <h3>Are you sure you want to delete this Question?</h3>
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

        {AddformModal && (
          <div
            className="medical-edit-overlay"
            onClick={() => {
              setAddformModal(false);
              setAddform(initalAddForm);
            }}
          >
            <div
              className="medical-edit-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="medical-edit-header">
                <div>
                  <h2>Add Question</h2>
                  <p>Create New Medical Question</p>
                </div>
                <button
                  type="button"
                  className="medical-edit-close"
                  onClick={() => {
                    setAddformModal(false);
                    setAddform(initalAddForm);
                  }}
                >
                  <FaTimes />
                </button>
              </div>

              <form
                className="medical-edit-form"
                onClick={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit();
                }}
              >
                <div className="form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    name="question"
                    placeholder="Enter Your Question"
                    value={Addform.question}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Question Type</label>
                  <select
                    name="answer_type"
                    value={Addform.answer_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Type</option>
                    <option value="choice">Single Choice</option>
                    <option value="multi_choice">Multiple Choice</option>
                    <option value="text">Text</option>
                  </select>
                </div>

                {(Addform.answer_type === "choice" ||
                  Addform.answer_type === "multi_choice") && (
                  <div className="form-group">
                    <div className="choice-header">
                      <h4>Choices</h4>
                      <button
                        type="button"
                        className="AddButton"
                        onClick={addChoice}
                      >
                        + Add Choice
                      </button>
                    </div>

                    {Addform.choices.map((choice, index) => (
                      <div key={index} className="choice-card">
                        <div className="choice-card-header">
                          <span className="choice-title">Choice {index + 1}</span>
                          <button
                            type="button"
                            className="remove-choice-btn"
                            onClick={() => removeChoice(index)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="choice-fields">
                          <input
                            type="text"
                            placeholder={`Enter Choice ${index + 1}`}
                            value={choice.value || ""}
                            onChange={(e) =>
                              handleChoiceChange(index, "value", e.target.value)
                            }
                            className="choice-input"
                          />

                          <input
                            type="file"
                            accept="image/*"
                            id={`add-form-choice-image-${index}`}
                            className="hidden-file-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleChoiceChange(index, "image", file);
                            }}
                          />

                          {choice.image ? (
                            <div className="selected-image-box">
                              <img
                                src={URL.createObjectURL(choice.image)}
                                alt="Selected choice"
                                className="choice-preview-image"
                                onClick={() => setPreviewImage(URL.createObjectURL(choice.image))}
                                style={{ cursor: "pointer" }}
                              />
                              <span className="choice-image-name">{choice.image.name}</span>
                              <button
                                type="button"
                                className="delete-image-btn"
                                onClick={() => {
                                  handleChoiceChange(index, "image", null);
                                  const input = document.getElementById(`add-form-choice-image-${index}`);
                                  if (input) input.value = "";
                                }}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`add-form-choice-image-${index}`}
                              className="upload-image-btn"
                            >
                              <span>📷</span>
                              <span>Click here to upload image</span>
                            </label>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-buttons">
                  <button type="submit">Add Question</button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddformModal(false);
                      setAddform(initalAddForm);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

     
{EditformModal && (
  <div
    className="medical-edit-overlay"
    onClick={() => setEditformModal(false)}
  >
    <div
      className="medical-edit-modal"
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div className="medical-edit-header">
        <div>
          <h2>Edit Question</h2>
          <p>Edit Medical Question</p>
        </div>

        <button
          type="button"
          className="medical-edit-close"
          onClick={() => setEditformModal(false)}
        >
          <FaTimes />
        </button>
      </div>

      {/* FORM */}
      <form
        className="medical-edit-form"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleUpdate();
        }}
      >

        {/* QUESTION */}
        <div className="form-group">
          <label>Question</label>

          <input
            type="text"
            name="question"
            placeholder="Enter Your Question"
            value={Editform.question}
            onChange={handleEditInputChange}
          />
        </div>

        {/* QUESTION TYPE */}
        <div className="form-group">
          <label>Question Type</label>

          <select
            name="answer_type"
            value={Editform.answer_type}
            onChange={handleEditInputChange}
          >
            <option value="">Select Type</option>
            <option value="choice">Single Choice</option>
            <option value="multi_choice">Multiple Choice</option>
            <option value="text">Text</option>
          </select>
        </div>

        {/* CHOICES */}
        {(Editform.answer_type === "choice" ||
          Editform.answer_type === "multi_choice") && (
          <div className="form-group">

            <div className="choice-header">
              <h4>Choices</h4>

              <button
                type="button"
                className="AddButton"
                onClick={addEditChoice}
              >
                + Add Choice
              </button>
            </div>

            {Editform.choices?.map((choice, index) => (
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
                    onClick={() => removeEditChoice(index)}
                  >
                    <FiTrash2 />
                  </button>
                </div>

                {/* CHOICE FIELDS */}
                <div className="choice-fields">

                  <input
                    type="text"
                    placeholder={`Enter Choice ${index + 1}`}
                    value={choice.value || ""}
                    onChange={(e) =>
                      handleEditChoiceChange(
                        index,
                        "value",
                        e.target.value
                      )
                    }
                    className="choice-input"
                  />

                  {/* FILE INPUT */}
                  <input
                    type="file"
                    accept="image/*"
                    id={`edit-form-choice-image-${index}`}
                    className="hidden-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        handleEditChoiceChange(
                          index,
                          "image",
                          file
                        );
                      }
                    }}
                  />

                  {/* NEW IMAGE */}
                  {choice.image ? (
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
                        style={{ cursor: "pointer" }}
                      />

                      <span className="choice-image-name">
                        {choice.image.name}
                      </span>

                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() => {
                          handleEditChoiceChange(
                            index,
                            "image",
                            null
                          );

                          const input = document.getElementById(
                            `edit-form-choice-image-${index}`
                          );

                          if (input) input.value = "";
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                  ) : choice.image_path ? (

                    /* EXISTING IMAGE */
                    <div className="selected-image-box">

                      <img
                        src={choice.image_path}
                        alt="Choice"
                        className="choice-preview-image"
                        onClick={() =>
                          setPreviewImage(choice.image_path)
                        }
                        style={{ cursor: "pointer" }}
                      />

                      <span className="choice-image-name">
                        Existing Image
                      </span>

                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() =>
                          handleEditChoiceChange(
                            index,
                            "image_path",
                            ""
                          )
                        }
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                  ) : (

                    /* UPLOAD IMAGE */
                    <label
                      htmlFor={`edit-form-choice-image-${index}`}
                      className="upload-image-btn"
                    >
                      <span>📷</span>
                      <span>Click here to upload image</span>
                    </label>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {/* BUTTONS */}
        <div className="form-buttons">

          <button type="submit">
            Update Question
          </button>

          <button
            type="button"
            onClick={() => setEditformModal(false)}
          >
            Cancel
          </button>

        </div>

      </form>
    </div>
  </div>
)}


      {previewImage && (
        <div
          className="medical-edit-overlay"
          style={{ zIndex: 10001 }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="medical-edit-modal"
            style={{ width: "min(760px, 94vw)", maxHeight: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="medical-edit-header">
              <div>
                <h2>Image Preview</h2>
                <p>View selected choice image</p>
              </div>
              <button
                type="button"
                className="medical-edit-close"
                onClick={() => setPreviewImage(null)}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: 24, textAlign: "center", overflow: "auto" }}>
              <img
                src={previewImage}
                alt="Choice preview"
                style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 10 }}
              />
            </div>
          </div>
        </div>
      )}

      </div>


    </>
  )
}

export default Medical