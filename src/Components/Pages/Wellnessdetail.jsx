import { useState, useEffect, useRef } from "react";
import { useParams } from 'react-router-dom';
import BASE_URL from "../../Base";
import { toast,ToastContainer } from "react-toastify";

const Wellnessdetail = () => {
  const[CenterData,setCenterData]=useState([])
  const[Error,setError]=useState(null)
    const { CenterId}= useParams();
    
    const getAllbooking=async()=>{
try{

  const response =await fetch(`${BASE_URL}/ecom/`,{
    method:'GET',
    headers:{
     "Content-Type": "application/json",
    }
  })
  const Data = await response.json();
  setCenterData(Data)

}
catch(err){
  console.error("Error Message",err)
setError(err)

}
    }


useEffect(()=>{
  getAllbooking();
},[])


const handleAddsubmit=async()=>{
  try{
    const formData = new FormData();
    formData.append()
const response = await fetch(`${BASE_URL}/ecom/`,{
  method:'POST',
 body:formData,
})

if(response.ok){
  const data= await response.json();
  setCenterData((prev)=>[...prev,data]) 
}
else{

  toast.error("Failed to Add")
}


  }
  catch(err){
console.err(err)
toast.error("something went Wrong")
  }
}

const handleInputChange=async(e)=>{
const {name,value}=e.target
setCenterData((prev)=>({...prev,[name]:value}))
}


  return (
    <>
   <div> Wellnessdetail
    </div> 
    </>
  )
}

export default Wellnessdetail