const supabaseUrl = "https://fpqhwdofkazmoprqilir.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcWh3ZG9ma2F6bW9wcnFpbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjkzOTQsImV4cCI6MjA4NzAwNTM5NH0.PekmusDIO_djprs8xlxCSvClmTSlTV5-poCWjiq71ic";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// protect page
async function protectPage() {
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    window.location = "index.html";
    return;
  }

  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) {
    const fullName = session.user.user_metadata?.full_name;
    if (fullName) {
      userEmailEl.innerText = `Welcome, ${fullName} (${session.user.email})`;
    } else {
      userEmailEl.innerText = `Logged in as: ${session.user.email}`;
    }
  }
}
protectPage();

// logout
async function logout() {
  await client.auth.signOut();
  window.location = "index.html";
}

// load user-specific data
async function loadData() {
  const list = document.getElementById("dataList");
  if (!list) return;
  
  list.innerHTML = "<li class='bg-white p-2 rounded shadow'>Loading...</li>";

  const { data, error } = await client
    .from("profiles")
    .select("*");

  if (error) {
    list.innerHTML = `<li class='bg-red-50 p-4 rounded shadow text-red-700'>
      <strong>Error:</strong> ${error.message}<br>
      <small class='text-xs mt-2 block'>Note: You may need to create a 'profiles' table in your Supabase database.</small>
    </li>`;
    console.error("Database error:", error);
    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML = "<li class='bg-gray-50 p-4 rounded shadow text-gray-500'>No data found.</li>";
    return;
  }

  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.className = "bg-white p-2 rounded shadow";
    li.innerText = item.title || JSON.stringify(item);
    list.appendChild(li);
  });
}
