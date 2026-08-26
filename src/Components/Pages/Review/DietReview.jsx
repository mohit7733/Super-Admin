// import React from 'react'

// const DietReview = () => {
//   return (
//     <>
    
//       <div className="page-header">
//         <h1> Diet  Review Management</h1>
//         <p className="page-paragraph">
//           Manage Review, their details
//         </p>
//       </div>

//          <div className="table-wrapper">
//                                     <table className="data-table" >
//                                       <thead>
//                                         <tr>
//                                           <th>ID</th>
//                                           <th> Customer </th>
//                                           <th> Doctor</th>
//                                           <th> Review</th>  
//                                           <th> Rating</th>              
//                                         <th>Status</th>
//                                           <th>Actions</th>
                            
//                                         </tr>
//                                       </thead>
//                       <tbody>
//                         {LoadingDoctorReview? (
//                           Array(3).fill(0).map((_, i) => (
//                             <tr key={i}>
//                               <td colSpan="6">
//                                 <div className="skeleton-row"></div>
//                               </td>
//                             </tr>
//                           ))
//                         ) : ErrorDoctorReview? (
//                           <tr>
//                             <td colSpan="6" style={{ color: "red" }}>
//                               {ErrorDoctorReview}
//                             </td>
//                           </tr>
//                         ) : DoctorReviewData?.length > 0 ? (
//                           DoctorReviewData.map((item, index) => (
//                             <tr key={item.id}>
//                               <td>{index + 1}</td>
                      
                             
//                               <td>{item.patient_name}</td>
                      
                             
//                           <td>
            
//             {item.doctor_name}
//             </td>
            
            
//               <td> {item.review}</td>
//              <td>
//               <div className="rating-stars">
//                 {renderStars(Number(item.rating))}
              
//               </div>
//             </td>
//              <td>
//         <select
//           value={item.status}
//           onChange={(e) => handleStatusChange(item.id, e.target.value)}
//           className="status-dropdown"
//         >
//           <option value="">Select Status</option>
//           <option value="active">Active</option>
//           <option value="rejected">Rejected</option>
//         </select>
//       </td>
            
                      
                            
                            
                              
//                               <td>
//                                       <div className="action-buttons">
//                                      <button
//         className="action-btn view"
//         onClick={() => handleViewReview(item)}
//       >
//         <FaEye />
//       </button>                                              
//                                                        </div>
//                                       </td>
//                             </tr>
//                           ))
//                         ) : (
//                           <tr>
//                             <td colSpan="6" style={{ textAlign: "center" }}>
//                               No data found
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                                     </table>
                           
                            
                            
//                                   </div>  

//     </>
//   )
// }

// export default DietReview
import React from 'react'

const DietReview = () => {
  return (
    <>
    
    </>
  )
}

export default DietReview
