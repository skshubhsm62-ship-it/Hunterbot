// js/js/dashboard.js

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  const name = user.user_metadata?.name || user.email.split('@')[0];
  document.getElementById('userName').textContent = name;
  document.getElementById('userEmail').textContent = user.email;

  await loadBots();

  document.getElementById('botForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const shopName = document.getElementById('shopName').value.trim();
    const botToken = document.getElementById('botToken').value.trim();
    const msg = document.getElementById('botMsg');
    const btn = document.getElementById('botBtn');

    if (!shopName || !botToken) {
      msg.innerHTML = '<div class="err">Both fields are required.</div>';
      return;
    }
    if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)) {
      msg.innerHTML = '<div class="err">Invalid bot token format. Should look like 123456:ABC-DEF...</div>';
      return;
    }

    btn.disabled = true; btn.textContent = 'Creating...';
    msg.innerHTML = '';

    const { error } = await supabaseClient.from('bots').insert({
      user_id: user.id,
      shop_name: shopName,
      bot_token: botToken
    });

    btn.disabled = false; btn.textContent = 'Create Bot';

    if (error) {
      msg.innerHTML = '<div class="err">' + escapeHtml(error.message) + '</div>';
      return;
    }
    msg.innerHTML = '<div class="ok">✅ Bot created!</div>';
    document.getElementById('botForm').reset();
    await loadBots();
  });
});

async function loadBots() {
  const list = document.getElementById('botList');
  const { data, error } = await supabaseClient
    .from('bots')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    list.innerHTML = '<div class="empty">Failed to load bots.</div>';
    return;
  }

  if (!data || !data.length) {
    list.innerHTML = '<div class="empty">No bots yet. Create your first one above! 🚀</div>';
    return;
  }

  list.innerHTML = data.map(b => `
    <div class="bot-item">
      <div class="info">
        <b>${escapeHtml(b.shop_name)}</b>
        <small>Token: ${escapeHtml(b.bot_token.slice(0, 12))}•••••</small>
      </div>
      <div class="status">${escapeHtml(b.status)}</div>
    </div>
  `).join('');
      }
