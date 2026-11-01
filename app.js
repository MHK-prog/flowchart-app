// ۱. ثبت سرویس ورکر برای آفلاین شدن
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Active'))
      .catch((err) => console.error('SW Error:', err));
  });
}

// ۲. تنظیم اولیه Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose'
});

const codeInput = document.getElementById('code-input');
const output = document.getElementById('output');
const btnExportSvg = document.getElementById('btn-export-svg');
const btnInstall = document.getElementById('btn-install');

let renderTimeout = null;

// ۳. رندر کردن بهینه دیاگرام
async function renderDiagram() {
  const code = codeInput.value.trim();
  if (!code) {
    output.innerHTML = '';
    return;
  }

  try {
    const { svg } = await mermaid.render('mermaid-svg-' + Date.now(), code);
    output.innerHTML = svg;
  } catch (error) {
    // خطاها بی‌سرصدا مدیریت میشن تا برنامه کرش نکنه
  }
}

// ۴. تکنیک Debounce برای اینکه موقع تایپ CPU داغ نکنه
codeInput.addEventListener('input', () => {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(renderDiagram, 300);
});

// ۵. دانلود خروجی SVG با یک کلیک
btnExportSvg.addEventListener('click', () => {
  const svgElement = output.querySelector('svg');
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'flowchart.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

// ۶. رویداد دکمه نصب PWA در ویندوز
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.style.display = 'inline-block';
});

btnInstall.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      btnInstall.style.display = 'none';
    }
    deferredPrompt = null;
  }
});

// رندر بار اول
renderDiagram();
