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
          participationStatus: {text: "Registered" , numeric : 1}
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
        {
          eventName: "Animal Shelter Volunteering",
          eventDescription: "Assist with feeding, walking, and socializing animals waiting for adoption. Great opportunity for animal lovers!",
          location: "Sunny Paws Shelter, 22 Pet Lane, Springfield",
          requiredSkills: ["Compassion", "Responsibility", "Animal Care"],
          urgency: { text: "Low", numeric: 0 },
          eventDate: "2025-07-08",
          participationStatus: { text: "Completed", numeric: 2 }
        },

        {
          eventName: "Riverbank Restoration Project",
          eventDescription: "Work alongside environmental specialists to restore the natural habitat along the riverbank. Tasks include planting native species and removing invasive plants.",
          location: "Maple River Trailhead, 321 River Rd, Springfield",
          requiredSkills: ["Environmental Awareness", "Physical Stamina", "Teamwork"],
          urgency: { text: "High", numeric: 2 },
          eventDate: "2025-07-12",
          participationStatus: { text: "Registered", numeric: 1}
        },

        {
          eventName: "Senior Center Tech Help",
          eventDescription: "Help seniors learn to use smartphones and computers for staying in touch with family and friends.",
          location: "Evergreen Senior Center, 90 Oak Blvd, Rivertown",
          requiredSkills: ["Patience", "Technology", "Communication"],
          urgency: { text: "Medium", numeric: 1 },
          eventDate: "2025-07-18",
          participationStatus: { text: "Interested", numeric: 0 }
        },

        {
          eventName: "Community Mural Painting",
          eventDescription: "Join local artists to design and paint a mural that reflects the community’s history and culture.",
          location: "Downtown Wall Project, 12 Main St, Springfield",
          requiredSkills: ["Artistic Skills", "Creativity", "Teamwork"],
          urgency: { text: "High", numeric: 2 },
          eventDate: "2025-07-14",
          participationStatus: { text: "Completed", numeric: 2 }
        },
        {
          eventName: "Library Summer Reading Program",
          eventDescription: "Support young readers by helping with storytime, book organization, and activity stations during the summer reading kickoff.",
          location: "Springfield Public Library, 88 Bookworm Ave, Springfield",
          requiredSkills: ["Reading", "Patience", "Organization"],
          urgency: { text: "Low", numeric: 0 },
          eventDate: "2025-07-05",
          participationStatus: { text: "Interested", numeric: 0 }
        },

        {
          eventName: "Neighborhood Tree Planting",
          eventDescription: "Join a local greening effort to plant trees and increase shade coverage across neighborhoods in need.",
          location: "Various locations across North Springfield",
          requiredSkills: ["Gardening", "Teamwork", "Physical Strength"],
          urgency: { text: "Medium", numeric: 1 },
          eventDate: "2025-07-13",
          participationStatus: { text: "Registered", numeric: 1 }
        },

        {
          eventName: "Homeless Shelter Meal Prep",
          eventDescription: "Prepare and serve hot meals to guests at the local homeless shelter. Volunteers will work kitchen shifts with staff.",
          location: "Safe Haven Shelter, 210 Hope St, Springfield",
          requiredSkills: ["Cooking", "Teamwork", "Efficiency"],
          urgency: { text: "High", numeric: 2 },
          eventDate: "2025-07-09",
          participationStatus: { text: "Completed", numeric: 2 }
        },

        {
          eventName: "Park Safety Patrol",
          eventDescription: "Help monitor and report safety concerns during a busy community park event. Volunteers walk trails and offer assistance.",
          location: "Liberty Park, 9 Freedom Blvd, Rivertown",
          requiredSkills: ["Alertness", "Public Communication", "Walking"],
          urgency: { text: "Medium", numeric: 1 },
          eventDate: "2025-07-11",
          participationStatus: { text: "Registered", numeric: 1 }
        }


      ];

    return data;
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

