import React, { useState } from 'react'
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../Base";

import "react-toastify/dist/ReactToastify.css";
const Items = () => {
const[ItemsData,setItemsData]=useState([]);
const[Itemsloading,setItemsloading]=useState(true);
const[ItemsError,setItemsError]=useState(null);
    const params = useParams();
    const { PaymentId } = params;
    const getItemsList= async () => {
    try {
       const response = await fetch( `${BASE_URL}/ecom/payment/${PaymentId}/`, {
        method: 'GET',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
   const sortedData = data[0]?.order?.items || [];



      setItemsData(sortedData)

      console.log("ItemsData---->", sortedData)
    } catch (err) {
      console.error(err.message)
  setItemsError("Something went wrong while fetching data.")
      toast.error(" Failed to fetch Items", {
        position: "top-center",
        autoClose: 2000,
      })
    } finally {
      setItemsloading(false)
    }
  }
useEffect(()=>{
getItemsList();
},[])

  return (

    <>
    <h2> Items</h2>
      <table  className="customers-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price (₹)</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
<tbody>
  {Itemsloading ? (
    <tr>
      <td colSpan="5">Loading Items data...</td>
    </tr>
  ) : ItemsError ? (
    <tr>
      <td colSpan="5" style={{ color: "red" }}>
        {ItemsError}
      </td>
    </tr>
  ) : ItemsData.length > 0 ? (
    ItemsData.map((item, index) => (
      <tr key={item.product_id || index}>
        <td>
          <img
            src={item.product_image}
            alt={item.product_name}
            style={{ width: "60px", height: "60px", objectFit: "cover" }}
          />
        </td>
        <td>{item.product_name}</td>
        <td>{item.quantity}</td>
        <td>{item.price}</td>
        <td>{(item.quantity * item.price).toFixed(2)}</td>
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


    </>
  )
}

export default Items