
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
      alert(parsed.message);

      if(parsed.message == "Login successful"){
        // Set user data in local storage
        localStorage.setItem("access_token", parsed.tokens.access_token);
        localStorage.setItem("refresh_token", parsed.tokens.refresh_token)
        localStorage.setItem("user_email", parsed.user.email);
        localStorage.setItem("user_role", parsed.user.role);

        // Login was successful
        return true;
    }
    else{
        // Login failed
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
    console.log("Sending fetch");
    const response = await fetch("http://127.0.0.1:5000/api/auth/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data)
      });

      const parsed = await response.json();
      alert(parsed.message);

      if (parsed.message == "Registration successful!"){
        // Register was successful
        return true;
      }
      else{
        // Register failed
        return false;
      }
  }
  catch (error){
    console.log("fetch failed");
    console.log('There was an error', error);
  }
}


// Function to check the remaining lifetime of a JWT token,
// if needed make api request to for new access token using the refresh token
export function checkTokenTime(){
    // Decode jwt from local storage

    // Set min time until refresh is determined to be needed

    // Check jwt.exp is <= min time

      // If then make api call to refresh endpoint
        // Set access_token in local stoage to response

      // else, let the user continue


      // return null
}