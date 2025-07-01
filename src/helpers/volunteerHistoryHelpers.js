/*
  Logic for these functions is incomplete due to no backend implementation.
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
          urgency: "High",
          eventDate: "2025-07-10",
          participationStatus: "Registered" // e.g., "Registered", "Interested", "Declined", "Completed"
        },
       
        {
          eventName: "Food Bank Distribution",
          eventDescription: "Help us sort, package, and distribute food to families in need. Volunteers should be able to lift light boxes and work efficiently in a team.",
          location: "Helping Hands Food Bank, 45 River Rd, Rivertown",
          requiredSkills: ["Organization", "Lifting", "Customer Service"],
          urgency: "Medium",
          eventDate: "2025-07-15",
          participationStatus: "Interested"
        },

        {
          eventName: "Senior Tech Workshop",
          eventDescription: "Assist senior citizens in learning how to use smartphones and basic computer functions. Patience and clear communication are key!",
          location: "Maplewood Senior Center, 678 Oak Ave, Pleasantville",
          requiredSkills: ["Communication", "Technology", "Patience"],
          urgency: "Low",
          eventDate: "2025-07-20",
          participationStatus: "Completed"
        }
      ];

    return data;
}