import {checkTokenTime} from "../helpers/authHelpers"

// Fetches the user's full volunteer history from the backend
export async function getVolunteerHistory(){
  // First validate that user JWT token is still vaild
  await checkTokenTime();

  
 const response = await fetch(`http://127.0.0.1:5000/api/history/?user=${localStorage.getItem("user_email")}`, {
        method: "GET",
        headers: {
          "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        }
        
    });

    const parsed = await response.json();

    return parsed;
}

// Fetches the user's full volunteer history from the backend
export async function addHistoryEntry(data){
  // First validate that user JWT token is still vaild
  await checkTokenTime();

  
    await fetch("http://127.0.0.1:5000/api/history/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization" : `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(data)
    });

}

export function sortByField(paginatedData,setPaginatedData ,field, ascending) {

  //Flatten the data - (paginatedData is an array of nested arrays orginally)
  const flatData = paginatedData.flat();

  // Sort it, pass the compareFn parameter(a,b) to determine sort order(Asc or Desc)
  flatData.sort((a, b) => {
    const valA = a[field];
    const valB = b[field];

    // Date case
    if (field === "eventDate") {
      return ascending
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    }

    // Event name case
    if (field === "eventName") {
      return ascending
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    // Numeric case (urgency and status)
    return ascending ? valA.numeric - valB.numeric : valB.numeric - valA.numeric;
  });

  // 3. Re-paginate (e.g., 5 per page)
  const pageSize = paginatedData[0]?.length || 5;
  const newPaginated = [];
  for (let i = 0; i < flatData.length; i += pageSize) {
    newPaginated.push(flatData.slice(i, i + pageSize));
  }

  // 4. Update state
  setPaginatedData(newPaginated);
}

