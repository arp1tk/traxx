"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
export default function Land(){
const[username , setUsername] = useState<string>()
const router = useRouter();
    const createRoon = async() => {
      if(!username?.trim()){
      alert("Please enter username");
      return;
      }
      try{
      const res = await fetch("/api/create-room",{
        method: "POST",
      headers:{
        "content-Type": "apllication/json",
      },
      body:JSON.stringify({username}),
      });
      const data = await res.json();
      console.log(data)
      if(res.ok && data.roomId){
        router.push(`/room/${data.roomId}`)
      }
      else{
        alert("something went wrong")
      }
      }
    catch (error) {
      console.error("Error creating room:", error);
      alert("Internal Server Error");
    }
    }
return(
    <div>
    <input 
      type="text"
      placeholder="username"
      onChange={(e)=>setUsername(e.target.value)}
     />
    <button onClick={createRoon}>click</button>
</div>
)
}