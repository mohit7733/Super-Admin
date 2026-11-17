import React from 'react';
import { useState, useEffect, useRef } from 'react';
import BASE_URL from '../../Base';
import { toast } from 'react-toastify';
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { FaEdit } from "react-icons/fa";
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
  const handleEditChoiceChange = (
    index,
    field,
    value
  ) => {
    const updated = [...Editform.choices];

    updated[index][field] = value;

    setEditform({
      ...Editform,
      choices: updated,
    });
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
              value: choice.value,
              image_path: imageUrl,
            };
          }
        )
      );



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

      const payload = {
        experience_type:
          Editform.experience_type,

        question: Editform.question,

        answer_type:
          Editform.answer_type,

        choices:
          Editform.answer_type === "text"
            ? []
            : Editform.choices.map(
              (choice, index) => ({
                index,
                value: choice.value,
                image_path:
                  choice.image_path || "",
              })
            ),
      };

      const res = await fetch(
        `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?id=${SelectedQuestionId}`,
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
  <div className="modal">
    <form
      className="customer-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <h2>Add Question</h2>

      <label>Question</label>

      <input
        type="text"
        name="question"
        placeholder="Enter Question"
        value={Addform.question}
        onChange={handleInputChange}
      />

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

      {(Addform.answer_type === "choice" ||
        Addform.answer_type === "multi_choice") && (
        <>
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
                <span className="choice-title">
                  Choice {index + 1}
                </span>

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

                {choice.image && (
                  <img
                    src={URL.createObjectURL(choice.image)}
                    alt="preview"
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </>
      )}

      <div className="form-buttons">
        <button type="submit">
          Add Question
        </button>

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
)}

        {EditformModal && (
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
                name="question"
                placeholder="Enter Question"
                value={Editform.question}
                onChange={handleEditInputChange}
              />

              <label>Question Type</label>

              <select
                name="answer_type"
                value={Editform.answer_type}
                onChange={handleEditInputChange}
              >
                <option value="">Select Type</option>

                <option value="choice">
                  Single Choice
                </option>

                <option value="multi_choice">
                  Multiple Choice
                </option>

                <option value="text">
                  Text
                </option>
              </select>

              {(Editform.answer_type === "choice" ||
                Editform.answer_type === "multi_choice") && (
                  <>
                    <div className="choice-header">
                      <h4>Choices</h4>

                      <button
                        type="button"
                        onClick={addEditChoice}
                        className="AddButton"
                      >
                        + Add Choice
                      </button>
                    </div>

                    {Editform.choices.map((choice, index) => (
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
                            onClick={() =>
                              removeEditChoice(index)
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </div>

                        <div className="choice-fields">

                          <input
                            type="text"
                            placeholder={`Enter Choice ${index + 1
                              }`}
                            value={choice.value}
                            onChange={(e) =>
                              handleEditChoiceChange(
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
                              handleEditChoiceChange(
                                index,
                                "image",
                                e.target.files[0]
                              )
                            }
                            className="choice-file"
                          />

                          {choice.image_path && (
                            <img
                              src={choice.image_path}
                              alt="choice"
                              style={{
                                width: "70px",
                                height: "70px",
                                objectFit: "cover",
                                borderRadius: "8px",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </>
                )}

              <div className="form-buttons">
                <button type="submit">
                  Update
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setEditformModal(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

      </div>


    </>

  )
}

export default Medical