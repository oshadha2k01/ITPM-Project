import React, { use, useEffect } from 'react'
import axios from 'axios'

//import the foodlis


const GetFood=()=> {

    const [food,setFood]=useState([]);
    const[searchItem,setSearchItem]=useState("");
    const[seletedCategory,setseletedCategory]=useState(""); 

    useEffect(() => {
        async function fetchData() {
          try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${API_BASE}/api/foods`);
            const data = await response.json();
            setFood(data);
          } catch (error) {
            console.error(error);
          }
        }
        fetchData();
      }, []);

    const handleCategoryChange=(e)=>{
        setseletedCategory(e.target.value);
    }

    const handleSearch=(e)=>{
        setSearchItem(e.target.value);
    }

    const filteredFoods=foods.filter(food=>{

    const matchesCategory = seletedCategory === "" || food.category === seletedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchItem.toLowerCase());
    return matchesCategory && matchesSearch;

    });

  return (
   <div>

    





   </div>
  )
}

export default GetFood