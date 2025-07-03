/*
  Logic for these function(s) is incomplete due to no backend implementation.
  Each function will eventually make API calls to Flask backend endpoints
  to retrieve the corresponding volunteer history data.
*/


// Fetches the user's full volunteer history from the backend
export async function getVolunteerHistory(){
    /* This is filler data for now, once backend is implemented
    this will be an API call */

    const data = [
        {
          eventName: "Community Park Cleanup",
          eventDescription: "Join us for a day of cleaning and beautifying the neighborhood park. Volunteers will help with trash pickup, light landscaping, and painting benches.",
          location: "Greenwood Community Park, 123 Elm St, Springfield",
          requiredSkills: ["Gardening", "Teamwork", "Painting"],
          urgency: {text : "High", numeric : 2},
          eventDate: "2025-07-10",
          participationStatus: {text: "Registered" , numeric : 3}
        },
       
        {
          eventName: "Food Bank Distribution",
          eventDescription: "Help us sort, package, and distribute food to families in need. Volunteers should be able to lift light boxes and work efficiently in a team.",
          location: "Helping Hands Food Bank, 45 River Rd, Rivertown",
          requiredSkills: ["Organization", "Lifting", "Customer Service"],
          urgency: {text : "Medium", numeric : 1},
          eventDate: "2025-07-15",
          participationStatus: {text:"Interested", numeric : 0}
        },
      ];

    return data;
}

export function sortByField(paginatedData, field, ascending, setPaginatedData) {

  //Flatten the data, paginatedData is an array of nested arrays orginally
  const flatData = paginatedData.flat();

  // Sort it, pass the compareFn parameter to determine sort order(Asc or Desc)
  flatData.sort((a, b) => {
    const valA = a[field];
    const valB = b[field];

    // Date special case (assume ISO string or Date obj)
    if (field === "Date") {
      return ascending
        ? new Date(valA) - new Date(valB)
        : new Date(valB) - new Date(valA);
    }

    // String case (name, status, etc.)
    if (typeof valA === "string") {
      return ascending
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    // Numeric case (urgency, etc.)
    return ascending ? valA - valB : valB - valA;
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
