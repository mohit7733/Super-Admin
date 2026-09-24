import React, { useEffect, useState, useRef } from "react";
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaCopy,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import { useNavigate } from "react-router-dom";
import { BiPlus } from "react-icons/bi";

const BannerEvent = () => {
  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);

  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const [previewImage, setPreviewImage] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    ended: 0,
  });

  const hasFetched = useRef(false);
  const navigate = useNavigate();


  const calculateStats = (data) => {
    const total = data.length;

    const live = data.filter(
      (item) => item.status?.toLowerCase() === "live"
    ).length;

    const ended = data.filter(
      (item) => item.status?.toLowerCase() === "ended"
    ).length;

    setStats({
      total,
      live,
      ended,
    });
  };

  

  const filterData = (data, search, status, mode) => {
    let filtered = [...data];

    if (search.trim()) {
      const term = search.toLowerCase().trim();

      filtered = filtered.filter((item) => {
        return (
          item.title?.toLowerCase().includes(term) ||
          item.id?.toLowerCase().includes(term) ||
          item.scope?.toLowerCase().includes(term) ||
          item.status?.toLowerCase().includes(term) ||
          item.mode?.toLowerCase().includes(term)
        );
      });
    }

    if (status !== "all") {
      filtered = filtered.filter(
        (item) => item.status?.toLowerCase() === status
      );
    }

    if (mode !== "all") {
      filtered = filtered.filter(
        (item) => item.mode?.toLowerCase() === mode
      );
    }

    return filtered;
  };


  const getBannerEvents = async () => {
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
        `${BASE_URL}/banners/admin/events/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
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

      if (data.success) {
        const sortedData = [...(data.data || [])].sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        setData(sortedData);

        calculateStats(sortedData);

        setFilteredData(
          filterData(
            sortedData,
            searchTerm,
            statusFilter,
            modeFilter
          )
        );
      } else {
        toast.error(
          data.message || "Failed to fetch banner events"
        );

        setError(
          data.message || "Failed to fetch banner events"
        );
      }
    } catch (error) {
      console.error("Banner Events Fetch Error:", error);

      setError(
        "Something went wrong while fetching banner events."
      );

      toast.error("Failed to fetch banner events");
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    getBannerEvents();
  }, []);

  
  useEffect(() => {
    setFilteredData(
      filterData(
        Data,
        searchTerm,
        statusFilter,
        modeFilter
      )
    );
  }, [Data, searchTerm, statusFilter, modeFilter]);


  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModeFilter("all");
  };

 

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };



  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "live":
        return "status-badge status-live";

      case "ended":
        return "status-badge status-ended";

      case "scheduled":
        return "status-badge status-scheduled";

      case "cancelled":
        return "status-badge status-cancelled";

      default:
        return "status-badge";
    }
  };

  return (
    <>
     
      <div className="page-header">
        <h1>Banner Events Management</h1>

        <p className="page-paragraph">
          Manage banner events and their scheduling details
        </p>
      </div>

    

      <div className="stats2-grid">

        
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaUsers size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Events</h3>

            <div className="stat2-value">
              {stats.total}
            </div>
          </div>
        </div>

     
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaChartLine size={16} />
          </div>

          <div className="stat2-info">
            <h3>Live</h3>

            <div className="stat2-value">
              {stats.live}
            </div>
          </div>
        </div>

      
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCalendarAlt size={16} />
          </div>

          <div className="stat2-info">
            <h3>Ended</h3>

            <div className="stat2-value">
              {stats.ended}
            </div>
          </div>
        </div>
      </div>
   


      <div className="filter-category">

        <div className="filter-controls">

         

          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by title, ID, scope..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="search-input"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

         

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">All Status</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          

          {(searchTerm ||
            statusFilter !== "all" ||
            modeFilter !== "all") && (
            <button
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Reset Filters"
            >
              <FiRefreshCw />
            </button>
          )}

        </div>

   
        <button
          className="add-customer-btn"

        >

          <BiPlus />

          Add  Banner

        </button>
     
      </div>



   

      <div className="table-wrapper">

        <table className="data-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Event</th>
              <th>Scope</th>
              <th>Mode</th>
              <th>Media</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

          

            {Loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="9">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : Error ? (

              /* Error */

              <tr>
                <td
                  colSpan="9"
                  style={{ color: "#dc2626" }}
                >
                  {Error}
                </td>
              </tr>

            ) : FilteredData?.length > 0 ? (

              /* Data */

              FilteredData.map((item, index) => {

                const media =
                  item.media?.[0];

                return (
                  <tr key={item.id}>

                    {/* # */}

                    <td>
                      {index + 1}
                    </td>

                    {/* Event */}

                    <td>
                      <strong>
                        {item.title || "N/A"}
                      </strong>

                      {item.id && (
                        <div className="category-id-wrapper">

                          <span className="category-id-text">
                            {item.id}
                          </span>

                          <button
                            type="button"
                            className="copy-id-btn"
                            title="Copy Event ID"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                item.id
                              );

                              toast.success(
                                "Event ID copied!"
                              );
                            }}
                          >
                            <FaCopy size={12} />
                          </button>

                        </div>
                      )}
                    </td>

                    

                    <td>
                      <span className="category-code-badge">
                        {item.scope || "N/A"}
                      </span>
                    </td>

              

                    <td>
                      <span
                        className="category-code-badge"
                        style={{
                          textTransform: "capitalize",
                        }}
                      >
                        {item.mode || "N/A"}
                      </span>
                    </td>

                 

                    <td>
                      {media?.media_url ? (

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >

                          <img
                            src={media.media_url}
                            alt={item.title || "Banner"}
                            width="55"
                            height="35"
                            style={{
                              objectFit: "cover",
                              borderRadius: "7px",
                              cursor: "pointer",
                              border:
                                "1px solid #e5e7eb",
                            }}
                            onClick={() =>
                              setPreviewImage(
                                media.media_url
                              )
                            }
                          />

                         

                        </div>

                      ) : (
                        <span
                          style={{
                            color: "#9ca3af",
                            fontSize: "13px",
                          }}
                        >
                          No Media
                        </span>
                      )}
                    </td>

                  

                    <td
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                      }}
                    >
                      {formatDate(item.starts_at)}
                    </td>

                    {/* End */}

                    <td
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                      }}
                    >
                      {formatDate(item.ends_at)}
                    </td>


                    <td>
                      <span
                        className={getStatusClass(
                          item.status
                        )}
                      >
                        {item.status || "N/A"}
                      </span>
                    </td>

                    {/* Active */}

                    <td>

                      <span
                        className={
                          item.is_active
                            ? "status-badge status-live"
                            : "status-badge status-ended"
                        }
                      >
                        {item.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </td>

                  </tr>
                );
              })

            ) : (

           

              <tr>
                <td colSpan="9">

                  <div className="empty-filter-state">

                    <div className="empty-filter-icon">
                      <FiSearch />
                    </div>

                    <h3>
                      {searchTerm ||
                      statusFilter !== "all" ||
                      modeFilter !== "all"
                        ? "No Banner Events Found"
                        : "No Banner Events Available"}
                    </h3>

                    <p>
                      {searchTerm ||
                      statusFilter !== "all" ||
                      modeFilter !== "all"
                        ? "We couldn't find any banner event matching your search or selected filters."
                        : "There are currently no banner events available."}
                    </p>

                    {(searchTerm ||
                      statusFilter !== "all" ||
                      modeFilter !== "all") && (
                      <button onClick={clearFilters}>
                        <FiRefreshCw />
                        Reset Filters
                      </button>
                    )}

                  </div>

                </td>
              </tr>

            )}

          </tbody>
        </table>
      </div>

      

      {previewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setPreviewImage("")}
        >

          <div
            className="prakriti-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="prakriti-modal-header">

              <h2>Banner Preview</h2>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setPreviewImage("")
                }
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
                alt="Banner Preview"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "70vh",
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
                className="cancel-btn"
                onClick={() =>
                  setPreviewImage("")
                }
              >
                Close
              </button>

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

export default BannerEvent;