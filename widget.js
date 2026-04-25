// Stephen Jepson Pottery Chat Widget
// Embed: <script src="https://jepson-pottery-chatbot.netlify.app/widget.js" defer></script>
(function () {
  var API = 'https://jepson-pottery-chatbot.netlify.app/.netlify/functions/chat';
  var history = [];
  var open = false;

  var css = `
    #sj-pot-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 64px; height: 64px; border-radius: 50%;
      background: #5b21b6; border: 3px solid #fff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s; font-size: 28px; line-height: 1;
    }
    #sj-pot-btn:hover { transform: scale(1.08); }
    #sj-pot-btn .sj-badge {
      position: absolute; top: -4px; right: -4px;
      background: #ef4444; color: #fff; border-radius: 50%;
      width: 20px; height: 20px; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      font-family: sans-serif;
    }
    #sj-pot-panel {
      position: fixed; bottom: 100px; right: 24px; z-index: 9998;
      width: 340px; max-width: calc(100vw - 32px);
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      display: none; flex-direction: column; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-height: 500px;
    }
    #sj-pot-panel.open { display: flex; }
    #sj-pot-header {
      background: #5b21b6; color: #fff; padding: 14px 16px;
      display: flex; align-items: center; gap: 10px;
    }
    #sj-pot-header-icon { font-size: 32px; line-height: 1; }
    #sj-pot-header-info { flex: 1; }
    #sj-pot-header-name { font-weight: 700; font-size: 14px; }
    #sj-pot-header-sub { font-size: 11px; opacity: 0.85; }
    #sj-pot-close { cursor: pointer; font-size: 20px; line-height: 1; opacity: 0.8; background: none; border: none; color: #fff; padding: 0; }
    #sj-pot-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex;
      flex-direction: column; gap: 10px; min-height: 200px;
    }
    .sj-pot-msg { max-width: 85%; padding: 10px 13px; border-radius: 12px; font-size: 13px; line-height: 1.5; }
    .sj-pot-msg.stephen { background: #f5f3ff; color: #1a1a1a; border-bottom-left-radius: 4px; align-self: flex-start; }
    .sj-pot-msg.user { background: #5b21b6; color: #fff; border-bottom-right-radius: 4px; align-self: flex-end; }
    .sj-pot-msg.typing { background: #f5f3ff; color: #666; font-style: italic; }
    #sj-pot-footer { padding: 12px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; }
    #sj-pot-input {
      flex: 1; border: 1px solid #d1d5db; border-radius: 8px; padding: 9px 12px;
      font-size: 13px; outline: none; font-family: inherit;
    }
    #sj-pot-input:focus { border-color: #5b21b6; }
    #sj-pot-send {
      background: #5b21b6; color: #fff; border: none; border-radius: 8px;
      padding: 9px 14px; cursor: pointer; font-size: 13px; font-weight: 600;
      font-family: inherit; transition: background 0.15s;
    }
    #sj-pot-send:hover { background: #4c1d95; }
    #sj-pot-send:disabled { background: #9ca3af; cursor: default; }
    #sj-pot-disclaimer { font-size: 10px; color: #9ca3af; text-align: center; padding: 0 12px 8px; }
  `;

  var GREETING = "Welcome! I'm Stephen Jepson — 60 years at the pottery wheel and still throwing every day. Ask me anything about centering, glazing, hand building, kiln temperatures, or life in the studio!";

  function init() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var btn = document.createElement('div');
    btn.id = 'sj-pot-btn';
    btn.innerHTML = '🏺<div class="sj-badge">1</div>';
    btn.onclick = toggleChat;
    document.body.appendChild(btn);

    var panel = document.createElement('div');
    panel.id = 'sj-pot-panel';
    panel.innerHTML = `
      <div id="sj-pot-header">
        <div id="sj-pot-header-icon">🏺</div>
        <div id="sj-pot-header-info">
          <div id="sj-pot-header-name">Stephen Jepson</div>
          <div id="sj-pot-header-sub">Master Potter · 60+ Years at the Wheel</div>
        </div>
        <button id="sj-pot-close" onclick="document.getElementById('sj-pot-panel').classList.remove('open')">&#x2715;</button>
      </div>
      <div id="sj-pot-messages">
        <div class="sj-pot-msg stephen">${GREETING}</div>
      </div>
      <div id="sj-pot-footer">
        <input id="sj-pot-input" type="text" placeholder="Ask about pottery…" maxlength="300">
        <button id="sj-pot-send">Send</button>
      </div>
      <div id="sj-pot-disclaimer">Powered by AI · Stephen&rsquo;s videos at <a href="https://jepsonpotteryvideos.com" target="_blank" style="color:#5b21b6">jepsonpotteryvideos.com</a></div>
    `;
    document.body.appendChild(panel);

    var input = document.getElementById('sj-pot-input');
    var sendBtn = document.getElementById('sj-pot-send');
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendMessage(); });
    sendBtn.addEventListener('click', sendMessage);
  }

  function toggleChat() {
    open = !open;
    var panel = document.getElementById('sj-pot-panel');
    if (open) {
      panel.classList.add('open');
      document.querySelector('#sj-pot-btn .sj-badge').style.display = 'none';
      setTimeout(function () { document.getElementById('sj-pot-input').focus(); }, 100);
    } else {
      panel.classList.remove('open');
    }
  }

  function addMessage(text, role) {
    var msgs = document.getElementById('sj-pot-messages');
    var div = document.createElement('div');
    div.className = 'sj-pot-msg ' + role;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function sendMessage() {
    var input = document.getElementById('sj-pot-input');
    var msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    addMessage(msg, 'user');
    history.push({ role: 'user', content: msg });

    var sendBtn = document.getElementById('sj-pot-send');
    sendBtn.disabled = true;
    var typing = addMessage('Stephen is thinking…', 'typing');

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: history.slice(-6) }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typing.remove();
        var reply = data.reply || "Let me step back to the wheel and think on that — ask me again!";
        addMessage(reply, 'stephen');
        history.push({ role: 'assistant', content: reply });
      })
      .catch(function () {
        typing.remove();
        addMessage("The kiln must have distracted me. Try again!", 'stephen');
      })
      .finally(function () {
        sendBtn.disabled = false;
        document.getElementById('sj-pot-input').focus();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
