"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
export default function Land(){
const[username , setUsername] = useState<string>()
const[roomId , setRoomId] = useState<string>();
const router = useRouter();
    const createRoom = async() => {
      if(!username?.trim()){
      alert("Please enter username");
      return;
      }
      try{
      const res = await fetch("/api/rooms/create-room",{
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
     const joinRoom = async() => {
      if(!username?.trim() || !roomId?.trim()){
      alert("Please enter username and room id");
      return;
      }
      try{
      const res = await fetch("/api/rooms/join",{
        method: "POST",
      headers:{
        "content-Type": "apllication/json",
      },
      body:JSON.stringify({username,roomId}),
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
    <div>
    <input 
      type="text"
      placeholder="username"
      onChange={(e)=>setUsername(e.target.value)}
     />
    <button onClick={createRoom}>create room</button>
   
</div>
<div>
    <input 
      type="text"
      placeholder="room id"
      onChange={(e)=>setRoomId(e.target.value)}
     />
    <button onClick={joinRoom}>join room</button>
   
</div>
</div>
)
}