// ۱. ثبت سرویس ورکر برای آفلاین
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ۲. تنظیمات Mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose'
});

const codeInput = document.getElementById('code-input');
const output = document.getElementById('output');
const btnExportSvg = document.getElementById('btn-export-svg');
const btnInstall = document.getElementById('btn-install');
const importFile = document.getElementById('import-file');

let renderTimeout = null;

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
    // خطاها فریز نمی‌شوند
  }
}

codeInput.addEventListener('input', () => {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(renderDiagram, 300);
});

// ۳. خروجی SVG
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

// ۴. امکان ایمپورت فایل (خواندن متن یا تگ‌های کد درون SVG)
importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    let content = event.target.result;
    
    // اگر فایل SVG بود، تلاش می‌کنیم تگ کدهای ذخیره شده را پیدا کنیم
    if (file.name.endsWith('.svg')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'image/svg+xml');
      // چک کردن تگ‌های رایج ذخیره‌سازی متون
      const descTag = doc.querySelector('desc');
      if (descTag) {
        content = descTag.textContent;
      }
    }
    
    codeInput.value = content;
    renderDiagram();
  };
  reader.readAsText(file);
  importFile.value = ''; // ریست کردن اینپوت
});

// ۵. مدیریت نصب PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstall.style.display = 'inline-flex';
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

renderDiagram();
