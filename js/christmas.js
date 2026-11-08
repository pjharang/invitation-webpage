// 행사 정보는 여기서만 수정한다.
// ⚠ 날짜(2026-12-24)만 확정된 값이고, 시간·장소·주소·좌표·연락처·보내는 사람은 임시 예시이다.
const CONFIG = {
  eventName: '크리스마스 이브 파티',
  eventDate: '2026-12-24T18:00:00+09:00', // ISO 8601, 시간대(+09:00) 필수 (시간은 임시)
  greeting: '한 해를 따뜻하게 마무리하는 크리스마스 이브,\n소중한 당신과 함께 보내고 싶어요.\n맛있는 음식과 즐거운 이야기로\n행복한 밤을 만들어 주세요.',
  host: '보내는 사람 이름', // 임시
  venueName: '서울특별시청', // 임시 (장소 확정 전)
  address: '서울특별시 중구 세종대로 110', // 임시
  lat: 37.5663,
  lng: 126.9779,
  phone: '010-0000-0000', // 더미 값
  footer: '따뜻하고 행복한 연말 보내세요.',
};

const EVENT_TIME = new Date(CONFIG.eventDate).getTime();
const KST = 'Asia/Seoul';
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pad(n) {
  return String(n).padStart(2, '0');
}

function setText(selector, text) {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = text;
  });
}

function initContent() {
  const date = new Date(EVENT_TIME);
  const dateText = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(date);
  const timeText = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);
  // 예: 2026. 12. 24
  const dateNum = new Intl.DateTimeFormat('en-CA', { timeZone: KST })
    .format(date).replace(/-/g, '. ');

  const values = {
    dateNum,
    eventName: CONFIG.eventName,
    greeting: CONFIG.greeting,
    host: CONFIG.host,
    venueName: CONFIG.venueName,
    address: CONFIG.address,
    footer: CONFIG.footer,
    dateText,
    timeText,
  };
  Object.entries(values).forEach(([key, value]) => setText(`[data-bind="${key}"]`, value));
  document.title = `${CONFIG.eventName} 초대장`;
}

// 행사일(KST) 기준 달력 날짜 차이 계산
function getCalendarDays() {
  const toKstDay = (ms) => {
    const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: KST })
      .format(new Date(ms)).split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toKstDay(EVENT_TIME) - toKstDay(Date.now())) / 86400000);
}

function initCountdown() {
  const els = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
    summary: document.getElementById('dday-summary'),
    message: document.getElementById('dday-message'),
    box: document.getElementById('countdown'),
  };
  let timerId = null;

  function tick() {
    const diff = EVENT_TIME - Date.now(); // 매번 현재 시각으로 계산
    if (diff <= 0) {
      els.box.hidden = true;
      const dayGap = getCalendarDays();
      els.summary.textContent = dayGap === 0 ? 'D-Day' : `D+${Math.abs(dayGap)}`;
      els.message.textContent = dayGap === 0 ? '오늘 밤, 메리 크리스마스!' : '파티가 종료되었습니다.';
      clearInterval(timerId);
      return;
    }
    const totalSec = Math.floor(diff / 1000);
    els.days.textContent = pad(Math.floor(totalSec / 86400));
    els.hours.textContent = pad(Math.floor((totalSec % 86400) / 3600));
    els.minutes.textContent = pad(Math.floor((totalSec % 3600) / 60));
    const sec = pad(totalSec % 60);
    if (sec !== els.seconds.textContent) {
      els.seconds.textContent = sec;
      // 초가 바뀔 때 살짝 떨어지는 효과
      if (!REDUCE_MOTION && els.seconds.animate) {
        els.seconds.animate(
          [{ opacity: 0.2, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }],
          { duration: 450, easing: 'ease-out' },
        );
      }
    }
    const dayGap = getCalendarDays();
    els.summary.textContent = dayGap === 0 ? 'D-Day' : `D-${dayGap}`;
    els.message.textContent = '파티까지 남은 시간';
  }

  tick();
  timerId = setInterval(tick, 1000);
}

function initMap() {
  const q = encodeURIComponent(`${CONFIG.venueName} ${CONFIG.address}`);
  document.getElementById('map-frame').src =
    `https://maps.google.com/maps?q=${CONFIG.lat},${CONFIG.lng}&z=16&output=embed&hl=ko`;
  document.getElementById('link-naver').href = `https://map.naver.com/p/search/${q}`;
  document.getElementById('link-kakao').href = `https://map.kakao.com/link/search/${q}`;
  document.getElementById('link-google').href = `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function initCopyButton() {
  const btn = document.getElementById('copy-address');
  const toast = document.getElementById('toast');

  function show(msg) {
    toast.textContent = msg;
    setTimeout(() => { toast.textContent = ''; }, 2500);
  }

  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONFIG.address);
      show('주소가 복사되었습니다.');
    } catch (e) {
      window.prompt('아래 주소를 복사해 주세요.', CONFIG.address);
    }
  });
}

function initContact() {
  const num = CONFIG.phone.replace(/[^0-9+]/g, '');
  document.getElementById('link-tel').href = `tel:${num}`;
  document.getElementById('link-sms').href = `sms:${num}`;
}

// 화면 위에서 눈이 내리는 효과
function initSnow() {
  if (REDUCE_MOTION) return;
  const box = document.getElementById('snow');
  const count = 28;
  for (let i = 0; i < count; i += 1) {
    const flake = document.createElement('span');
    flake.className = 'snow__flake';
    flake.style.setProperty('--size', `${3 + Math.random() * 5}px`);
    flake.style.setProperty('--x', `${Math.random() * 100}%`);
    flake.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);
    flake.style.setProperty('--dur', `${8 + Math.random() * 9}s`);
    flake.style.setProperty('--delay', `${-Math.random() * 15}s`); // 처음부터 화면 곳곳에 보이도록
    box.appendChild(flake);
  }
}

// 섹션이 화면에 들어올 때 서서히 나타나는 효과
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  initSnow();
  initReveal();
  initContent();
  initCountdown();
  initMap();
  initCopyButton();
  initContact();
});
