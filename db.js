const supabaseUrl = "https://fpqhwdofkazmoprqilir.supabase.co";
const supabaseKey = "sb_publishable_4Zy0XB4j_U8AjhRuSScCsw_ayWoYglu";

const client = supabase.createClient(supabaseUrl, supabaseKey);

// protect page
async function protectPage() {
  const { data: { session } } = await client.auth.getSession();
  if (!session) window.location = "index.html";

  document.getElementById("userEmail").innerText =
    "Logged in as: " + session.user.email;
}
protectPage();

// logout
async function logout() {
  await client.auth.signOut();
  window.location = "index.html";
}

// load user-specific data
async function loadData() {
  const { data, error } = await client
    .from("profiles")
    .select("*");

  if (error) return alert(error.message);

  const list = document.getElementById("dataList");
  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.className = "bg-white p-2 rounded shadow";
    li.innerText = item.title;
    list.appendChild(li);
  });
}
