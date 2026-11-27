
import React, { useState, useEffect, useRef } from "react";
import BASE_URL from "../../Base";
import { toast, ToastContainer } from "react-toastify";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTimes, FaEye } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";

const initialAddForm = {
  experience_type: "medical_history",
  question: "",
  answer_type: "",
  choices: [],
};

const Medical = () => {
  const Navigate = useNavigate();
  const fetchOnce = useRef(false);

  const [Data, setData] = useState([]);
  const [Error, setError] = useState(null);
  const [Loading, setLoading] = useState(true);

  const [Addform, setAddform] = useState(initialAddForm);
  const [Editform, setEditform] = useState(initialAddForm);

  const [AddformModal, setAddformModal] = useState(false);
  const [EditformModal, setEditformModal] = useState(false);
  const [DeleteModal, setDeleteModal] = useState(false);

  const [SelectedQuestionId, setSelectedQuestionId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [AddError, setAddError] = useState({});
  const [EditError, setEditError] = useState({});

  const [Submitting, setSubmitting] = useState(false);
  const [Updating, setUpdating] = useState(false);
  const [Deleting, setDeleting] = useState(false);

  const [SearchQuestion, setSearchQuestion] = useState("");
  const [AnswerTypeFilter, setAnswerTypeFilter] = useState("");

  // ==========================================
  // FETCH MEDICAL QUESTIONS
  // ==========================================

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
      fetchOnce.current = true;
      getAllMedicalQuestion();
    }
  }, []);

  // ==========================================
  // CLOSE THREE DOT MENU ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  // ==========================================
  // IMAGE UPLOAD API
  // ==========================================

  const uploadImage = async (file) => {
    const token = sessionStorage.getItem("superadmin_token");

    try {
      const formData = new FormData();

      formData.append("image", file);
      formData.append("dir", "health_issues");

      const response = await fetch(`${BASE_URL}/user/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: formData,
      });

      const data = await response.json();

      console.log("Upload Response:", data);

      if (!response.ok || !data?.data?.url) {
        toast.error(data?.message || "Image upload failed");
        return null;
      }

      return data.data.url;
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  // ==========================================
  // ADD FORM INPUT HANDLERS
  // ==========================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAddform((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "answer_type"
        ? {
            choices:
              value === "text"
                ? []
                : prev.choices.length > 0
                  ? prev.choices
                  : [{ value: "", image: null }],
          }
        : {}),
    }));

    setAddError((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "answer_type" ? { choices: "" } : {}),
    }));
  };

  const handleChoiceChange = (index, field, value) => {
    setAddform((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) =>
        i === index ? { ...choice, [field]: value } : choice
      ),
    }));

    if (field === "value") {
      setAddError((prev) => ({
        ...prev,
        [`choice_${index}`]: "",
      }));
    }

    if (field === "image" && value) {
      setAddError((prev) => ({
        ...prev,
        [`image_${index}`]: "",
      }));
    }
  };

  const addChoice = () => {
    setAddform((prev) => ({
      ...prev,
      choices: [
        ...prev.choices,
        { value: "", image: null },
      ],
    }));
  };

  const removeChoice = (index) => {
    setAddform((prev) => ({
      ...prev,
      choices: prev.choices.filter((_, i) => i !== index),
    }));

    setAddError((prev) => {
      const updated = { ...prev };

      delete updated[`choice_${index}`];
      delete updated[`image_${index}`];

      return updated;
    });
  };

  // ==========================================
  // ADD FORM VALIDATION
  // ==========================================

  const validateAddForm = () => {
    const errors = {};

    if (!Addform.question.trim()) {
      errors.question = "Please enter question";
    }

    if (!Addform.answer_type) {
      errors.answer_type = "Please select question type";
    }

    if (
      Addform.answer_type === "choice" ||
      Addform.answer_type === "multi_choice"
    ) {
      if (Addform.choices.length === 0) {
        errors.choices = "Please add at least one choice";
      }

      Addform.choices.forEach((choice, index) => {
        if (!choice.value?.trim()) {
          errors[`choice_${index}`] = "Please enter choice text";
        }

        if (!(choice.image instanceof File)) {
          errors[`image_${index}`] = "Please upload choice image";
        }
      });
    }

    setAddError(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================
  // ADD QUESTION API
  // ==========================================

  const handleSubmit = async () => {
    if (Submitting) return;

    if (!validateAddForm()) {
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      Navigate("/login");
      return;
    }

    setSubmitting(true);

    try {
      const updatedChoices = await Promise.all(
        Addform.choices.map(async (choice, index) => {
          let imageUrl = "";

          if (choice.image instanceof File) {
            imageUrl = await uploadImage(choice.image);
          }

          return {
            index,
            value: choice.value.trim(),
            image_path: imageUrl || "",
          };
        })
      );

      if (
        Addform.answer_type !== "text" &&
        updatedChoices.some((choice) => !choice.image_path)
      ) {
        toast.error("Please upload image for every choice");
        return;
      }

      const payload = {
        experience_type: "medical_history",
        questions: [
          {
            question: Addform.question.trim(),
            answer_type: Addform.answer_type,
            choices:
              Addform.answer_type === "text" ? [] : updatedChoices,
          },
        ],
      };

      console.log("FINAL ADD PAYLOAD:", payload);

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

      console.log("ADD RESPONSE:", data);

      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        Navigate("/login");
        return;
      }

      if (!res.ok) {
        toast.error(
          data?.message ||
          data?.errors?.questions?.[0]?.non_field_errors?.[0] ||
          "Error adding question"
        );
        return;
      }

      toast.success("Question Added Successfully");

      setAddformModal(false);
      setAddform(initialAddForm);
      setAddError({});
      setOpenMenuId(null);

      await getAllMedicalQuestion();
    } catch (error) {
      console.error("Add Question Error:", error);
      toast.error("Error adding question");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // EDIT FORM INPUT HANDLERS
  // ==========================================

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditform((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "answer_type"
        ? {
            choices:
              value === "text"
                ? []
                : prev.choices.length > 0
                  ? prev.choices
                  : [{ value: "", image: null, image_path: "" }],
          }
        : {}),
    }));

    setEditError((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "answer_type" ? { choices: "" } : {}),
    }));
  };

  const handleEditChoiceChange = (index, field, value) => {
    setEditform((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) =>
        i === index ? { ...choice, [field]: value } : choice
      ),
    }));

    if (field === "value") {
      setEditError((prev) => ({
        ...prev,
        [`choice_${index}`]: "",
      }));
    }

    if (
      (field === "image" && value) ||
      (field === "image_path" && value)
    ) {
      setEditError((prev) => ({
        ...prev,
        [`image_${index}`]: "",
      }));
    }
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

    setEditError((prev) => {
      const updated = { ...prev };

      delete updated[`choice_${index}`];
      delete updated[`image_${index}`];

      return updated;
    });
  };

  // ==========================================
  // EDIT FORM VALIDATION
  // ==========================================

  const validateEditForm = () => {
    const errors = {};

    if (!Editform.question.trim()) {
      errors.question = "Please enter question";
    }

    if (!Editform.answer_type) {
      errors.answer_type = "Please select question type";
    }

    if (
      Editform.answer_type === "choice" ||
      Editform.answer_type === "multi_choice"
    ) {
      if (Editform.choices.length === 0) {
        errors.choices = "Please add at least one choice";
      }

      Editform.choices.forEach((choice, index) => {
        if (!choice.value?.trim()) {
          errors[`choice_${index}`] = "Please enter choice text";
        }

        if (
          !(choice.image instanceof File) &&
          !choice.image_path
        ) {
          errors[`image_${index}`] = "Please upload choice image";
        }
      });
    }

    setEditError(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================
  // OPEN EDIT MODAL
  // ==========================================

  const openEditModal = (question) => {
    setSelectedQuestionId(question.id);

    setEditform({
      experience_type: question.experience_type || "medical_history",
      question: question.question || "",
      answer_type: question.answer_type || "",
      choices:
        question.answer_type === "text"
          ? []
          : question.choices?.length
            ? question.choices.map((choice) => ({
                value: choice.value || "",
                image_path: choice.image_path || "",
                image: null,
              }))
            : [{ value: "", image: null, image_path: "" }],
    });

    setEditError({});
    setOpenMenuId(null);
    setEditformModal(true);
  };

 

  const handleUpdate = async () => {
    if (Updating) return;

    if (!validateEditForm()) {
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      Navigate("/login");
      return;
    }

    setUpdating(true);

    try {
      const updatedChoices = await Promise.all(
        Editform.choices.map(async (choice, index) => {
          let imagePath = choice.image_path || "";

          if (choice.image instanceof File) {
            imagePath = await uploadImage(choice.image);
          }

          return {
            index,
            value: choice.value.trim(),
            image_path: imagePath || "",
          };
        })
      );

      if (
        Editform.answer_type !== "text" &&
        updatedChoices.some((choice) => !choice.image_path)
      ) {
        toast.error("Please upload image for every choice");
        return;
      }

      const payload = {
        experience_type: Editform.experience_type || "medical_history",
        question: Editform.question.trim(),
        answer_type: Editform.answer_type,
        choices:
          Editform.answer_type === "text" ? [] : updatedChoices,
      };

      console.log("UPDATE PAYLOAD:", payload);

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

      console.log("UPDATE RESPONSE:", data);

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
      setEditError({});
      setOpenMenuId(null);

      await getAllMedicalQuestion();
    } catch (error) {
      console.error("Update Medical Question Error:", error);
      toast.error("Error updating question");
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // DELETE QUESTION API
  // ==========================================

  const handleDelete = async () => {
    if (Deleting) return;

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      Navigate("/login");
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(
        `${BASE_URL}/customers/admin/customer-onboarding/questionnaires/questions/?id=${SelectedQuestionId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

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

      setData((prev) =>
        prev.filter((item) => item.id !== SelectedQuestionId)
      );

      toast.success("Question deleted successfully");

      setDeleteModal(false);
      setSelectedQuestionId(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Delete Question Error:", error);
      toast.error("Something went wrong while deleting Question");
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // FILTER QUESTIONS
  // ==========================================

  const filteredQuestions = Data.filter((question) => {
    const questionText = (question.question || "").toLowerCase();
    const searchText = SearchQuestion.trim().toLowerCase();

    const matchesQuestion = questionText.includes(searchText);

    const matchesAnswerType =
      !AnswerTypeFilter ||
      question.answer_type === AnswerTypeFilter;

    return matchesQuestion && matchesAnswerType;
  });

  // ==========================================
  // CLOSE ADD MODAL
  // ==========================================

  const closeAddModal = () => {
    setAddformModal(false);
    setAddform(initialAddForm);
    setAddError({});
  };

  // ==========================================
  // CLOSE EDIT MODAL
  // ==========================================

  const closeEditModal = () => {
    setEditformModal(false);
    setEditError({});
  };

  // ==========================================
  // IMAGE PREVIEW HELPER
  // ==========================================

  const getImagePreview = (choice) => {
    if (choice.image instanceof File) {
      return URL.createObjectURL(choice.image);
    }

    return choice.image_path || "";
  };

  return (
    <>
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
          font-size: 14px;
        }

        .medical-edit-close {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 10px;
          background: #f2f3f6;
          color: #697386;
          font-size: 20px;
          cursor: pointer;
        }

        .medical-edit-form {
          min-height: 0;
          overflow-y: auto;
          padding: 22px 25px 28px;
        }

        .medical-edit-form .form-group {
          margin-bottom: 20px;
        }

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
          font-size: 15px;
        }

        .medical-edit-form input:focus,
        .medical-edit-form select:focus {
          border-color: #0d614e;
          outline: none;
        }

        .medical-field-error {
          display: block;
          margin-top: 6px;
          color: #dc3545;
          font-size: 13px;
          font-weight: 500;
        }

        .medical-question-error {
          margin-top: 7px;
        }

        .medical-edit-form .choice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 0 0 10px;
        }

        .medical-edit-form .choice-header h4 {
          margin: 0;
          font-size: 16px;
          color: #111827;
        }

        .medical-edit-form .AddButton {
          border: 0;
          border-radius: 10px;
          padding: 11px 17px;
          background: #0d614e;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .medical-edit-form .choice-card {
          margin: 10px 0 18px;
          padding: 14px;
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
          font-size: 15px;
          font-weight: 600;
          color: #292929;
        }

        .medical-edit-form .remove-choice-btn,
        .medical-edit-form .delete-image-btn {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border: 0;
          border-radius: 10px;
          background: #fff0f0;
          color: #ef3340;
          cursor: pointer;
          font-size: 15px;
        }

        .medical-edit-form .choice-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          align-items: start;
        }

        .medical-edit-form .choice-input {
          width: 100%;
          min-width: 0;
          height: 52px;
          box-sizing: border-box;
          padding: 12px 14px;
          border: 1px solid #dedede;
          border-radius: 11px;
          background: #fff;
          font-size: 15px;
          color: #172033;
        }

        .medical-edit-form .hidden-file-input {
          display: none;
        }

        .medical-edit-form .selected-image-box,
        .medical-edit-form .upload-image-btn {
          min-width: 0;
          min-height: 52px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 10px;
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
          cursor: pointer;
        }

        .medical-edit-form .choice-image-name {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 13px;
        }

        .medical-edit-form .upload-image-btn {
          cursor: pointer;
          font-size: 14px;
        }

        .medical-edit-form .form-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 30px;
        }

        .medical-edit-form .form-buttons button {
          min-height: 50px;
          border: 0;
          border-radius: 8px;
          background: #0d614e;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .medical-edit-form .form-buttons button:last-child {
          background: #dedede;
          color: #333;
        }

        .medical-edit-form .form-buttons button:disabled {
          opacity: .65;
          cursor: not-allowed;
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
          border: 1px solid #d5d5d5;
          border-radius: 6px;
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

        .medical-question-filters .clear-medical-filters {
          padding: 10px 14px;
          border: 1px solid #0d614e;
          border-radius: 6px;
          color: #0d614e;
          background: #fff;
          cursor: pointer;
        }

        .medical-no-choice-error {
          margin-top: 8px;
        }

        .medical-image-column {
          min-width: 0;
        }

        .medical-action-cell {
          position: relative;
        }

        .medical-action-cell .action-menu-toggle {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          padding: 6px;
        }

        .medical-action-cell .action-buttons-modal {
          position: absolute;
          right: 25px;
          top: 30px;
          z-index: 100;
          min-width: 130px;
          padding: 7px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          box-shadow: 0 5px 20px rgba(0,0,0,.13);
        }

        .medical-action-cell .action-btn1 {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          color: #263238;
          border-radius: 6px;
        }

        .medical-action-cell .action-btn1:hover {
          background: #f2f7f5;
        }

        .medical-delete-overlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          background: rgba(0,0,0,.55);
        }

        .medical-delete-content {
          width: min(420px, 95vw);
          padding: 25px;
          background: white;
          border-radius: 12px;
          text-align: center;
        }

        .medical-delete-content h3 {
          color: #202938;
          font-size: 18px;
          margin: 0 0 24px;
        }

        .medical-delete-buttons {
          display: flex;
          gap: 12px;
        }

        .medical-delete-buttons button {
          flex: 1;
          min-height: 42px;
          border: none;
          border-radius: 7px;
          background: #0d614e;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        .medical-delete-buttons button:last-child {
          background: #e5e5e5;
          color: #333;
        }

        .medical-delete-buttons button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .medical-image-preview {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 10px;
        }

        @media (max-width: 650px) {
          .medical-edit-overlay {
            padding: 10px;
          }

          .medical-edit-modal {
            width: 100%;
            max-height: 95vh;
          }

          .medical-edit-form .choice-fields,
          .medical-edit-form .form-buttons {
            grid-template-columns: 1fr;
          }

          .medical-edit-header {
            padding: 15px;
          }

          .medical-edit-form {
            padding: 18px 15px 22px;
          }
        }

        @media (max-width: 600px) {
          .medical-question-filters {
            width: 100%;
          }

          .medical-question-filters .search-question-box,
          .medical-question-filters .search-question-box input,
          .medical-question-filters .answer-type-filter {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">
        <h1>Vikriti Question Management</h1>
      </div>

      {/* ======================================
          SEARCH AND FILTERS
      ====================================== */}

      <div className="Question-controls">
        <div className="filter-question">
          <div className="medical-question-filters">

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
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={AnswerTypeFilter}
              onChange={(e) => setAnswerTypeFilter(e.target.value)}
              className="answer-type-filter"
              aria-label="Filter by answer type"
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
              setAddform(initialAddForm);
              setAddError({});
              setAddformModal(true);
            }}
          >
            + Add Question
          </button>
        </div>
      </div>

      {/* ======================================
          QUESTIONS TABLE
      ====================================== */}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Index</th>
              <th>Question</th>
              <th>Answer Type</th>
              <th>Choices</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, index) => (
                <tr key={index}>
                  <td colSpan="5">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : Error ? (
              <tr>
                <td colSpan="5" style={{ color: "red" }}>
                  {Error}
                </td>
              </tr>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((question, index) => (
                <tr key={question.id}>
                  <td>{index + 1}</td>

                  <td>{question.question}</td>

                  <td>{question.answer_type}</td>

                  <td>
                    {question.choices?.length > 0
                      ? question.choices
                          .map((choice) => choice.value)
                          .join(", ")
                      : "No Choices"}
                  </td>

                  <td
                    className="medical-action-cell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="action-menu-toggle"
                      onClick={(e) => {
                        e.stopPropagation();

                        setOpenMenuId(
                          openMenuId === question.id
                            ? null
                            : question.id
                        );
                      }}
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {openMenuId === question.id && (
                      <div
                        className="action-buttons-modal"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="action-btn1"
                          onClick={() => openEditModal(question)}
                        >
                          <span className="icon">
                            <FaEdit />
                          </span>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="action-btn1"
                          onClick={() => {
                            setSelectedQuestionId(question.id);
                            setDeleteModal(true);
                            setOpenMenuId(null);
                          }}
                        >
                          <span className="icon-delete">
                            <FiTrash2 />
                          </span>
                          <span className="delete-text">Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      {DeleteModal && (
        <div
          className="medical-delete-overlay"
          onClick={() => {
            if (!Deleting) setDeleteModal(false);
          }}
        >
          <div
            className="medical-delete-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              Are you sure you want to delete this Question?
            </h3>

            <div className="medical-delete-buttons">
              <button
                type="button"
                disabled={Deleting}
                onClick={handleDelete}
              >
                {Deleting ? "Deleting..." : "Yes, Delete"}
              </button>

              <button
                type="button"
                disabled={Deleting}
                onClick={() => setDeleteModal(false)}
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          ADD QUESTION MODAL
      ====================================== */}

      {AddformModal && (
        <div
          className="medical-edit-overlay"
          onClick={closeAddModal}
        >
          <div
            className="medical-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="medical-edit-header">
              <div>
                <h2>Add Question</h2>
                <p>Create New Vikriti Question</p>
              </div>

              <button
                type="button"
                className="medical-edit-close"
                onClick={closeAddModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="medical-edit-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* QUESTION */}

              <div className="form-group">
                <label>Question</label>

                <input
                  type="text"
                  name="question"
                  placeholder="Enter Your Question"
                  value={Addform.question}
                  onChange={handleInputChange}
                />

                {AddError.question && (
                  <small className="medical-field-error medical-question-error">
                    {AddError.question}
                  </small>
                )}
              </div>

              {/* ANSWER TYPE */}

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

                {AddError.answer_type && (
                  <small className="medical-field-error">
                    {AddError.answer_type}
                  </small>
                )}
              </div>

              {/* CHOICES */}

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

                  {AddError.choices && (
                    <small className="medical-field-error medical-no-choice-error">
                      {AddError.choices}
                    </small>
                  )}

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
                          title="Remove choice"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <div className="choice-fields">
                        {/* CHOICE TEXT */}

                        <div>
                          <input
                            type="text"
                            placeholder={`Enter Choice ${index + 1}`}
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

                          {AddError[`choice_${index}`] && (
                            <small className="medical-field-error">
                              {AddError[`choice_${index}`]}
                            </small>
                          )}
                        </div>

                        {/* CHOICE IMAGE */}

                        <div className="medical-image-column">
                          <input
                            type="file"
                            accept="image/*"
                            id={`add-form-choice-image-${index}`}
                            className="hidden-file-input"
                            onChange={(e) => {
                              const file = e.target.files?.[0];

                              if (file) {
                                handleChoiceChange(
                                  index,
                                  "image",
                                  file
                                );
                              }
                            }}
                          />

                          {choice.image ? (
                            <div className="selected-image-box">
                              <img
                                src={getImagePreview(choice)}
                                alt="Selected choice"
                                className="choice-preview-image"
                                onClick={() =>
                                  setPreviewImage(getImagePreview(choice))
                                }
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

                                  const input = document.getElementById(
                                    `add-form-choice-image-${index}`
                                  );

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

                          {AddError[`image_${index}`] && (
                            <small className="medical-field-error">
                              {AddError[`image_${index}`]}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ADD BUTTONS */}

              <div className="form-buttons">
                <button type="submit" disabled={Submitting}>
                  {Submitting ? "Adding..." : "Add Question"}
                </button>

                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={Submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          EDIT QUESTION MODAL
      ====================================== */}

      {EditformModal && (
        <div
          className="medical-edit-overlay"
          onClick={closeEditModal}
        >
          <div
            className="medical-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="medical-edit-header">
              <div>
                <h2>Edit Question</h2>
                <p>Edit Vikriti Question</p>
              </div>

              <button
                type="button"
                className="medical-edit-close"
                onClick={closeEditModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="medical-edit-form"
              onSubmit={(e) => {
                e.preventDefault();
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

                {EditError.question && (
                  <small className="medical-field-error">
                    {EditError.question}
                  </small>
                )}
              </div>

              {/* ANSWER TYPE */}

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

                {EditError.answer_type && (
                  <small className="medical-field-error">
                    {EditError.answer_type}
                  </small>
                )}
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

                  {EditError.choices && (
                    <small className="medical-field-error">
                      {EditError.choices}
                    </small>
                  )}

                  {Editform.choices?.map((choice, index) => (
                    <div key={index} className="choice-card">
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

                      <div className="choice-fields">
                        {/* CHOICE TEXT */}

                        <div>
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

                          {EditError[`choice_${index}`] && (
                            <small className="medical-field-error">
                              {EditError[`choice_${index}`]}
                            </small>
                          )}
                        </div>

                        {/* IMAGE */}

                        <div className="medical-image-column">
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

                          {choice.image instanceof File ? (
                            <div className="selected-image-box">
                              <img
                                src={getImagePreview(choice)}
                                alt="Selected choice"
                                className="choice-preview-image"
                                onClick={() =>
                                  setPreviewImage(getImagePreview(choice))
                                }
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
                            <div className="selected-image-box">
                              <img
                                src={choice.image_path}
                                alt="Existing choice"
                                className="choice-preview-image"
                                onClick={() =>
                                  setPreviewImage(choice.image_path)
                                }
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
                            <label
                              htmlFor={`edit-form-choice-image-${index}`}
                              className="upload-image-btn"
                            >
                              <span>📷</span>
                              <span>Click here to upload image</span>
                            </label>
                          )}

                          {EditError[`image_${index}`] && (
                            <small className="medical-field-error">
                              {EditError[`image_${index}`]}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* UPDATE BUTTONS */}

              <div className="form-buttons">
                <button type="submit" disabled={Updating}>
                  {Updating ? "Updating..." : "Update Question"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={Updating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================
          IMAGE PREVIEW MODAL
      ====================================== */}

      {previewImage && (
        <div
          className="medical-edit-overlay"
          style={{ zIndex: 10001 }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="medical-edit-modal"
            style={{
              width: "min(760px, 94vw)",
              maxHeight: "90vh",
            }}
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

            <div
              style={{
                padding: 24,
                textAlign: "center",
                overflow: "auto",
              }}
            >
              <img
                src={previewImage}
                alt="Choice preview"
                className="medical-image-preview"
              />
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2000}
      />
    </>
  );
};

export default Medical;
