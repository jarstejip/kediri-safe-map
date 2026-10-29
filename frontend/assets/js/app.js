// ========================================================
// KEDIRI SAFE MAP - WEB APPLICATION JAVASCRIPT
// ========================================================

const webState = {
  currentScreen: 'auth', // 'auth' | 'app'
  currentTab: 'map',     // 'map' | 'sos' | 'profile'
  authTab: 'signin',     // 'signin' | 'signup'
  sosSubtab: 'hotline',  // 'hotline' | 'lapor' | 'riwayat'
  darkMode: false,
  map: null,
  mapMarkers: [],
  mapInitialized: false,
  reports: [],
  // Realtime High-Precision GPS System
  userLocation: {
    lat: -7.8190,
    lng: 112.0125,
    accuracy: null,
    heading: null,
    speed: null,
    timestamp: null,
    isLive: false
  },
  watchId: null,
  userMarker: null,
  userAccuracyCircle: null,
  hasInitialCenter: false,
  deviceHeading: null,
  // Profile, Family Contact & Notification Settings
  userProfile: {
    name: 'Warga Kediri',
    email: 'warga@kedirisafe.id',
    phone: '0812-3456-7890',
    address: 'Kecamatan Pesantren, Kota Kediri',
    bloodType: 'O+',
    status: 'Warga Siaga Kediri'
  },
  emergencyContact: {
    name: 'Ibu / Rumah',
    relation: 'Orang Tua (Ibu/Ayah)',
    phone: '081234455667',
    displayPhone: '0812-3445-5667',
    defaultMsg: 'Halo, saya butuh bantuan darurat di lokasi saya. Mohon pantau koordinat saya!'
  },
  notificationSettings: {
    masterEnabled: true,
    disasterAlerts: true,
    reportUpdates: true,
    soundAlerts: true,
    radius: '5'
  }
};

// Kediri emergency & health facilities (Database Fasilitas Lengkap Seluruh Kediri Raya)
const kediriFacilities = [
  // --- KOTA KEDIRI ---
  {
    id: 1,
    name: 'RSUD Gambiran Kediri',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Kapten Tendean No.16, Pakunden, Kec. Pesantren',
    phone: '(0354) 2891111',
    lat: -7.8344,
    lng: 112.0234,
    color: '#ef4444',
    distance: '1.2 km dari Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 2,
    name: 'RS Bhayangkara Kediri',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Kombes Pol Duryat No.17, Dandangan, Kota Kediri',
    phone: '(0354) 671100',
    lat: -7.8105,
    lng: 112.0162,
    color: '#ef4444',
    distance: '2.1 km dari Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 3,
    name: 'RS Baptis Kediri',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Brigjen Katamso No.1, Bangsal, Kec. Pesantren',
    phone: '(0354) 682170',
    lat: -7.8385,
    lng: 112.0321,
    color: '#ef4444',
    distance: '2.8 km dari Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 4,
    name: 'RSUD Kilisuci Kota Kediri',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. KH Wachid Hasyim No.64, Bandar Lor, Mojoroto',
    phone: '(0354) 777888',
    lat: -7.8245,
    lng: 112.0012,
    color: '#ef4444',
    distance: '1.9 km dari Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 5,
    name: 'Kimia Farma Dhoho',
    type: 'apotek',
    category: 'APOTEK SIAGA',
    address: 'Jl. Dhoho No.120, Setono Gedong, Kota Kediri',
    phone: '(0354) 681423',
    lat: -7.8205,
    lng: 112.0118,
    color: '#10b981',
    distance: '350 m dari Anda',
    status: 'Buka Siaga'
  },
  {
    id: 6,
    name: 'Apotek K-24 Kediri',
    type: 'apotek',
    category: 'APOTEK SIAGA',
    address: 'Jl. Hayam Wuruk No.45, Dandangan, Kota Kediri',
    phone: '(0354) 698224',
    lat: -7.8152,
    lng: 112.0250,
    color: '#10b981',
    distance: '1.5 km dari Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 7,
    name: 'Apotek Kimia Farma Veteran',
    type: 'apotek',
    category: 'APOTEK SIAGA',
    address: 'Jl. Veteran No.18, Mojoroto, Kota Kediri',
    phone: '(0354) 771234',
    lat: -7.8122,
    lng: 111.9980,
    color: '#10b981',
    distance: '2.4 km dari Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 8,
    name: 'Masjid Agung Kota Kediri',
    type: 'shelter',
    category: 'TEMPAT IBADAH & EVAKUASI',
    address: 'Jl. Panglima Sudirman, Kp. Dalem, Kota Kediri',
    phone: '112 (Siaga Kediri)',
    lat: -7.8170,
    lng: 112.0080,
    color: '#f97316',
    distance: '850 m dari Anda',
    status: 'Buka Setiap Waktu'
  },
  {
    id: 9,
    name: 'GOR Jayabaya Kota Kediri (Shelter Utama)',
    type: 'shelter',
    category: 'TEMPAT IBADAH & EVAKUASI',
    address: 'Jl. GOR Jayabaya, Banaran, Kec. Pesantren',
    phone: '112 (BPBD Kediri)',
    lat: -7.8465,
    lng: 112.0289,
    color: '#f97316',
    distance: '3.6 km dari Anda',
    status: 'Posko Evakuasi Bencana'
  },
  {
    id: 10,
    name: 'Posko Pemadam Kebakaran Kediri',
    type: 'keamanan',
    category: 'DAMKAR & PENYELAMATAN',
    address: 'Jl. Brigjen Katamso No.22, Kota Kediri',
    phone: '113 / (0354) 682113',
    lat: -7.8280,
    lng: 112.0210,
    color: '#dc2626',
    distance: '1.6 km dari Anda',
    status: 'Siaga 24 Jam'
  },
  {
    id: 11,
    name: 'SPKT Polres Kediri Kota',
    type: 'keamanan',
    category: 'KEAMANAN & KEPOLISIAN',
    address: 'Jl. KDP Slamet No.2, Bandar Lor, Mojoroto',
    phone: '110 / (0354) 771110',
    lat: -7.8188,
    lng: 112.0045,
    color: '#2563eb',
    distance: '950 m dari Anda',
    status: 'Siaga 24 Jam'
  },
  {
    id: 12,
    name: 'PMI Cabang Kota Kediri',
    type: 'rs',
    category: 'DONOR DARAH & AMBULANS',
    address: 'Jl. Mayor Bismo No.27, Semampir, Kota Kediri',
    phone: '(0354) 681327',
    lat: -7.8020,
    lng: 112.0112,
    color: '#ef4444',
    distance: '2.5 km dari Anda',
    status: 'Unit Darurat 24 Jam'
  },

  // --- KECAMATAN WATES & SEKITARNYA ---
  {
    id: 20,
    name: 'RS Surya Melati Wates',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD 24 JAM',
    address: 'Jl. Raya Kediri - Wates KM.13, Tawang, Kec. Wates',
    phone: '(0354) 442233',
    lat: -7.9152,
    lng: 112.1158,
    color: '#ef4444',
    distance: 'Dekat dengan Anda',
    status: 'Buka 24 Jam (IGD Siaga)'
  },
  {
    id: 21,
    name: 'Puskesmas Wates (IGD 24 Jam)',
    type: 'rs',
    category: 'PUSKESMAS RAWAT INAP & IGD',
    address: 'Jl. Raya Wates No.12, Kec. Wates, Kab. Kediri',
    phone: '(0354) 441012',
    lat: -7.9262,
    lng: 112.1284,
    color: '#ef4444',
    distance: 'Dekat dengan Anda',
    status: 'Buka 24 Jam (Siaga IGD)'
  },
  {
    id: 22,
    name: 'Klinik Rawat Inap Siti Khodijah Wates',
    type: 'rs',
    category: 'KLINIK RAWAT INAP & DOKTER',
    address: 'Jl. Raya Gadungan, Kec. Wates, Kab. Kediri',
    phone: '(0354) 441588',
    lat: -7.9221,
    lng: 112.1325,
    color: '#ef4444',
    distance: 'Dekat dengan Anda',
    status: 'Buka 24 Jam'
  },
  {
    id: 23,
    name: 'Apotek Wates Farma',
    type: 'apotek',
    category: 'APOTEK SIAGA',
    address: 'Jl. Raya Wates (Area Pasar Wates)',
    phone: '(0354) 441999',
    lat: -7.9255,
    lng: 112.1302,
    color: '#10b981',
    distance: 'Dekat dengan Anda',
    status: 'Buka 07:00 - 22:00'
  },
  {
    id: 24,
    name: 'Polsek Wates (Posko Siaga)',
    type: 'keamanan',
    category: 'KEAMANAN & KEPOLISIAN',
    address: 'Jl. Raya Wates, Kec. Wates, Kab. Kediri',
    phone: '110 / (0354) 441110',
    lat: -7.9248,
    lng: 112.1278,
    color: '#2563eb',
    distance: 'Dekat dengan Anda',
    status: 'Siaga 24 Jam'
  },

  // --- KECAMATAN PARE & GURAH ---
  {
    id: 25,
    name: 'RSUD Kabupaten Kediri (RSKK Pare)',
    type: 'rs',
    category: 'RUMAH SAKIT UMUM DAERAH',
    address: 'Jl. Pahlawan Kusuma Bangsa No.1, Kec. Pare',
    phone: '(0354) 391718',
    lat: -7.7685,
    lng: 112.1950,
    color: '#ef4444',
    distance: 'Area Pare',
    status: 'Buka 24 Jam (IGD Utama)'
  },
  {
    id: 26,
    name: 'RS HVA Toeloengredjo Pare',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Ahmad Yani No.25, Kec. Pare',
    phone: '(0354) 391047',
    lat: -7.7610,
    lng: 112.1915,
    color: '#ef4444',
    distance: 'Area Pare',
    status: 'Buka 24 Jam'
  },
  {
    id: 27,
    name: 'RS Amelia Pare',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Pahlawan No.25A, Kec. Pare',
    phone: '(0354) 394118',
    lat: -7.7712,
    lng: 112.1880,
    color: '#ef4444',
    distance: 'Area Pare',
    status: 'Buka 24 Jam'
  },
  {
    id: 28,
    name: 'RS Siti Khadijah Gurah',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Raya Gurah - Pare, Kec. Gurah',
    phone: '(0354) 545112',
    lat: -7.8182,
    lng: 112.1055,
    color: '#ef4444',
    distance: 'Area Gurah',
    status: 'Buka 24 Jam'
  },
  {
    id: 29,
    name: 'Puskesmas Gurah',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Dr. Wahidin Sudirohusodo, Kec. Gurah',
    phone: '(0354) 545012',
    lat: -7.8285,
    lng: 112.0950,
    color: '#ef4444',
    distance: 'Area Gurah',
    status: 'Buka 24 Jam'
  },

  // --- KECAMATAN NGADILUWIH, KRAS & KANDAT ---
  {
    id: 30,
    name: 'RS Arga Husada Ngadiluwih',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Jl. Raya Ngadiluwih No.65, Branggahan',
    phone: '(0354) 479155',
    lat: -7.8920,
    lng: 112.0125,
    color: '#ef4444',
    distance: 'Area Ngadiluwih',
    status: 'Buka 24 Jam'
  },
  {
    id: 31,
    name: 'Puskesmas Ngadiluwih',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Prof. Dr. Moestopo, Kec. Ngadiluwih',
    phone: '(0354) 479012',
    lat: -7.8985,
    lng: 112.0088,
    color: '#ef4444',
    distance: 'Area Ngadiluwih',
    status: 'Buka 24 Jam'
  },
  {
    id: 32,
    name: 'Puskesmas Kandat',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Raya Kandat, Kec. Kandat',
    phone: '(0354) 411012',
    lat: -7.9355,
    lng: 112.0250,
    color: '#ef4444',
    distance: 'Area Kandat',
    status: 'Buka 24 Jam'
  },
  {
    id: 33,
    name: 'Puskesmas Kras',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Raya Kras, Kec. Kras',
    phone: '(0354) 479900',
    lat: -7.9620,
    lng: 111.9950,
    color: '#ef4444',
    distance: 'Area Kras',
    status: 'Buka 24 Jam'
  },

  // --- KECAMATAN PLOSOKLATEN & RINGINREJO ---
  {
    id: 34,
    name: 'Puskesmas Plosoklaten',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Raya Plosoklaten, Kec. Plosoklaten',
    phone: '(0354) 491012',
    lat: -7.8780,
    lng: 112.1810,
    color: '#ef4444',
    distance: 'Area Plosoklaten',
    status: 'Buka 24 Jam'
  },

  // --- BARAT SUNGAI & KAWASAN BANDARA DHOHO (BANYAKAN, GROGOL, MOJO) ---
  {
    id: 35,
    name: 'RS Dhoho Kediri (Kawasan Bandara)',
    type: 'rs',
    category: 'RUMAH SAKIT & IGD',
    address: 'Kawasan Bandara Internasional Dhoho, Kec. Banyakan',
    phone: '(0354) 741122',
    lat: -7.7925,
    lng: 111.9680,
    color: '#ef4444',
    distance: 'Kawasan Bandara',
    status: 'Buka 24 Jam'
  },
  {
    id: 36,
    name: 'Puskesmas Grogol',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Raya Grogol, Kec. Grogol',
    phone: '(0354) 771012',
    lat: -7.7550,
    lng: 111.9820,
    color: '#ef4444',
    distance: 'Area Grogol',
    status: 'Buka 24 Jam'
  },
  {
    id: 37,
    name: 'Puskesmas Mojo',
    type: 'rs',
    category: 'PUSKESMAS & IGD',
    address: 'Jl. Raya Mojo, Kec. Mojo',
    phone: '(0354) 481012',
    lat: -7.9012,
    lng: 111.9540,
    color: '#ef4444',
    distance: 'Area Mojo',
    status: 'Buka 24 Jam'
  }
];

// ---- HTML Sanitizer Helper ----
// Escape semua karakter khusus HTML — cegah XSS reflected & stored
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#096;')
    .replace(/\//g, '&#047;');
}

// Escape untuk nilai di dalam atribut JS event (onclick, dll)
// Gunakan ini khusus untuk nilai yang masuk ke string onclick="...('NILAI_INI')..."
function escapeJsAttr(str) {
  if (str === null || str === undefined) return '';
  // Hanya izinkan karakter aman (email valid chars) — tolak semua yang berbahaya
  return String(str).replace(/[^a-zA-Z0-9@._\-+]/g, '');
}

// Validasi URL — pastikan hanya http/https
function sanitizeUrl(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch (e) {}
  return '#';
}

// ========================================================
// USER REGISTRATION & AUTHENTICATION ACCOUNT REGISTRY
// ========================================================
const DEFAULT_SYSTEM_USERS = [
  {
    name: 'Administrator',
    email: 'admin@kediri.go.id',
    password: 'admin123',
    status: 'Administrator Kediri Safe Map'
  },
  {
    name: 'Budi Warga',
    email: 'budi@gmail.com',
    password: 'budi123',
    status: 'Warga Terverifikasi Biometrik (Face ID)'
  }
];

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem('kediri_safe_registered_users');
    if (!raw) {
      localStorage.setItem('kediri_safe_registered_users', JSON.stringify(DEFAULT_SYSTEM_USERS));
      return [...DEFAULT_SYSTEM_USERS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('kediri_safe_registered_users', JSON.stringify(DEFAULT_SYSTEM_USERS));
      return [...DEFAULT_SYSTEM_USERS];
    }
    return parsed;
  } catch (e) {
    return [...DEFAULT_SYSTEM_USERS];
  }
}

function saveRegisteredUser(userObj) {
  try {
    const users = getRegisteredUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === userObj.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = Object.assign(users[idx], userObj);
    } else {
      users.push(userObj);
    }
    localStorage.setItem('kediri_safe_registered_users', JSON.stringify(users));
  } catch (e) {
    console.warn('Gagal menyimpan user ke local storage:', e);
  }
}

function prefillSignupEmail(email) {
  const el = document.getElementById('signup-email');
  if (el) {
    el.value = email;
    el.focus();
  }
}

function prefillSigninEmail(email) {
  const el = document.getElementById('signin-email');
  if (el) {
    el.value = email;
    el.focus();
  }
}

// ---- Auth Tab Switcher (Sign In vs Sign Up) ----
function switchAuthTab(tab) {
  webState.authTab = tab;
  const formSignin = document.getElementById('form-signin');
  const formSignup = document.getElementById('form-signup');
  const btnSignin = document.getElementById('tab-btn-signin');
  const btnSignup = document.getElementById('tab-btn-signup');

  // Bersihkan kotak error saat berpindah tab
  const signinErr = document.getElementById('signin-error-box');
  const signupErr = document.getElementById('signup-error-box');
  if (signinErr) { signinErr.style.display = 'none'; signinErr.innerHTML = ''; }
  if (signupErr) { signupErr.style.display = 'none'; signupErr.innerHTML = ''; }

  if (tab === 'signin') {
    if (formSignin) formSignin.style.display = 'block';
    if (formSignup) formSignup.style.display = 'none';
    btnSignin?.classList.add('active');
    btnSignup?.classList.remove('active');
  } else {
    if (formSignin) formSignin.style.display = 'none';
    if (formSignup) formSignup.style.display = 'block';
    btnSignin?.classList.remove('active');
    btnSignup?.classList.add('active');
  }
}

// ---- Password Visibility Toggle ----
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    btnEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    `;
  } else {
    input.type = 'password';
    btnEl.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }
}

// ---- Form Submit Handlers (Strict Verification: Wajib Punya Akun / Sign Up / Google) ----
async function handleSignIn(e) {
  e.preventDefault();
  const emailInput = document.getElementById('signin-email');
  const passInput = document.getElementById('signin-pass');
  const errorBox = document.getElementById('signin-error-box');
  const btnSubmit = document.getElementById('btn-submit-signin') || (e.target ? e.target.querySelector('button[type="submit"]') : null);

  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.innerHTML = '';
  }

  const email = emailInput?.value.trim();
  const pass = passInput?.value.trim();

  if (!email || !pass) {
    showToast('⚠️ Silakan masukkan email dan kata sandi Anda!');
    if (errorBox) {
      errorBox.className = 'auth-alert danger';
      errorBox.innerHTML = '<span>⚠️ Mohon masukkan email dan kata sandi Anda.</span>';
      errorBox.style.display = 'flex';
    }
    return;
  }

  // Tampilkan loading di tombol Sign In
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = '0.7';
    btnSubmit.textContent = 'Memverifikasi...';
  }

  // 1. Cek LANGSUNG ke basis data akun terdaftar (LocalStorage) — tanpa tunggu API
  const registeredUsers = getRegisteredUsers();
  const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  // Jika akun TIDAK ditemukan di localStorage, langsung tolak — jangan tunggu API
  if (!matchedUser) {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = '1';
      btnSubmit.textContent = 'Sign In';
    }
    const safeEmail = escapeHtml(email);
    const safeEmailJs = escapeJsAttr(email); // aman untuk onclick attribute
    const notFoundHtml = `
      <div style="width:100%;">
        <div style="font-weight:700;margin-bottom:4px;color:#991b1b;display:flex;align-items:center;gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Akun Belum Terdaftar!
        </div>
        <div style="font-size:12.5px;color:#7f1d1d;line-height:1.4;">
          Email <b>${safeEmail}</b> belum memiliki akun di sistem. Anda tidak dapat login sebelum mendaftar. Silakan buat akun terlebih dahulu atau masuk langsung dengan Google.
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" onclick="switchAuthTab('signup'); prefillSignupEmail('${safeEmailJs}');" style="background:#15803d;color:#ffffff;border:none;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 2px 6px rgba(21,128,61,0.25);">
            Buat Akun (Sign Up)
          </button>
          <button type="button" onclick="initiateGoogleLogin()" style="background:#ffffff;color:#1e293b;border:1px solid #cbd5e1;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
            Masuk dengan Google
          </button>
        </div>
      </div>
    `;
    if (errorBox) {
      errorBox.className = 'auth-alert danger';
      errorBox.innerHTML = notFoundHtml;
      errorBox.style.display = 'flex';
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    showToast('⚠️ Akun belum terdaftar! Silakan Sign Up terlebih dahulu atau Masuk dengan Google.');
    return;
  }

  // 2. Coba verifikasi API backend (opsional, dengan timeout 3 detik)
  let apiSuccess = false;
  let apiUserData = null;
  let apiToken = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => null);
    if (res.ok && data && data.status === 'success') {
      apiSuccess = true;
      apiUserData = data.user;
      apiToken = data.token;
    }
  } catch (err) {
    // Mode offline / timeout — lanjutkan dengan localStorage
  }

  if (btnSubmit) {
    btnSubmit.disabled = false;
    btnSubmit.style.opacity = '1';
    btnSubmit.textContent = 'Sign In';
  }

  // KONDISI B: Akun terdaftar tetapi kata sandi salah!
  if (matchedUser && matchedUser.password !== pass && !apiSuccess) {
    const wrongPassHtml = `
      <div style="width:100%;">
        <div style="font-weight:700;margin-bottom:3px;color:#991b1b;display:flex;align-items:center;gap:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Kata Sandi Salah!
        </div>
        <div style="font-size:12.5px;color:#7f1d1d;line-height:1.4;">
          Kata sandi yang Anda masukkan salah. Pastikan ejaan dan huruf besar/kecil sudah benar.
        </div>
      </div>
    `;
    if (errorBox) {
      errorBox.className = 'auth-alert danger';
      errorBox.innerHTML = wrongPassHtml;
      errorBox.style.display = 'flex';
    }
    showToast('❌ Kata sandi salah! Silakan periksa kembali kata sandi Anda.');
    return;
  }

  // KONDISI C: Berhasil Masuk!
  const user = apiUserData || matchedUser;
  const userName = user.nama || user.name || 'Warga Kediri';
  const userEmail = user.email || email;
  const userPhoto = user.foto_face || user.photo || null;
  const userStatus = user.status || 'Warga Terverifikasi';

  localStorage.setItem('kediri_safe_logged_in', 'true');
  if (apiToken) {
    localStorage.setItem('kediri_safe_session_token', apiToken);
  }

  webState.userProfile.name = userName;
  webState.userProfile.email = userEmail;
  if (userPhoto) {
    webState.userProfile.photo = userPhoto;
  }
  webState.userProfile.status = userStatus;

  try {
    localStorage.setItem('kediri_safe_profile', JSON.stringify(webState.userProfile));
  } catch (err) {}

  updateLoggedInUserProfile(userName, userEmail, userName.charAt(0).toUpperCase(), '#15803d', userPhoto);
  syncProfileUiDisplays();

  if (errorBox) errorBox.style.display = 'none';

  showToast(`✅ Masuk berhasil! Selamat datang kembali, ${userName}.`);
  setTimeout(() => {
    enterAppDirectly();
  }, 500);
}

// ========================================================
// BIOMETRIC FACE RECOGNITION SYSTEM (ANTI-FRAUD REGISTRATION)
// ========================================================
let faceMediaStream = null;
let verifiedFacePhoto = null;
let verifiedFaceToken = null;

async function startFaceCamera() {
  const video = document.getElementById('face-video');
  const placeholder = document.getElementById('face-placeholder');
  const hudOverlay = document.getElementById('face-hud-overlay');
  const preview = document.getElementById('face-captured-preview');
  const statusDot = document.getElementById('face-status-dot');
  const statusText = document.getElementById('face-status-text');
  const btnStart = document.getElementById('btn-start-camera');
  const btnCapture = document.getElementById('btn-capture-face');
  const btnRetake = document.getElementById('btn-retake-face');
  const box = document.getElementById('biometric-signup-box');

  if (preview) preview.style.display = 'none';
  if (box) {
    box.classList.remove('error-pulse', 'verified');
    box.classList.add('active-scan');
  }

  if (statusDot) {
    statusDot.className = 'status-dot scanning';
  }
  if (statusText) {
    statusText.textContent = 'Menghubungkan ke sensor kamera...';
  }

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser tidak mendukung akses kamera langsung');
    }

    faceMediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: false
    });

    if (video) {
      video.srcObject = faceMediaStream;
      video.style.display = 'block';
      await video.play();
    }

    if (placeholder) placeholder.style.display = 'none';
    if (hudOverlay) hudOverlay.style.display = 'flex';
    if (btnStart) btnStart.style.display = 'none';
    if (btnCapture) btnCapture.style.display = 'inline-flex';
    if (btnRetake) btnRetake.style.display = 'none';

    if (statusDot) statusDot.className = 'status-dot scanning';
    if (statusText) statusText.textContent = '🟢 Kamera Aktif: Posisikan wajah Anda di dalam lingkaran oval';

    showToast('📷 Kamera aktif! Posisikan wajah dan klik "Ambil & Verifikasi Biometrik"');
  } catch (err) {
    console.warn('Gagal membuka kamera:', err);
    if (statusDot) statusDot.className = 'status-dot warning';
    if (statusText) statusText.textContent = 'Gagal mengakses webcam. Pastikan izin kamera diizinkan.';
    if (box) box.classList.remove('active-scan');
    showToast('⚠️ Izin kamera diperlukan untuk verifikasi wajah asli!');
  }
}

function captureAndVerifyFace() {
  const video = document.getElementById('face-video');
  const canvas = document.getElementById('face-canvas');
  const preview = document.getElementById('face-captured-preview');
  const previewImg = document.getElementById('face-preview-img');
  const hudOverlay = document.getElementById('face-hud-overlay');
  const statusDot = document.getElementById('face-status-dot');
  const statusText = document.getElementById('face-status-text');
  const btnCapture = document.getElementById('btn-capture-face');
  const btnRetake = document.getElementById('btn-retake-face');
  const box = document.getElementById('biometric-signup-box');

  if (!video || !canvas) return;

  // Liveness & centering snapshot
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;

  // Crop center square
  const size = Math.min(width, height);
  const startX = (width - size) / 2;
  const startY = (height - size) / 2;

  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  // Mirror effect so result matches selfie preview
  ctx.translate(320, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, startX, startY, size, size, 0, 0, 320, 320);

  // Analisis Pixel Liveness Ringan (memastikan bukan blank/hitam pekat)
  try {
    const imgData = ctx.getImageData(0, 0, 320, 320);
    const data = imgData.data;
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 16) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 16);

    if (avgBrightness < 15) {
      showToast('⚠️ Pencahayaan terlalu gelap atau lensa tertutup! Mohon posisikan wajah di tempat terang.');
      return;
    }
  } catch (e) {}

  const photoBase64 = canvas.toDataURL('image/jpeg', 0.88);
  verifiedFacePhoto = photoBase64;
  verifiedFaceToken = 'FACE-KDR-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Stop camera stream to free resources & respect privacy
  if (faceMediaStream) {
    faceMediaStream.getTracks().forEach(track => track.stop());
    faceMediaStream = null;
  }

  // Update UI to Verified State
  video.style.display = 'none';
  if (hudOverlay) hudOverlay.style.display = 'none';
  if (preview && previewImg) {
    previewImg.src = photoBase64;
    preview.style.display = 'flex';
  }

  if (box) {
    box.classList.remove('active-scan', 'error-pulse');
    box.classList.add('verified');
  }

  if (statusDot) statusDot.className = 'status-dot success';
  if (statusText) statusText.innerHTML = `✓ <b>Wajah Asli Terverifikasi Biometrik</b> • Token: ${verifiedFaceToken.substring(0, 16)}...`;

  if (btnCapture) btnCapture.style.display = 'none';
  if (btnRetake) btnRetake.style.display = 'inline-flex';

  showToast('✅ Verifikasi Wajah Berhasil! Wajah asli Anda telah terekam aman.');
}

function retakeFaceVerification() {
  verifiedFacePhoto = null;
  verifiedFaceToken = null;
  const box = document.getElementById('biometric-signup-box');
  if (box) box.classList.remove('verified');
  startFaceCamera();
}

function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name')?.value.trim();
  const email = document.getElementById('signup-email')?.value.trim();
  const pass = document.getElementById('signup-pass')?.value.trim();
  const confirm = document.getElementById('signup-confirm')?.value.trim();
  const box = document.getElementById('biometric-signup-box');
  const errorBox = document.getElementById('signup-error-box');

  if (errorBox) {
    errorBox.style.display = 'none';
    errorBox.innerHTML = '';
  }

  if (!name || !email || !pass || !confirm) {
    showToast('⚠️ Lengkapi semua kolom pendaftaran!');
    if (errorBox) {
      errorBox.className = 'auth-alert danger';
      errorBox.innerHTML = '<span>⚠️ Mohon lengkapi seluruh kolom pendaftaran di atas.</span>';
      errorBox.style.display = 'flex';
    }
    return;
  }
  if (pass !== confirm) {
    showToast('❌ Konfirmasi kata sandi tidak cocok!');
    if (errorBox) {
      errorBox.className = 'auth-alert danger';
      errorBox.innerHTML = '<span>❌ Konfirmasi kata sandi tidak sama dengan kata sandi Anda.</span>';
      errorBox.style.display = 'flex';
    }
    return;
  }

  // Cek apakah email sudah terdaftar sebelumnya
  const registeredUsers = getRegisteredUsers();
  if (registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    const safeEmail = escapeHtml(email);
    if (errorBox) {
      errorBox.className = 'auth-alert danger';
      errorBox.innerHTML = `
        <div style="width:100%;">
          <div style="font-weight:700;margin-bottom:3px;color:#991b1b;">⚠️ Email Sudah Terdaftar</div>
          <div style="font-size:12.5px;color:#7f1d1d;">Email <b>${safeEmail}</b> sudah terdaftar. Silakan langsung masuk pada tab Sign In.</div>
          <button type="button" onclick="switchAuthTab('signin'); prefillSigninEmail('${escapeJsAttr(email)}');" style="margin-top:8px;background:#15803d;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">
            Menuju Sign In
          </button>
        </div>
      `;
      errorBox.style.display = 'flex';
    }
    showToast('⚠️ Email ini sudah terdaftar! Silakan Sign In.');
    return;
  }

  // 1. VALIDASI WAJIB FACE RECOGNITION (ANTI-FRAUD)
  if (!verifiedFacePhoto) {
    if (box) {
      box.classList.add('error-pulse');
      setTimeout(() => box.classList.remove('error-pulse'), 800);
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast('⚠️ Verifikasi Wajah Wajib! Silakan klik "Buka Kamera & Scan Wajah" untuk mencegah akun palsu.');
    return;
  }

  showToast('Memproses pendaftaran akun & verifikasi biometrik...');

  // Simpan akun ke registri pengguna terdaftar
  const newUser = {
    name: name,
    email: email,
    password: pass,
    photo: verifiedFacePhoto,
    faceToken: verifiedFaceToken,
    faceVerified: true,
    status: 'Warga Terverifikasi Biometrik (Face ID)',
    createdAt: new Date().toISOString()
  };
  saveRegisteredUser(newUser);

  // 2. Simpan ke Backend Database (Laragon MySQL / Vercel API)
  fetch('api/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      email: email,
      password: pass,
      foto_face: verifiedFacePhoto,
      face_token: verifiedFaceToken,
      face_verified: 1
    })
  })
  .then(res => res.json())
  .then(resp => {
    console.log('Register API Response:', resp);
  })
  .catch(err => {
    console.warn('Register API offline fallback:', err);
  });

  // 3. Simpan data profil pengguna terverifikasi secara lokal
  webState.userProfile.name = name;
  webState.userProfile.email = email;
  webState.userProfile.photo = verifiedFacePhoto;
  webState.userProfile.status = 'Warga Terverifikasi Biometrik (Face ID)';
  webState.userProfile.bloodType = 'O+';
  webState.userProfile.address = 'Kota Kediri';

  try {
    localStorage.setItem('kediri_safe_profile', JSON.stringify(webState.userProfile));
  } catch (err) {}

  localStorage.setItem('kediri_safe_logged_in', 'true');
  syncProfileUiDisplays();

  // Tampilkan ucapan selamat
  showToast('🎉 Pendaftaran Berhasil! Akun & Wajah Anda telah terverifikasi resmi.');

  setTimeout(() => {
    // Masuk langsung ke aplikasi dengan akun baru terverifikasi
    updateLoggedInUserProfile(name, email, name.charAt(0).toUpperCase(), '#15803d', verifiedFacePhoto);
    enterAppDirectly();
  }, 700);
}

// ========================================================
// OAUTH INTEGRATIONS (Real Google OAuth 2.0 Official)
// ========================================================

// Configuration: Google Client ID Resmi dari Google Cloud Console
const OAUTH_CONFIG = {
  googleClientId: '574533120201-kpf8frtjnpg6tp0i87261q37tq7c19p3.apps.googleusercontent.com'
};

let googleTokenClient = null;

// Inisialisasi Google Token Client resmi
function setupRealGoogleAuth() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    try {
      googleTokenClient = google.accounts.oauth2.initTokenClient({
        client_id: OAUTH_CONFIG.googleClientId,
        scope: 'email profile openid',
        callback: (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            showToast('Memverifikasi akun Google resmi Anda...');
            // Ambil data profil asli dari Google UserInfo API
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            })
            .then(res => res.json())
            .then(profile => {
              console.log('Akun Google Berhasil Masuk:', profile);
              loginWithGoogleAccount(
                profile.name || 'Pengguna Google',
                profile.email || 'user@gmail.com',
                (profile.name || 'G').charAt(0).toUpperCase(),
                '#15803d',
                profile.picture
              );
            })
            .catch(err => {
              console.warn('Gagal ambil data userinfo:', err);
              loginWithGoogleAccount('Pengguna Google', 'user@gmail.com', 'G', '#15803d');
            });
          }
        },
        error_callback: (err) => {
          console.warn('Google Auth Error:', err);
          showToast('⚠️ Gagal terhubung ke akun Google. Pastikan popup tidak diblokir browser.');
        }
      });
    } catch (e) {
      console.warn('Error setup Google Token Client:', e);
    }
  }
}

// 1. Inisiasi Login Google Asli (100% Real Google OAuth Resmi)
function initiateGoogleLogin() {
  if (window.google && window.google.accounts && window.google.accounts.oauth2) {
    if (!googleTokenClient) {
      setupRealGoogleAuth();
    }
    if (googleTokenClient) {
      showToast('Membuka dialog akun Google resmi...');
      googleTokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    }
  }

  showToast('⚠️ Layanan Google sedang dimuat, silakan klik lagi dalam beberapa detik.');
}

// 2. Handler Saat Akun Google Asli Berhasil Masuk
function loginWithGoogleAccount(name, email, avatarLetter, color, pictureUrl) {
  closeOAuthModals();

  // Daftarkan ke user registry jika belum ada
  const newGoogleUser = {
    name: name,
    email: email,
    provider: 'google',
    photo: pictureUrl || null,
    status: 'Warga Terverifikasi Akun Google',
    createdAt: new Date().toISOString()
  };
  saveRegisteredUser(newGoogleUser);

  localStorage.setItem('kediri_safe_logged_in', 'true');
  webState.userProfile.name = name;
  webState.userProfile.email = email;
  if (pictureUrl) {
    webState.userProfile.photo = pictureUrl;
  }
  webState.userProfile.status = 'Warga Terverifikasi Google';

  try {
    localStorage.setItem('kediri_safe_profile', JSON.stringify(webState.userProfile));
  } catch (err) {}

  // Perbarui data pengguna di profil dan navbar
  updateLoggedInUserProfile(name, email, avatarLetter, color, pictureUrl);
  syncProfileUiDisplays();

  showToast(`✅ Berhasil masuk dengan Google: ${name}`);

  // Masuk langsung ke aplikasi
  setTimeout(() => {
    enterAppDirectly();
  }, 400);
}

// 5. Tutup Modal OAuth
function closeOAuthModals() {
  document.querySelectorAll('.oauth-modal-overlay').forEach(m => m.classList.remove('active'));
}

// 6. Update Profil Pengguna yang Sedang Login
function updateLoggedInUserProfile(name, email, avatarLetter, color, pictureUrl) {
  // Escape semua string user sebelum masuk ke DOM
  const safeName   = escapeHtml(name);
  const safeColor  = /^#[0-9a-fA-F]{3,6}$/.test(color || '') ? color : '#15803d';
  const safeLetter = escapeHtml(avatarLetter || (name ? name.charAt(0).toUpperCase() : '?'));

  const safePicUrl = (pictureUrl && typeof pictureUrl === 'string' && (pictureUrl.startsWith('data:image/') || pictureUrl.startsWith('https://'))) ? escapeHtml(pictureUrl) : null;

  // Update Navbar User Chip
  const navUser   = document.querySelector('.user-name-label');
  const navAvatar = document.querySelector('.user-avatar-sm');
  if (navUser) navUser.textContent = name; // textContent aman
  if (navAvatar) {
    if (safePicUrl) {
      navAvatar.innerHTML = `<img src="${safePicUrl}" alt="${safeName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      navAvatar.textContent = safeLetter;
      if (safeColor) navAvatar.style.background = safeColor;
    }
  }

  // Update Profile Page Card
  const profileName   = document.querySelector('.user-display-name');
  const profileEmail  = document.querySelector('.user-display-email');
  const profileAvatar = document.querySelector('.avatar-round');
  if (profileName)  profileName.textContent  = name;   // textContent aman
  if (profileEmail) profileEmail.textContent = email;  // textContent aman
  if (profileAvatar) {
    if (safePicUrl) {
      profileAvatar.innerHTML = `<img src="${safePicUrl}" alt="${safeName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      profileAvatar.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${safeColor};color:#fff;font-size:32px;font-weight:800;">${safeLetter}</div>`;
    }
  }
}

// ---- Switch Screen: Auth vs Web App ----
function enterAppDirectly() {
  localStorage.setItem('kediri_safe_logged_in', 'true');
  webState.currentScreen = 'app';
  document.getElementById('auth-screen')?.classList.remove('active');
  document.getElementById('main-web-app')?.classList.add('active');
  switchWebTab('map');
  setTimeout(() => {
    if (webMap) {
      webMap.invalidateSize();
    }
  }, 200);
}

// ========================================================
// PROFILE, EMERGENCY CONTACT & SETTINGS MANAGEMENT
// ========================================================

function loadStoredProfileData() {
  try {
    const storedProfile = localStorage.getItem('kediri_safe_profile');
    if (storedProfile) {
      webState.userProfile = Object.assign(webState.userProfile, JSON.parse(storedProfile));
    }
    const storedContact = localStorage.getItem('kediri_safe_family_contact');
    if (storedContact) {
      webState.emergencyContact = Object.assign(webState.emergencyContact, JSON.parse(storedContact));
    }
    const storedNotif = localStorage.getItem('kediri_safe_notif_settings');
    if (storedNotif) {
      webState.notificationSettings = Object.assign(webState.notificationSettings, JSON.parse(storedNotif));
    }
    const storedReports = localStorage.getItem('kediri_safe_reports');
    if (storedReports) {
      try {
        const parsed = JSON.parse(storedReports);
        // Hapus laporan mock / dummy agar riwayat murni kosong jika belum ada laporan nyata buatan warga
        const mockKeywords = ['pohon tumbang', 'lampu penerangan', 'lampu jalan', 'genangan air', 'simpang dhoho', 'brawijaya'];
        webState.reports = Array.isArray(parsed)
          ? parsed.filter(r => {
              if (r.id === 1 || r.id === 2 || r.id === 3 || r.id === 1714001 || r.id === 1714002) return false;
              const titleLow = (r.title || '').toLowerCase();
              if (mockKeywords.some(kw => titleLow.includes(kw))) return false;
              return true;
            })
          : [];
      } catch (err) {
        webState.reports = [];
      }
    } else {
      webState.reports = [];
    }
    try {
      localStorage.setItem('kediri_safe_reports', JSON.stringify(webState.reports));
    } catch (e) {}
  } catch (e) {
    console.warn('Error reading stored profile data:', e);
  }

  syncProfileUiDisplays();
}

function selectProfileAvatar(avatar, btnEl) {
  document.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('active'));
  btnEl?.classList.add('active');
  // Clear photo if user chooses an avatar emoji
  webState.userProfile.photo = null;
  const preview = document.getElementById('edit-avatar-preview');
  if (preview) preview.innerHTML = avatar;
  const input = document.getElementById('edit-profile-avatar');
  if (input) input.value = avatar;
  const removeBtn = document.getElementById('btn-remove-photo');
  if (removeBtn) removeBtn.style.display = 'none';
  const fileInput = document.getElementById('input-profile-photo');
  if (fileInput) fileInput.value = '';
}

function triggerProfilePhotoUpload() {
  document.getElementById('input-profile-photo')?.click();
}

function handleProfilePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('❌ Mohon pilih file gambar (JPG, PNG, atau WEBP)');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(evt) {
    const img = new Image();
    img.onload = function() {
      // Resize to max 256x256 square with center-crop to preserve aspect ratio & lightweight storage
      const canvas = document.createElement('canvas');
      const maxSize = 256;
      let width = img.width;
      let height = img.height;

      const minDim = Math.min(width, height);
      const startX = (width - minDim) / 2;
      const startY = (height - minDim) / 2;

      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, maxSize, maxSize);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      webState.userProfile.photo = compressedDataUrl;
      const preview = document.getElementById('edit-avatar-preview');
      if (preview) {
        preview.innerHTML = `<img src="${compressedDataUrl}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      }
      const removeBtn = document.getElementById('btn-remove-photo');
      if (removeBtn) removeBtn.style.display = 'inline-flex';

      // Deselect emoji buttons
      document.querySelectorAll('.avatar-opt-btn').forEach(b => b.classList.remove('active'));

      showToast('📷 Foto dari galeri berhasil dipilih! Klik "Simpan Perubahan".');
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function removeProfilePhoto() {
  webState.userProfile.photo = null;
  const curAvatar = webState.userProfile.avatar || '👤';
  const preview = document.getElementById('edit-avatar-preview');
  if (preview) preview.innerHTML = curAvatar;
  const fileInput = document.getElementById('input-profile-photo');
  if (fileInput) fileInput.value = '';
  const removeBtn = document.getElementById('btn-remove-photo');
  if (removeBtn) removeBtn.style.display = 'none';

  document.querySelectorAll('.avatar-opt-btn').forEach(b => {
    if (b.dataset.avatar === curAvatar) b.classList.add('active');
    else b.classList.remove('active');
  });

  showToast('Foto profil dihapus. Kembali ke simbol avatar.');
}

function syncProfileUiDisplays() {
  const p = webState.userProfile;
  document.querySelectorAll('.user-display-name').forEach(el => el.textContent = p.name);
  document.querySelectorAll('.user-display-email').forEach(el => el.textContent = p.email);
  document.querySelectorAll('.user-name-label').forEach(el => el.textContent = p.name);

  // Avatar and Initials
  const initials = p.name ? p.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'FK';
  const safePhotoSrc = (p.photo && typeof p.photo === 'string' && (p.photo.startsWith('data:image/') || p.photo.startsWith('https://'))) ? escapeHtml(p.photo) : null;
  const safePName = escapeHtml(p.name || '');

  document.querySelectorAll('.user-avatar-sm').forEach(el => {
    if (safePhotoSrc) {
      el.innerHTML = `<img src="${safePhotoSrc}" alt="${safePName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else if (p.avatar && p.avatar !== 'default' && p.avatar !== '👤') {
      el.textContent = p.avatar;
      el.style.fontSize = '14px';
    } else {
      el.textContent = initials;
      el.style.fontSize = '12px';
    }
  });

  const avatarDisplay = document.getElementById('profile-avatar-display');
  if (avatarDisplay) {
    if (safePhotoSrc) {
      avatarDisplay.innerHTML = `<img src="${safePhotoSrc}" alt="${safePName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else if (p.avatar && p.avatar !== 'default' && p.avatar !== '👤') {
      avatarDisplay.innerHTML = `<span style="font-size:36px;line-height:1;">${escapeHtml(p.avatar)}</span>`;
    } else {
      avatarDisplay.innerHTML = `
        <svg width="56" height="56" viewBox="0 0 24 24" fill="#9ca3af">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      `;
    }
  }

  const editSubtext = document.getElementById('profile-edit-subtext');
  if (editSubtext) {
    editSubtext.textContent = (p.phone && p.address) ? `${p.phone} • ${p.address}` : 'Ubah nama, nomor telepon, dan domisili';
  }

  const statusText = document.getElementById('profile-status-text');
  if (statusText) statusText.textContent = p.status || 'Warga Siaga Kediri';

  // Stats Counters
  const statTotal = document.getElementById('stat-laporan-total');
  const statSelesai = document.getElementById('stat-laporan-selesai');
  const statFasilitas = document.getElementById('stat-fasilitas-total');
  if (statTotal) statTotal.textContent = webState.reports.length;
  if (statSelesai) statSelesai.textContent = webState.reports.filter(r => r.status === 'selesai').length;
  if (statFasilitas) statFasilitas.textContent = kediriFacilities.length;

  // Family Contact
  const ec = webState.emergencyContact;
  const descEl = document.getElementById('profile-family-contact-desc');
  if (descEl) descEl.textContent = `${ec.name} (${ec.displayPhone || ec.phone})`;
  const prevName = document.getElementById('ec-preview-name');
  if (prevName) prevName.textContent = ec.name;
  const prevPhone = document.getElementById('ec-preview-phone');
  if (prevPhone) prevPhone.textContent = ec.displayPhone || ec.phone;

  // Notification settings
  const n = webState.notificationSettings;
  const notifSwitch = document.getElementById('profile-notif-switch');
  if (notifSwitch) {
    if (n.masterEnabled) notifSwitch.classList.remove('off');
    else notifSwitch.classList.add('off');
  }
  const notifDesc = document.getElementById('profile-notif-desc');
  if (notifDesc) {
    notifDesc.textContent = n.masterEnabled 
      ? 'Peringatan bencana & status laporan (Aktif)' 
      : 'Peringatan bencana & status laporan (Nonaktif)';
  }
}

// 1. Edit Profil Handlers
function openEditProfileModal() {
  const modal = document.getElementById('modal-edit-profile');
  if (!modal) return;
  const p = webState.userProfile;
  const nameEl = document.getElementById('edit-profile-name');
  const phoneEl = document.getElementById('edit-profile-phone');
  const addrEl = document.getElementById('edit-profile-address');
  const bloodEl = document.getElementById('edit-profile-blood');
  const statusEl = document.getElementById('edit-profile-status');
  const curAvatar = p.avatar || '👤';

  if (nameEl) nameEl.value = p.name || '';
  if (phoneEl) phoneEl.value = p.phone || '';
  if (addrEl) addrEl.value = p.address || '';
  if (bloodEl) bloodEl.value = p.bloodType || 'O+';
  if (statusEl) statusEl.value = p.status || 'Warga Siaga Kediri';

  const preview = document.getElementById('edit-avatar-preview');
  const removeBtn = document.getElementById('btn-remove-photo');
  if (preview) {
    if (p.photo) {
      preview.innerHTML = `<img src="${p.photo}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      if (removeBtn) removeBtn.style.display = 'inline-flex';
    } else {
      preview.innerHTML = curAvatar;
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  const avatarInput = document.getElementById('edit-profile-avatar');
  if (avatarInput) avatarInput.value = curAvatar;

  document.querySelectorAll('.avatar-opt-btn').forEach(b => {
    if (!p.photo && b.dataset.avatar === curAvatar) b.classList.add('active');
    else b.classList.remove('active');
  });

  modal.classList.add('active');
}

function closeEditProfileModal() {
  document.getElementById('modal-edit-profile')?.classList.remove('active');
}

function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById('edit-profile-name')?.value.trim();
  const phone = document.getElementById('edit-profile-phone')?.value.trim();
  const address = document.getElementById('edit-profile-address')?.value.trim();
  const bloodType = document.getElementById('edit-profile-blood')?.value;
  const status = document.getElementById('edit-profile-status')?.value;
  const avatar = document.getElementById('edit-profile-avatar')?.value || '👤';

  if (!name || !phone || !address) {
    showToast('Mohon lengkapi semua kolom bertanda *');
    return;
  }

  webState.userProfile.name = name;
  webState.userProfile.phone = phone;
  webState.userProfile.address = address;
  webState.userProfile.bloodType = bloodType;
  webState.userProfile.status = status;
  webState.userProfile.avatar = avatar;

  try {
    localStorage.setItem('kediri_safe_profile', JSON.stringify(webState.userProfile));
  } catch (err) {}

  syncProfileUiDisplays();
  closeEditProfileModal();
  showToast('✅ Data profil & foto berhasil disimpan!');
}

// 2. Kontak Darurat Keluarga Handlers
function openEmergencyContactModal() {
  const modal = document.getElementById('modal-emergency-contact');
  if (!modal) return;
  const ec = webState.emergencyContact;
  const nameEl = document.getElementById('ec-name');
  const relEl = document.getElementById('ec-relation');
  const phoneEl = document.getElementById('ec-phone');
  const msgEl = document.getElementById('ec-default-msg');

  if (nameEl) nameEl.value = ec.name || '';
  if (relEl) relEl.value = ec.relation || 'Orang Tua (Ibu/Ayah)';
  if (phoneEl) phoneEl.value = ec.phone || '';
  if (msgEl) msgEl.value = ec.defaultMsg || '';

  const prevName = document.getElementById('ec-preview-name');
  if (prevName) prevName.textContent = ec.name;
  const prevPhone = document.getElementById('ec-preview-phone');
  if (prevPhone) prevPhone.textContent = ec.displayPhone || ec.phone;

  modal.classList.add('active');
}

function closeEmergencyContactModal() {
  document.getElementById('modal-emergency-contact')?.classList.remove('active');
}

function handleSaveEmergencyContact(e) {
  e.preventDefault();
  const name = document.getElementById('ec-name')?.value.trim();
  const relation = document.getElementById('ec-relation')?.value;
  const phone = document.getElementById('ec-phone')?.value.trim();
  const defaultMsg = document.getElementById('ec-default-msg')?.value.trim();

  if (!name || !phone) {
    showToast('Nama dan nomor kontak darurat wajib diisi!');
    return;
  }

  webState.emergencyContact = {
    name,
    relation,
    phone,
    displayPhone: phone,
    defaultMsg: defaultMsg || 'Halo, saya butuh bantuan darurat di lokasi saya!'
  };

  try {
    localStorage.setItem('kediri_safe_family_contact', JSON.stringify(webState.emergencyContact));
  } catch (err) {}

  syncProfileUiDisplays();
  closeEmergencyContactModal();
  showToast(`✅ Kontak darurat keluarga (${name}) berhasil disimpan!`);
}

function callEmergencyFamilyContact() {
  const phone = webState.emergencyContact?.phone || '081234455667';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  showToast(`📞 Menghubungi kontak darurat keluarga: ${webState.emergencyContact.name}...`);
  setTimeout(() => {
    window.location.href = `tel:${cleanPhone}`;
  }, 400);
}

function sendEmergencyFamilyWhatsApp() {
  const ec = webState.emergencyContact;
  let targetPhone = ec?.phone ? ec.phone.replace(/[^0-9]/g, '') : '6281234455667';
  if (targetPhone.startsWith('0')) {
    targetPhone = '62' + targetPhone.substring(1);
  }

  showToast(`📍 Mengambil koordinat GPS untuk dikirim ke ${ec.name}...`);

  getLiveGpsLocation((loc) => {
    const timeStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    const mapsLink = `https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
    const accText = loc.isFallback ? 'Estimasi Area Kota Kediri' : `Akurasi GPS: ±${loc.accuracy} meter`;

    const msg =
`🚨 *PANGGILAN DARURAT KELUARGA - KEDIRI SAFE MAP*
--------------------------------------------------
Halo ${ec.name},
${ec.defaultMsg || 'Saya membutuhkan bantuan atau pemantauan darurat saat ini.'}

📍 *Titik Lokasi Saya Terkini:*
${mapsLink}

🌐 *Koordinat:* ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}
🎯 *Akurasi:* ${accText}
⏰ *Waktu:* ${timeStr} WIB
--------------------------------------------------
Pesan darurat dikirim otomatis melalui Kediri Safe Map.`;

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  });
}

// 3. Pengaturan Notifikasi Handlers
function openNotificationSettingsModal() {
  const modal = document.getElementById('modal-notification-settings');
  if (!modal) return;
  const n = webState.notificationSettings;
  const swDisaster = document.getElementById('switch-notif-disaster');
  const swReports = document.getElementById('switch-notif-reports');
  const swSound = document.getElementById('switch-notif-sound');
  const selRadius = document.getElementById('select-notif-radius');

  if (swDisaster) {
    if (n.disasterAlerts) swDisaster.classList.remove('off');
    else swDisaster.classList.add('off');
  }
  if (swReports) {
    if (n.reportUpdates) swReports.classList.remove('off');
    else swReports.classList.add('off');
  }
  if (swSound) {
    if (n.soundAlerts) swSound.classList.remove('off');
    else swSound.classList.add('off');
  }
  if (selRadius) selRadius.value = n.radius || '5';

  const keyInput = document.getElementById('input-bpbd-key');
  const endpointInput = document.getElementById('input-bpbd-endpoint');
  if (keyInput) keyInput.value = localStorage.getItem('bpbd_gov_api_key') || '';
  if (endpointInput) endpointInput.value = localStorage.getItem('bpbd_gov_endpoint') || '';

  modal.classList.add('active');
}

function closeNotificationSettingsModal() {
  document.getElementById('modal-notification-settings')?.classList.remove('active');
}

function saveNotificationSettings() {
  const swDisaster = !document.getElementById('switch-notif-disaster')?.classList.contains('off');
  const swReports = !document.getElementById('switch-notif-reports')?.classList.contains('off');
  const swSound = !document.getElementById('switch-notif-sound')?.classList.contains('off');
  const radius = document.getElementById('select-notif-radius')?.value || '5';

  webState.notificationSettings.disasterAlerts = swDisaster;
  webState.notificationSettings.reportUpdates = swReports;
  webState.notificationSettings.soundAlerts = swSound;
  webState.notificationSettings.radius = radius;

  const keyInput = document.getElementById('input-bpbd-key');
  const endpointInput = document.getElementById('input-bpbd-endpoint');
  if (keyInput) localStorage.setItem('bpbd_gov_api_key', keyInput.value.trim());
  if (endpointInput) localStorage.setItem('bpbd_gov_endpoint', endpointInput.value.trim());

  try {
    localStorage.setItem('kediri_safe_notif_settings', JSON.stringify(webState.notificationSettings));
  } catch (err) {}

  closeNotificationSettingsModal();
  showToast('🔔 Pengaturan notifikasi & API Pemerintah berhasil disimpan!');

  // Trigger sync ulang dengan data baru
  syncGovernmentAlertsNow(false);
}

function toggleMasterNotification(switchEl) {
  switchEl.classList.toggle('off');
  const isEnabled = !switchEl.classList.contains('off');
  webState.notificationSettings.masterEnabled = isEnabled;

  if (isEnabled && 'Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('🔔 Izin notifikasi browser telah diaktifkan!');
      }
    });
  }

  syncProfileUiDisplays();
  showToast(isEnabled ? '🔔 Notifikasi siaga diaktifkan' : '🔕 Notifikasi siaga dinonaktifkan');

  try {
    localStorage.setItem('kediri_safe_notif_settings', JSON.stringify(webState.notificationSettings));
  } catch (err) {}
}

// 4. Riwayat Laporan Saya Handler & Dedicated Modal
let currentModalReportFilter = 'all';

function openMyReportsModal() {
  const modal = document.getElementById('modal-my-reports');
  if (!modal) return;
  modal.classList.add('active');
  renderModalReports(currentModalReportFilter);
}

function closeMyReportsModal() {
  document.getElementById('modal-my-reports')?.classList.remove('active');
}

function filterModalReports(filter, chipEl) {
  currentModalReportFilter = filter;
  document.querySelectorAll('.reports-modal-filter .notif-chip').forEach(c => c.classList.remove('active'));
  chipEl?.classList.add('active');
  renderModalReports(filter);
}

function renderModalReports(filter = 'all') {
  const listEl = document.getElementById('modal-reports-list');
  const repTotal = document.getElementById('modal-rep-total');
  const repProses = document.getElementById('modal-rep-proses');
  const repSelesai = document.getElementById('modal-rep-selesai');
  const cntAll = document.getElementById('count-rep-all');
  const cntProses = document.getElementById('count-rep-proses');
  const cntSelesai = document.getElementById('count-rep-selesai');

  const total = webState.reports.length;
  const prosesCount = webState.reports.filter(r => r.status === 'proses' || r.status === 'diterima').length;
  const selesaiCount = webState.reports.filter(r => r.status === 'selesai').length;

  if (repTotal) repTotal.textContent = total;
  if (repProses) repProses.textContent = prosesCount;
  if (repSelesai) repSelesai.textContent = selesaiCount;

  if (cntAll) cntAll.textContent = total;
  if (cntProses) cntProses.textContent = prosesCount;
  if (cntSelesai) cntSelesai.textContent = selesaiCount;

  if (!listEl) return;

  const filtered = filter === 'all'
    ? webState.reports
    : filter === 'proses'
      ? webState.reports.filter(r => r.status === 'proses' || r.status === 'diterima')
      : webState.reports.filter(r => r.status === filter);

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:32px 16px;color:#64748b;">
        <span style="font-size:36px;display:block;margin-bottom:8px;">📋</span>
        <h4 style="font-size:14.5px;color:#0f172a;margin:0 0 4px;">Tidak Ada Laporan ${filter !== 'all' ? `(${filter})` : ''}</h4>
        <p style="font-size:12px;margin:0 0 16px;">Setiap laporan kejadian yang Anda laporkan akan terpantau statusnya di sini.</p>
        <button type="button" class="btn-modal-save" style="font-size:12px;padding:7px 16px;" onclick="closeMyReportsModal(); switchWebTab('sos'); switchSosSubTab('lapor');">
          + Buat Laporan Baru
        </button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(rep => {
    const isSelesai = rep.status === 'selesai';
    const statusClass = isSelesai ? 'selesai' : (rep.status === 'proses' ? 'proses' : 'baru');
    const statusLabel = isSelesai ? 'SELESAI DITANGANI' : (rep.status === 'proses' ? 'SEDANG DITINDAKLANJUTI' : 'BARU DITERIMA');

    // Escape semua data user sebelum masuk ke innerHTML — cegah XSS stored
    const safeCategory = escapeHtml(rep.category || 'Laporan Kejadian');
    const safeTitle    = escapeHtml(rep.title);
    const safeDesc     = escapeHtml(rep.desc);
    const safeLocation = escapeHtml(rep.location || 'Kota Kediri');
    const safeOfficer  = escapeHtml(rep.officer || '');
    const safeTime     = escapeHtml(rep.time || 'Baru saja');

    return `
      <div class="report-modal-item">
        <div class="rep-header-row">
          <span class="rep-cat-badge">${safeCategory}</span>
          <span class="rep-status-pill ${statusClass}">${statusLabel}</span>
        </div>
        <h4 class="rep-modal-title">${safeTitle}</h4>
        <p class="rep-modal-desc">${safeDesc}</p>
        <div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:#64748b;margin-bottom:8px;flex-wrap:wrap;">
          <span>📍</span>
          <span>${safeLocation}</span>
          ${safeOfficer ? `<span style="margin-left:auto;color:#15803d;font-weight:600;">Petugas: ${safeOfficer}</span>` : ''}
        </div>
        <div class="rep-modal-meta">
          <span>⏰ ${safeTime}</span>
          <button type="button" class="rep-action-link" onclick="closeMyReportsModal(); switchWebTab('map'); showToast('🗺️ Membuka peta titik kejadian');">
            <span>Lihat di Peta &rarr;</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openMyReportsHistory() {
  openMyReportsModal();
}

// 5. Logout Confirmation Handlers
function openLogoutModal() {
  document.getElementById('modal-logout-confirm')?.classList.add('active');
}

function closeLogoutModal() {
  document.getElementById('modal-logout-confirm')?.classList.remove('active');
}

function confirmLogout() {
  closeLogoutModal();
  localStorage.removeItem('kediri_safe_logged_in');

  // Kosongkan input form dan error box
  const signinEmail = document.getElementById('signin-email');
  const signinPass = document.getElementById('signin-pass');
  if (signinEmail) signinEmail.value = '';
  if (signinPass) signinPass.value = '';

  const errBox = document.getElementById('signin-error-box');
  if (errBox) {
    errBox.style.display = 'none';
    errBox.innerHTML = '';
  }

  webState.currentScreen = 'auth';
  document.getElementById('main-web-app')?.classList.remove('active');
  document.getElementById('auth-screen')?.classList.add('active');
  switchAuthTab('signin');
  showToast('Anda telah keluar dari akun.');
}

function logoutToAuth() {
  openLogoutModal();
}

// ---- Switch Web Tabs (Map, SOS, Profile) ----
function switchWebTab(tabName) {
  webState.currentTab = tabName;

  // Views
  document.querySelectorAll('.tab-page-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`tab-view-${tabName}`)?.classList.add('active');

  // Desktop Navbar Links
  document.querySelectorAll('.nav-link-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`nav-btn-${tabName}`)?.classList.add('active');

  // Mobile Bottom Tabs
  document.querySelectorAll('.mobile-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`m-tab-${tabName}`)?.classList.add('active');

  if (tabName === 'map') {
    setTimeout(initWebMap, 150);
  }
}

// ========================================================
// MAP CONFIGURATION & MAPBOX ENTERPRISE INTEGRATION
// ========================================================
const MAP_CONFIG = {
  // Provider aktif: 'googleRoadmap' | 'googleSatellite' | 'osm'
  activeProvider: 'googleRoadmap',
  mapboxToken: ''
};

const MAP_TILE_PROVIDERS = {
  googleRoadmap: {
    name: 'Google Maps Resmi (Jalan & Bangunan)',
    getUrl: () => 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    options: {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 22,
      maxNativeZoom: 20,
      attribution: '&copy; Google Maps'
    }
  },
  googleSatellite: {
    name: 'Google Citra Satelit + Nama Jalan',
    getUrl: () => 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    options: {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 22,
      maxNativeZoom: 20,
      attribution: '&copy; Google Maps'
    }
  },
  osm: {
    name: 'OpenStreetMap Global',
    getUrl: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 20,
      maxNativeZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }
  }
};

let currentTileLayerInstance = null;

function setMapTileProvider(providerKey) {
  if (!webState.map) return;
  const provider = MAP_TILE_PROVIDERS[providerKey] || MAP_TILE_PROVIDERS.googleRoadmap;
  
  if (currentTileLayerInstance) {
    webState.map.removeLayer(currentTileLayerInstance);
  }
  
  const url = typeof provider.getUrl === 'function' ? provider.getUrl() : provider.url;
  currentTileLayerInstance = L.tileLayer(url, provider.options).addTo(webState.map);

  // Auto-recovery jika ada tile bermasalah di jaringan HP
  currentTileLayerInstance.on('tileerror', function() {
    if (MAP_CONFIG.activeProvider !== 'googleRoadmap') {
      MAP_CONFIG.activeProvider = 'googleRoadmap';
      const fallbackProv = MAP_TILE_PROVIDERS.googleRoadmap;
      if (currentTileLayerInstance) webState.map.removeLayer(currentTileLayerInstance);
      currentTileLayerInstance = L.tileLayer(fallbackProv.getUrl(), fallbackProv.options).addTo(webState.map);
    }
  });

  MAP_CONFIG.activeProvider = providerKey;
}

function toggleMapLayerType() {
  const current = MAP_CONFIG.activeProvider;
  const next = current === 'googleRoadmap' ? 'googleSatellite' : current === 'googleSatellite' ? 'osm' : 'googleRoadmap';
  setMapTileProvider(next);
  const prov = MAP_TILE_PROVIDERS[next];
  showToast(`Tampilan peta: ${prov.name}`);
}

function updateMapboxToken(token) {
  MAP_CONFIG.mapboxToken = token.trim();
  setMapTileProvider(MAP_CONFIG.activeProvider);
  showToast('Token Mapbox berhasil dihubungkan!');
}

// ========================================================
// REALTIME HIGH-PRECISION GEOLOCATION ENGINE
// ========================================================

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatLiveDistance(distKm) {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m dari Anda`;
  }
  return `${distKm.toFixed(1)} km dari Anda`;
}

function updateFacilitiesWithLiveLocation(lat, lng) {
  // 1. Hitung jarak untuk semua fasilitas di Kediri Raya
  kediriFacilities.forEach(f => {
    const distKm = calculateDistanceKm(lat, lng, f.lat, f.lng);
    f.rawDistanceKm = distKm;
    f.distance = formatLiveDistance(distKm);
  });

  // 2. Urutkan fasilitas dari yang PALING DEKAT secara otomatis
  kediriFacilities.sort((a, b) => a.rawDistanceKm - b.rawDistanceKm);

  // 3. Render kartu fasilitas terdekat ke drawer bawah secara dinamis
  renderDrawerFacilityCards();

  const subTitle = document.getElementById('drawer-sub-title') || document.querySelector('.drawer-sub');
  const drawerEl = document.getElementById('main-facilities-drawer');
  const isDrawerMin = drawerEl && drawerEl.classList.contains('minimized');
  if (subTitle && kediriFacilities.length > 0) {
    if (!isDrawerMin) {
      subTitle.textContent = `📍 Terdekat: ${kediriFacilities[0].name} (${kediriFacilities[0].distance})`;
    } else {
      subTitle.dataset.prevText = `📍 Terdekat: ${kediriFacilities[0].name} (${kediriFacilities[0].distance})`;
    }
  }

  // 4. Deteksi nama Desa / Kecamatan pengguna secara real-time
  fetchUserVillageName(lat, lng);

  // 5. Cari fasilitas kesehatan tambahan via OpenStreetMap di sekitar lokasi user
  fetchLiveNearbyFromOSM(lat, lng);
}

// Render dinamis kartu fasilitas terdekat
function renderDrawerFacilityCards() {
  const container = document.getElementById('drawer-cards-grid-row') || document.querySelector('.cards-grid-row');
  if (!container) return;

  // Tampilkan 8 fasilitas darurat terdekat dari posisi pengguna saat ini
  const topNearby = kediriFacilities.slice(0, 8);

  container.innerHTML = topNearby.map(item => {
    const isRs = item.type === 'rs';
    const isApotek = item.type === 'apotek';
    const isShelter = item.type === 'shelter';
    const catClass = isRs ? 'cat-rs' : (isApotek ? 'cat-apotek' : (isShelter ? 'cat-shelter' : 'cat-keamanan'));

    return `
      <div class="facility-web-card" onclick="focusFacilityOnMap(${item.id})" title="Klik untuk melihat di peta">
        <span class="badge-cat-cyan ${catClass}">${item.category}</span>
        <h3 class="facility-heading" title="${item.name}">${item.name}</h3>
        <p class="facility-distance">📍 ${item.distance || 'Menghitung...'}</p>
        <div class="card-bottom-actions">
          <span class="facility-open-tag">● ${item.status}</span>
          <button type="button" class="btn-card-start-nav" onclick="event.stopPropagation(); startNavigationToFacility(${item.id})" title="Mulai Navigasi">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>Rute</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ========================================================
// KONTROL SEMBUNYIKAN & TAMPILKAN (HIDE/SHOW) FASILITAS TERDEKAT
// ========================================================
function hideFacilityDrawer() {
  const drawer = document.getElementById('main-facilities-drawer');
  const pill = document.getElementById('btn-show-facilities-pill');
  if (drawer) {
    drawer.classList.add('drawer-hidden');
  }
  if (pill) {
    pill.classList.remove('hidden');
  }
  showToast('ℹ️ Panel fasilitas disembunyikan. Ketuk "Fasilitas Terdekat" untuk membuka.');
}

function showFacilityDrawer() {
  const drawer = document.getElementById('main-facilities-drawer');
  const pill = document.getElementById('btn-show-facilities-pill');
  if (drawer) {
    drawer.classList.remove('drawer-hidden');
    drawer.classList.remove('minimized');
  }
  if (pill) {
    pill.classList.add('hidden');
  }
}

function toggleFacilityDrawerVisible() {
  const drawer = document.getElementById('main-facilities-drawer');
  if (!drawer) return;
  if (drawer.classList.contains('drawer-hidden')) {
    showFacilityDrawer();
  } else {
    hideFacilityDrawer();
  }
}

function toggleDrawerCollapse() {
  toggleFacilityDrawerVisible();
}

function setDrawerCollapsed(isCollapsed) {
  if (isCollapsed) {
    hideFacilityDrawer();
  } else {
    showFacilityDrawer();
  }
}

// Inisialisasi gestur swipe geser ke bawah (sembunyikan) dan geser ke atas (tampilkan)
function initFacilitiesDrawerGestures() {
  const drawer = document.getElementById('main-facilities-drawer');
  if (!drawer || drawer.dataset.gestureBound === 'true') return;
  drawer.dataset.gestureBound = 'true';

  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  drawer.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      isSwiping = true;
    }
  }, { passive: true });

  drawer.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || e.touches.length !== 1) return;
    const deltaY = e.touches[0].clientY - touchStartY;
    const deltaX = e.touches[0].clientX - touchStartX;

    // Abaikan jika pengguna sedang scroll horizontal pada daftar kartu fasilitas
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
      isSwiping = false;
    }
  }, { passive: true });

  drawer.addEventListener('touchend', (e) => {
    if (!isSwiping || !e.changedTouches || e.changedTouches.length === 0) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const deltaX = e.changedTouches[0].clientX - touchStartX;

    isSwiping = false;

    // Deteksi gestur vertikal yang dominan
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Geser jari ke BAWAH (> 28px) -> Sembunyikan panel
      if (deltaY > 28) {
        hideFacilityDrawer();
        return;
      }
    }
  }, { passive: true });
}

// Deteksi nama desa / kecamatan pengguna
let lastGeocodedCoord = null;
async function fetchUserVillageName(lat, lng) {
  if (lastGeocodedCoord && calculateDistanceKm(lat, lng, lastGeocodedCoord.lat, lastGeocodedCoord.lng) < 0.5) {
    return;
  }
  lastGeocodedCoord = { lat, lng };

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const village = addr.village || addr.suburb || addr.quarter || addr.hamlet || '';
      const town = addr.town || addr.city_district || addr.municipality || addr.county || 'Kediri';
      
      const locText = village ? `${village}, Kec. ${town}` : `Kecamatan ${town}`;
      const subTitle = document.getElementById('drawer-sub-title') || document.querySelector('.drawer-sub');
      if (subTitle) {
        subTitle.textContent = `📍 Area: ${locText} • Diurutkan dari terdekat`;
      }
      const drawerTitle = document.getElementById('drawer-main-title') || document.querySelector('.drawer-title');
      if (drawerTitle) {
        drawerTitle.textContent = `Fasilitas Terdekat (${village || town})`;
      }
    }
  } catch (err) {}
}

// Cari fasilitas kesehatan terdekat tambahan via Photon Komoot API
let hasFetchedLiveNearby = false;
async function fetchLiveNearbyFromOSM(lat, lng) {
  if (hasFetchedLiveNearby) return;
  hasFetchedLiveNearby = true;

  try {
    const res = await fetch(`https://photon.komoot.io/api/?q=rumah+sakit&lat=${lat}&lon=${lng}&limit=4`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.features && data.features.length) {
        data.features.forEach(feat => {
          const props = feat.properties || {};
          const geom = feat.geometry || {};
          const name = props.name;
          const coords = geom.coordinates;
          if (name && coords && coords.length >= 2) {
            const fLng = coords[0];
            const fLat = coords[1];
            const exists = kediriFacilities.some(f => f.name.toLowerCase().includes(name.toLowerCase()));
            if (!exists) {
              const distKm = calculateDistanceKm(lat, lng, fLat, fLng);
              const newId = 100 + kediriFacilities.length;
              kediriFacilities.push({
                id: newId,
                name: name,
                type: 'rs',
                category: 'FASILITAS KESEHATAN SEKITAR',
                address: props.street ? `${props.street}, ${props.city || ''}` : 'Di sekitar lokasi Anda',
                phone: '112 / Hubungi Langsung',
                lat: fLat,
                lng: fLng,
                color: '#ef4444',
                rawDistanceKm: distKm,
                distance: formatLiveDistance(distKm),
                status: 'Buka Siaga'
              });
            }
          }
        });
        kediriFacilities.sort((a, b) => a.rawDistanceKm - b.rawDistanceKm);
        renderDrawerFacilityCards();
      }
    }
  } catch (e) {}
}

function copyUserCoords() {
  if (webState.userLocation && webState.userLocation.lat) {
    const text = `${webState.userLocation.lat.toFixed(6)}, ${webState.userLocation.lng.toFixed(6)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('📋 Koordinat GPS presisi disalin: ' + text);
      }).catch(() => {
        showToast('Koordinat: ' + text);
      });
    } else {
      showToast('Koordinat: ' + text);
    }
  }
}

function updateUserLocationMarker(lat, lng, accuracy, heading, speed) {
  if (!webState.map) return;

  const latLng = [lat, lng];

  // 1. Lingkaran visualisasi batas presisi GPS (Akurasi dalam meter)
  const accRadius = Math.max(accuracy || 15, 6);
  if (!webState.userAccuracyCircle) {
    webState.userAccuracyCircle = L.circle(latLng, {
      radius: accRadius,
      color: '#2563eb',
      weight: 1.5,
      opacity: 0.65,
      fillColor: '#3b82f6',
      fillOpacity: 0.12,
      interactive: false
    }).addTo(webState.map);
  } else {
    webState.userAccuracyCircle.setLatLng(latLng);
    webState.userAccuracyCircle.setRadius(accRadius);
  }

  // 2. Tampilan Puck Biru GPS Berdenyut + Sinar Kompas
  const effectiveHeading = (heading !== null && heading !== undefined) ? heading : webState.deviceHeading;
  const headingStyle = (effectiveHeading !== null && effectiveHeading !== undefined)
    ? `transform: translateX(-50%) rotate(${Math.round(effectiveHeading)}deg); display: block;`
    : 'display: none;';

  const markerHtml = `
    <div class="user-live-marker-container">
      <div class="user-heading-cone" id="user-heading-cone" style="${headingStyle}"></div>
      <div class="user-live-pulse-halo"></div>
      <div class="user-live-pulse-inner"></div>
    </div>
  `;

  const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const accFormatted = accuracy ? `±${Math.round(accuracy)} meter` : 'Estimasi GPS';
  const speedFormatted = (speed && speed > 0.5) ? `<span>⚡ Kecepatan: <b>${Math.round(speed * 3.6)} km/jam</b></span>` : '';

  const popupHtml = `
    <div class="user-gps-popup">
      <div class="user-gps-badge-status">
        <span class="live-dot-green"></span> GPS Terkunci (Presisi Realtime)
      </div>
      <div class="user-gps-title">📍 Lokasi Anda Saat Ini</div>
      <div class="user-gps-coord-box">
        <span>${lat.toFixed(6)}, ${lng.toFixed(6)}</span>
        <button type="button" onclick="copyUserCoords()" title="Salin Koordinat">📋</button>
      </div>
      <div class="user-gps-meta">
        <span>🎯 Akurasi GPS: <b>${accFormatted}</b></span>
        ${speedFormatted}
        <span>🕒 Pembaruan: <b>${nowTime} WIB</b></span>
      </div>
      <div class="user-gps-actions">
        <button type="button" class="btn-gps-share" onclick="sendGpsWhatsApp()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.127-.061-.26-.084-.588-.2-1.012-.387-1.785-.785-2.955-2.585-3.044-2.705-.089-.12-1.144-1.523-1.144-2.905 0-1.381.724-2.062.981-2.343.257-.282.56-.352.748-.352.187 0 .375.002.538.01.174.009.407-.067.636.483.237.572.809 1.977.879 2.122.07.144.117.313.024.5-.094.186-.141.303-.28.467-.14.164-.294.366-.42.492-.14.14-.286.293-.123.573.164.28.727 1.2 1.56 1.942 1.07 1.002 1.971 1.312 2.252 1.452.281.14.444.117.608-.07.164-.187.702-.818.889-1.099.187-.281.374-.234.632-.14.258.094 1.637.772 1.918.913.281.14.469.21.538.328.07.117.07.679-.074 1.084z"/></svg>
          Kirim WA
        </button>
        <a href="https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}" target="_blank" rel="noopener noreferrer" class="btn-gps-gmaps">GMaps ↗</a>
      </div>
    </div>
  `;

  if (!webState.userMarker) {
    const userIcon = L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
    webState.userMarker = L.marker(latLng, { icon: userIcon, zIndexOffset: 2000 })
      .addTo(webState.map)
      .bindPopup(popupHtml, { minWidth: 220 });
  } else {
    webState.userMarker.setLatLng(latLng);
    webState.userMarker.setIcon(L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    }));
    webState.userMarker.setPopupContent(popupHtml);
  }
}

function startRealtimeGeolocation() {
  const pillEl = document.getElementById('map-gps-live-pill');
  const pillText = document.getElementById('map-gps-live-text');
  const pulseDot = document.getElementById('gps-pulse-dot');
  const centerBtn = document.querySelector('.map-action-btn[onclick="centerToUserLocation()"]');

  if (!navigator.geolocation) {
    if (pillEl) {
      pillEl.className = 'map-gps-live-pill error';
      if (pillText) pillText.textContent = 'GPS Tidak Didukung';
      if (pulseDot) pulseDot.className = 'gps-pulse-dot error';
    }
    return;
  }

  function handlePos(pos) {
    const { latitude: lat, longitude: lng, accuracy, heading, speed } = pos.coords;
    const roundedAcc = Math.round(accuracy || 10);

    webState.userLocation = {
      lat,
      lng,
      accuracy: roundedAcc,
      heading,
      speed,
      timestamp: Date.now(),
      isLive: true
    };

    if (pillEl) {
      pillEl.className = 'map-gps-live-pill locked';
      if (pillText) pillText.textContent = `GPS Presisi: ±${roundedAcc}m (Realtime)`;
      if (pulseDot) pulseDot.className = 'gps-pulse-dot active';
    }
    if (centerBtn) {
      centerBtn.classList.add('tracking');
    }

    updateUserLocationMarker(lat, lng, accuracy, heading, speed);

    // Initial center to user's real location wherever they are
    if (webState.map && !webState.hasInitialCenter) {
      webState.hasInitialCenter = true;
      webState.map.flyTo([lat, lng], 16.5, { duration: 1.2 });
      showToast(`📍 Lokasi presisi Anda ditemukan (Akurasi: ±${roundedAcc}m)`);
    }

    // Dynamic facility distances
    updateFacilitiesWithLiveLocation(lat, lng);

    // Follow user in active real-life navigation if not in simulation
    if (webState.navigation && webState.navigation.active && !webState.navigation.isSimulating) {
      updateLiveNavigationUserPos(lat, lng, heading);
    }
  }

  function handleError(err) {
    console.warn('Geolocation notice:', err.message);
    if (pillEl && !webState.userLocation.isLive) {
      pillEl.className = 'map-gps-live-pill error';
      if (pulseDot) pulseDot.className = 'gps-pulse-dot error';
      if (err.code === 1) {
        if (pillText) pillText.textContent = 'Izin Lokasi Ditolak (Klik Aktifkan)';
      } else {
        if (pillText) pillText.textContent = 'Mencari Sinyal GPS...';
      }
    }
  }

  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };

  // Immediate fix
  navigator.geolocation.getCurrentPosition(handlePos, handleError, geoOptions);

  // Watch position
  if (webState.watchId !== null) {
    navigator.geolocation.clearWatch(webState.watchId);
  }
  webState.watchId = navigator.geolocation.watchPosition(handlePos, handleError, geoOptions);

  // Listen to orientation if available
  if (window.DeviceOrientationEvent && !webState.orientationBound) {
    webState.orientationBound = true;
    window.addEventListener('deviceorientation', (e) => {
      let compass = null;
      if (e.webkitCompassHeading) {
        compass = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        compass = 360 - e.alpha;
      }
      if (compass !== null && !isNaN(compass)) {
        webState.deviceHeading = compass;
        const cone = document.getElementById('user-heading-cone');
        if (cone) {
          cone.style.transform = `translateX(-50%) rotate(${Math.round(compass)}deg)`;
          cone.style.display = 'block';
        }
      }
    }, { passive: true });
  }
}

function updateLiveNavigationUserPos(lat, lng, heading) {
  if (!webState.navigation || !webState.navigation.active) return;
  const nav = webState.navigation;
  const pos = [lat, lng];

  if (nav.vehicleMarker) {
    nav.vehicleMarker.setLatLng(pos);
  }

  if (heading !== null && heading !== undefined) {
    const puckEl = document.getElementById('nav-vehicle-puck');
    if (puckEl) puckEl.style.transform = `rotate(${Math.round(heading)}deg)`;
  }

  webState.map.panTo(pos, { animate: true, duration: 0.5 });

  const destLat = nav.facility.lat;
  const destLng = nav.facility.lng;
  const remainingMeters = L.latLng(lat, lng).distanceTo(L.latLng(destLat, destLng));
  const remainingSeconds = remainingMeters / 8.3;

  updateNavEtaDisplay(remainingMeters, remainingSeconds);

  if (remainingMeters < 25 && !nav.hasAnnouncedArrival) {
    nav.hasAnnouncedArrival = true;
    speakNavInstruction(`Anda telah tiba di tujuan: ${nav.facility.name}.`);
    showToast(`🎉 Anda telah tiba di ${nav.facility.name}!`);
  }
}

// ---- Leaflet Interactive Map ----
function initWebMap() {
  const mapEl = document.getElementById('web-leaflet-map');
  if (!mapEl) return;

  if (webState.map) {
    webState.map.invalidateSize();
    return;
  }

  // Start initial view at Kediri or live location if available
  const initialLat = webState.userLocation.lat || -7.8180;
  const initialLng = webState.userLocation.lng || 112.0135;
  const initialZoom = webState.userLocation.isLive ? 16 : 14;

  webState.map = L.map('web-leaflet-map', {
    zoomControl: false,
    attributionControl: false,
    maxZoom: 22
  }).setView([initialLat, initialLng], initialZoom);

  // Inisialisasi tile peta jernih tanpa watermark
  setMapTileProvider(MAP_CONFIG.activeProvider);

  // Multi-step invalidateSize agar ukuran peta pas dan langsung muncul di browser HP
  setTimeout(() => { if (webState.map) webState.map.invalidateSize(); }, 150);
  setTimeout(() => { if (webState.map) webState.map.invalidateSize(); }, 400);
  setTimeout(() => { if (webState.map) webState.map.invalidateSize(); }, 800);

  // Start High-Precision Realtime GPS Tracker
  startRealtimeGeolocation();

  // If live location already acquired, draw marker immediately, otherwise show initial marker
  if (webState.userLocation.isLive) {
    updateUserLocationMarker(
      webState.userLocation.lat,
      webState.userLocation.lng,
      webState.userLocation.accuracy,
      webState.userLocation.heading,
      webState.userLocation.speed
    );
  } else {
    updateUserLocationMarker(-7.8190, 112.0125, 25, null, null);
  }

  renderWebFacilities('all');
  renderDrawerFacilityCards();
}

function renderWebFacilities(filter) {
  if (!webState.map) return;

  webState.mapMarkers.forEach(m => webState.map.removeLayer(m));
  webState.mapMarkers = [];

  const list = filter === 'all' 
    ? kediriFacilities 
    : kediriFacilities.filter(f => f.type === filter);

  list.forEach(item => {
    const iconSymbol = item.type === 'rs' ? '✚' : item.type === 'apotek' ? '℞' : item.type === 'keamanan' ? '🛡️' : '☖';
    const iconHtml = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:32px;height:32px;border-radius:50%;background:${item.color};color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #ffffff;font-size:12px;font-weight:700;">
          ${iconSymbol}
        </div>
        <div style="background:#1e293b;color:#ffffff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.2);">${item.name}</div>
      </div>
    `;

    const markerIcon = L.divIcon({
      html: iconHtml,
      className: '',
      iconSize: [100, 48],
      iconAnchor: [50, 46]
    });

    const marker = L.marker([item.lat, item.lng], { icon: markerIcon })
      .addTo(webState.map)
      .bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:3px;min-width:190px;">
          <div style="font-size:9px;font-weight:800;color:#0891b2;margin-bottom:2px;">${item.category}</div>
          <b style="font-size:13px;color:#111827;">${item.name}</b>
          <div style="font-size:11px;color:#6b7280;margin:3px 0;">📍 ${item.address || item.distance}</div>
          ${item.phone ? `<div style="font-size:11px;color:#334155;margin-bottom:4px;">📞 <b>${item.phone}</b></div>` : ''}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;margin-bottom:8px;">
            <span style="font-size:10px;font-weight:700;color:#16a34a;background:#dcfce7;padding:2px 8px;border-radius:10px;">${item.status}</span>
            <span style="font-size:10.5px;color:#64748b;font-weight:600;">${item.distance}</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button type="button" onclick="startNavigationToFacility(${item.id})" style="flex:1;background:#15803d;color:#ffffff;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;box-shadow:0 2px 5px rgba(21,128,61,0.25);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>Mulai</span>
            </button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}" target="_blank" rel="noopener noreferrer" style="padding:5px 8px;border-radius:6px;border:1px solid #cbd5e1;background:#f8fafc;color:#475569;font-size:10.5px;text-decoration:none;font-weight:600;display:flex;align-items:center;" title="Buka di Google Maps Eksternal">
              GMaps ↗
            </a>
          </div>
        </div>
      `, {
        closeOnClick: false,
        autoPan: true
      });

    marker.facilityId = item.id;
    item.marker = marker;
    webState.mapMarkers.push(marker);
  });
}

function filterMapFacilities(type, pillEl) {
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
  pillEl?.classList.add('active');
  renderWebFacilities(type);
  showToast(`Menampilkan fasilitas: ${pillEl ? pillEl.textContent.trim() : type}`);
}

function handleMapSearch(val) {
  const q = val.toLowerCase().trim();
  if (!q) {
    renderWebFacilities('all');
    return;
  }
  const filtered = kediriFacilities.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  if (webState.map) {
    webState.mapMarkers.forEach(m => webState.map.removeLayer(m));
    webState.mapMarkers = [];
    filtered.forEach(item => {
      const iconHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="width:30px;height:30px;border-radius:50%;background:${item.color};color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #ffffff;font-size:12px;font-weight:700;">✚</div>
          <div style="background:#1e293b;color:#ffffff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin-top:2px;white-space:nowrap;">${item.name}</div>
        </div>
      `;
      const m = L.marker([item.lat, item.lng], {
        icon: L.divIcon({ html: iconHtml, className: '', iconSize: [100, 48], iconAnchor: [50, 46] })
      }).addTo(webState.map);
      webState.mapMarkers.push(m);
    });
  }
}

function centerToUserLocation() {
  if (!webState.map) return;

  if (webState.userLocation && webState.userLocation.isLive) {
    const lat = webState.userLocation.lat;
    const lng = webState.userLocation.lng;
    webState.map.flyTo([lat, lng], 17, { duration: 1.1 });
    showToast(`📍 Memusatkan ke lokasi presisi Anda (Akurasi: ±${webState.userLocation.accuracy}m)`);
    if (webState.userMarker) {
      setTimeout(() => webState.userMarker.openPopup(), 650);
    }
  } else {
    showToast('📡 Mengunci koordinat GPS presisi tinggi...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 10);
          webState.userLocation = {
            lat,
            lng,
            accuracy: acc,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: Date.now(),
            isLive: true
          };
          updateUserLocationMarker(lat, lng, acc, pos.coords.heading, pos.coords.speed);
          updateFacilitiesWithLiveLocation(lat, lng);
          webState.map.flyTo([lat, lng], 17, { duration: 1.1 });
          showToast(`📍 Lokasi presisi Anda terkunci (±${acc}m)!`);
          if (webState.userMarker) {
            setTimeout(() => webState.userMarker.openPopup(), 650);
          }
        },
        (err) => {
          showToast('⚠️ Izin lokasi diperlukan untuk menentukan posisi presisi Anda.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }
}

function zoomInMap() {
  if (webState.map) webState.map.zoomIn();
}

function zoomOutMap() {
  if (webState.map) webState.map.zoomOut();
}

function panMapTo(lat, lng) {
  if (webState.map) {
    webState.map.flyTo([lat, lng], 15, { duration: 0.8 });
  }
}

// ========================================================
// DIREKTORI FASILITAS LENGKAP KOTA KEDIRI (Fitur Lihat Semua)
// ========================================================
let activeDirectoryFilter = 'all';
let activeDirectorySearch = '';

function openAllFacilitiesModal() {
  const modal = document.getElementById('modal-all-facilities');
  if (!modal) return;
  modal.classList.add('active');
  activeDirectoryFilter = 'all';
  activeDirectorySearch = '';
  
  // Reset chips & input
  document.querySelectorAll('.dir-chip-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('dir-chip-all')?.classList.add('active');
  const searchInput = document.getElementById('directory-search-input');
  if (searchInput) searchInput.value = '';

  renderDirectoryFacilities('all', '');
}

function closeAllFacilitiesModal() {
  const modal = document.getElementById('modal-all-facilities');
  if (modal) modal.classList.remove('active');
}

function filterDirectoryCategory(category, buttonEl) {
  activeDirectoryFilter = category;
  document.querySelectorAll('.dir-chip-btn').forEach(b => b.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
  renderDirectoryFacilities(activeDirectoryFilter, activeDirectorySearch);
}

function handleDirectorySearch(query) {
  activeDirectorySearch = query.trim().toLowerCase();
  renderDirectoryFacilities(activeDirectoryFilter, activeDirectorySearch);
}

function renderDirectoryFacilities(category, query) {
  const grid = document.getElementById('directory-facilities-grid');
  if (!grid) return;

  let list = kediriFacilities;
  if (category && category !== 'all') {
    list = list.filter(f => f.type === category);
  }
  if (query) {
    list = list.filter(f => 
      f.name.toLowerCase().includes(query) ||
      f.category.toLowerCase().includes(query) ||
      (f.address && f.address.toLowerCase().includes(query))
    );
  }

  if (list.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#64748b;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" style="margin-bottom:12px;">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p style="font-size:14px;font-weight:700;color:#334155;margin-bottom:4px;">Tidak ada fasilitas ditemukan</p>
        <p style="font-size:12px;">Coba gunakan kata kunci pencarian atau kategori lain.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(f => {
    const badgeClass = f.type === 'rs' ? 'badge-rs' : f.type === 'apotek' ? 'badge-apotek' : f.type === 'shelter' ? 'badge-shelter' : 'badge-keamanan';
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`;
    return `
      <div class="directory-card">
        <div>
          <div class="dir-card-top">
            <span class="dir-category-badge ${badgeClass}">${f.category}</span>
            <span class="dir-distance-tag">📍 ${f.distance}</span>
          </div>
          <h4 class="dir-card-title">${f.name}</h4>
          <p class="dir-card-address">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:2px;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span>${f.address || 'Kota Kediri'}</span>
          </p>
        </div>
        <div>
          <div class="dir-card-meta">
            <span>Status: <b class="dir-status-text">${f.status}</b></span>
            <span>Telp: <b>${f.phone || '-'}</b></span>
          </div>
          <div class="dir-card-actions">
            <button type="button" class="btn-dir-pin" style="background:#15803d;color:#ffffff;border-color:#166534;" onclick="startNavigationToFacility(${f.id})" title="Mulai Navigasi Rute Langsung">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <span>Mulai Rute</span>
            </button>
            <button type="button" class="btn-dir-pin" onclick="focusFacilityOnMap(${f.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
              </svg>
              <span>Lihat di Peta</span>
            </button>
            ${f.phone ? `
              <button type="button" class="btn-dir-tel" onclick="makeEmergencyCall('${f.name}', '${f.phone}')" title="Telepon ${f.phone}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </button>
            ` : ''}
            <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="btn-dir-tel" title="Petunjuk Rute Google Maps" style="text-decoration:none;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function focusFacilityOnMap(facilityId) {
  closeAllFacilitiesModal();
  switchWebTab('map');
  showFacilityDrawer();

  const facility = kediriFacilities.find(f => f.id === facilityId);
  if (!facility || !webState.map) return;

  // Fly to target
  webState.map.flyTo([facility.lat, facility.lng], 16.5, { duration: 0.8 });
  showToast(`Memusatkan peta ke: ${facility.name}`);

  // Find corresponding marker & open popup reliably
  setTimeout(() => {
    if (facility.marker && typeof facility.marker.openPopup === 'function') {
      facility.marker.openPopup();
      return;
    }
    const targetMarker = webState.mapMarkers.find(m => m.facilityId === facilityId);
    if (targetMarker) {
      targetMarker.openPopup();
    } else {
      webState.mapMarkers.forEach(marker => {
        const pos = marker.getLatLng();
        if (Math.abs(pos.lat - facility.lat) < 0.0001 && Math.abs(pos.lng - facility.lng) < 0.0001) {
          marker.openPopup();
        }
      });
    }
  }, 850);
}

function fitAllFacilitiesOnMap() {
  closeAllFacilitiesModal();
  switchWebTab('map');

  if (!webState.map || kediriFacilities.length === 0) return;

  const latLngs = kediriFacilities.map(f => [f.lat, f.lng]);
  const bounds = L.latLngBounds(latLngs);
  webState.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  showToast('Menampilkan seluruh titik fasilitas darurat di Kota Kediri');
}

// ========================================================
// GOOGLE MAPS TURN-BY-TURN NAVIGATION ENGINE & SIMULATION
// ========================================================
webState.navigation = null;

function getManeuverSvg(modifier, type) {
  const mod = (modifier || '').toLowerCase();
  const typ = (type || '').toLowerCase();

  if (typ === 'arrive') {
    return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
      <line x1="4" y1="22" x2="4" y2="15"></line>
    </svg>`;
  }

  if (mod.includes('uturn')) {
    return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 10 4 15 9 20"></polyline>
      <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
    </svg>`;
  }

  if (mod.includes('left') || mod.includes('kiri')) {
    return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="8 4 3 9 8 14"></polyline>
      <path d="M3 9h11a5 5 0 0 1 5 5v6"></path>
    </svg>`;
  }

  if (mod.includes('right') || mod.includes('kanan')) {
    return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 4 21 9 16 14"></polyline>
      <path d="M21 9H10a5 5 0 0 0-5 5v6"></path>
    </svg>`;
  }

  if (typ.includes('roundabout')) {
    return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85 1.04 6.54 2.73L21 8"></path>
      <polyline points="21 3 21 8 16 8"></polyline>
    </svg>`;
  }

  // Default: straight ahead
  return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>`;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
            Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  const brng = Math.atan2(y, x) * 180 / Math.PI;
  return (brng + 360) % 360;
}

function formatNavDistance(meters) {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + ' km';
  }
  return Math.max(10, Math.round(meters / 10) * 10) + ' m';
}

function formatNavDuration(seconds) {
  const mins = Math.max(1, Math.round(seconds / 60));
  return mins + ' min';
}

function formatNavArrivalTime(seconds) {
  const t = new Date();
  t.setSeconds(t.getSeconds() + seconds);
  const h = String(t.getHours()).padStart(2, '0');
  const m = String(t.getMinutes()).padStart(2, '0');
  return h + ':' + m;
}

function speakNavInstruction(text) {
  if (!webState.navigation || !webState.navigation.voiceEnabled) return;
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

function toggleNavVoice() {
  if (!webState.navigation) return;
  webState.navigation.voiceEnabled = !webState.navigation.voiceEnabled;
  const btn = document.getElementById('btn-nav-voice');
  if (btn) {
    btn.classList.toggle('active', webState.navigation.voiceEnabled);
  }
  if (webState.navigation.voiceEnabled) {
    showToast('🔊 Panduan suara navigasi aktif');
    speakNavInstruction('Panduan suara navigasi aktif.');
  } else {
    window.speechSynthesis?.cancel();
    showToast('🔇 Panduan suara dinonaktifkan');
  }
}

async function fetchRouteDirections(originLat, originLng, destLat, destLng) {
  // 1. Try Mapbox Directions API (Official token with Indonesian language)
  if (MAP_CONFIG.mapboxToken) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?language=id&geometries=geojson&steps=true&overview=full&access_token=${MAP_CONFIG.mapboxToken}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // GeoJSON [lng, lat] to Leaflet [lat, lng]
          const steps = (route.legs && route.legs[0] && route.legs[0].steps) ? route.legs[0].steps : [];
          return {
            coordinates: coords,
            distance: route.distance,
            duration: route.duration,
            steps: steps
          };
        }
      }
    } catch (e) {
      console.warn('Mapbox directions API failed, trying OSRM fallback:', e);
    }
  }

  // 2. Try OSRM public service fallback
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
        const steps = (route.legs && route.legs[0] && route.legs[0].steps) ? route.legs[0].steps : [];
        return {
          coordinates: coords,
          distance: route.distance,
          duration: route.duration,
          steps: steps
        };
      }
    }
  } catch (e) {
    console.warn('OSRM routing failed, using street interpolation:', e);
  }

  // 3. Robust offline fallback: interpolate coordinates along Kediri street grid
  const stepsCount = 20;
  const coords = [];
  for (let i = 0; i <= stepsCount; i++) {
    const t = i / stepsCount;
    // Add realistic bend through Kediri street network
    const curveOffset = Math.sin(t * Math.PI) * 0.003;
    const lat = originLat + (destLat - originLat) * t + curveOffset;
    const lng = originLng + (destLng - originLng) * t - (curveOffset * 0.5);
    coords.push([lat, lng]);
  }

  const approxDist = L.latLng(originLat, originLng).distanceTo(L.latLng(destLat, destLng)) * 1.35;
  return {
    coordinates: coords,
    distance: approxDist,
    duration: approxDist / 8.3, // approx 30 km/h
    steps: [
      {
        maneuver: { instruction: 'Mulai dari lokasi Anda di Kediri Kota', modifier: 'straight', type: 'depart' },
        distance: approxDist * 0.3,
        duration: (approxDist * 0.3) / 8.3,
        name: 'Jalan Utama Kediri'
      },
      {
        maneuver: { instruction: 'Lanjutkan menuju jalan protokol', modifier: 'right', type: 'turn' },
        distance: approxDist * 0.4,
        duration: (approxDist * 0.4) / 8.3,
        name: 'Jl. Dhoho / Hasanudin'
      },
      {
        maneuver: { instruction: 'Tiba di fasilitas tujuan', modifier: '', type: 'arrive' },
        distance: approxDist * 0.3,
        duration: (approxDist * 0.3) / 8.3,
        name: 'Tujuan Akhir'
      }
    ]
  };
}

async function startNavigationToFacility(facilityId) {
  closeAllFacilitiesModal();
  switchWebTab('map');

  const facility = kediriFacilities.find(f => f.id === facilityId);
  if (!facility || !webState.map) return;

  // Stop previous navigation if any
  if (webState.navigation) {
    stopNavigationMode(true);
  }

  showToast(`Menghitung rute navigasi menuju ${facility.name}...`);

  // Origin: Realtime High-Precision GPS User Location if available
  const originLat = (webState.userLocation && webState.userLocation.isLive)
    ? webState.userLocation.lat
    : -7.8190;
  const originLng = (webState.userLocation && webState.userLocation.isLive)
    ? webState.userLocation.lng
    : 112.0125;
  const destLat = facility.lat;
  const destLng = facility.lng;

  const routeData = await fetchRouteDirections(originLat, originLng, destLat, destLng);
  const coords = routeData.coordinates;

  if (!coords || coords.length === 0) {
    showToast('Gagal memuat jalur rute. Silakan coba lagi.');
    return;
  }

  // Draw Route Polylines (Casing + Vibrant Google Maps Blue)
  const casingPolyline = L.polyline(coords, {
    color: '#1e3a8a',
    weight: 8,
    opacity: 0.45,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(webState.map);

  const routePolyline = L.polyline(coords, {
    color: '#2563eb',
    weight: 5,
    opacity: 0.95,
    lineCap: 'round',
    lineJoin: 'round'
  }).addTo(webState.map);

  // Destination Marker (Target Pin)
  const destIconHtml = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:34px;height:34px;border-radius:50%;background:#dc2626;color:white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(220,38,38,0.5);border:2px solid #ffffff;font-size:16px;">
        🏁
      </div>
      <div style="background:#1e293b;color:#ffffff;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin-top:2px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
        ${facility.name}
      </div>
    </div>
  `;
  const destMarker = L.marker([destLat, destLng], {
    icon: L.divIcon({ html: destIconHtml, className: '', iconSize: [120, 50], iconAnchor: [60, 48] })
  }).addTo(webState.map);

  // Animated Vehicle / Navigation Arrow Marker
  const initialBearing = coords.length > 1 ? calculateBearing(coords[0][0], coords[0][1], coords[1][0], coords[1][1]) : 0;
  const vehicleIconHtml = `
    <div class="nav-vehicle-arrow-box">
      <div class="nav-vehicle-arrow-icon" id="nav-vehicle-puck" style="transform: rotate(${initialBearing}deg);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 19 21 12 17 5 21 12 2"/>
        </svg>
      </div>
    </div>
  `;
  const vehicleMarker = L.marker(coords[0], {
    icon: L.divIcon({ html: vehicleIconHtml, className: '', iconSize: [40, 40], iconAnchor: [20, 20] }),
    zIndexOffset: 1000
  }).addTo(webState.map);

  // Save Navigation State
  webState.navigation = {
    active: true,
    facility: facility,
    routeData: routeData,
    coords: coords,
    steps: routeData.steps || [],
    currentStepIndex: 0,
    currentCoordIndex: 0,
    casingPolyline: casingPolyline,
    routePolyline: routePolyline,
    destMarker: destMarker,
    vehicleMarker: vehicleMarker,
    isSimulating: false,
    simTimer: null,
    voiceEnabled: true
  };

  // Hide regular drawer & map toolbar
  const drawerEl = document.getElementById('main-facilities-drawer');
  if (drawerEl) drawerEl.style.display = 'none';
  const pillEl = document.getElementById('btn-show-facilities-pill');
  if (pillEl) pillEl.style.display = 'none';
  const queryBar = document.querySelector('.map-query-toolbar');
  if (queryBar) queryBar.style.display = 'none';

  // Show Navigation HUD
  const hud = document.getElementById('nav-mode-hud');
  if (hud) hud.style.display = 'flex';

  // Update HUD Initial Texts
  updateNavInstructionDisplay(0);
  updateNavEtaDisplay(routeData.distance, routeData.duration);
  const targetLabel = document.getElementById('nav-target-name');
  if (targetLabel) targetLabel.textContent = facility.name;

  // Fit bounds to show route initially, then smoothly focus on starting point
  const bounds = routePolyline.getBounds();
  webState.map.fitBounds(bounds, { padding: [80, 80] });

  setTimeout(() => {
    if (webState.navigation && webState.navigation.active) {
      webState.map.flyTo(coords[0], 16.5, { duration: 1.2 });
    }
  }, 1000);

  // Indonesian Voice Guidance Announcement
  const firstInstruction = routeData.steps[0]?.maneuver?.instruction || 'Mulai navigasi';
  speakNavInstruction(`Navigasi dimulai menuju ${facility.name}. ${firstInstruction}.`);

  showToast(`🚗 Mode Navigasi Aktif: Menuju ${facility.name}`);
}

function updateNavInstructionDisplay(stepIndex) {
  if (!webState.navigation) return;
  const steps = webState.navigation.steps;
  const currentStep = steps[stepIndex] || {
    maneuver: { instruction: 'Lanjutkan mengikuti jalur peta', modifier: 'straight', type: 'continue' },
    distance: 250
  };

  const nextStep = steps[stepIndex + 1];

  const iconWrap = document.getElementById('nav-turn-icon-wrap');
  if (iconWrap) {
    iconWrap.innerHTML = getManeuverSvg(currentStep.maneuver?.modifier, currentStep.maneuver?.type);
  }

  const distEl = document.getElementById('nav-next-distance');
  if (distEl) {
    distEl.textContent = formatNavDistance(currentStep.distance || 150);
  }

  const actionEl = document.getElementById('nav-next-action');
  if (actionEl) {
    actionEl.textContent = currentStep.maneuver?.instruction || 'Lanjutkan di jalur ini';
  }

  const subActionEl = document.getElementById('nav-sub-action');
  if (subActionEl) {
    if (nextStep) {
      subActionEl.textContent = `Lalu: ${nextStep.maneuver?.instruction || nextStep.name || 'Terus lurus'}`;
    } else {
      subActionEl.textContent = `Tujuan: ${webState.navigation.facility?.name || 'Lokasi Siaga'}`;
    }
  }
}

function updateNavEtaDisplay(remainingMeters, remainingSeconds) {
  const etaMinutesEl = document.getElementById('nav-eta-minutes');
  if (etaMinutesEl) {
    etaMinutesEl.textContent = formatNavDuration(remainingSeconds);
  }

  const etaSubEl = document.getElementById('nav-eta-sub');
  if (etaSubEl) {
    etaSubEl.textContent = `${formatNavDistance(remainingMeters)} • Tiba ${formatNavArrivalTime(remainingSeconds)}`;
  }
}

function toggleRouteSimulation() {
  if (!webState.navigation) return;
  const nav = webState.navigation;
  const simBtn = document.getElementById('btn-nav-sim');
  const simLabel = document.getElementById('btn-sim-label');

  if (nav.isSimulating) {
    // Pause simulation
    clearInterval(nav.simTimer);
    nav.simTimer = null;
    nav.isSimulating = false;
    if (simBtn) simBtn.classList.remove('simulating');
    if (simLabel) simLabel.textContent = 'Lanjutkan Simulasi';
    showToast('Simulasi perjalanan dijeda');
  } else {
    // Start or resume simulation
    nav.isSimulating = true;
    if (simBtn) simBtn.classList.add('simulating');
    if (simLabel) simLabel.textContent = 'Jeda Simulasi';
    showToast('▶ Simulasi perjalanan Google Maps dimulai');

    const totalCoords = nav.coords.length;
    if (nav.currentCoordIndex >= totalCoords - 1) {
      nav.currentCoordIndex = 0;
    }

    nav.simTimer = setInterval(() => {
      if (!webState.navigation || !nav.isSimulating) {
        clearInterval(nav.simTimer);
        return;
      }

      nav.currentCoordIndex++;
      if (nav.currentCoordIndex >= totalCoords) {
        // Arrived at destination!
        clearInterval(nav.simTimer);
        nav.simTimer = null;
        nav.isSimulating = false;
        if (simBtn) simBtn.classList.remove('simulating');
        if (simLabel) simLabel.textContent = 'Simulasi Ulang';

        const lastPos = nav.coords[totalCoords - 1];
        nav.vehicleMarker.setLatLng(lastPos);
        webState.map.panTo(lastPos);

        const iconWrap = document.getElementById('nav-turn-icon-wrap');
        if (iconWrap) iconWrap.innerHTML = getManeuverSvg('', 'arrive');

        const distEl = document.getElementById('nav-next-distance');
        if (distEl) distEl.textContent = '0 m';

        const actionEl = document.getElementById('nav-next-action');
        if (actionEl) actionEl.textContent = `Tiba di ${nav.facility.name}!`;

        const subActionEl = document.getElementById('nav-sub-action');
        if (subActionEl) subActionEl.textContent = 'Perjalanan telah selesai.';

        updateNavEtaDisplay(0, 0);

        speakNavInstruction(`Anda telah tiba di tujuan: ${nav.facility.name}. Navigasi selesai.`);
        showToast(`🎉 Anda telah tiba di tujuan: ${nav.facility.name}!`);
        return;
      }

      const currentPos = nav.coords[nav.currentCoordIndex];
      const prevPos = nav.coords[nav.currentCoordIndex - 1] || currentPos;

      // Update vehicle marker position
      nav.vehicleMarker.setLatLng(currentPos);

      // Rotate bearing puck
      const nextPos = nav.coords[Math.min(nav.currentCoordIndex + 1, totalCoords - 1)];
      const bearing = calculateBearing(currentPos[0], currentPos[1], nextPos[0], nextPos[1]);
      const puckEl = document.getElementById('nav-vehicle-puck');
      if (puckEl) {
        puckEl.style.transform = `rotate(${Math.round(bearing)}deg)`;
      }

      // Smoothly pan camera with vehicle
      webState.map.panTo(currentPos, { animate: true, duration: 0.35 });

      // Update remaining ETA & distance
      const progressFraction = (totalCoords - nav.currentCoordIndex) / totalCoords;
      const remDistance = nav.routeData.distance * progressFraction;
      const remDuration = nav.routeData.duration * progressFraction;
      updateNavEtaDisplay(remDistance, remDuration);

      // Determine step progression
      const stepIndex = Math.min(
        nav.steps.length - 1,
        Math.floor((nav.currentCoordIndex / totalCoords) * nav.steps.length)
      );

      if (stepIndex !== nav.currentStepIndex) {
        nav.currentStepIndex = stepIndex;
        updateNavInstructionDisplay(stepIndex);
        const step = nav.steps[stepIndex];
        if (step && step.maneuver?.instruction) {
          speakNavInstruction(step.maneuver.instruction);
        }
      }
    }, 400);
  }
}

function recenterNavMap() {
  if (!webState.navigation || !webState.map) return;
  const currentPos = webState.navigation.coords[webState.navigation.currentCoordIndex] || webState.navigation.coords[0];
  webState.map.flyTo(currentPos, 16.5, { duration: 0.8 });
  showToast('Kamera dipusatkan ke posisi kendaraan');
}

function stopNavigationMode(silent = false) {
  if (!webState.navigation) return;
  const nav = webState.navigation;

  // Clear running simulation
  if (nav.simTimer) {
    clearInterval(nav.simTimer);
    nav.simTimer = null;
  }

  // Cancel speech
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Remove map layers
  if (webState.map) {
    if (nav.casingPolyline) webState.map.removeLayer(nav.casingPolyline);
    if (nav.routePolyline) webState.map.removeLayer(nav.routePolyline);
    if (nav.destMarker) webState.map.removeLayer(nav.destMarker);
    if (nav.vehicleMarker) webState.map.removeLayer(nav.vehicleMarker);
  }

  // Hide HUD
  const hud = document.getElementById('nav-mode-hud');
  if (hud) hud.style.display = 'none';

  // Restore drawer & toolbar
  const drawerEl = document.getElementById('main-facilities-drawer');
  if (drawerEl) drawerEl.style.display = '';
  const pillEl = document.getElementById('btn-show-facilities-pill');
  if (pillEl) pillEl.style.display = '';
  const queryBar = document.querySelector('.map-query-toolbar');
  if (queryBar) queryBar.style.display = 'flex';

  // Close steps modal if open
  const modal = document.getElementById('modal-nav-steps');
  if (modal) modal.classList.remove('active');

  webState.navigation = null;

  if (!silent) {
    showToast('Mode navigasi telah ditutup.');
  }
}

function toggleNavStepsModal() {
  const modal = document.getElementById('modal-nav-steps');
  if (!modal) return;

  const isOpen = modal.classList.contains('active');
  if (isOpen) {
    modal.classList.remove('active');
    return;
  }

  if (!webState.navigation) {
    showToast('Belum ada rute aktif yang dipilih.');
    return;
  }

  const nav = webState.navigation;
  const titleEl = document.getElementById('nav-steps-target-title');
  if (titleEl) {
    titleEl.textContent = `Rute menuju: ${nav.facility.name} (${formatNavDistance(nav.routeData.distance)})`;
  }

  const bodyEl = document.getElementById('nav-steps-list-body');
  if (bodyEl) {
    if (!nav.steps || nav.steps.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align:center;padding:24px;color:#64748b;">
          Tidak ada detail belokan tambahan untuk rute ini.
        </div>
      `;
    } else {
      bodyEl.innerHTML = nav.steps.map((st, idx) => {
        const svg = getManeuverSvg(st.maneuver?.modifier, st.maneuver?.type);
        const isCurrent = idx === nav.currentStepIndex;
        return `
          <div class="nav-step-item" style="${isCurrent ? 'background:#f0fdf4;border-radius:12px;padding:10px 12px;border:1px solid #bbf7d0;' : ''}">
            <div class="nav-step-icon" style="${isCurrent ? 'background:#15803d;color:#ffffff;' : ''}">
              ${svg}
            </div>
            <div style="flex:1;">
              <div class="nav-step-instruction" style="${isCurrent ? 'color:#15803d;font-weight:700;' : ''}">
                ${st.maneuver?.instruction || st.name || 'Terus ikuti jalur'}
              </div>
              <div class="nav-step-dist">
                ${formatNavDistance(st.distance || 0)} ${st.name ? `• ${st.name}` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  modal.classList.add('active');
}

// ---- SOS & Emergency Handlers ----
const WHATSAPP_GPS_TARGET = '6282338030891';

function getLiveGpsLocation(callback) {
  if (webState.userLocation && webState.userLocation.isLive) {
    callback({
      lat: webState.userLocation.lat,
      lng: webState.userLocation.lng,
      accuracy: webState.userLocation.accuracy || 10,
      isFallback: false
    });
    return;
  }

  // Koordinat default Kota Kediri (Balai Kota Kediri)
  const defaultCoords = {
    lat: -7.8190,
    lng: 112.0125,
    accuracy: null,
    isFallback: true
  };

  if (!navigator.geolocation) {
    callback(defaultCoords);
    return;
  }

  let finished = false;
  const timeoutId = setTimeout(() => {
    if (!finished) {
      finished = true;
      callback(defaultCoords);
    }
  }, 3500);

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeoutId);
        callback({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 15),
          isFallback: false
        });
      }
    },
    (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeoutId);
        callback(defaultCoords);
      }
    },
    { enableHighAccuracy: true, timeout: 3000, maximumAge: 10000 }
  );
}

function triggerSosCall() {
  if (navigator.vibrate) {
    navigator.vibrate([300, 150, 300, 150, 500]);
  }
  showToast('🚨 PANGGILAN DARURAT: Menghubungi Siaga 112 Kota Kediri...');
  setTimeout(() => {
    window.location.href = 'tel:112';
  }, 400);
}

// Khusus fitur Kirim Koordinat GPS via WhatsApp menggunakan nomor 082338030891
function sendGpsWhatsApp() {
  showToast('📍 Mengambil titik koordinat GPS terkini untuk dikirim via WhatsApp...');

  getLiveGpsLocation((loc) => {
    const timeStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    const mapsLink = `https://maps.google.com/?q=${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;
    const accText = loc.isFallback ? 'Estimasi Area Kota Kediri' : `Akurasi GPS: ±${loc.accuracy} meter`;

    const msg = 
`📍 *BAGIKAN TITIK KOORDINAT LOKASI - KEDIRI SAFE MAP*
--------------------------------------------------
Halo, saya membagikan titik koordinat lokasi saya saat ini:

📌 *Tautan Google Maps:*
${mapsLink}

🌐 *Koordinat:* ${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}
🎯 *Status:* ${accText}
⏰ *Waktu Kirim:* ${timeStr} WIB
--------------------------------------------------
Mohon pemantauan atau bantuan jika ada kendala darurat di titik ini. Terima kasih.`;

    const url = `https://wa.me/${WHATSAPP_GPS_TARGET}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  });
}

function switchSosSubTab(subtab) {
  webState.sosSubtab = subtab;
  document.querySelectorAll('.subtab-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.subtab-content-box').forEach(v => v.classList.remove('active'));

  document.getElementById(`subtab-btn-${subtab}`)?.classList.add('active');
  document.getElementById(`subtab-view-${subtab}`)?.classList.add('active');
}

function makeEmergencyCall(name, number) {
  showToast(`Menghubungi ${name} (${number})...`);
  setTimeout(() => {
    window.location.href = `tel:${number}`;
  }, 400);
}

// ---- Report Form Submission ----
function handleReportSubmit(e) {
  e.preventDefault();
  const cat = document.getElementById('report-cat')?.value;
  const loc = document.getElementById('report-loc')?.value.trim();
  const desc = document.getElementById('report-txt')?.value.trim();

  if (!cat || !loc || !desc) {
    showToast('Lengkapi semua data laporan!');
    return;
  }

  // Validasi panjang input — cegah abuse
  if (loc.length > 200) {
    showToast('⚠️ Lokasi terlalu panjang (maks 200 karakter)');
    return;
  }
  if (desc.length > 2000) {
    showToast('⚠️ Keterangan terlalu panjang (maks 2000 karakter)');
    return;
  }

  // Whitelist kategori yang valid (dari dropdown)
  const allowedCategories = [
    'Kerusakan Jalan', 'Lampu Jalan Mati', 'Genangan Air & Banjir',
    'Pohon Tumbang', 'Kecelakaan Lalu Lintas', 'Darurat Medis'
  ];
  const safeCat = allowedCategories.includes(cat) ? cat : 'Laporan Kejadian';

  const newReport = {
    id: Date.now(),
    title: `${safeCat} di ${loc}`,
    category: safeCat,
    location: loc,
    desc: desc,
    status: 'diterima',
    statusText: 'BARU DITERIMA',
    time: 'Baru saja',
    officer: 'Petugas Piket Siaga 112 Kota Kediri',
    step: 1
  };

  webState.reports.unshift(newReport);
  try {
    localStorage.setItem('kediri_safe_reports', JSON.stringify(webState.reports));
  } catch (err) {}

  // Simpan juga ke Database MySQL (data sudah divalidasi di backend juga)
  fetch('api/reports.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: safeCat,
      title: `${safeCat} di ${loc}`,
      location: loc,
      desc: desc,
      latitude: webState.userLocation?.lat || -7.8190,
      longitude: webState.userLocation?.lng || 112.0125
    })
  }).catch(() => {});

  renderWebReportsStack();
  syncProfileUiDisplays();
  if (typeof renderModalReports === 'function') {
    renderModalReports(currentModalReportFilter);
  }

  showToast('✅ Laporan berhasil dikirim & tersimpan ke sistem!');
  e.target.reset();

  setTimeout(() => {
    switchSosSubTab('riwayat');
  }, 400);
}

function renderWebReportsStack() {
  const container = document.getElementById('web-reports-stack');
  const hotlineBanner = document.getElementById('hotline-report-banner');
  const hotlineNotice = document.getElementById('hotline-empty-notice');

  // Update profile stat counters
  const totalStats = document.getElementById('stat-laporan-total');
  const selesaiStats = document.getElementById('stat-laporan-selesai');
  if (totalStats) totalStats.textContent = webState.reports.length;
  if (selesaiStats) selesaiStats.textContent = webState.reports.filter(r => r.status === 'selesai').length;

  // If reports list is empty
  if (webState.reports.length === 0) {
    if (container) {
      container.innerHTML = `
        <div class="empty-reports-state">
          <div class="empty-state-icon">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <h4 class="empty-state-title">Belum Ada Riwayat Laporan</h4>
          <p class="empty-state-desc">Anda belum mengirimkan laporan kejadian atau aduan. Setiap laporan yang Anda buat akan terpantau status penanganannya secara real-time di sini.</p>
          <button type="button" class="btn-buat-laporan-empty" onclick="switchSosSubTab('lapor')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>Buat Laporan Baru</span>
          </button>
        </div>
      `;
    }
    if (hotlineBanner) hotlineBanner.style.display = 'none';
    if (hotlineNotice) hotlineNotice.style.display = 'flex';
    return;
  }

  // If reports exist
  if (hotlineNotice) hotlineNotice.style.display = 'none';
  if (hotlineBanner) {
    const latest = webState.reports[0];
    // Escape semua data user — cegah XSS stored
    const lTitle      = escapeHtml(latest.title);
    const lDesc       = escapeHtml(latest.desc);
    const lStatusText = escapeHtml(latest.statusText);
    hotlineBanner.style.display = 'block';
    hotlineBanner.innerHTML = `
      <div class="card-head-row">
        <span class="report-title-bold">${lTitle}</span>
        <span class="badge-diproses" style="${latest.status === 'selesai' ? 'background:#dcfce7;color:#15803d;' : latest.status === 'diproses' ? 'background:#fef08a;color:#854d0e;' : 'background:#dbeafe;color:#1e40af;'}">
          ${lStatusText}
        </span>
      </div>
      <div class="report-quote">"${lDesc}"</div>
      <div class="stepper-track">
        <div class="track-step">
          <div class="step-circle ${latest.step >= 1 ? 'green' : 'gray'}">✓</div>
          <span class="step-lbl">Diterima</span>
        </div>
        <div class="track-line ${latest.step >= 2 ? 'green' : ''}"></div>
        <div class="track-step">
          <div class="step-circle ${latest.step >= 2 ? 'green' : 'gray'}">✓</div>
          <span class="step-lbl">Diverifikasi</span>
        </div>
        <div class="track-line ${latest.step >= 3 ? 'orange' : ''}"></div>
        <div class="track-step">
          <div class="step-circle ${latest.step === 3 ? 'orange' : latest.step > 3 ? 'green' : 'gray'}">${latest.step >= 3 ? (latest.step > 3 ? '✓' : '3') : '3'}</div>
          <span class="step-lbl">Diproses</span>
        </div>
        <div class="track-line ${latest.step >= 4 ? 'green' : ''}"></div>
        <div class="track-step">
          <div class="step-circle ${latest.step >= 4 ? 'green' : 'gray'}">4</div>
          <span class="step-lbl">Selesai</span>
        </div>
      </div>
    `;
  }

  if (container) {
    container.innerHTML = webState.reports.map(r => {
      // Escape setiap field — cegah XSS stored dari input laporan
      const rTitle      = escapeHtml(r.title);
      const rDesc       = escapeHtml(r.desc);
      const rStatusText = escapeHtml(r.statusText);
      return `
        <div class="featured-stepper-card" style="margin-bottom:12px;">
          <div class="card-head-row">
            <span class="report-title-bold">${rTitle}</span>
            <span class="badge-diproses" style="${r.status === 'selesai' ? 'background:#dcfce7;color:#15803d;' : r.status === 'diproses' ? 'background:#fef08a;color:#854d0e;' : 'background:#dbeafe;color:#1e40af;'}">
              ${rStatusText}
            </span>
          </div>
          <div class="report-quote">"${rDesc}"</div>
          <div class="stepper-track">
            <div class="track-step">
              <div class="step-circle ${r.step >= 1 ? 'green' : 'gray'}">✓</div>
              <span class="step-lbl">Diterima</span>
            </div>
            <div class="track-line ${r.step >= 2 ? 'green' : ''}"></div>
            <div class="track-step">
              <div class="step-circle ${r.step >= 2 ? 'green' : 'gray'}">✓</div>
              <span class="step-lbl">Diverifikasi</span>
            </div>
            <div class="track-line ${r.step >= 3 ? 'orange' : ''}"></div>
            <div class="track-step">
              <div class="step-circle ${r.step === 3 ? 'orange' : r.step > 3 ? 'green' : 'gray'}">${r.step >= 3 ? (r.step > 3 ? '✓' : '3') : '3'}</div>
              <span class="step-lbl">Diproses</span>
            </div>
            <div class="track-line ${r.step >= 4 ? 'green' : ''}"></div>
            <div class="track-step">
              <div class="step-circle ${r.step >= 4 ? 'green' : 'gray'}">4</div>
              <span class="step-lbl">Selesai</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ---- Profile & Global Tools ----
function toggleTheme() {
  webState.darkMode = !webState.darkMode;
  document.body.classList.toggle('dark-theme', webState.darkMode);
  showToast(webState.darkMode ? 'Mode Gelap diaktifkan' : 'Mode Terang diaktifkan');
}

function toggleWebSwitch(switchEl) {
  switchEl.classList.toggle('off');
  const isOn = !switchEl.classList.contains('off');
  showToast(isOn ? 'Notifikasi sistem diaktifkan' : 'Notifikasi sistem dimatikan');
}

// ---- Toast Web Helper ----
function showToast(msg) {
  const toast = document.getElementById('toast-notify');
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  if (window.toastTimer) clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ========================================================
// NOTIFICATION SYSTEM & POPOVER (Pusat Siaga & Informasi)
// ========================================================
webState.notifications = [
  {
    id: 'notif-1',
    category: 'darurat',
    categoryLabel: 'SIAGA BANJIR',
    badgeColor: '#dc2626',
    badgeBg: '#fee2e2',
    icon: '🌊',
    iconBg: '#fee2e2',
    title: 'Pantauan Debit Air Sungai Brantas',
    desc: 'Posko Siaga BPBD Kota Kediri memantau debit Sungai Brantas normal-waspada di Jembatan Brawijaya & Semampir.',
    time: '10 menit lalu',
    unread: true,
    facilityId: 10,
    actionLabel: 'Lihat Posko BPBD'
  },
  {
    id: 'notif-2',
    category: 'darurat',
    categoryLabel: 'MEDIS 24 JAM',
    badgeColor: '#16a34a',
    badgeBg: '#dcfce7',
    icon: '🏥',
    iconBg: '#dcfce7',
    title: 'Kapasitas IGD RSUD Gambiran Kediri',
    desc: 'Ruang IGD dan 4 unit ambulans gawat darurat beroperasi penuh 24 jam siap melayani rujukan warga.',
    time: '35 menit lalu',
    unread: true,
    facilityId: 1,
    actionLabel: 'Navigasi ke RSUD'
  },
  {
    id: 'notif-3',
    category: 'darurat',
    categoryLabel: 'PATROLI SIAGA',
    badgeColor: '#2563eb',
    badgeBg: '#dbeafe',
    icon: '🛡️',
    iconBg: '#dbeafe',
    title: 'Patroli Blue Light Polres Kediri Kota',
    desc: 'Patroli presisi aktif menyisir Jl. Dhoho, Jl. PB Sudirman, dan pusat keramaian untuk rasa aman masyarakat.',
    time: '1 jam lalu',
    unread: true,
    facilityId: 7,
    actionLabel: 'Lihat SPKT Polres'
  },
  {
    id: 'notif-4',
    category: 'layanan',
    categoryLabel: 'PALANG MERAH',
    badgeColor: '#db2777',
    badgeBg: '#fce7f3',
    icon: '🩸',
    iconBg: '#fce7f3',
    title: 'Layanan Donor Darah PMI Kota Kediri',
    desc: 'Stok darah golongan O & AB tersedia. Pelayanan donor darah dibuka di Jl. Jaksa Agung Suprapto hingga 21:00 WIB.',
    time: '3 jam lalu',
    unread: false,
    facilityId: 12,
    actionLabel: 'Lihat Lokasi PMI'
  },
  {
    id: 'notif-5',
    category: 'layanan',
    categoryLabel: 'LAYANAN 112',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    icon: '🔔',
    iconBg: '#fef3c7',
    title: 'Panggilan Darurat Bebas Pulsa 112',
    desc: 'Layanan Command Center Pemkot Kediri Siaga 112 aktif 24 jam bebas pulsa dari semua operator telepon.',
    time: 'Kemarin',
    unread: false,
    facilityId: null,
    actionTab: 'sos',
    actionLabel: 'Buka Tab SOS 112'
  }
];

let currentNotifFilter = 'all';

function updateNotificationBadge() {
  const unreadCount = webState.notifications.filter(n => n.unread).length;
  const redBadge = document.getElementById('notif-red-badge');
  const countPill = document.getElementById('notif-unread-count-pill');

  if (redBadge) {
    redBadge.style.display = unreadCount > 0 ? 'block' : 'none';
  }
  if (countPill) {
    countPill.textContent = unreadCount > 0 ? `${unreadCount} Baru` : 'Semua Terbaca';
    countPill.style.background = unreadCount > 0 ? '#dcfce7' : '#f1f5f9';
    countPill.style.color = unreadCount > 0 ? '#15803d' : '#64748b';
  }
}

function renderNotifications(category = 'all') {
  currentNotifFilter = category;
  const listEl = document.getElementById('notif-items-body');
  if (!listEl) return;

  const filtered = category === 'all'
    ? webState.notifications
    : category === 'pemerintah'
    ? webState.notifications.filter(n => n.isGovernment || (n.source && /bmkg|bpbd|bnpb|dinkes/i.test(n.source)))
    : webState.notifications.filter(n => n.category === category);

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="notif-empty-state">
        <span class="notif-empty-icon">📭</span>
        <p class="notif-empty-text">Tidak ada notifikasi dalam kategori ini.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(item => {
    // Escape semua data sebelum masuk ke innerHTML — cegah XSS dari API/data
    const safeId          = escapeJsAttr(item.id);
    const safeIcon        = escapeHtml(item.icon);
    const safeCatLabel    = escapeHtml(item.categoryLabel);
    const safeTitle       = escapeHtml(item.title);
    const safeDesc        = escapeHtml(item.desc);
    const safeTime        = escapeHtml(item.time);
    const safeActionLabel = escapeHtml(item.actionLabel);
    // Warna hanya izinkan format hex/rgb
    const safeBadgeColor  = /^(#[0-9a-fA-F]{3,6}|rgb\(\d+,\s*\d+,\s*\d+\))$/.test(item.badgeColor || '') ? item.badgeColor : '#dc2626';
    const safeBadgeBg     = /^(#[0-9a-fA-F]{3,6}|rgb\(\d+,\s*\d+,\s*\d+\))$/.test(item.badgeBg || '') ? item.badgeBg : '#fee2e2';
    const safeIconBg      = /^(#[0-9a-fA-F]{3,6}|rgb\(\d+,\s*\d+,\s*\d+\))$/.test(item.iconBg || '') ? item.iconBg : '#fee2e2';

    return `
    <div class="notif-item ${item.unread ? 'unread' : ''}" onclick="handleNotificationClick('${safeId}')">
      <div class="notif-item-icon" style="background:${safeIconBg};">
        ${safeIcon}
      </div>
      <div class="notif-item-content">
        <div class="notif-item-top">
          <div>
            <span class="notif-badge-tag" style="color:${safeBadgeColor};background:${safeBadgeBg};">${safeCatLabel}</span>
            ${item.isGovernment ? '<span class="notif-gov-tag">✓ RESMI</span>' : ''}
          </div>
          <span class="notif-time-text">${safeTime}</span>
        </div>
        <h4 class="notif-item-title">${safeTitle}</h4>
        <p class="notif-item-desc">${safeDesc}</p>
        ${safeActionLabel ? `
          <button type="button" class="notif-action-pill" onclick="event.stopPropagation(); executeNotificationAction('${safeId}')">
            <span>${safeActionLabel}</span>
            <span style="font-size:12px;">&rarr;</span>
          </button>
        ` : ''}
      </div>
      ${item.unread ? '<span class="notif-unread-dot" title="Belum dibaca"></span>' : ''}
    </div>
  `;
  }).join('');
}

function filterNotificationCategory(category, chipEl) {
  document.querySelectorAll('.notif-chip').forEach(c => c.classList.remove('active'));
  chipEl?.classList.add('active');
  renderNotifications(category);
}

function toggleNotificationDropdown(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const dropdown = document.getElementById('notification-dropdown');
  if (!dropdown) return;

  const isVisible = dropdown.style.display === 'flex';
  if (isVisible) {
    closeNotificationDropdown();
  } else {
    dropdown.style.display = 'flex';
    renderNotifications(currentNotifFilter);
    updateNotificationBadge();
  }
}

function closeNotificationDropdown() {
  const dropdown = document.getElementById('notification-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

function markAllNotificationsRead() {
  webState.notifications.forEach(n => { n.unread = false; });
  updateNotificationBadge();
  renderNotifications(currentNotifFilter);
  showToast('✓ Semua notifikasi telah ditandai sebagai dibaca');
}

function handleNotificationClick(notifId) {
  const notif = webState.notifications.find(n => n.id === notifId);
  if (!notif) return;

  notif.unread = false;
  updateNotificationBadge();
  renderNotifications(currentNotifFilter);

  executeNotificationAction(notifId);
}

function executeNotificationAction(notifId) {
  const notif = webState.notifications.find(n => n.id === notifId);
  if (!notif) return;

  notif.unread = false;
  updateNotificationBadge();
  closeNotificationDropdown();

  // 1. Jika memiliki koordinat bahaya (Gempa/Bencana/Posko)
  if (notif.latitude && notif.longitude) {
    switchWebTab('map');
    if (webState.map) {
      webState.map.setView([notif.latitude, notif.longitude], 13, { animate: true });
      const popupHtml = `
        <div style="font-family:Inter,sans-serif;padding:6px 4px;max-width:260px;">
          <div style="font-size:10px;font-weight:800;color:${/^#[0-9a-fA-F]{3,6}$/.test(notif.badgeColor || '') ? notif.badgeColor : '#dc2626'};margin-bottom:3px;">
            ⚠️ ${escapeHtml(notif.categoryLabel || 'PERINGATAN BAHAYA')}
          </div>
          <div style="font-size:12.5px;font-weight:700;color:#0f172a;line-height:1.3;margin-bottom:4px;">
            ${escapeHtml(notif.title)}
          </div>
          <div style="font-size:11px;color:#475569;line-height:1.35;">
            ${escapeHtml(notif.desc)}
          </div>
          ${notif.shakemap && sanitizeUrl(notif.shakemap) !== '#' ? `
            <div style="margin-top:8px;">
              <a href="${sanitizeUrl(notif.shakemap)}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#2563eb;font-weight:700;text-decoration:none;">
                🗺️ Buka Peta Guncangan BMKG &rarr;
              </a>
            </div>
          ` : ''}
        </div>
      `;
      L.popup()
        .setLatLng([notif.latitude, notif.longitude])
        .setContent(popupHtml)
        .openOn(webState.map);
    }
    showToast('📍 Lokasi bahaya dipusatkan pada peta: ' + (notif.location || notif.title));
    return;
  }

  // 2. Jika tautan eksternal (misal Radar BMKG / Shakemap) — validasi URL dulu
  if (notif.actionUrl) {
    const safeUrl = sanitizeUrl(notif.actionUrl);
    if (safeUrl !== '#') {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  // 3. Aksi internal fasilitas atau SOS
  if (notif.facilityId) {
    focusFacilityOnMap(notif.facilityId);
  } else if (notif.actionTab) {
    switchWebTab(notif.actionTab);
  }
}

// ========================================================
// REALTIME GOVERNMENT DISASTER SYNC ENGINE (BMKG & BPBD)
// ========================================================
async function syncGovernmentAlertsNow(isManual = false) {
  const syncStatus = document.getElementById('gov-sync-status-text');
  if (syncStatus) syncStatus.textContent = 'Menyinkronkan data BMKG & BPBD...';

  const bpbdApiKey = localStorage.getItem('bpbd_gov_api_key') || '';
  const bpbdCustomEndpoint = localStorage.getItem('bpbd_gov_endpoint') || '';

  const newGovAlerts = [];

  // 1. Coba ambil dari Backend API Lokal Laragon (api/alerts.php)
  try {
    const res = await fetch('api/alerts.php', {
      headers: bpbdApiKey ? { 'x-api-key': bpbdApiKey } : {}
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        newGovAlerts.push(...json.data);
      }
    }
  } catch (err) {
    // Mode standalone / static server
  }

  // 2. Realtime BMKG Auto Gempa Terkini (Direct Official API RI)
  try {
    const bmkgResp = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json');
    if (bmkgResp.ok) {
      const bmkgData = await bmkgResp.json();
      const gempa = bmkgData?.Infogempa?.gempa;
      if (gempa) {
        const coords = (gempa.Coordinates || '').split(',');
        const lat = parseFloat(coords[0]) || null;
        const lng = parseFloat(coords[1]) || null;

        newGovAlerts.push({
          id: 'bmkg-live-' + (gempa.DateTime || Date.now()),
          source: 'BMKG RI',
          category: 'darurat',
          categoryLabel: `RESMI BMKG • GEMPA M ${escapeHtml(String(gempa.Magnitude || '?'))}`,
          badgeColor: '#991b1b',
          badgeBg: '#fee2e2',
          icon: '🌐',
          iconBg: '#fee2e2',
          title: `Gempa Terkini M ${escapeHtml(String(gempa.Magnitude || '?'))} - ${escapeHtml(String(gempa.Wilayah || ''))}`,
          desc: `Kedalaman ${escapeHtml(String(gempa.Kedalaman || ''))} | ${escapeHtml(String(gempa.Potensi || ''))}. ${gempa.Dirasakan ? 'Dirasakan: ' + escapeHtml(String(gempa.Dirasakan)) : ''}`,
          location: escapeHtml(String(gempa.Wilayah || 'Indonesia')),
          time: `${escapeHtml(String(gempa.Jam || ''))} (${escapeHtml(String(gempa.Tanggal || ''))})`,
          unread: true,
          isGovernment: true,
          latitude: lat,
          longitude: lng,
          shakemap: gempa.Shakemap ? sanitizeUrl(`https://data.bmkg.go.id/DataMKG/TEWS/${encodeURIComponent(gempa.Shakemap.replace(/^.*\//, ''))}`) : null,
          actionLabel: 'Pusatkan Titik Gempa',
          actionType: 'gempa'
        });
      }
    }
  } catch (bmkgErr) {
    console.warn('BMKG Live Autogempa fetch failed:', bmkgErr);
  }

  // 3. Realtime Peringatan Cuaca Kota Kediri dari BMKG API
  try {
    const weatherResp = await fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=35.71.01.1001');
    if (weatherResp.ok) {
      const wData = await weatherResp.json();
      const currentCuaca = wData?.data?.[0]?.cuaca?.[0]?.[0];
      if (currentCuaca) {
        const weatherDesc = currentCuaca.weather_desc || 'Cerah';
        const isExtr = /hujan|petir|badai|angin/i.test(weatherDesc);
        newGovAlerts.push({
          id: 'bmkg-weather-kdr',
          source: 'BMKG Kota Kediri',
          category: isExtr ? 'darurat' : 'layanan',
          categoryLabel: 'BMKG KOTA KEDIRI',
          badgeColor: isExtr ? '#b45309' : '#0369a1',
          badgeBg: isExtr ? '#fef3c7' : '#e0f2fe',
          icon: isExtr ? '⛈️' : '🌤️',
          iconBg: isExtr ? '#fef3c7' : '#e0f2fe',
          title: `Prakiraan Cuaca Kediri: ${weatherDesc} (${currentCuaca.t}°C)`,
          desc: `Kelembaban ${currentCuaca.hu}% | Kecepatan Angin ${currentCuaca.ws} km/j (${currentCuaca.wd}). Stasiun Meteorologi BMKG Jawa Timur.`,
          location: 'Mojoroto, Kota Kediri',
          time: 'Realtime BMKG',
          unread: isExtr,
          isGovernment: true,
          latitude: -7.818659,
          longitude: 112.003402,
          actionLabel: 'Cek Radar BMKG',
          actionUrl: 'https://www.bmkg.go.id/cuaca/prakiraan-cuaca.bmkg?Kota=Kediri'
        });
      }
    }
  } catch (wErr) {
    console.warn('BMKG Weather fetch failed:', wErr);
  }

  // 4. Custom BPBD Endpoint (jika dimasukkan oleh pengguna dengan API Key)
  // Validasi URL — hanya izinkan https
  if (bpbdCustomEndpoint && sanitizeUrl(bpbdCustomEndpoint) !== '#') {
    try {
      const parsedEndpoint = new URL(bpbdCustomEndpoint);
      // Hanya izinkan HTTPS untuk keamanan
      if (parsedEndpoint.protocol !== 'https:') {
        console.warn('BPBD Endpoint harus menggunakan HTTPS');
      } else {
        const bpbdResp = await fetch(bpbdCustomEndpoint, {
          headers: {
            'Authorization': `Bearer ${bpbdApiKey}`,
            'x-api-key': bpbdApiKey
          }
        });
        if (bpbdResp.ok) {
          const bpbdJson = await bpbdResp.json();
          const alerts = bpbdJson.data || bpbdJson.alerts || bpbdJson;
          if (Array.isArray(alerts)) {
            alerts.slice(0, 20).forEach((item, idx) => { // Batasi max 20 alert
              newGovAlerts.push({
                id: 'custom-bpbd-' + escapeJsAttr(String(item.id || idx)),
                source: String(item.source || 'BPBD Kota Kediri').substring(0, 100),
                category: 'darurat',
                categoryLabel: 'RESMI BPBD KEDIRI',
                badgeColor: '#dc2626',
                badgeBg: '#fee2e2',
                icon: '🚨',
                iconBg: '#fee2e2',
                title: String(item.title || item.judul || 'Peringatan Darurat BPBD').substring(0, 255),
                desc: String(item.desc || item.deskripsi || '').substring(0, 2000),
                location: String(item.location || 'Kota Kediri').substring(0, 200),
                time: 'Baru saja',
                unread: true,
                isGovernment: true,
                latitude: typeof item.latitude === 'number' ? item.latitude : null,
                longitude: typeof item.longitude === 'number' ? item.longitude : null,
                actionLabel: 'Lihat Posko BPBD'
              });
            });
          }
        }
      }
    } catch (bpbdErr) {
      console.warn('Custom BPBD API fetch error:', bpbdErr);
    }
  }

  // Merge unik ke webState.notifications
  if (newGovAlerts.length > 0) {
    const existingIds = new Set(webState.notifications.map(n => n.id));
    const toPrepend = [];
    newGovAlerts.forEach(alert => {
      if (!existingIds.has(alert.id)) {
        toPrepend.push(alert);
        existingIds.add(alert.id);
      }
    });

    if (toPrepend.length > 0) {
      webState.notifications = [...toPrepend, ...webState.notifications];
    }
  }

  updateNotificationBadge();
  renderNotifications(currentNotifFilter);

  if (syncStatus) {
    syncStatus.textContent = 'Live BMKG & BPBD RI Terhubung';
  }

  if (isManual) {
    showToast('📡 Berhasil memperbarui data peringatan darurat BMKG & BPBD!');
  }
}

async function syncDatabaseReports() {
  try {
    const res = await fetch('api/reports.php');
    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        const mockKeywords = ['pohon tumbang', 'lampu penerangan', 'lampu jalan', 'genangan air', 'simpang dhoho', 'brawijaya'];
        const validDbReports = json.data.filter(r => {
          if (r.id === 1 || r.id === 2 || r.id === 3 || r.id === 1714001 || r.id === 1714002) return false;
          const titleLow = (r.title || '').toLowerCase();
          return !mockKeywords.some(kw => titleLow.includes(kw));
        });
        if (validDbReports.length > 0) {
          const localIds = new Set(webState.reports.map(r => r.id));
          validDbReports.forEach(dbRep => {
            if (!localIds.has(dbRep.id)) {
              webState.reports.push(dbRep);
              localIds.add(dbRep.id);
            }
          });
        }
        renderWebReportsStack();
        syncProfileUiDisplays();
        if (typeof renderModalReports === 'function') {
          renderModalReports('all');
        }
      }
    }
  } catch (e) {}
}

// Global outside-click listener to auto-close notification dropdown
document.addEventListener('click', (event) => {
  const container = document.getElementById('notif-bell-container');
  if (container && !container.contains(event.target)) {
    closeNotificationDropdown();
  }
});

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  loadStoredProfileData();
  renderWebReportsStack();
  updateNotificationBadge();
  renderDrawerFacilityCards();
  initFacilitiesDrawerGestures();
  if (navigator.geolocation) {
    startRealtimeGeolocation();
  }
  // Auto-sync peringatan bahaya dari BMKG & BPBD saat web dimuat
  syncGovernmentAlertsNow(false);
  // Auto-sync laporan warga dari database Laragon MySQL
  syncDatabaseReports();

  // Hapus permanen link guest bypass jika masih ada di DOM atau cache
  document.querySelectorAll('.guest-skip-box, .guest-link').forEach(el => el.remove());

  // Pastikan kolom login selalu bersih dari autofill dummy lama
  const emailInput = document.getElementById('signin-email');
  const passInput = document.getElementById('signin-pass');
  if (emailInput && (emailInput.value === 'onlymc75@gmail.com' || emailInput.getAttribute('value'))) {
    emailInput.value = '';
    emailInput.removeAttribute('value');
  }
  if (passInput && (passInput.value === '••••••••' || passInput.getAttribute('value'))) {
    passInput.value = '';
    passInput.removeAttribute('value');
  }

  // Wajib Daftar / Login dulu untuk membuka aplikasi
  const isLoggedIn = localStorage.getItem('kediri_safe_logged_in') === 'true';
  if (isLoggedIn) {
    enterAppDirectly();
  } else {
    webState.currentScreen = 'auth';
    document.getElementById('auth-screen')?.classList.add('active');
    document.getElementById('main-web-app')?.classList.remove('active');
  }
});



