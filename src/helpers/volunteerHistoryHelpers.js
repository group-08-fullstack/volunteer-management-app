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
          urgency: "High",
          eventDate: "2025-07-10",
          participationStatus: "Registered" 
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
        },
        {
          eventName: "Food Bank Distribution",
          eventDescription: "Help sort, pack, and distribute food to families in need. A great opportunity to give back and support the local community.",
          location: "Springfield Food Pantry, 456 Oak St, Springfield",
          requiredSkills: ["Organization", "Lifting", "Compassion"],
          urgency: "Medium",
          eventDate: "2025-07-15",
          participationStatus: "Registered"
        },
        {
          eventName: "Senior Tech Help Day",
          eventDescription: "Assist senior citizens with using smartphones, tablets, and computers. Patience and basic tech knowledge needed.",
          location: "Downtown Senior Center, 789 Pine St, Springfield",
          requiredSkills: ["Tech Support", "Communication", "Patience"],
          urgency: "Low",
          eventDate: "2025-07-20",
          participationStatus: "Registered"
        },
        {
          eventName: "Riverbank Restoration Project",
          eventDescription: "Work alongside environmental specialists to restore the natural habitat along the riverbank. Tasks include planting native species and removing invasive plants.",
          location: "Maple River Trailhead, 321 River Rd, Springfield",
          requiredSkills: ["Environmental Awareness", "Physical Stamina", "Teamwork"],
          urgency: "High",
          eventDate: "2025-07-12",
          participationStatus: "Registered"
        },
        {
          eventName: "Community Food Drive",
          eventDescription: "Help collect, sort, and distribute food donations to local families in need. Volunteers will assist with organizing supplies and managing distribution points.",
          location: "Downtown Shelter, 456 Main St, Springfield",
          requiredSkills: ["Organization", "Communication", "Compassion"],
          urgency: "Medium",
          eventDate: "2025-07-15",
          participationStatus: "Pending"
        },
        {
          eventName: "Youth Sports Coaching",
          eventDescription: "Assist coaches in running youth sports activities including soccer and basketball. Support includes organizing drills and encouraging sportsmanship.",
          location: "Eastside Recreation Center, 789 Park Ave, Springfield",
          requiredSkills: ["Coaching", "Leadership", "Patience"],
          urgency: "Low",
          eventDate: "2025-07-20",
          participationStatus: "Registered"
        },
        {
          eventName: "Senior Center Tech Support",
          eventDescription: "Provide basic computer and smartphone assistance to seniors to help them stay connected with family and friends.",
          location: "Springfield Senior Center, 101 Oak St, Springfield",
          requiredSkills: ["Tech Knowledge", "Patience", "Communication"],
          urgency: "Medium",
          eventDate: "2025-07-18",
          participationStatus: "Registered"
        },
        {
          eventName: "Beach Cleanup Day",
          eventDescription: "Join volunteers to remove litter and debris from the local beach. Help protect marine life and preserve the beauty of the shoreline.",
          location: "Sunny Shores Beach, 222 Ocean Blvd, Springfield",
          requiredSkills: ["Teamwork", "Physical Stamina", "Environmental Awareness"],
          urgency: "High",
          eventDate: "2025-07-22",
          participationStatus: "Pending"
        },
        {
          eventName: "Library Book Sorting",
          eventDescription: "Assist library staff in sorting and shelving new book arrivals to keep the collection organized and accessible to patrons.",
          location: "Springfield Public Library, 333 Library Ln, Springfield",
          requiredSkills: ["Organization", "Attention to Detail", "Reading"],
          urgency: "Low",
          eventDate: "2025-07-25",
          participationStatus: "Registered"
        },
        {
          eventName: "Community Art Mural",
          eventDescription: "Collaborate with local artists to paint a mural that celebrates the neighborhood’s history and culture.",
          location: "Downtown Arts District, 444 Creative St, Springfield",
          requiredSkills: ["Painting", "Creativity", "Teamwork"],
          urgency: "Medium",
          eventDate: "2025-07-30",
          participationStatus: "Pending"
        },



      ];

    return data;
}