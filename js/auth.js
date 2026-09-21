// js/auth.js — Shared auth helpers

async function getCurrentUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

async function redirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) window.location.href = 'dashboard.html';
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function updateNavbar() {
  const user = await getCurrentUser();
  const nav = document.getElementById('navlinks');
  if (!nav) return;

  const authLinks = nav.querySelectorAll('[data-auth]');
  authLinks.forEach(el => el.remove());

  if (user) {
    const name = user.user_metadata?.name || user.email.split('@')[0];
    nav.insertAdjacentHTML('beforeend', `
      <a class="plain" data-auth href="dashboard.html">Hi, ${escapeHtml(name)}</a>
      <button class="btn btn-ghost" data-auth onclick="logout()">Log out</button>
    `);
  } else {
    nav.insertAdjacentHTML('beforeend', `
      <a class="plain" data-auth href="login.html">Log in</a>
      <a class="btn btn-primary" data-auth href="register.html">Get Started</a>
    `);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

document.addEventListener('DOMContentLoaded', updateNavbar);
