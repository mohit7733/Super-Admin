import React, { useState, useEffect } from "react";
import BASE_URL from "../../Base";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify"
import { useNavigate } from "react-router-dom";


const Prakiritianalysis = () => {
  const [openModal, setOpenModal] = useState(false);
  const [Loading, setLoading] = useState(true);
  const [Data, setData] = useState([]);

  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    prakriti_type: "",
    core_essence: "",
    dos: [""],
    donts: [""],

  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const navigate = useNavigate();
 const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  

 const getPrakritiData = async (page = 1) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `${BASE_URL}/customers/prakriti/admin/analysis-contents/`,
      {
        method: "GET",
        headers: {
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

    console.log("Prakriti API Response:", data);

    if (data.success) {
      setData(data.data);

     
     
    } else {
      toast.error(data.message || "Failed to fetch data");
    }

  } catch (error) {
    console.log("GET ERROR:", error);
    toast.error("Something went wrong while fetching data");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    getPrakritiData();
  }, []);

const handleDeleteClick = (id) => {
  setDeleteId(id);
  setDeleteModal(true);
};

const removeDosField = (index) => {
  const updatedDos = formData.dos.filter(
    (_, i) => i !== index
  );

  setFormData((prev) => ({
    ...prev,
    dos: updatedDos,
  }));
};

const removeDontsField = (index) => {
  const updatedDonts = formData.donts.filter(
    (_, i) => i !== index
  );

  setFormData((prev) => ({
    ...prev,
    donts: updatedDonts,
  }));
};


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDosChange = (index, value) => {
    const updatedDos = [...formData.dos];
    updatedDos[index] = value;

    setFormData({
      ...formData,
      dos: updatedDos,
    });
  };

  const handleDontsChange = (index, value) => {
    const updatedDonts = [...formData.donts];
    updatedDonts[index] = value;

    setFormData({
      ...formData,
      donts: updatedDonts,
    });
  };



  const addDosField = () => {
    setFormData({
      ...formData,
      dos: [...formData.dos, ""],
    });
  };

  const addDontsField = () => {
    setFormData({
      ...formData,
      donts: [...formData.donts, ""],
    });
  };


const handleDelete = async (id) => {
  try {
   const token = sessionStorage.getItem("superadmin_token");
   const response = await fetch(
      `${BASE_URL}/customers/prakriti/admin/analysis-contents/?id=${deleteId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!response) return;

    toast.success("Prakriti deleted successfully", {
      position: "top-center",
      autoClose: 2000,
    });

    setData((prev) => prev.filter((item) => item.id !== id));

    setDeleteModal(false);

  } catch (err) {

    console.error("Delete Error:", err);

    toast.error("Failed to delete prakriti", {
      position: "top-center",
      autoClose: 2000,
    });
  }
};


  const handleEdit = (item) => {
    setEditId(item.id);

    setFormData({
      prakriti_type: item.prakriti_type || "",
      core_essence: item.content?.core_essence || "",
      dos: item.content?.lifestyle?.["do's"] || [""],
      donts: item.content?.lifestyle?.["don'ts"] || [""],
    });

    setOpenModal(true);
  };


  const resetForm = () => {
    setFormData({
      prakriti_type: "",
      core_essence: "",
      dos: [""],
      donts: [""],
    });

    setEditId(null);
  };



  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  const payload = {
    prakriti_type: formData.prakriti_type,
    content: {
      core_essence: formData.core_essence,
      lifestyle: {
        "do's": formData.dos,
        "don'ts": formData.donts,
      },
    },
  };

  try {
    let response;

    if (editId) {
      response = await fetch(
        `${BASE_URL}/customers/prakriti/admin/analysis-contents/?id=${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
    } else {
      response = await fetch(
        `${BASE_URL}/customers/prakriti/admin/analysis-contents/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
    }

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.message || "Something went wrong");
      return;
    }

    toast.success(
      editId
        ? "Prakriti Updated Successfully"
        : "Prakriti Added Successfully"
    );

    resetForm();
    setOpenModal(false);
    getPrakritiData();

  } catch (error) {
    console.error("Error:", error);

    toast.error(error.message || "Failed to submit form");
  }
};

  return (
    <>
      <div className="page-header">
        <h1>Prakirti Management</h1>
        <p className="page-paragraph">Manage Prakirti</p>
      </div>

      <div className="Question-controls">
        <div className="filter-controls">
          <button
            className="add-customer-btn"
            onClick={() => {
              resetForm();
              setOpenModal(true);
            }}
          >
            + Add Prakirti
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Prakriti Type</th>
              <th>Core Essence</th>
              <th>Do's</th>
              <th>Don'ts</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : Data?.length > 0 ? (
              Data?.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>

                  <td>{item.prakriti_type}</td>

                  <td>{item.content?.core_essence}</td>

                  <td>
                    <ul className="list-style">
                      {item.content?.lifestyle?.["do's"]?.map(
                        (doItem, i) => (
                          <li key={i}>{doItem}</li>
                        )
                      )}
                    </ul>
                  </td>

                  <td>
                    <ul className="list-style">
                      {item.content?.lifestyle?.["don'ts"]?.map(
                        (dontItem, i) => (
                          <li key={i}>{dontItem}</li>
                        )
                      )}
                    </ul>
                  </td>

                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </button>

<button
  className="action-btn delete"
  onClick={() => handleDeleteClick(item.id)}
>
  <FiTrash2 />
</button>
                  </td>
                </tr>
              ))
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
              onClick={() => getPrakritiData(currentPage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getPrakritiData(page)}
                style={{

                  fontWeight: currentPage === page ? "bold" : "normal",
                  background: currentPage === page ? "#0D614E" : "#fff",
                  color: currentPage === page ? "#fff" : "#0D614E",
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => getPrakritiData(currentPage + 1)}
              disabled={!nextPage}
            >
              Next
            </button>

          </div>
        )}
        
      </div>


      {openModal && (
        <div className="prakriti-modal-overlay">
          <div className="prakriti-modal">

            <div className="prakriti-modal-header">
              <div>
                <h2>
                  {editId ? "Edit Prakriti" : "Add Prakriti"}
                </h2>

                <p>
                  Create prakriti content with lifestyle guidance
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="prakriti-form"
            >
              <div className="form-group">
                <label>Prakriti Type</label>

                <input
                  type="text"
                  name="prakriti_type"
                  placeholder="Enter prakriti type"
                  value={formData.prakriti_type}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Core Essence</label>

                <textarea
                  name="core_essence"
                  placeholder="Write the core essence..."
                  value={formData.core_essence}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>



<div className="dynamic-section">
  <div className="section-header">
    <h3>Do's</h3>

    <button
      type="button"
      onClick={addDosField}
      className="add-btn"
    >
      + Add
    </button>
  </div>

  <div className="dynamic-list">
    {formData.dos.map((item, index) => (
      <div
        className="dynamic-input"
        key={index}
      >
        <span>{index + 1}</span>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder={`Enter do ${index + 1}`}
            value={item}
            onChange={(e) =>
              handleDosChange(
                index,
                e.target.value
              )
            }
          />

          <button
            type="button"
            className="delete-icon-btn"
            onClick={() =>
              removeDosField(index)
            }
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    ))}
  </div>
</div>



<div className="dynamic-section">
  <div className="section-header">
    <h3>Don'ts</h3>

    <button
      type="button"
      onClick={addDontsField}
      className="add-btn danger"
    >
      + Add
    </button>
  </div>

  <div className="dynamic-list">
    {formData.donts.map((item, index) => (
      <div
        className="dynamic-input"
        key={index}
      >
        <span>{index + 1}</span>

        <div className="input-wrapper">
          <input
            type="text"
            placeholder={`Enter don't ${index + 1}`}
            value={item}
            onChange={(e) =>
              handleDontsChange(
                index,
                e.target.value
              )
            }
          />

          <button
            type="button"
            className="delete-icon-btn"
            onClick={() =>
              removeDontsField(index)
            }
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    ))}
  </div>
</div>




              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setOpenModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button type="submit" className="save-btn">
                  {editId
                    ? "Update Prakriti"
                    : "Save Prakriti"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     {deleteModal && (
  <div className="modal">
    <div className="modal-content">

      <h3>
        Are you sure you want to delete this Prakriti?
      </h3>

      <div className="form-buttons">

        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(deleteId);
            setDeleteModal(false);
          }}
        >
          Yes
        </button>

        <button
          onClick={() => {
            setDeleteModal(false);
            setDeleteId(null);
          }}
        >
          No
        </button>

      </div>
    </div>
  </div>
)}
    </>
  );
};

export default Prakiritianalysis;