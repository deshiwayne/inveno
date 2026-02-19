const supabaseUrl = "https://fpqhwdofkazmoprqilir.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcWh3ZG9ma2F6bW9wcnFpbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjkzOTQsImV4cCI6MjA4NzAwNTM5NH0.PekmusDIO_djprs8xlxCSvClmTSlTV5-poCWjiq71ic";

if (!window.supabase) {
  throw new Error("Supabase client library is not loaded.");
}

const client = window.supabase.createClient(supabaseUrl, supabaseKey);

// Handle email confirmation from link
async function handleEmailConfirmation() {
  // Check if this is a redirect from email confirmation
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const type = hashParams.get('type');

  if (type === 'signup' || (accessToken && window.location.pathname.includes('dashboard.html'))) {
    // User clicked email confirmation link
    const { data, error } = await client.auth.getSession();
    
    if (data?.session) {
      // Email confirmed successfully
      showMsg("✅ Email confirmed successfully! Redirecting to dashboard...", "success");
      setTimeout(() => {
        window.location = "dashboard.html";
      }, 1500);
    } else if (error) {
      showMsg("Email confirmation failed. Please try again or contact support.", "error");
    }
  } else if (type === 'recovery') {
    // Password reset link
    showMsg("Please enter your new password.", "success");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  const signUpForm = document.getElementById("signup-form");
  if (signUpForm) {
    signUpForm.addEventListener("submit", signUp);
  }

  // Handle email confirmation callback
  handleEmailConfirmation();
});

// Redirect if already logged in.
async function checkSession() {
  const { data: { session } } = await client.auth.getSession();
  if (session) window.location = "dashboard.html";
}
checkSession();

async function signUp(event) {
  event.preventDefault();
  hideMsg();

  const email = emailInput(event);
  const password = passwordInput(event);
  const fullName = fullNameInput(event);
  const confirmPassword = confirmPasswordInput(event);

  if (!email || !password) {
    return showMsg("Email and password are required.", "error");
  }

  if (password.length < 6) {
    return showMsg("Password must be at least 6 characters.", "error");
  }

  if (confirmPassword && password !== confirmPassword) {
    return showMsg("Passwords do not match.", "error");
  }

  // Show loading state
  const submitBtn = document.getElementById("submit-btn") || event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null
      },
      emailRedirectTo: `${window.location.origin}/dashboard.html`
    }
  });

  // Reset button
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }

  if (error) {
    const message =
      error.status === 500
        ? "Sign up failed with a server error. Please try again."
        : error.message;
    return showMsg(message, "error");
  }

  // Check if email confirmation is required
  if (data?.user && !data.session) {
    // Email confirmation is enabled - user needs to verify email
    showMsg("✅ Account created! Please check your email and click the confirmation link to activate your account.", "success");
    
    // Optionally redirect to login page after a delay
    setTimeout(() => {
      const redirectToLogin = confirm("Account created successfully! You'll receive a confirmation email shortly. Click OK to go to the login page.");
      if (redirectToLogin) {
        window.location = "login.html";
      }
    }, 3000);
  } else if (data?.session) {
    // Auto-login is enabled (email confirmation disabled)
    showMsg("Account created successfully! Redirecting to dashboard...", "success");
    setTimeout(() => {
      window.location = "dashboard.html";
    }, 1500);
  } else {
    // Unexpected case - show generic success
    showMsg("Account created! Please check your email for next steps.", "success");
  }
}

async function login(event) {
  event.preventDefault();
  hideMsg();

  const email = emailInput(event);
  const password = passwordInput(event);

  if (!email || !password) {
    return showMsg("Email and password are required.", "error");
  }

  // Show loading state
  const submitBtn = document.getElementById("submit-btn") || event.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";
  }

  const { data, error } = await client.auth.signInWithPassword({ email, password });

  // Reset button
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }

  if (error) {
    // Handle specific error cases
    if (error.message.includes("Invalid login credentials")) {
      return showMsg("Invalid email or password. Please try again.", "error");
    } else if (error.message.includes("Email not confirmed")) {
      showMsg("Please confirm your email address before logging in. Check your inbox for the confirmation link.", "error");
      showResendConfirmationBox();
      return;
    } else if (error.status === 400 && error.message.includes("email")) {
      showMsg("Email not verified. Please check your inbox and click the confirmation link.", "error");
      showResendConfirmationBox();
      return;
    }
    return showMsg(error.message, "error");
  }

  // Check if user exists but email not confirmed
  if (!data.session) {
    showMsg("Please verify your email before logging in. Check your inbox for the confirmation link.", "error");
    showResendConfirmationBox();
    return;
  }

  // Success - redirect to dashboard
  showMsg("Login successful! Redirecting...", "success");
  setTimeout(() => {
    window.location = "dashboard.html";
  }, 500);
}



function emailInput(event) {
  const form = event?.target?.closest("form");
  return (
    document.getElementById("email")?.value ||
    form?.querySelector('input[type="email"]')?.value ||
    ""
  );
}

function passwordInput(event) {
  const form = event?.target?.closest("form");
  return (
    document.getElementById("password")?.value ||
    form?.querySelector('input[type="password"]')?.value ||
    ""
  );
}

function fullNameInput(event) {
  const form = event?.target?.closest("form");
  return (
    document.getElementById("full-name")?.value ||
    form?.querySelector('input[name="full_name"]')?.value ||
    ""
  );
}

function confirmPasswordInput(event) {
  const form = event?.target?.closest("form");
  return (
    document.getElementById("confirm-password")?.value ||
    form?.querySelector('input[name="confirm_password"]')?.value ||
    ""
  );
}

function showMsg(msg, type = "error") {
  const textEl = document.getElementById("error-text");
  const boxEl = document.getElementById("error-message");
  if (!textEl || !boxEl) return;

  textEl.innerText = msg;
  
  // Remove previous styling
  boxEl.classList.remove("hidden", "bg-red-100", "border-red-400", "text-red-700", "bg-green-100", "border-green-400", "text-green-700");
  
  // Add appropriate styling based on type
  if (type === "success") {
    boxEl.classList.add("bg-green-100", "border-green-400", "text-green-700");
  } else {
    boxEl.classList.add("bg-red-100", "border-red-400", "text-red-700");
  }
}

function hideMsg() {
  const boxEl = document.getElementById("error-message");
  if (!boxEl) return;
  boxEl.classList.add("hidden");
}

function showResendConfirmationBox() {
  const resendBox = document.getElementById("resend-confirmation");
  if (resendBox) {
    resendBox.classList.remove("hidden");
  }
}

function hideResendConfirmationBox() {
  const resendBox = document.getElementById("resend-confirmation");
  if (resendBox) {
    resendBox.classList.add("hidden");
  }
}

// Resend confirmation email
async function resendConfirmationEmail(email) {
  if (!email) {
    return showMsg("Please enter your email address first.", "error");
  }

  hideMsg();
  showMsg("Sending confirmation email...", "success");

  const { error } = await client.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard.html`
    }
  });

  if (error) {
    return showMsg("Failed to resend confirmation email. " + error.message, "error");
  }

  hideResendConfirmationBox();
  showMsg("✅ Confirmation email sent successfully! Please check your inbox (and spam folder).", "success");
}










