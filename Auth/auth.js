const supabaseUrl = "https://fpqhwdofkazmoprqilir.supabase.co";
const supabaseKey = "sb_publishable_4Zy0XB4j_U8AjhRuSScCsw_ayWoYglu";

if (!window.supabase) {
  throw new Error("Supabase client library is not loaded.");
}

const client = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  const signUpForm = document.getElementById("signup-form");
  if (signUpForm) {
    signUpForm.addEventListener("submit", signUp);
  }
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
    return showMsg("Email and password are required.");
  }

  if (password.length < 6) {
    return showMsg("Password must be at least 6 characters.");
  }

  if (confirmPassword && password !== confirmPassword) {
    return showMsg("Password and confirm password do not match.");
  }

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null
      },
      emailRedirectTo: `${window.location.origin}/login.html`
    }
  });

  if (error) {
    const message =
      error.status === 500
        ? "Sign up failed with a server error. Check Supabase Auth settings and DB triggers/policies, then try again."
        : error.message;
    return showMsg(message);
  }

  showMsg("Check your email to confirm your account.");
}

async function login(event) {
  event.preventDefault();
  hideMsg();

  const email = emailInput(event);
  const password = passwordInput(event);

  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) return showMsg(error.message);

  window.location = "dashboard.html";
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

function showMsg(msg) {
  const textEl = document.getElementById("error-text");
  const boxEl = document.getElementById("error-message");
  if (!textEl || !boxEl) return;

  textEl.innerText = msg;
  boxEl.classList.remove("hidden");
}

function hideMsg() {
  const boxEl = document.getElementById("error-message");
  if (!boxEl) return;
  boxEl.classList.add("hidden");
}










