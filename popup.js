// --- 0. QUẢN LÝ GIAO DIỆN EXTENSION (SÁNG/TỐI) ---
const body = document.body;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('ext-theme');

// Cài đặt giao diện ban đầu (ưu tiên lịch sử lưu, nếu không thì theo hệ thống)
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  body.classList.add('dark-mode');
  themeToggleBtn.textContent = 'dark_mode';
}

// Lắng nghe sự kiện click nút đổi giao diện
themeToggleBtn.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  if (body.classList.contains('dark-mode')) {
    themeToggleBtn.textContent = 'dark_mode'; // Icon mặt trăng
    localStorage.setItem('ext-theme', 'dark');
  } else {
    themeToggleBtn.textContent = 'light_mode'; // Icon mặt trời
    localStorage.setItem('ext-theme', 'light');
  }
});

// --- 1. SET MÀU MẶC ĐỊNH CHUẨN CỦA CHROME CHO BẢN XEM TRƯỚC ---
const defaultColors = systemPrefersDark ? { // Chỗ này vẫn phụ thuộc systemPrefersDark hoặc bạn có thể gán theo savedTheme tùy ý
  frame: '#202124', frameInactive: '#28292c', toolbar: '#35363a', toolbarIcon: '#e8eaed',
  tintsButtons: '#8ab4f8', omniboxBg: '#202124', omniboxText: '#e8eaed',
  tabText: '#e8eaed', tabBgText: '#9aa0a6', bookmarkText: '#e8eaed',
  ntpBg: '#35363a', ntpText: '#e8eaed', ntpLink: '#8ab4f8', ntpSection: '#202124'
} : {
  frame: '#dee1e6', frameInactive: '#e7eaed', toolbar: '#ffffff', toolbarIcon: '#5f6368',
  tintsButtons: '#1a73e8', omniboxBg: '#f1f3f4', omniboxText: '#202124',
  tabText: '#3c4043', tabBgText: '#5f6368', bookmarkText: '#3c4043',
  ntpBg: '#ffffff', ntpText: '#202124', ntpLink: '#1a73e8', ntpSection: '#f1f3f4'
};

const inputs = {
  frame: document.getElementById('c-frame'),
  frameInactive: document.getElementById('c-frame-inactive'),
  toolbar: document.getElementById('c-toolbar'),
  toolbarIcon: document.getElementById('c-toolbar-icon'),
  tintsButtons: document.getElementById('c-tints-buttons'),
  omniboxBg: document.getElementById('c-omnibox-bg'),
  omniboxText: document.getElementById('c-omnibox-text'),
  tabText: document.getElementById('c-tab-text'),
  tabBgText: document.getElementById('c-tab-bg-text'),
  bookmarkText: document.getElementById('c-bookmark-text'),
  ntpBg: document.getElementById('c-ntp-bg'),
  ntpText: document.getElementById('c-ntp-text'),
  ntpLink: document.getElementById('c-ntp-link'),
  ntpSection: document.getElementById('c-ntp-section')
};

Object.keys(inputs).forEach(key => { inputs[key].value = defaultColors[key]; });

// --- 2. XỬ LÝ ẢNH NỀN NHIỀU VỊ TRÍ ---
const imgStates = {
  ntp: { input: document.getElementById('img-ntp'), file: null, url: null, zipKey: 'theme_ntp_background' },
  frame: { input: document.getElementById('img-frame'), file: null, url: null, zipKey: 'theme_frame' },
  toolbar: { input: document.getElementById('img-toolbar'), file: null, url: null, zipKey: 'theme_toolbar' },
  tabBg: { input: document.getElementById('img-tab-bg'), file: null, url: null, zipKey: 'theme_tab_background' }
};

Object.values(imgStates).forEach(img => {
  img.input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      img.file = file;
      const reader = new FileReader();
      reader.onload = event => { img.url = event.target.result; updatePreview(); };
      reader.readAsDataURL(file);
    }
  });
});

// --- 3. QUẢN LÝ LAYOUT BẢN XEM TRƯỚC ---
const toggleLayoutBtn = document.getElementById('toggleLayoutBtn');
const horizontalLayout = document.getElementById('browser-preview-horizontal');
const verticalLayout = document.getElementById('browser-preview-vertical');
let isVertical = false;

toggleLayoutBtn.addEventListener('click', () => {
  isVertical = !isVertical;
  if (isVertical) {
    horizontalLayout.classList.remove('layout-active');
    verticalLayout.classList.add('layout-active');
    toggleLayoutBtn.textContent = 'Chuyển sang Tab Ngang';
  } else {
    verticalLayout.classList.remove('layout-active');
    horizontalLayout.classList.add('layout-active');
    toggleLayoutBtn.textContent = 'Chuyển sang Tab Dọc';
  }
  updatePreview(); 
});

function updatePreview() {
  const activeLayout = isVertical ? verticalLayout : horizontalLayout;
  
  const applyBackground = (el, color, imgUrl) => {
    if (imgUrl) {
      el.style.backgroundImage = `url(${imgUrl})`;
      el.style.backgroundColor = 'transparent';
    } else {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = color;
    }
  };

  const frameEl = isVertical ? activeLayout.querySelector('.mockup-sidebar') : activeLayout.querySelector('.mockup-frame');
  applyBackground(frameEl, inputs.frame.value, imgStates.frame.url);

  const toolbarEl = activeLayout.querySelector('.mockup-toolbar');
  const bookmarkEl = activeLayout.querySelector('.mockup-bookmarks');
  applyBackground(toolbarEl, inputs.toolbar.value, imgStates.toolbar.url);
  applyBackground(bookmarkEl, inputs.toolbar.value, imgStates.toolbar.url);
  bookmarkEl.style.color = inputs.bookmarkText.value;

  activeLayout.querySelectorAll('.mockup-tab.active').forEach(tab => {
    applyBackground(tab, inputs.toolbar.value, imgStates.toolbar.url);
    tab.style.color = inputs.tabText.value;
  });

  activeLayout.querySelectorAll('.mockup-tab.inactive').forEach(tab => {
    applyBackground(tab, 'transparent', imgStates.tabBg.url);
    tab.style.color = inputs.tabBgText.value;
  });

  const ntpEl = activeLayout.querySelector('.mockup-ntp');
  applyBackground(ntpEl, inputs.ntpBg.value, imgStates.ntp.url);
  ntpEl.style.color = inputs.ntpText.value;

  activeLayout.querySelectorAll('.toolbar-icon').forEach(i => i.style.color = inputs.toolbarIcon.value);
  const omni = activeLayout.querySelector('.mockup-omnibox');
  omni.style.backgroundColor = inputs.omniboxBg.value;
  omni.style.color = inputs.omniboxText.value;
}

Object.values(inputs).forEach(input => input.addEventListener('input', updatePreview));
updatePreview();

// --- 4. HÀM XUẤT FILE ---
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');
  return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
}

function hexToChromeTint(hex) {
    let [r, g, b] = hexToRgb(hex);
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [parseFloat(h.toFixed(2)), parseFloat(s.toFixed(2)), parseFloat(l.toFixed(2))];
}

document.getElementById('generateBtn').addEventListener('click', async () => {
  try {
    if (typeof JSZip === 'undefined') return alert("Lỗi: Không tìm thấy thư viện JSZip.");
    
    const zip = new JSZip();
    const manifestData = {
      "manifest_version": 3,
      "name": "My Custom Theme Pro",
      "version": "1.0",
      "theme": {
        "colors": {
          "bookmark_text": hexToRgb(inputs.bookmarkText.value),
          "frame": hexToRgb(inputs.frame.value),
          "frame_inactive": hexToRgb(inputs.frameInactive.value),
          "ntp_background": hexToRgb(inputs.ntpBg.value),
          "ntp_link": hexToRgb(inputs.ntpLink.value),
          "ntp_section": hexToRgb(inputs.ntpSection.value),
          "ntp_text": hexToRgb(inputs.ntpText.value),
          "omnibox_background": hexToRgb(inputs.omniboxBg.value),
          "omnibox_text": hexToRgb(inputs.omniboxText.value),
          "tab_background_text": hexToRgb(inputs.tabBgText.value),
          "tab_text": hexToRgb(inputs.tabText.value),
          "toolbar": hexToRgb(inputs.toolbar.value),
          "toolbar_button_icon": hexToRgb(inputs.toolbarIcon.value)
        },
        "tints": { "buttons": hexToChromeTint(inputs.tintsButtons.value) },
        "images": {}
      }
    };

    for (const key in imgStates) {
      if (imgStates[key].file) {
        const file = imgStates[key].file;
        const arrayBuffer = await file.arrayBuffer();
        const fileName = `${key}_bg.${file.name.split('.').pop()}`;
        zip.file(`images/${fileName}`, arrayBuffer);
        manifestData.theme.images[imgStates[key].zipKey] = `images/${fileName}`;
      }
    }

    if (Object.keys(manifestData.theme.images).length === 0) delete manifestData.theme.images;

    zip.file("manifest.json", JSON.stringify(manifestData, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_full_theme.zip";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);

  } catch (error) {
    alert("Lỗi tạo file: " + error.message);
  }
});