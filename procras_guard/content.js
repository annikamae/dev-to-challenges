let scrollTimer = null;
let activeSeconds = 0;
let modalTriggered = false;

function startTracking() {
  window.addEventListener('scroll', () => {
    if (modalTriggered) return;

    if (!scrollTimer) {
      scrollTimer = setInterval(() => {
        activeSeconds++;
        
        if (activeSeconds >= 30 && !modalTriggered) {
          modalTriggered = true;
          clearInterval(scrollTimer);
          requestInterventionMessage();
        }
      }, 1000);
    }
  });
}

function requestInterventionMessage() {
  const hostname = window.location.hostname;
  
  chrome.runtime.sendMessage(
    { action: "fetchAIGuardMessage", site: hostname },
    (response) => {
      const message = response?.message || "Stop doomscrolling and get back to work!";
      showOverlayModal(message);
    }
  );
}

function showOverlayModal(warningText) {
  const overlayContainer = document.createElement('div');
  overlayContainer.id = 'procrastination-guard-root';
  
  const shadow = overlayContainer.attachShadow({ mode: 'open' });
  
  shadow.innerHTML = `
    <style>
      .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .modal {
        background: #1e293b;
        color: #f8fafc;
        padding: 2.5rem;
        border-radius: 1rem;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        text-align: center;
        border: 1px solid #334155;
      }
      h2 {
        margin-top: 0;
        color: #38bdf8;
        font-size: 1.5rem;
      }
      p {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #cbd5e1;
        margin: 1.5rem 0;
      }
      .btn-group {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
      button {
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-close {
        background: #ef4444;
        color: white;
      }
      .btn-close:hover {
        background: #dc2626;
      }
      .btn-break {
        background: #334155;
        color: #f8fafc;
      }
      .btn-break:hover {
        background: #475569;
      }
    </style>
    <div class="backdrop">
      <div class="modal">
        <h2>🛡️ Procrastination Guard</h2>
        <p>${warningText}</p>
        <div class="btn-group">
          <button class="btn-close" id="closeTabBtn">Close Tab</button>
          <button class="btn-break" id="breakBtn">Take 5-Min Break</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlayContainer);

  shadow.getElementById('closeTabBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "closeCurrentTab" });
  });

  shadow.getElementById('breakBtn').addEventListener('click', () => {
    overlayContainer.remove();
    activeSeconds = 0;
    modalTriggered = false;
  });
}

startTracking();