/* PollCast shared data layer
   Default mode is localStorage for testing on one browser/computer.
   For real WordPress fan voting across devices, replace this with Firebase/Supabase later.
*/
const POLLCAST_KEY = 'pollcast_clean_v1';

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function defaultState() {
  const id = uid();
  return {
    activePollId: id,
    settings: {
      footerUrl: 'nbcsportsboston.com/poll',
      logo: '',
      qr: '',
      tvBackground: 'assets/pollcast_bkgrd.png'
    },
    polls: [{
      id,
      title: 'Celtics MVP Poll',
      question: 'Who is the Celtics MVP this season?',
      status: 'active',
      createdAt: new Date().toISOString(),
      options: [
        { id: uid(), label: 'Tatum', votes: 48, image: '' },
        { id: uid(), label: 'Brown', votes: 32, image: '' },
        { id: uid(), label: 'White', votes: 20, image: '' }
      ]
    }]
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(POLLCAST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const state = defaultState();
  saveState(state);
  return state;
}

function saveState(state) {
  localStorage.setItem(POLLCAST_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('pollcast:update'));
}

function getPollFromUrl(state) {
  const params = new URLSearchParams(location.search);
  const pollId = params.get('poll') || state.activePollId;
  return state.polls.find(p => p.id === pollId) || state.polls[0];
}

function percent(option, poll) {
  const total = poll.options.reduce((sum, o) => sum + Number(o.votes || 0), 0);
  return total ? Math.round((Number(option.votes || 0) / total) * 100) : 0;
}

function totalVotes(poll) {
  return poll.options.reduce((sum, o) => sum + Number(o.votes || 0), 0);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fitText(el, max, min) {
  if (!el) return;
  let size = max;
  el.style.fontSize = `${size}px`;
  while ((el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) && size > min) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

function copyText(text) {
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

window.PollCast = { loadState, saveState, getPollFromUrl, percent, totalVotes, fileToDataUrl, fitText, copyText, uid };
