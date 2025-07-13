

// Function to call backend login api endpoint and recieve JWT token
export async function login(data){
  const response = await fetch("http://127.0.0.1:5000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    const parsed = await response.json();
    // Set user data in local storage
    localStorage.setItem("access_token", parsed.access_token);
    localStorage.setItem("user_email", parsed.user.email);
    localStorage.setItem("user_role", parsed.user.role);

}

// Function to call backend register api endpoint
export async function register(data){
  const response = await fetch("http://127.0.0.1:5000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    const parsed = await response.json();
}


