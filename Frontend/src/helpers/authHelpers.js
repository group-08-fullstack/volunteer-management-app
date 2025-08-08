import { jwtDecode } from "jwt-decode";


// Function to call login api endpoint and recieve JWT tokens
export async function login(data){

  try{
    const response = await fetch("http://127.0.0.1:5000/api/auth/login/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
      });

      const parsed = await response.json();

    if(parsed.message == "Login successful"){
      alert(parsed.message);
      // Set user data in local storage
      sessionStorage.setItem("access_token", parsed.tokens.access_token);
      sessionStorage.setItem("refresh_token", parsed.tokens.refresh_token);
      sessionStorage.setItem("user_id", parsed.user.user_id);
      sessionStorage.setItem("user_email", parsed.user.email);
      sessionStorage.setItem("user_role", parsed.user.role);

      // Login was successful
      return true;
    }
    else{
        // Login failed
        alert(parsed.message);
        return false;
      }
  }
  catch (error){
      console.log('There was an error', error);
    }
}

// Function to call backend register api endpoint
export async function register(data){
  try{
    const response = await fetch("http://127.0.0.1:5000/api/auth/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
      });

      const parsed = await response.json();

      if (parsed.message == "Registration successful!" || parsed.message == "User with this email already exists, but is not verified."){
        // Register was successful
        alert(parsed.message);
        return true;
      }
      else{
        // Register failed
        alert(parsed.message);
        return false;
      }
  }
  catch (error){
    console.log('An error occured', error);
  }
}

// Function to call backend EmailVerfication api endpoint
export async function verifyEmail(data){
  try{
    const response = await fetch("http://127.0.0.1:5000/api/auth/verifyEmail/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
      });

      const parsed = await response.json();

      if (parsed.message == "Verification code sent successfully" || parsed.message == "A code has already been issued. Please refer to your previous email" ){
        // Email was successfully sent
        alert(parsed.message);
        return true;
      }
      else{
        // // Email was unsuccessfully sent
        // alert(parsed.message);
        return false;
      }
  }
  catch (error){
    console.log('An error occured', error);
  }
}


// Function to call backend EmailVerfication api endpoint
export async function confirmCode(data){

  try{
    const response = await fetch("http://127.0.0.1:5000/api/auth/confirmCode/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
      });

      const parsed = await response.json();

      if (parsed.message == "Verified"){
        // verfication was successful
        alert(parsed.message);
        return true;
      }
      else{
        // verfication failed
        // alert(parsed.message);
        return false;
      }
  }
  catch (error){
    console.log('An error occured', error);
  }
}


// Function to check the remaining lifetime of a JWT token,
// if needed make api request to for new access token using the refresh token
export async function checkTokenTime(){

    // Grab tokens from local storage
    const token = sessionStorage.getItem("access_token");
    const refresh_token = sessionStorage.getItem("refresh_token");

    if (!token || !refresh_token) {
      console.log("Missing tokens");
      return;
    }
    
    // Decode jwt from local storage
     let decoded_token;
      try {
        decoded_token = jwtDecode(token);
      } catch (err) {
        console.error("Invalid access token", err);
        return;
      }

    // Set bufferTime and current time
    const bufferTime = 180; // Time until refresh is needed
    const currentTime = Math.floor(Date.now() / 1000);

    // Check currentTime > decoded_token.exp - buffertime, exp meaning expiration time

    // If true then threshold has been crossed, then make api call to refresh endpoint
    // Set access_token in local stoage to response
    if (currentTime > decoded_token.exp - bufferTime){
      try{
        const response = await fetch("http://127.0.0.1:5000/api/auth/refresh/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${refresh_token}`
          }
        });
        
        const parsed = await response.json();
        console.log(parsed.message);


        if(parsed.message == "New token created"){
          // Set user data in local storage
          sessionStorage.setItem("access_token", parsed.access_token);
    
        }
      }
      catch(error){
          console.log("Error", error);
      }
    }

    else{
      // Token still valid
    }
    
};
