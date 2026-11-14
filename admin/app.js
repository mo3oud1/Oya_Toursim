(function () {
  "use strict";
  if (window.top !== window.self) { document.documentElement.hidden = true; return; } // never inside another site's frame
  var OWNER = "mo3oud1", REPO = "Oya_Toursim", BRANCH = "main";
  var API = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/";
  var CATS = [["vip", "#F4B740", "منتصف المدرج الرئيسي"], ["cat1", "#ED5404", "المدرجات الطولية"], ["cat2", "#4F8BC9", "الزوايا وأطراف المدرجات"], ["cat3", "#2A9D8F", "خلف المرميين"]];
  var AREAS = [["sapanca", "سبانجا"], ["masukiye", "معشوقية"], ["kartepe", "كارتبه"], ["uzungol", "أوزنجول"], ["trabzon", "طرابزون"], ["ayder", "أيدر"]];
  var FEATS = [["pool", "مسبح خاص"], ["heated", "مسبح مدفأ"], ["jacuzzi", "جاكوزي"], ["fireplace", "مدفأة حطب"], ["lake", "إطلالة على البحيرة"], ["mountain", "إطلالة جبلية"], ["forest", "بين الغابات"], ["garden", "حديقة خاصة"], ["bbq", "منطقة شواء"], ["kitchen", "مطبخ مجهّز"], ["breakfast", "فطور"], ["wifi", "إنترنت"], ["parking", "موقف سيارات"], ["family", "مناسب للعائلات"], ["couples", "مناسب للأزواج"]];
  var areaName = {}; AREAS.forEach(function (a) { areaName[a[0]] = a[1]; });
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var token = null;
  // two files: prices and cabins — each keeps its git sha, the edited copy and the last saved copy
  var F = { prices: { path: "data/prices.json" }, cabins: { path: "data/cabins.json" }, events: { path: "data/events.json", list: "events" }, hotels: { path: "data/hotels.json", list: "hotels" }, flights: { path: "data/flights.json", list: "routes" } };
  var db = null; // shortcut to F.prices.db
  var localImg = {}; // uploaded photo path → local preview (the site needs a minute to publish new files)

  function store() { try { return window.localStorage; } catch (e) { return null; } }
  function sess() { try { return window.sessionStorage; } catch (e) { return null; } }
  function getTok() { var a = store(), b = sess(); return (a && a.getItem("oya-gh")) || (b && b.getItem("oya-gh")) || null; }
  function setTok(t, keep) { var a = store(), b = sess(); try { if (keep && a) a.setItem("oya-gh", t); else if (b) b.setItem("oya-gh", t); } catch (e) {} }
  function clearTok() { try { var a = store(), b = sess(); a && a.removeItem("oya-gh"); b && b.removeItem("oya-gh"); } catch (e) {} }

  function b64dec(s) { var bin = atob(s.replace(/\s/g, "")), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new TextDecoder().decode(u); }
  function b64bytes(u) { var bin = ""; for (var i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(bin); }
  function b64enc(s) { return b64bytes(new TextEncoder().encode(s)); }
  function gh(method, path, body) {
    return fetch(API + path + (method === "GET" ? "?ref=" + BRANCH + "&t=" + Date.now() : ""), {
      method: method, cache: "no-store",
      headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      body: body ? JSON.stringify(body) : undefined
    });
  }
  function why(status) {
    if (status === 401) return "المفتاح غير صحيح أو انتهت صلاحيته.";
    if (status === 403 || status === 404) return "المفتاح لا يملك صلاحية على مستودع الموقع. تأكد من اختيار Oya_Toursim وصلاحية Contents: Read and write.";
    if (status === 409 || status === 422) return "تم التعديل من مكان آخر. أعد تحميل الصفحة ثم عدّل من جديد.";
    return "تعذّر الاتصال (" + status + "). تحقّق من الإنترنت وحاول مرة أخرى.";
  }
  var toastT = 0;
  function toast(msg, kind) { var t = $("#toast"); t.textContent = msg; t.className = "toast on " + (kind || ""); clearTimeout(toastT); toastT = setTimeout(function () { t.className = "toast"; }, 5200); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">المصدر</a>'); }
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var today = function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var sym = function () { return (db && db.currency && db.currency.symbol) || "$"; };

  /* ---------- login ---------- */
  function showLogin(msg) { $("#app").hidden = true; $("#login").hidden = false; $("#loginErr").textContent = msg || ""; $("#tok").focus(); }
  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    token = $("#tok").value.trim(); if (!token) return;
    var btn = e.target.querySelector("button"); btn.disabled = true; btn.textContent = "جارٍ التحقق…";
    load().then(function (ok) {
      btn.disabled = false; btn.textContent = "دخول";
      if (ok) { setTok(token, $("#remember").checked); $("#tok").value = ""; }
    });
  });
  $("#logout").addEventListener("click", function () { if (dirtyCount() && !confirm("لديك تغييرات غير محفوظة. هل تريد الخروج؟")) return; clearTok(); token = null; showLogin(); });

  /* ---------- load ---------- */
  function loadFile(k) {
    return gh("GET", F[k].path).then(function (r) {
      if (r.status === 404 && k !== "prices") { F[k].sha = null; F[k].db = {}; F[k].db[F[k].list || k] = []; F[k].orig = clone(F[k].db); return true; }
      if (!r.ok) throw r.status;
      return r.json().then(function (j) { F[k].sha = j.sha; F[k].db = JSON.parse(b64dec(j.content)); F[k].orig = clone(F[k].db); return true; });
    });
  }
  function load() {
    return loadFile("prices").then(function () { return Promise.all(["cabins", "events", "hotels", "flights", "blog"].map(loadFile)); }).then(function () {
      db = F.prices.db; if (!F.cabins.db.cabins) F.cabins.db.cabins = [];
      GEN.forEach(function (k) { if (!Array.isArray(F[k].db[F[k].list])) F[k].db[F[k].list] = []; });
      $("#login").hidden = true; $("#app").hidden = false; render(); return true;
    }).catch(function (st) { showLogin(typeof st === "number" ? why(st) : "تعذّر الاتصال. تحقّق من الإنترنت وحاول مرة أخرى."); return false; });
  }

  /* ---------- render ---------- */
  function money(val, key) {
    return '<div class="money"><input type="number" inputmode="numeric" min="0" step="1" data-key="' + key + '" value="' + (typeof val === "number" ? val : "") + '" placeholder="عند الطلب" aria-label="السعر"><span>' + esc(sym()) + "</span></div>";
  }
  function render() {
    $("#loading").hidden = true; $("#content").hidden = false;
    $("#upd").textContent = "آخر تحديث للأسعار: " + (db.updated || "—");
    $("#hist").href = "https://github.com/" + OWNER + "/" + REPO + "/commits/" + BRANCH + "/data";
    var labels = (db.superCup && db.superCup.categories) || {};
    var m = (db.superCup && db.superCup.matches) || {};
    $("#matches").innerHTML = Object.keys(m).map(function (id) {
      var r = m[id], parts = (r.name || id).split(" — ");
      return '<article class="card match"><h3>' + esc(parts[0]) + '</h3><p class="sub">' + esc(parts.slice(1).join(" — ")) + "</p>" +
        CATS.map(function (c) {
          return '<div class="row"><span class="dot" style="background:' + c[1] + '"></span><span class="nm">الفئة ' + esc(labels[c[0]] || c[0]) + "<small>" + c[2] + "</small></span>" + money(r[c[0]], "sc." + id + "." + c[0]) + "</div>";
        }).join("") + "</article>";
    }).join("");
    renderPkgs(); renderCabs(); GEN.forEach(renderGen); renderBlog();
    $("#curr").value = (db.currency && (db.currency.code + "|" + db.currency.symbol)) || "USD|$";
    update();
  }
  function renderPkgs() {
    var q = $("#q").value.trim(), reg = $("#reg").value;
    var rows = (db.packages || []).map(function (p, i) { return [p, i]; }).filter(function (x) { return (!reg || x[0].region === reg) && (!q || (x[0].name || "").indexOf(q) > -1); });
    $("#pkgs").innerHTML = rows.length ? rows.map(function (x) {
      var p = x[0];
      return '<div class="row"><span class="nm">' + esc(p.name || p.slug) + '<span class="reg">' + (p.region === "world" ? "خارج تركيا" : "داخل تركيا") + "</span><small>" + esc(p.slug) + "</small></span>" + money(p.priceFrom, "pk." + x[1]).replace('placeholder="عند الطلب"', 'placeholder="حسب الموسم"') + "</div>";
    }).join("") : '<div class="empty">لا توجد نتائج</div>';
    markChanged();
  }
  function photoSrc(p) { return localImg[p] || "../" + p; }
  function renderCabs() {
    var list = F.cabins.db.cabins;
    $("#cabs").innerHTML = list.length ? list.map(function (c, i) {
      var ph = (c.photos || [])[0];
      return '<div class="cabrow">' + (ph ? '<img class="th" src="' + esc(photoSrc(ph)) + '" alt="">' : '<span class="th"></span>') +
        "<div><h3>" + esc(c.name) + '<span class="pill' + (c.active === false ? " off" : "") + '">' + (c.active === false ? "مسودة / مخفي" : "ظاهر") + "</span></h3><p>" +
        esc(areaName[c.area] || c.area) + " • غرف النوم: " + (parseInt(c.rooms, 10) || "—") + " • الأشخاص: " + (parseInt(c.guests, 10) || "—") + " • " +
        (typeof c.price === "number" && c.price > 0 ? Number(c.price).toLocaleString("en-US") + " " + esc(sym()) + " / الليلة" : "حسب الموسم") + " • الصور: " + (c.photos || []).length + "</p>" + (c.ref ? '<p class="ref">' + linkify(c.ref) + "</p>" : "") + "</div>" +
        '<div class="acts"><button class="btn btn--ghost sbtn" type="button" data-edit="' + i + '">تعديل</button><button class="btn btn--danger sbtn" type="button" data-del="' + i + '">حذف</button></div></div>';
    }).join("") : '<div class="card empty">لا توجد أكواخ بعد. اضغط «إضافة كوخ» لإضافة أول كوخ.</div>';
  }

  /* ---------- prices editing ---------- */
  function getRef(key) {
    var k = key.split(".");
    if (k[0] === "sc") return { o: db.superCup.matches[k[1]], f: k[2] };
    return { o: db.packages[+k[1]], f: "priceFrom" };
  }
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.matches && el.matches("input[data-key]")) {
      var v = el.value.trim(), n = v === "" ? null : Math.round(Number(v));
      if (v !== "" && (!isFinite(n) || n < 0)) return;
      var ref = getRef(el.dataset.key); ref.o[ref.f] = n; update();
    }
  });
  $("#q").addEventListener("input", renderPkgs);
  $("#reg").addEventListener("change", renderPkgs);
  $("#curr").addEventListener("change", function () { var p = this.value.split("|"); db.currency = { code: p[0], symbol: p[1] }; render(); });
  var SUBS = { bl: ["المدونة", "اكتب مقالاتك وأضف صورها وانشرها فوراً أو جدولها لموعد لاحق."], ev: ["المباريات والبطولات", "أضف بطولة أو مباراة، أو عدّلها، أو احذفها — وتظهر في صفحة تذاكر المباريات."], ho: ["الفنادق", "أضف الفنادق التي تتعامل معها بصورها الحقيقية وسعر الليلة."], fl: ["الطيران", "أضف وجهات الطيران التي تريد إبرازها، مع مدة الرحلة والسعر إن أردت."], sc: ["الأسعار", "اكتب السعر بالأرقام. اترك الخانة فارغة ليظهر «عند الطلب»."], pk: ["الأسعار", "اكتب السعر بالأرقام. اترك الخانة فارغة ليظهر «حسب الموسم»."], cb: ["الأكواخ والبنغلات", "أضف الأكواخ التي تتعامل معها بصورها الحقيقية وسعر الليلة."], st: ["الإعدادات", "إعدادات عامة للعرض."] };
  $$(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      $$(".tab").forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
      $$(".panel").forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
      $("#ttl").textContent = SUBS[t.dataset.tab][0]; $("#sub").textContent = SUBS[t.dataset.tab][1];
    });
  });

  /* ---------- cabins editing ---------- */
  $("#cArea").innerHTML = AREAS.map(function (a) { return '<option value="' + a[0] + '">' + a[1] + "</option>"; }).join("");
  $("#cFeats").innerHTML = FEATS.map(function (f) { return '<label><input type="checkbox" value="' + f[0] + '"> ' + f[1] + "</label>"; }).join("");
  var edIdx = -1, ed = null;
  function openEditor(i) {
    edIdx = i; ed = i < 0 ? { id: "c" + Date.now().toString(36), name: "", area: "sapanca", rooms: 1, guests: 2, price: null, features: [], note: "", photos: [], active: true } : clone(F.cabins.db.cabins[i]);
    $("#edTitle").textContent = i < 0 ? "كوخ جديد" : "تعديل الكوخ";
    $("#cName").value = ed.name; $("#cArea").value = ed.area; $("#cRooms").value = ed.rooms || ""; $("#cGuests").value = ed.guests || ""; $("#cRef").value = ed.ref || "";
    $("#cPrice").value = typeof ed.price === "number" ? ed.price : ""; $("#cNote").value = ed.note || ""; $("#cActive").checked = ed.active !== false;
    ["en", "ru", "tr", "pt"].forEach(function (l) { $("#cNote_" + l).value = (ed.i18n && ed.i18n[l] && ed.i18n[l].note) || ""; });
    $(".sym", $("#editor")).textContent = sym();
    $$("#cFeats input").forEach(function (x) { x.checked = (ed.features || []).indexOf(x.value) > -1; });
    $("#edErr").textContent = ""; drawPhotos();
    $("#editor").hidden = false; $("#cName").focus();
  }
  function drawPhotos() {
    $("#cPhotos").innerHTML = ed.photos.map(function (p, i) {
      return '<div class="ph' + (p.indexOf("uploading:") === 0 ? " up" : "") + '"><img src="' + esc(p.indexOf("uploading:") === 0 ? localImg[p] : photoSrc(p)) + '" alt="">' +
        '<button class="x" type="button" data-rm="' + i + '" aria-label="حذف الصورة">✕</button>' + (i === 0 ? '<span class="cover">الغلاف</span>' : '<button class="first" type="button" data-first="' + i + '">اجعلها الغلاف</button>') + "</div>";
    }).join("") + '<label class="addph">＋ إضافة صور<input type="file" accept="image/*" multiple id="cFiles"></label>';
  }
  $("#cPhotos").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.rm != null) ed.photos.splice(+b.dataset.rm, 1);
    if (b.dataset.first != null) { var p = ed.photos.splice(+b.dataset.first, 1)[0]; ed.photos.unshift(p); }
    drawPhotos();
  });
  $("#cPhotos").addEventListener("change", function (e) {
    if (e.target.id !== "cFiles") return;
    [].slice.call(e.target.files || []).slice(0, 12).forEach(upload);
  });
  // resize in the browser (longest side 1000px — cards are shown at ~400px) and upload straight to the site's files
  function upload(file) {
    var tmp = "uploading:" + Math.random().toString(36).slice(2);
    var url = URL.createObjectURL(file); localImg[tmp] = url; ed.photos.push(tmp); drawPhotos();
    var img = new Image();
    img.onload = function () {
      var s = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var useWebp = c.toDataURL("image/webp").indexOf("data:image/webp") === 0;
      c.toBlob(function (blob) {
        blob.arrayBuffer().then(function (buf) {
          var path = "assets/img/cabins/" + ed.id + "-" + Date.now().toString(36) + (useWebp ? ".webp" : ".jpg");
          return gh("PUT", path, { message: "صورة كوخ: " + ($("#cName").value.trim() || ed.id), content: b64bytes(new Uint8Array(buf)), branch: BRANCH }).then(function (r) {
            var i = ed.photos.indexOf(tmp);
            if (!r.ok) { if (i > -1) ed.photos.splice(i, 1); drawPhotos(); toast("لم تُرفع الصورة: " + why(r.status), "bad"); return; }
            localImg[path] = url; if (i > -1) ed.photos[i] = path; drawPhotos();
          });
        }).catch(function () { var i = ed.photos.indexOf(tmp); if (i > -1) ed.photos.splice(i, 1); drawPhotos(); toast("لم تُرفع الصورة. حاول مرة أخرى.", "bad"); });
      }, useWebp ? "image/webp" : "image/jpeg", 0.8);
    };
    img.onerror = function () { var i = ed.photos.indexOf(tmp); if (i > -1) ed.photos.splice(i, 1); drawPhotos(); toast("هذا الملف ليس صورة.", "bad"); };
    img.src = url;
  }
  $("#addCab").addEventListener("click", function () { openEditor(-1); });
  $("#cabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.edit != null) openEditor(+b.dataset.edit);
    if (b.dataset.del != null) { var c = F.cabins.db.cabins[+b.dataset.del]; if (confirm("حذف «" + c.name + "»؟ سيختفي من الموقع بعد الحفظ.")) { F.cabins.db.cabins.splice(+b.dataset.del, 1); renderCabs(); update(); } }
  });
  function closeEditor() { $("#editor").hidden = true; ed = null; }
  $("#edCancel").addEventListener("click", closeEditor);
  $("#editor").addEventListener("keydown", function (e) { if (e.key === "Escape") closeEditor(); });
  $("#edOk").addEventListener("click", function () {
    var name = $("#cName").value.trim(), pr = $("#cPrice").value.trim();
    if (!name) { $("#edErr").textContent = "اكتب اسم الكوخ."; $("#cName").focus(); return; }
    if (ed.photos.some(function (p) { return p.indexOf("uploading:") === 0; })) { $("#edErr").textContent = "انتظر حتى ينتهي رفع الصور."; return; }
    ed.name = name; ed.area = $("#cArea").value;
    ed.rooms = +$("#cRooms").value > 0 ? Math.round(+$("#cRooms").value) : null; ed.guests = +$("#cGuests").value > 0 ? Math.round(+$("#cGuests").value) : null;
    if ($("#cActive").checked && (!ed.rooms || !ed.guests || !ed.photos.length)) { $("#edErr").textContent = "قبل إظهار الكوخ على الموقع أكمل: عدد غرف النوم، وعدد الأشخاص، وصورة واحدة على الأقل. أو أزل علامة «ظاهر على الموقع» واحفظه كمسودة."; return; }
    ed.ref = $("#cRef").value.trim();
    ed.price = pr === "" ? null : Math.max(0, Math.round(+pr)) || null;
    ed.features = $$("#cFeats input:checked").map(function (x) { return x.value; });
    ed.note = $("#cNote").value.trim(); ed.active = $("#cActive").checked;
    ["en", "ru", "tr", "pt"].forEach(function (l) { var v = $("#cNote_" + l).value.trim(); ed.i18n = ed.i18n || {}; if (v) { ed.i18n[l] = ed.i18n[l] || {}; ed.i18n[l].note = v; } else if (ed.i18n[l]) delete ed.i18n[l].note; if (ed.i18n[l] && !Object.keys(ed.i18n[l]).length) delete ed.i18n[l]; });
    if (ed.i18n && !Object.keys(ed.i18n).length) delete ed.i18n;
    if (edIdx < 0) F.cabins.db.cabins.unshift(ed); else F.cabins.db.cabins[edIdx] = ed;
    closeEditor(); renderCabs(); update();
    toast("تمت إضافة التعديل — اضغط «حفظ التغييرات» لنشره على الموقع.");
  });

  /* ---------- events, hotels, flights: one editor driven by a field list ---------- */
  var GEN = ["events", "hotels", "flights"];
  var AIRPORTS = [["IST", "إسطنبول"], ["SAW", "إسطنبول (صبيحة)"], ["ESB", "أنقرة"], ["TZX", "طرابزون"], ["AYT", "أنطاليا"], ["ADB", "إزمير"], ["BJV", "بودروم"], ["DLM", "دالامان"], ["NAV", "كابادوكيا"], ["YEI", "بورصة"],
    ["RUH", "الرياض"], ["JED", "جدة"], ["DMM", "الدمام"], ["MED", "المدينة المنورة"], ["TIF", "الطائف"], ["AHB", "أبها"], ["TUU", "تبوك"], ["ELQ", "القصيم"],
    ["DXB", "دبي"], ["AUH", "أبوظبي"], ["SHJ", "الشارقة"], ["DOH", "الدوحة"], ["KWI", "الكويت"], ["BAH", "البحرين"], ["MCT", "مسقط"],
    ["BGW", "بغداد"], ["EBL", "أربيل"], ["BSR", "البصرة"], ["NJF", "النجف"], ["ISU", "السليمانية"], ["AMM", "عمّان"], ["BEY", "بيروت"], ["DAM", "دمشق"], ["ALP", "حلب"],
    ["CAI", "القاهرة"], ["HRG", "الغردقة"], ["CMN", "الدار البيضاء"], ["RAK", "مراكش"], ["TUN", "تونس"], ["ALG", "الجزائر"], ["MJI", "طرابلس"], ["KRT", "الخرطوم"],
    ["TBS", "تبليسي"], ["BUS", "باتومي"], ["GYD", "باكو"], ["TAS", "طشقند"], ["KUL", "كوالالمبور"],
    ["LHR", "لندن"], ["CDG", "باريس"], ["FRA", "فرانكفورت"], ["MUC", "ميونخ"], ["AMS", "أمستردام"], ["MAD", "مدريد"], ["BCN", "برشلونة"], ["FCO", "روما"], ["VIE", "فيينا"]];
  var apName = {}; AIRPORTS.forEach(function (a) { apName[a[0]] = a[1]; });
  var HCITY = [["istanbul", "إسطنبول"], ["trabzon", "طرابزون"], ["uzungol", "أوزنجول"], ["sapanca", "سبانجا"], ["antalya", "أنطاليا"], ["bursa", "بورصة"], ["bodrum", "بودروم"], ["cappadocia", "كابادوكيا"]];
  var HKIND = [["hotel", "فندق"], ["resort", "منتجع"], ["apartment", "شقق فندقية"], ["villa", "فيلا"]];
  var HFEAT = [["pool", "مسبح"], ["indoorpool", "مسبح داخلي"], ["spa", "سبا"], ["sea", "إطلالة بحرية"], ["bosphorus", "إطلالة على البوسفور"], ["lake", "إطلالة على البحيرة"], ["breakfast", "فطور"], ["family", "مناسب للعائلات"], ["conservative", "مناسب للعائلات المحافظة"], ["kids", "أنشطة للأطفال"], ["center", "في وسط المدينة"], ["beach", "شاطئ خاص"], ["allinc", "شامل كل شيء"], ["parking", "موقف سيارات"], ["wifi", "إنترنت"]];
  var nameOf = function (list, v) { for (var i = 0; i < list.length; i++) if (list[i][0] === v) return list[i][1]; return v || ""; };
  var durTxt = function (m) { if (!m) return "—"; var h = Math.floor(m / 60), r = m % 60; return (h ? h + " س" : "") + (h && r ? " و" : "") + (r ? r + " د" : ""); };
  var SPEC = {
    events: {
      label: "بطولة أو مباراة", icon: "⚽",
      fresh: function () { return { id: "e" + Date.now().toString(36), title: "", tag: "", text: "", link: "", photo: "", icon: "ball", priceFrom: null, featured: false, active: true, i18n: {} }; },
      fields: [
        { k: "title", t: "text", label: "الاسم", req: true, wide: true, tr: true, ph: "مثال: ديربي إسطنبول: غلطة سراي × فنربخشة" },
        { k: "tag", t: "text", label: "سطر قصير: المكان والتاريخ", tr: true, ph: "مثال: إسطنبول • 15 مارس 2027" },
        { k: "text", t: "area", label: "وصف قصير", wide: true, tr: true, max: 260 },
        { k: "link", t: "select", label: "عند الضغط على البطاقة", opts: [["", "يفتح طلباً على واتساب"], ["matches/spanish-super-cup-2027/", "يفتح صفحة كأس السوبر الإسباني 2027"]] },
        { k: "priceFrom", t: "money", label: "السعر يبدأ من (اختياري)" },
        { k: "icon", t: "select", label: "الأيقونة (إن لم توجد صورة)", opts: [["ball", "كرة"], ["trophy", "كأس"], ["stadium", "ملعب"], ["globe", "العالم"]] },
        { k: "photo", t: "photo", label: "صورة البطاقة (اختياري — صورة حقيقية)", folder: "assets/img/events/", wide: true },
        { k: "featured", t: "check", label: "بطاقة كبيرة في أول الصفحة", wide: true },
        { k: "active", t: "check", label: "ظاهر على الموقع", wide: true }
      ],
      row: function (e) { return { th: e.photo, ico: "⚽", h: e.title, p: [e.tag, e.link ? "يفتح صفحته" : "طلب واتساب", typeof e.priceFrom === "number" ? "من " + e.priceFrom + " " + sym() : ""].filter(Boolean).join(" • ") }; }
    },
    hotels: {
      label: "فندق", icon: "🏨",
      fresh: function () { return { id: "h" + Date.now().toString(36), name: "", city: "istanbul", kind: "hotel", stars: 5, area: "", price: null, features: [], note: "", photos: [], ref: "", active: true }; },
      fields: [
        { k: "name", t: "text", label: "اسم الفندق (كما يظهر للزبون)", req: true, wide: true, ltr: true, ph: "مثال: Swissôtel The Bosphorus" },
        { k: "city", t: "select", label: "المدينة", opts: HCITY },
        { k: "kind", t: "select", label: "النوع", opts: HKIND },
        { k: "stars", t: "select", label: "النجوم", opts: [["5", "5 نجوم"], ["4", "4 نجوم"], ["3", "3 نجوم"], ["0", "بدون تصنيف"]], num: true },
        { k: "price", t: "money", label: "سعر الليلة (اختياري)", ph: "حسب الموسم" },
        { k: "area", t: "text", label: "المنطقة (اختياري)", tr: true, ph: "مثال: بشكتاش — على البوسفور" },
        { k: "features", t: "checks", label: "المواصفات", opts: HFEAT, wide: true },
        { k: "note", t: "area", label: "وصف قصير (اختياري)", wide: true, tr: true, max: 260 },
        { k: "photos", t: "photos", label: "الصور (الأولى هي صورة الغلاف)", folder: "assets/img/hotels/", wide: true },
        { k: "ref", t: "area", label: "ملاحظة داخلية (لا تظهر على صفحات الموقع، لكنها محفوظة في ملف عام — لا تكتب فيها أسراراً)", wide: true, max: 600 },
        { k: "active", t: "check", label: "ظاهر على الموقع", wide: true }
      ],
      check: function (o) { return o.active && !(o.photos || []).length ? "أضف صورة واحدة على الأقل قبل إظهار الفندق، أو أزل علامة «ظاهر على الموقع» واحفظه كمسودة." : ""; },
      row: function (h) { return { th: (h.photos || [])[0], ico: "🏨", h: h.name, p: [nameOf(HCITY, h.city), nameOf(HKIND, h.kind), +h.stars ? h.stars + " نجوم" : "", typeof h.price === "number" && h.price > 0 ? h.price + " " + sym() + " / الليلة" : "حسب الموسم", "الصور: " + (h.photos || []).length].filter(Boolean).join(" • "), ref: h.ref }; }
    },
    flights: {
      label: "وجهة طيران", icon: "✈",
      fresh: function () { return { id: "r" + Date.now().toString(36), from: "IST", to: "RUH", mins: 240, price: null, active: true }; },
      fields: [
        { k: "from", t: "select", label: "من", opts: AIRPORTS },
        { k: "to", t: "select", label: "إلى", opts: AIRPORTS },
        { k: "mins", t: "dur", label: "مدة الرحلة المباشرة تقريباً" },
        { k: "price", t: "money", label: "السعر يبدأ من (اختياري)" },
        { k: "active", t: "check", label: "ظاهر على الموقع", wide: true }
      ],
      check: function (o) { return o.from === o.to ? "اختر مدينتين مختلفتين." : ""; },
      row: function (r) { return { ico: "✈", h: (apName[r.from] || r.from) + " ← " + (apName[r.to] || r.to), p: ["المدة: " + durTxt(r.mins), typeof r.price === "number" && r.price > 0 ? "من " + r.price + " " + sym() : ""].filter(Boolean).join(" • ") }; }
    }
  };
  var gList = function (k) { return F[k].db[F[k].list]; };
  function renderGen(k) {
    var box = $('[data-list="' + k + '"]'); if (!box) return;
    var list = gList(k), S = SPEC[k];
    box.innerHTML = list.length ? list.map(function (o, i) {
      var r = S.row(o);
      return '<div class="cabrow">' + (r.th ? '<img class="th" src="' + esc(photoSrc(r.th)) + '" alt="">' : '<span class="th ico" aria-hidden="true">' + r.ico + "</span>") +
        "<div><h3>" + esc(r.h || "—") + '<span class="pill' + (o.active === false ? " off" : "") + '">' + (o.active === false ? "مسودة / مخفي" : "ظاهر") + "</span>" + (o.featured ? '<span class="pill">بطاقة كبيرة</span>' : "") + "</h3><p>" + esc(r.p) + "</p>" + (r.ref ? '<p class="ref">' + linkify(r.ref) + "</p>" : "") + "</div>" +
        '<div class="acts"><button class="btn btn--ghost sbtn mv" type="button" data-g="' + k + '" data-up="' + i + '" aria-label="تحريك للأعلى"' + (i ? "" : " disabled") + '>▲</button><button class="btn btn--ghost sbtn mv" type="button" data-g="' + k + '" data-down="' + i + '" aria-label="تحريك للأسفل"' + (i < list.length - 1 ? "" : " disabled") + '>▼</button>' +
        '<button class="btn btn--ghost sbtn" type="button" data-g="' + k + '" data-gedit="' + i + '">تعديل</button><button class="btn btn--danger sbtn" type="button" data-g="' + k + '" data-gdel="' + i + '">حذف</button></div></div>';
    }).join("") : '<div class="card empty">لا يوجد شيء بعد. اضغط زر الإضافة في الأعلى.</div>';
  }
  document.addEventListener("click", function (e) {
    var add = e.target.closest && e.target.closest("[data-add]"); if (add) { openGen(add.getAttribute("data-add"), -1); return; }
    var b = e.target.closest && e.target.closest("button[data-g]"); if (!b) return;
    var k = b.getAttribute("data-g"), list = gList(k), i;
    if (b.hasAttribute("data-gedit")) openGen(k, +b.getAttribute("data-gedit"));
    if (b.hasAttribute("data-gdel")) { i = +b.getAttribute("data-gdel"); var r = SPEC[k].row(list[i]); if (confirm("حذف «" + r.h + "»؟ سيختفي من الموقع بعد الحفظ.")) { list.splice(i, 1); renderGen(k); update(); } }
    if (b.hasAttribute("data-up")) { i = +b.getAttribute("data-up"); if (i > 0) { list.splice(i - 1, 0, list.splice(i, 1)[0]); renderGen(k); update(); } }
    if (b.hasAttribute("data-down")) { i = +b.getAttribute("data-down"); if (i < list.length - 1) { list.splice(i + 1, 0, list.splice(i, 1)[0]); renderGen(k); update(); } }
  });
  var gk = null, gi = -1, go = null, gLang = "ar";
  var trFields = function () { return SPEC[gk].fields.filter(function (f) { return f.tr; }); };
  var gVal = function (f, l) { return l === "ar" ? go[f.k] : ((go.i18n || {})[l] || {})[f.k]; };
  function gStash() {
    if (!go) return;
    trFields().forEach(function (f) {
      var el = $("#g_" + f.k); if (!el) return; var v = el.value.trim();
      if (gLang === "ar") go[f.k] = v;
      else { go.i18n = go.i18n || {}; go.i18n[gLang] = go.i18n[gLang] || {}; if (v) go.i18n[gLang][f.k] = v; else delete go.i18n[gLang][f.k]; if (!Object.keys(go.i18n[gLang]).length) delete go.i18n[gLang]; }
    });
  }
  function gShowLang(l) {
    gLang = l;
    trFields().forEach(function (f) { var el = $("#g_" + f.k); if (el) { el.value = gVal(f, l) || ""; el.dir = dirOf(l); } });
    $("#gLangNote").textContent = l === "ar" ? "اكتب النصوص بالعربية أولاً، ثم افتح كل لغة واكتب ترجمتها (أو استخدم زر الترجمة التلقائية)." : "نسخة " + LNAME[l] + ": تظهر في موقع " + LNAME[l] + ". الخانة الفارغة تُعرض بالإنجليزية.";
    langBar($("#gLangs"), l, function (x) { return x === "ar" ? !!go.title || !!go.name : !!((go.i18n || {})[x] && Object.keys(go.i18n[x]).length); }, function (x) { if (x === gLang) return; gStash(); gShowLang(x); });
  }
  function fieldHtml(f, v) {
    var id = "g_" + f.k, w = f.wide ? ' class="wide"' : "", lbl = '<label for="' + id + '">' + esc(f.label) + "</label>", dir = f.ltr ? ' dir="ltr"' : "";
    if (f.t === "text") return "<div" + w + ">" + lbl + '<input type="text" id="' + id + '"' + dir + ' value="' + esc(v || "") + '" placeholder="' + esc(f.ph || "") + '"></div>';
    if (f.t === "area") return "<div" + w + ">" + lbl + '<textarea id="' + id + '"' + dir + ' maxlength="' + (f.max || 400) + '">' + esc(v || "") + "</textarea></div>";
    if (f.t === "select") return "<div" + w + ">" + lbl + '<select id="' + id + '">' + f.opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(v == null ? "" : v) === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></div>";
    if (f.t === "money") return "<div" + w + ">" + lbl + '<div class="money" style="width:100%"><input type="number" id="' + id + '" min="0" step="1" inputmode="numeric" value="' + (typeof v === "number" ? v : "") + '" placeholder="' + esc(f.ph || "اختياري") + '"><span>' + esc(sym()) + "</span></div></div>";
    if (f.t === "dur") return "<div" + w + ">" + lbl + '<div class="dur"><input type="number" id="' + id + '_h" min="0" max="20" value="' + Math.floor((v || 0) / 60) + '" inputmode="numeric" aria-label="ساعات"> ساعة <input type="number" id="' + id + '_m" min="0" max="59" step="5" value="' + ((v || 0) % 60) + '" inputmode="numeric" aria-label="دقائق"> دقيقة</div></div>';
    if (f.t === "check") return "<div" + w + '><label class="chk" style="margin:0"><input type="checkbox" id="' + id + '"' + (v ? " checked" : "") + "> " + esc(f.label) + "</label></div>";
    if (f.t === "checks") return "<div" + w + "><label>" + esc(f.label) + '</label><div class="feats" id="' + id + '">' + f.opts.map(function (o) { return '<label><input type="checkbox" value="' + o[0] + '"' + ((v || []).indexOf(o[0]) > -1 ? " checked" : "") + "> " + esc(o[1]) + "</label>"; }).join("") + "</div></div>";
    if (f.t === "photo" || f.t === "photos") return "<div" + w + "><label>" + esc(f.label) + '</label><div class="photos" id="' + id + '" data-folder="' + f.folder + '" data-multi="' + (f.t === "photos" ? 1 : 0) + '"></div></div>';
    return "";
  }
  function gPhotos(f) {
    var box = $("#g_" + f.k), multi = f.t === "photos", list = multi ? go[f.k] : (go[f.k] ? [go[f.k]] : []);
    box.innerHTML = list.map(function (p, i) {
      var up = p.indexOf("uploading:") === 0;
      return '<div class="ph' + (up ? " up" : "") + '"><img src="' + esc(up ? localImg[p] : photoSrc(p)) + '" alt=""><button class="x" type="button" data-rm="' + i + '" aria-label="حذف الصورة">✕</button>' +
        (multi ? (i === 0 ? '<span class="cover">الغلاف</span>' : '<button class="first" type="button" data-first="' + i + '">اجعلها الغلاف</button>') : "") + "</div>";
    }).join("") + (multi || !list.length ? '<label class="addph">＋ ' + (multi ? "إضافة صور" : "إضافة صورة") + '<input type="file" accept="image/*"' + (multi ? " multiple" : "") + "></label>" : "");
  }
  function openGen(k, i) {
    gk = k; gi = i; go = i < 0 ? SPEC[k].fresh() : clone(gList(k)[i]);
    $("#gTitle").textContent = (i < 0 ? "إضافة " : "تعديل ") + SPEC[k].label;
    $("#gFields").innerHTML = SPEC[k].fields.map(function (f) { return fieldHtml(f, f.t === "photos" ? null : go[f.k]); }).join("");
    SPEC[k].fields.forEach(function (f) { if (f.t === "photo" || f.t === "photos") { if (f.t === "photos" && !Array.isArray(go[f.k])) go[f.k] = []; gPhotos(f); } });
    // older entries kept English in titleEn / tagEn / textEn: move them to the English version
    ["title", "tag", "text"].forEach(function (f) { if (go[f + "En"]) { go.i18n = go.i18n || {}; go.i18n.en = go.i18n.en || {}; if (!go.i18n.en[f]) go.i18n.en[f] = go[f + "En"]; delete go[f + "En"]; } });
    var hasTr = trFields().length > 0; $("#gLangs").hidden = !hasTr; $("#gLangNote").hidden = !hasTr; $("#gAi").hidden = !hasTr; gLang = "ar"; if (hasTr) gShowLang("ar");
    $("#gErr").textContent = ""; $("#gEditor").hidden = false;
    var first = $("#gFields input,#gFields select"); if (first) first.focus();
  }
  var photoField = function (box) { return SPEC[gk].fields.filter(function (f) { return "g_" + f.k === box.id; })[0]; };
  $("#gFields").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; var box = b.closest(".photos"); if (!box) return; var f = photoField(box);
    if (f.t === "photo") go[f.k] = "";
    else { if (b.dataset.rm != null) go[f.k].splice(+b.dataset.rm, 1); if (b.dataset.first != null) go[f.k].unshift(go[f.k].splice(+b.dataset.first, 1)[0]); }
    gPhotos(f);
  });
  $("#gFields").addEventListener("change", function (e) {
    if (e.target.type !== "file") return; var box = e.target.closest(".photos"), f = photoField(box);
    [].slice.call(e.target.files || []).slice(0, f.t === "photos" ? 12 : 1).forEach(function (file) { uploadTo(file, f, go); });
  });
  // resize in the browser (longest side 1000px) and upload straight to the site's files
  function uploadTo(file, f, obj) {
    var tmp = "uploading:" + Math.random().toString(36).slice(2), url = URL.createObjectURL(file); localImg[tmp] = url;
    var put1 = function (v) { if (f.t === "photos") obj[f.k].push(v); else obj[f.k] = v; };
    var swap = function (from, to) { if (f.t === "photos") { var i = obj[f.k].indexOf(from); if (i > -1) { if (to) obj[f.k][i] = to; else obj[f.k].splice(i, 1); } } else if (obj[f.k] === from) obj[f.k] = to || ""; if (go === obj) gPhotos(f); };
    put1(tmp); gPhotos(f);
    var img = new Image();
    img.onload = function () {
      var s = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      var webp = c.toDataURL("image/webp").indexOf("data:image/webp") === 0;
      c.toBlob(function (blob) {
        blob.arrayBuffer().then(function (buf) {
          var path = f.folder + obj.id + "-" + Date.now().toString(36) + (webp ? ".webp" : ".jpg");
          return gh("PUT", path, { message: "صورة: " + (obj.name || obj.title || obj.id), content: b64bytes(new Uint8Array(buf)), branch: BRANCH }).then(function (r) {
            if (!r.ok) { swap(tmp, null); toast("لم تُرفع الصورة: " + why(r.status), "bad"); return; }
            localImg[path] = url; swap(tmp, path);
          });
        }).catch(function () { swap(tmp, null); toast("لم تُرفع الصورة. حاول مرة أخرى.", "bad"); });
      }, webp ? "image/webp" : "image/jpeg", 0.82);
    };
    img.onerror = function () { swap(tmp, null); toast("هذا الملف ليس صورة.", "bad"); };
    img.src = url;
  }
  function closeGen() { $("#gEditor").hidden = true; go = null; }
  $("#gCancel").addEventListener("click", closeGen);
  $("#gEditor").addEventListener("keydown", function (e) { if (e.key === "Escape") closeGen(); });
  $("#gOk").addEventListener("click", function () {
    gStash();
    var S = SPEC[gk], o = go, before = gi < 0 ? null : gList(gk)[gi], err = "";
    S.fields.forEach(function (f) {
      var el = $("#g_" + f.k);
      if (f.tr) { if (f.req && !o[f.k] && !err) { err = "اكتب: " + f.label + " بالعربية"; gShowLang("ar"); } return; }
      if (f.t === "text" || f.t === "area") o[f.k] = el.value.trim();
      if (f.t === "select") o[f.k] = f.num ? +el.value : el.value;
      if (f.t === "money") { var v = el.value.trim(); o[f.k] = v === "" ? null : Math.max(0, Math.round(+v)) || null; }
      if (f.t === "dur") o[f.k] = Math.max(0, Math.round(+$("#g_" + f.k + "_h").value || 0)) * 60 + Math.max(0, Math.min(59, Math.round(+$("#g_" + f.k + "_m").value || 0)));
      if (f.t === "check") o[f.k] = el.checked;
      if (f.t === "checks") o[f.k] = $$("input:checked", el).map(function (x) { return x.value; });
      if (f.req && !o[f.k] && !err) { err = "اكتب: " + f.label; el.focus(); }
    });
    if (!err && S.fields.some(function (f) { return (f.t === "photo" && String(o[f.k] || "").indexOf("uploading:") === 0) || (f.t === "photos" && o[f.k].some(function (p) { return p.indexOf("uploading:") === 0; })); })) err = "انتظر حتى ينتهي رفع الصور.";
    if (!err && S.check) err = S.check(o);
    if (err) { $("#gErr").textContent = err; return; }
    if (o.i18n && !Object.keys(o.i18n).length) delete o.i18n;
    if (gk === "events" && o.featured) gList(gk).forEach(function (x) { if (x !== before) x.featured = false; });
    if (gi < 0) gList(gk).unshift(o); else gList(gk)[gi] = o;
    var k = gk; closeGen(); renderGen(k); update();
    toast("تمت إضافة التعديل — اضغط «حفظ التغييرات» لنشره على الموقع.");
  });

  /* ---------- languages + writing assistant (ChatGPT or Gemini, the owner's own key) ---------- */
  var LANGS = [["ar", "العربية", "ع"], ["en", "English", "EN"], ["ru", "Русский", "RU"], ["tr", "Türkçe", "TR"], ["pt", "Português", "PT"]];
  var LNAME = { ar: "العربية", en: "الإنجليزية", ru: "الروسية", tr: "التركية", pt: "البرتغالية (البرازيل)" };
  var AIP = { openai: { name: "ChatGPT", model: "gpt-5-mini", keyUrl: "platform.openai.com/api-keys" }, gemini: { name: "Gemini", model: "gemini-2.5-flash", keyUrl: "aistudio.google.com/apikey" } };
  function aiCfg() { try { return JSON.parse(localStorage.getItem("oya-ai2") || "{}"); } catch (e) { return {}; } }
  function aiSave(c) { try { localStorage.setItem("oya-ai2", JSON.stringify(c)); } catch (e) {} }
  var aiProv = function () { return aiCfg().provider || "openai"; };
  var aiReady = function () { var c = aiCfg(); return !!(c.keys && c.keys[aiProv()]); };
  // settings
  (function () {
    var pv = $("#aiProv"), ky = $("#aiKey"), md = $("#aiModel"), hint = $("#aiHint"); if (!pv) return;
    function show() { var c = aiCfg(), p = pv.value; ky.value = (c.keys && c.keys[p]) || ""; md.value = (c.models && c.models[p]) || ""; md.placeholder = AIP[p].model; hint.textContent = "تحصل على المفتاح من " + AIP[p].keyUrl + " — يُحفظ على هذا الجهاز فقط، ولا يُرسل إلا إلى " + AIP[p].name + " عند ضغط أزرار المساعد. التكلفة تُحتسب على حسابك هناك حسب الاستعمال."; }
    pv.value = aiProv(); show();
    pv.addEventListener("change", function () { var c = aiCfg(); c.provider = pv.value; aiSave(c); show(); });
    ky.addEventListener("change", function () { var c = aiCfg(); c.keys = c.keys || {}; c.keys[pv.value] = ky.value.trim(); aiSave(c); toast(ky.value.trim() ? "تم حفظ المفتاح على هذا الجهاز." : "تم حذف المفتاح من هذا الجهاز.", "ok"); });
    md.addEventListener("change", function () { var c = aiCfg(); c.models = c.models || {}; c.models[pv.value] = md.value.trim(); aiSave(c); });
    $("#aiTest").addEventListener("click", function () {
      var b = this; b.disabled = true; b.textContent = "جارٍ التجربة…";
      ai("Reply with JSON only.", "قل: جاهز", { type: "object", properties: { ok: { type: "string" } }, required: ["ok"], additionalProperties: false })
        .then(function () { toast("الاتصال يعمل ✓ — المساعد جاهز.", "ok"); }).catch(function (e) { toast(aiErr(e), "bad"); })
        .then(function () { b.disabled = false; b.textContent = "جرّب الاتصال"; });
    });
  })();
  var AI_RULES = "You are a professional travel-content editor for OYA Tourism (أويا للسياحة), a travel agency in Istanbul serving Arab travellers: hotels, cabins, flights, tours, visas and match tickets. Strict rules: never invent facts, prices, dates, numbers, names, reviews, guarantees or licence claims — use only what you are given. Keep every number, date, name, link (href) and image (src, alt) exactly. Never promise a guaranteed booking: OYA helps with bookings and confirms availability in writing. In HTML use only: p, h2, h3, strong, em, ul, ol, li, blockquote, a (href), figure, img (src, alt), figcaption. No h1, no styles. The brand is «أويا للسياحة» in Arabic and «OYA Tourism» in other languages.";
  function noAddl(x) { if (Array.isArray(x)) return x.map(noAddl); if (x && typeof x === "object") { var o = {}; Object.keys(x).forEach(function (k) { if (k !== "additionalProperties") o[k] = noAddl(x[k]); }); return o; } return x; }
  function ai(system, task, schema) {
    var c = aiCfg(), p = aiProv(), key = c.keys && c.keys[p], model = (c.models && c.models[p]) || AIP[p].model;
    if (!key) return Promise.reject("nokey");
    var done = function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw { st: r.status, msg: j.error && j.error.message }; return j; }); };
    if (p === "openai") return fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + key },
      body: JSON.stringify({ model: model, messages: [{ role: "system", content: system }, { role: "user", content: task }], response_format: { type: "json_schema", json_schema: { name: "result", strict: true, schema: schema } } }) })
      .then(done).then(function (j) { var m = j.choices && j.choices[0]; if (!m) throw {}; if (m.message && m.message.refusal) throw { msg: "اعتذر المساعد عن هذا الطلب." }; if (m.finish_reason === "length") throw { msg: "النص طويل جداً على المساعد في طلب واحد." }; return JSON.parse(m.message.content); });
    return fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: task }] }], generationConfig: { responseMimeType: "application/json", responseSchema: noAddl(schema) } }) })
      .then(done).then(function (j) { var cd = j.candidates && j.candidates[0], t = cd && cd.content && (cd.content.parts || []).map(function (x) { return x.text || ""; }).join(""); if (!t) throw { msg: cd && cd.finishReason === "MAX_TOKENS" ? "النص طويل جداً على المساعد في طلب واحد." : "لم يرجع المساعد نتيجة. حاول مرة أخرى." }; return JSON.parse(t); });
  }
  var aiErr = function (e) { if (e === "nokey") return "أضف مفتاح المساعد (ChatGPT أو Gemini) من تبويب «الإعدادات» أولاً."; if (e && (e.st === 401 || e.st === 403 || e.st === 400 && /key/i.test(e.msg || ""))) return "مفتاح المساعد غير صحيح أو لا يملك صلاحية."; if (e && e.st === 404) return "اسم النموذج غير موجود — صحّحه في «الإعدادات» أو اتركه فارغاً."; if (e && e.st === 429) return "تجاوزت حدّ الاستخدام أو رصيد الحساب لدى مزوّد المساعد. حاول لاحقاً."; if (e && e.st >= 500) return "خدمة المساعد مزدحمة الآن، حاول بعد قليل."; return (e && e.msg) || "تعذّر الاتصال بالمساعد. تحقّق من الإنترنت وحاول مرة أخرى."; };
  // translate a set of Arabic texts into one language (plain strings, or HTML for keys listed in html)
  function aiTranslate(texts, lang, html) {
    var keys = Object.keys(texts).filter(function (k) { return texts[k] && (typeof texts[k] === "string" ? texts[k].trim() : texts[k].length); });
    if (!keys.length) return Promise.resolve({});
    var props = {}; keys.forEach(function (k) { props[k] = Array.isArray(texts[k]) ? { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"], additionalProperties: false } } : { type: "string" }; });
    var src = {}; keys.forEach(function (k) { src[k] = texts[k]; });
    return ai(AI_RULES, "Translate the values of this JSON from Arabic into natural, fluent " + { en: "English (US)", ru: "Russian", tr: "Turkish", pt: "Brazilian Portuguese" }[lang] + " for a travel website, for readers searching on Google in that language. Keep the same keys. " + (html && html.length ? "The keys " + html.join(", ") + " contain HTML: translate the text only and keep every tag, href, src and the image order exactly (translate alt text and figcaption). " : "") + "Keep numbers, prices, dates and proper names; transliterate Turkish place names the usual way for that language. Arrows: Arabic ← becomes →.\n\n" + JSON.stringify(src),
      { type: "object", properties: props, required: keys, additionalProperties: false });
  }
  // language switcher for an editor: draw(langBox, current, filled) → buttons; ✓ marks languages that have text
  function langBar(box, cur, filled, onPick) {
    box.innerHTML = '<span class="lb-l">لغة النص:</span>' + LANGS.map(function (l) { return '<button type="button" data-l="' + l[0] + '" class="' + (l[0] === cur ? "on" : "") + '"' + (l[0] !== "ar" ? ' lang="' + l[0] + '"' : "") + ">" + l[1] + (filled(l[0]) ? ' <i aria-label="مكتمل">✓</i>' : "") + "</button>"; }).join("");
    box.onclick = function (e) { var b = e.target.closest("button[data-l]"); if (b) onPick(b.dataset.l); };
  }
  var dirOf = function (l) { return l === "ar" ? "rtl" : "ltr"; };

  /* ---------- blog: write in every language, photos, schedule, SEO check ---------- */
  F.blog = { path: "data/blog.json", list: "posts" }; GEN.push("blog");
  var takenSlugs = []; // built-in articles (from the sitemap) — the panel cannot reuse their links
  fetch("../sitemap.xml", { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (x) { var m, re = /oyatourism\.com\/blog\/([a-z0-9-]+)\//g; while ((m = re.exec(x))) if (takenSlugs.indexOf(m[1]) < 0) takenSlugs.push(m[1]); }).catch(function () {});
  var istNow = function () { var p = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; }); return p.year + "-" + p.month + "-" + p.day + "T" + (p.hour === "24" ? "00" : p.hour) + ":" + p.minute; };
  var whenMs = function (w) { return w ? new Date(w + ":00+03:00").getTime() : 0; };
  var fmtWhen = function (w) { return w ? w.replace("T", " — ") : ""; };
  var BF = ["title", "body", "seoTitle", "description", "excerpt", "coverAlt", "keyword", "faq"]; // fields written per language
  var langOf = function (p, l) { return l === "ar" ? p : ((p.i18n || {})[l] || {}); };
  var hasLang = function (p, l) { var v = langOf(p, l); return !!(v.title && String(v.body || "").replace(/<[^>]+>/g, "").trim()); };
  function postState(p) {
    if (p.status !== "publish") return ["مسودة", "off"];
    if (whenMs(p.publishAt) > Date.now()) return ["مجدول: " + fmtWhen(p.publishAt), "sch"];
    return ["منشور", ""];
  }
  function renderBlog() {
    var list = F.blog.db.posts, box = $("#posts"); if (!box) return;
    box.innerHTML = list.length ? list.map(function (p, i) {
      var st = postState(p), th = p.cover ? (localImg["photos/" + p.cover] || "../assets/img/photos/" + p.cover + "-640.webp") : "";
      return '<div class="cabrow">' + (th ? '<img class="th" src="' + esc(th) + '" alt="">' : '<span class="th ico" aria-hidden="true">✎</span>') +
        "<div><h3>" + esc(p.title || "بدون عنوان") + '<span class="pill' + (st[1] === "off" ? " off" : "") + '"' + (st[1] === "sch" ? ' style="background:#FFF3DC;color:#8A4B00"' : "") + ">" + esc(st[0]) + "</span></h3><p>" +
        esc([p.category, (p.words || 0) + " كلمة", p.slug ? "/blog/" + p.slug + "/" : ""].filter(Boolean).join(" • ")) + '</p><p class="lchips">' + LANGS.map(function (l) { return '<span class="' + (hasLang(p, l[0]) ? "on" : "") + '">' + l[2] + "</span>"; }).join("") + "</p></div>" +
        '<div class="acts">' + (st[0] === "منشور" && p.slug ? '<a class="btn btn--ghost sbtn" href="../blog/' + esc(p.slug) + '/" target="_blank" rel="noopener">عرض</a>' : "") +
        '<button class="btn btn--ghost sbtn" type="button" data-pedit="' + i + '">تعديل</button><button class="btn btn--danger sbtn" type="button" data-pdel="' + i + '">حذف</button></div></div>';
    }).join("") : '<div class="card empty">لا توجد مقالات بعد. اضغط «مقال جديد» لكتابة أول مقال.</div>';
  }
  $("#posts").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.pedit != null) openPost(+b.dataset.pedit);
    if (b.dataset.pdel != null) { var p = F.blog.db.posts[+b.dataset.pdel]; if (confirm("حذف المقال «" + (p.title || "") + "»؟ تختفي صفحاته من الموقع بعد الحفظ.")) { F.blog.db.posts.splice(+b.dataset.pdel, 1); renderBlog(); update(); } }
  });
  $("#addPost").addEventListener("click", function () { openPost(-1); });

  var bi = -1, bp = null, bLang = "ar", aiUndo = null, rte = $("#bBody");
  // stored body uses site paths (assets/…); the editor shows them from the admin folder (../assets/…)
  var CLEAN = { P: [], H2: [], H3: [], STRONG: [], B: [], EM: [], I: [], U: [], UL: [], OL: [], LI: [], BLOCKQUOTE: [], BR: [], A: ["href"], IMG: ["src", "alt", "data-p", "data-up"], FIGURE: [], FIGCAPTION: [], TABLE: [], THEAD: [], TBODY: [], TR: [], TH: [], TD: [] };
  var DROP = /^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|SVG|MATH|TEMPLATE|NOSCRIPT|FORM|INPUT|BUTTON|TEXTAREA|SELECT|LINK|META|BASE)$/;
  function cleanHTML(html) {
    var t = document.createElement("template"); t.innerHTML = String(html || "");
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 8) { node.removeChild(n); return; }
        if (n.nodeType !== 1) return;
        if (DROP.test(n.nodeName)) { node.removeChild(n); return; }
        walk(n);
        var keep = CLEAN[n.nodeName];
        if (!keep) { if (n.nodeName === "DIV") { var p = document.createElement("p"); while (n.firstChild) p.appendChild(n.firstChild); node.replaceChild(p, n); } else { while (n.firstChild) node.insertBefore(n.firstChild, n); node.removeChild(n); } return; }
        [].slice.call(n.attributes).forEach(function (a) {
          var k = a.name.toLowerCase(), v = a.value.trim();
          var ok = keep.indexOf(k) > -1 && !(k === "href" && !/^(https?:\/\/[^\s]+|\.\.\/[\w\/.#-]*)$/i.test(v)) && !(k === "src" && !/^(\.\.\/assets\/|assets\/|blob:|https:\/\/)/.test(v));
          if (!ok) n.removeAttribute(a.name);
        });
        if (n.nodeName === "IMG" && !n.getAttribute("src")) node.removeChild(n);
      });
    })(t.content);
    return t.innerHTML;
  }
  var toEditor = function (h) { return cleanHTML(String(h || "").replace(/src="assets\//g, 'src="../assets/')); };
  function showImgs() { $$("img", rte).forEach(function (im) { var p = (im.getAttribute("src") || "").replace(/^\.\.\//, ""); if (localImg[p]) { im.setAttribute("data-p", p); im.src = localImg[p]; } }); }
  function fromEditor() {
    var c = rte.cloneNode(true);
    $$("img", c).forEach(function (im) { var p = im.getAttribute("data-p"); if (p) im.setAttribute("src", p); im.removeAttribute("data-p"); im.removeAttribute("style"); });
    $$("[style]", c).forEach(function (x) { x.removeAttribute("style"); });
    // top-level text and inline pieces go into paragraphs; editor <div>s become <p>
    var BLK = /^(P|H2|H3|UL|OL|BLOCKQUOTE|FIGURE|TABLE|DIV)$/, cur = null;
    [].slice.call(c.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && BLK.test(n.nodeName)) { cur = null; if (n.nodeName === "DIV") { var np = document.createElement("p"); np.innerHTML = n.innerHTML; c.replaceChild(np, n); } return; }
      if (n.nodeType === 3 && !n.textContent.trim()) { if (cur) cur.appendChild(n); else c.removeChild(n); return; }
      if (n.nodeName === "BR" && !cur) { c.removeChild(n); return; }
      if (!cur) { cur = document.createElement("p"); c.insertBefore(cur, n); }
      cur.appendChild(n);
    });
    $$("p", c).forEach(function (x) { if (!x.textContent.trim() && !x.querySelector("img")) x.parentNode.removeChild(x); });
    return c.innerHTML.replace(/src="\.\.\/assets\//g, 'src="assets/').replace(/&nbsp;/g, " ").trim();
  }
  var wordsOf = function (h) { return String(h || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; };
  // the per-language fields live in the form while that language is open; stash() writes them back
  function stash() {
    if (!bp) return; syncFaq();
    var v = bLang === "ar" ? bp : ((bp.i18n = bp.i18n || {})[bLang] = bp.i18n[bLang] || {});
    v.title = $("#bTitle").value.trim(); v.body = fromEditor(); v.seoTitle = $("#bSeo").value.trim(); v.description = $("#bDesc").value.trim(); v.excerpt = $("#bEx").value.trim();
    v.coverAlt = $("#bCoverAlt").value.trim(); v.keyword = $("#bKey").value.trim(); v.faq = (bp._faq || []).filter(function (f) { return f.q || f.a; });
    if (bLang !== "ar" && !v.title && !wordsOf(v.body)) delete bp.i18n[bLang];
  }
  function showLang(l) {
    bLang = l; var v = langOf(bp, l), d = dirOf(l);
    $("#bTitle").value = v.title || ""; rte.innerHTML = toEditor(v.body); showImgs();
    $("#bSeo").value = v.seoTitle || ""; $("#bDesc").value = v.description || ""; $("#bEx").value = v.excerpt || ""; $("#bCoverAlt").value = v.coverAlt || ""; $("#bKey").value = v.keyword || "";
    bp._faq = clone(v.faq || []); drawFaq();
    ["#bTitle", "#bSeo", "#bDesc", "#bEx", "#bCoverAlt", "#bKey"].forEach(function (s) { $(s).dir = d; }); rte.dir = d; $("#bFaq").dir = d;
    $("#bCopyAr").hidden = l === "ar" || !!wordsOf(v.body) || !wordsOf(bp.body);
    $("#bLangNote").textContent = l === "ar" ? "العربية هي النسخة الأساسية للمقال (مطلوبة للنشر)." : "نسخة " + LNAME[l] + ": تظهر في موقع " + LNAME[l] + " عندما تكتب لها عنواناً ونصاً. اتركها فارغة إن لم تكن جاهزة.";
    drawLangs(); check();
  }
  function drawLangs() { langBar($("#bLangs"), bLang, function (l) { if (l === bLang) return !!($("#bTitle").value.trim() && wordsOf(fromEditor())); return hasLang(bp, l); }, function (l) { if (l === bLang) return; stash(); showLang(l); }); }
  function openPost(i) {
    bi = i; aiUndo = null; $("#aiUndo").hidden = true;
    bp = i < 0 ? { id: "p" + Date.now().toString(36), title: "", slug: "", body: "", category: "دليل السفر", keyword: "", seoTitle: "", description: "", excerpt: "", cover: "", coverAlt: "", faq: [], i18n: {}, status: "draft", publishAt: istNow(), created: today() } : clone(F.blog.db.posts[i]);
    $("#bHead").textContent = i < 0 ? "مقال جديد" : "تعديل المقال";
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}
    $$('input[name="bStatus"]').forEach(function (x) { x.checked = x.value === (bp.status || "draft"); });
    $("#bWhen").value = bp.publishAt || istNow(); $("#bSlug").value = bp.slug || "";
    var cat = $("#bCat"); if (![].some.call(cat.options, function (o) { return o.value === bp.category; })) cat.add(new Option(bp.category, bp.category)); cat.value = bp.category;
    drawCover(); $("#bErr").textContent = ""; aiState();
    $("#bEditor").hidden = false; document.body.style.overflow = "hidden"; $("#bEditor").scrollTop = 0;
    showLang("ar"); $("#bTitle").focus();
  }
  function closePost() { $("#bEditor").hidden = true; document.body.style.overflow = ""; bp = null; }
  $("#bCancel").addEventListener("click", function () { if (bp && JSON.stringify(collect(true)) !== JSON.stringify(bi < 0 ? null : F.blog.db.posts[bi]) && !confirm("إغلاق دون حفظ التعديلات على هذا المقال؟")) return; closePost(); });
  $("#bCopyAr").addEventListener("click", function () { rte.innerHTML = toEditor(bp.body); showImgs(); this.hidden = true; rte.focus(); check(); toast("نُسخ النص العربي مع الصور — اكتب الترجمة مكانه."); });
  // FAQ rows (for the open language)
  function drawFaq() {
    $("#bFaq").innerHTML = (bp._faq || []).map(function (f, i) { return '<div class="faqrow"><div><input type="text" data-fq="' + i + '" value="' + esc(f.q) + '" placeholder="' + (bLang === "ar" ? "السؤال" : "Question") + '"><textarea data-fa="' + i + '" placeholder="' + (bLang === "ar" ? "الجواب" : "Answer") + '">' + esc(f.a) + '</textarea></div><button class="btn btn--danger sbtn" type="button" data-frm="' + i + '" aria-label="حذف السؤال">✕</button></div>'; }).join("");
    $$("#bFaq input, #bFaq textarea").forEach(function (x) { x.dir = dirOf(bLang); });
  }
  $("#bFaqAdd").addEventListener("click", function () { syncFaq(); bp._faq.push({ q: "", a: "" }); drawFaq(); });
  $("#bFaq").addEventListener("click", function (e) { var b = e.target.closest("[data-frm]"); if (b) { syncFaq(); bp._faq.splice(+b.dataset.frm, 1); drawFaq(); check(); } });
  function syncFaq() { bp._faq = (bp._faq || []).map(function (f, i) { var q = $('[data-fq="' + i + '"]'), a = $('[data-fa="' + i + '"]'); return { q: q ? q.value.trim() : f.q, a: a ? a.value.trim() : f.a }; }); }
  // cover (shared by every language): full size + 1024 + 640 WebP in assets/img/photos and a 1200×630 share image
  function drawCover() {
    var k = bp.cover, src = k ? (localImg["photos/" + k] || "../assets/img/photos/" + k + "-640.webp") : "";
    $("#bCover").innerHTML = k ? '<div class="ph' + (k.indexOf("uploading") === 0 ? " up" : "") + '"><img src="' + esc(src) + '" alt=""><button class="x" type="button" id="bCoverX" aria-label="حذف الصورة">✕</button></div>' : '<label class="addph">＋ صورة الغلاف<input type="file" accept="image/*" id="bCoverF"></label>';
  }
  $("#bCover").addEventListener("click", function (e) { if (e.target.id === "bCoverX") { bp.cover = ""; drawCover(); check(); } });
  $("#bCover").addEventListener("change", function (e) { if (e.target.id === "bCoverF" && e.target.files[0]) uploadCover(e.target.files[0]); });
  function resized(img, maxW, maxH, crop, type, q) {
    var c = document.createElement("canvas"), sw = img.width, sh = img.height, sx = 0, sy = 0;
    if (crop) { var r = maxW / maxH; if (sw / sh > r) { sx = (sw - sh * r) / 2; sw = sh * r; } else { sy = (sh - sw / r) / 2; sh = sw / r; } c.width = maxW; c.height = maxH; }
    else { var s = Math.min(1, maxW / sw); c.width = Math.round(sw * s); c.height = Math.round(sh * s); }
    c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    return new Promise(function (res) { c.toBlob(function (b) { b.arrayBuffer().then(function (x) { res(new Uint8Array(x)); }); }, type, q); });
  }
  var webpOK = (function () { var c = document.createElement("canvas"); c.width = c.height = 1; return c.toDataURL("image/webp").indexOf("data:image/webp") === 0; })();
  function putFile(path, bytes, msg) { return gh("PUT", path, { message: msg, content: b64bytes(bytes), branch: BRANCH }).then(function (r) { if (!r.ok) throw r.status; }); }
  function loadImg(file) { return new Promise(function (res, rej) { var u = URL.createObjectURL(file), im = new Image(); im.onload = function () { res([im, u]); }; im.onerror = function () { rej("img"); }; im.src = u; }); }
  function uploadCover(file) {
    if (!webpOK) { toast("هذا المتصفح لا يدعم حفظ الصور بصيغة WebP. استخدم Chrome أو Edge أو Firefox.", "bad"); return; }
    var post = bp, key = "ob-" + post.id + "-" + Date.now().toString(36); post.cover = "uploading"; drawCover();
    loadImg(file).then(function (x) {
      var im = x[0], u = x[1], msg = "صورة غلاف مقال: " + (post.title || $("#bTitle").value.trim() || post.id);
      localImg["photos/" + key] = u;
      return Promise.all([resized(im, 1536, 0, false, "image/webp", 0.82), resized(im, 1024, 0, false, "image/webp", 0.8), resized(im, 640, 0, false, "image/webp", 0.78), resized(im, 1200, 630, true, "image/jpeg", 0.84)])
        .then(function (b) { return putFile("assets/img/photos/" + key + ".webp", b[0], msg).then(function () { return Promise.all([putFile("assets/img/photos/" + key + "-1024.webp", b[1], msg), putFile("assets/img/photos/" + key + "-640.webp", b[2], msg), putFile("assets/img/og/" + key + ".jpg", b[3], msg)]); }); })
        .then(function () { post.cover = key; if (bp === post) { drawCover(); check(); } });
    }).catch(function (st) { post.cover = ""; if (bp === post) drawCover(); toast(st === "img" ? "هذا الملف ليس صورة." : "لم تُرفع الصورة: " + (typeof st === "number" ? why(st) : "حاول مرة أخرى."), "bad"); });
  }
  // images inside the article: one WebP (max 1400px) in assets/img/blog, inserted as a figure with its caption
  var savedRange = null;
  rte.addEventListener("keyup", keepRange); rte.addEventListener("mouseup", keepRange); rte.addEventListener("input", function () { keepRange(); check(); });
  function keepRange() { var s = getSelection(); if (s.rangeCount && rte.contains(s.anchorNode)) savedRange = s.getRangeAt(0).cloneRange(); }
  function restoreRange() { rte.focus(); if (savedRange) { var s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); } }
  $("#bImg").addEventListener("change", function (e) {
    var file = e.target.files[0]; e.target.value = ""; if (!file) return;
    var alt = prompt("اكتب وصفاً قصيراً للصورة (يظهر تحتها ويفيد محركات البحث):", "") || "";
    var post = bp, path = "assets/img/blog/" + post.id + "-" + Date.now().toString(36) + ".webp";
    loadImg(file).then(function (x) {
      localImg[path] = x[1];
      restoreRange();
      document.execCommand("insertHTML", false, '<figure><img src="' + x[1] + '" data-p="' + path + '" data-up="1" alt="' + esc(alt) + '">' + (alt ? "<figcaption>" + esc(alt) + "</figcaption>" : "") + "</figure><p><br></p>");
      return resized(x[0], 1400, 0, false, "image/webp", 0.8).then(function (b) { return putFile(path, b, "صورة في مقال: " + (post.title || post.id)); })
        .then(function () { $$('img[data-p="' + path + '"]', rte).forEach(function (im) { im.removeAttribute("data-up"); }); check(); });
    }).catch(function (st) { $$('img[data-p="' + path + '"]', rte).forEach(function (im) { var f = im.closest("figure"); (f || im).parentNode.removeChild(f || im); }); toast(st === "img" ? "هذا الملف ليس صورة." : "لم تُرفع الصورة: " + (typeof st === "number" ? why(st) : "حاول مرة أخرى."), "bad"); });
  });
  // toolbar
  $(".rte-bar").addEventListener("mousedown", function (e) { if (e.target.closest("button")) e.preventDefault(); });
  $(".rte-bar").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-cmd]"); if (!b) return; var c = b.dataset.cmd; restoreRange();
    if (c === "h2" || c === "h3" || c === "p") document.execCommand("formatBlock", false, c);
    if (c === "quote") document.execCommand("formatBlock", false, "blockquote");
    if (c === "bold") document.execCommand("bold");
    if (c === "ul") document.execCommand("insertUnorderedList");
    if (c === "ol") document.execCommand("insertOrderedList");
    if (c === "clear") { document.execCommand("removeFormat"); document.execCommand("formatBlock", false, "p"); }
    if (c === "link") { var u = prompt("الصق الرابط: صفحة من موقعنا (مثل https://oyatourism.com/hotels/istanbul/) أو موقع آخر", "https://"); if (u && /^https?:\/\/\S+$/.test(u)) document.execCommand("createLink", false, u); }
    keepRange(); check();
  });
  // paste as clean text (no fonts or colours from Word / websites); blank lines become paragraphs
  rte.addEventListener("paste", function (e) {
    var t = (e.clipboardData || window.clipboardData).getData("text/plain"); if (!t) return; e.preventDefault();
    var html = t.replace(/\r/g, "").split(/\n{2,}/).map(function (p) { return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>"; }).join("");
    document.execCommand("insertHTML", false, html); check();
  });
  ["#bTitle", "#bKey", "#bSlug", "#bSeo", "#bDesc", "#bEx", "#bCoverAlt", "#bWhen"].forEach(function (s) { $(s).addEventListener("input", check); });
  $$('input[name="bStatus"]').forEach(function (x) { x.addEventListener("change", check); });
  $("#bFaq").addEventListener("input", check);

  function collect(soft) {
    if (!bp) return null; stash();
    var o = clone(bp); delete o._faq;
    o.words = wordsOf(o.body);
    o.status = ($('input[name="bStatus"]:checked') || {}).value || "draft"; o.publishAt = $("#bWhen").value || istNow();
    o.category = $("#bCat").value; o.slug = $("#bSlug").value.trim().toLowerCase();
    if (o.i18n && !Object.keys(o.i18n).length) delete o.i18n;
    if (!soft) o.updated = today();
    return o;
  }
  /* live SEO check for the open language (no assistant needed) */
  function check() {
    if (!bp) return; syncFaq();
    var title = $("#bTitle").value.trim(), body = fromEditor(), k = $("#bKey").value.trim(), seoT = $("#bSeo").value.trim() || title, desc = $("#bDesc").value.trim(), alt = $("#bCoverAlt").value.trim();
    var words = wordsOf(body), firstP = (/<p>([\s\S]*?)<\/p>/.exec(body) || [, ""])[1], slug = $("#bSlug").value.trim().toLowerCase(), faq = (bp._faq || []).filter(function (f) { return f.q && f.a; });
    var h2 = (body.match(/<h2/g) || []).length, imgs = body.match(/<img[^>]*>/g) || [], noAlt = imgs.filter(function (x) { return !/alt="[^"]+"/.test(x); }).length;
    var has = function (s) { return k && s && s.toLowerCase().indexOf(k.toLowerCase()) > -1; };
    var internal = /href="(https?:\/\/(www\.)?oyatourism\.com\/|\.\.\/|\/)/.test(body);
    var slugOk = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 80, slugFree = takenSlugs.indexOf(slug) < 0 && !F.blog.db.posts.some(function (p, i) { return i !== bi && p.slug === slug; });
    var rows = [
      [seoT.length >= 20 && seoT.length <= 65, "عنوان Google بين 20 و65 حرفاً (الآن " + seoT.length + ")"],
      [desc.length >= 110 && desc.length <= 165, "الوصف بين 110 و165 حرفاً (الآن " + desc.length + ")"],
      [slugOk && slugFree, !slug ? "اكتب رابطاً بالإنجليزية" : !slugOk ? "الرابط بأحرف إنجليزية صغيرة وأرقام وشرطات فقط" : !slugFree ? "هذا الرابط مستخدم لمقال آخر" : "الرابط صالح (واحد لكل اللغات)"],
      [!!k, "اختر كلمة مفتاحية يبحث عنها الزبون بهذه اللغة"],
      [has(seoT), "الكلمة المفتاحية في العنوان"],
      [has(desc), "الكلمة المفتاحية في الوصف"],
      [has(firstP), "الكلمة المفتاحية في الفقرة الأولى"],
      [k && (body.match(/<h2[^>]*>[\s\S]*?<\/h2>/g) || []).some(function (h) { return has(h); }), "الكلمة المفتاحية في أحد العناوين"],
      [words >= 600, "طول المقال 600 كلمة أو أكثر (الآن " + words + ")"],
      [h2 >= 2, "عنوانان أو أكثر داخل المقال (الآن " + h2 + ")"],
      [!!bp.cover && bp.cover !== "uploading" && !!alt, "صورة غلاف مع وصفها بهذه اللغة"],
      [imgs.length > 0 && !noAlt, imgs.length ? (noAlt ? noAlt + " صورة بدون وصف" : "كل الصور لها وصف") : "أضف صورة واحدة على الأقل داخل المقال"],
      [internal, "رابط واحد على الأقل لصفحة من موقعنا (فندق، برنامج، تأشيرة…)"],
      [faq.length >= 2, "سؤالان شائعان أو أكثر في آخر المقال"]
    ];
    var ok = rows.filter(function (r) { return r[0]; }).length, pct = Math.round(ok / rows.length * 100), col = pct >= 80 ? "var(--ok)" : pct >= 50 ? "#D98E04" : "var(--bad)";
    $("#bSeoCheck").innerHTML = '<div class="bar"><i style="width:' + pct + "%;background:" + col + '"></i></div><b style="color:' + col + '">جاهزية نسخة ' + LNAME[bLang] + " لمحركات البحث: " + pct + "%</b>" + rows.map(function (r) { return '<p class="' + (r[0] ? "y" : "n") + '">' + (r[0] ? "✓" : "○") + " <span>" + esc(r[1]) + "</span></p>"; }).join("");
    $("#bCount").textContent = words + " كلمة • " + Math.max(1, Math.round(words / 200)) + " دقائق قراءة";
    $("#bSeoN").textContent = ($("#bSeo").value.trim() ? $("#bSeo").value.trim().length + " حرفاً" : "فارغ = يُستخدم عنوان المقال");
    $("#bDescN").textContent = desc.length + " / 160 حرفاً"; $("#bDescN").className = "bnote " + (desc.length >= 110 && desc.length <= 165 ? "ok" : "bad");
    var st = ($('input[name="bStatus"]:checked') || {}).value, w = $("#bWhenNote"), when = $("#bWhen").value;
    if (st !== "publish") { w.textContent = "مسودة: لا تظهر على الموقع."; w.className = "bnote"; }
    else if (whenMs(when) > Date.now() + 60000) { w.textContent = "مجدول: يُنشر تلقائياً في " + fmtWhen(when) + " (خلال ساعة من الموعد)."; w.className = "bnote ok"; }
    else { w.textContent = "يُنشر بعد الحفظ خلال دقائق."; w.className = "bnote ok"; }
    var lb = $("#bLangs .on i"); if (!!(title && words) !== !!lb) drawLangs();
  }
  $("#bOk").addEventListener("click", function () {
    var o = collect(false), err = "";
    if (!o.title) err = "اكتب عنوان المقال بالعربية.";
    else if (/data-up="1"/.test(rte.innerHTML) || o.cover === "uploading") err = "انتظر حتى ينتهي رفع الصور.";
    else if (o.status === "publish") {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(o.slug) || o.slug.length < 3) err = "قبل النشر اكتب رابط المقال بالإنجليزية (مثل uzungol-winter-guide)، أو احفظه كمسودة.";
      else if (takenSlugs.indexOf(o.slug) > -1 || F.blog.db.posts.some(function (p, i) { return i !== bi && p.slug === o.slug; })) err = "هذا الرابط مستخدم لمقال آخر. اختر رابطاً مختلفاً.";
      else if (!o.description) err = "قبل النشر اكتب وصف Google للمقال بالعربية.";
      else if (o.words < 120) err = "النص العربي قصير جداً للنشر. أكمل كتابته أو احفظه كمسودة.";
      else { var half = LANGS.slice(1).filter(function (l) { var v = langOf(o, l[0]); return !!v.title !== !!wordsOf(v.body); }); if (half.length) err = "نسخة " + LNAME[half[0][0]] + " ناقصة: اكتب لها العنوان والنص معاً، أو امسح ما كتبته فيها."; }
    }
    if (err) { $("#bErr").textContent = err; return; }
    if (o.cover === "uploading") o.cover = "";
    if (bi < 0) F.blog.db.posts.unshift(o); else F.blog.db.posts[bi] = o;
    closePost(); renderBlog(); update();
    toast("تم حفظ المقال في القائمة — اضغط «حفظ التغييرات» لنشره على الموقع.");
  });

  /* assistant tools in the article editor */
  function aiState() { $("#aiState").textContent = aiReady() ? "المساعد: " + AIP[aiProv()].name + " — يعمل على اللغة المفتوحة، وأنت تراجع قبل الحفظ. لا يضيف أسعاراً أو معلومات من عنده." : "لتفعيله اختر ChatGPT أو Gemini وأضف المفتاح من تبويب «الإعدادات»."; }
  $(".bbox.ai").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ai]"); if (!b || !bp) return;
    var box = this, kind = b.dataset.ai, label = b.textContent; stash();
    var v = langOf(bp, bLang), words = wordsOf(v.body), LN = { ar: "Arabic (Modern Standard, warm and practical)", en: "English", ru: "Russian", tr: "Turkish", pt: "Brazilian Portuguese" }[bLang];
    if ((kind === "polish" || kind === "seo") && words < 40) { toast("اكتب المقال أولاً (أو استخدم «اكتب مسودة من نقاطي»).", "bad"); return; }
    if (kind === "draft" && !$("#aiNotes").value.trim()) { toast("اكتب نقاطك ومعلوماتك أولاً.", "bad"); return; }
    if (kind === "translate" && !hasLang(bp, "ar")) { toast("اكتب العنوان والنص العربي أولاً، ثم ترجمه.", "bad"); return; }
    if (kind === "translate" && LANGS.slice(1).some(function (l) { return hasLang(bp, l[0]); }) && !confirm("ستُستبدل الترجمات الموجودة بترجمة جديدة من النص العربي. متابعة؟")) return;
    var undo = { i18n: clone(bp.i18n || {}), ar: {}, lang: bLang }; BF.forEach(function (f) { undo.ar[f] = clone(bp[f]); });
    var job;
    if (kind === "polish") job = ai(AI_RULES, "Rewrite this travel article in " + LN + " so it reads smoothly and pleasantly on a phone: short paragraphs (2–4 sentences), natural transitions, an opening that draws the reader in and a closing that gently invites them to contact OYA. Keep every piece of information, number, link and image, and keep the h2/h3 structure (you may improve the wording). Use the keyword «" + (v.keyword || "") + "» naturally in the opening and in one heading, without stuffing. Do not remove or add information.\n\nTitle: " + v.title + "\n\nArticle (HTML):\n" + v.body,
      { type: "object", properties: { html: { type: "string" } }, required: ["html"], additionalProperties: false });
    if (kind === "draft") job = ai(AI_RULES, "Write a draft article in " + LN + " for the OYA Tourism blog" + (v.title ? " titled «" + v.title + "»" : "") + (v.keyword ? ", keyword «" + v.keyword + "»" : "") + ". Use only the information in the notes below; organise it into an introduction, sections with h2 (h3 when needed) and a closing that invites readers to contact OYA. Where an important detail is missing (price, date, duration…), do not invent it: write [ADD: …] for the owner to fill in.\n\nNotes:\n" + $("#aiNotes").value.trim(),
      { type: "object", properties: { html: { type: "string" }, title: { type: "string" } }, required: ["html", "title"], additionalProperties: false });
    if (kind === "seo") job = ai(AI_RULES, "Read this article and suggest, in " + LN + " and only from its content: seoTitle (40–60 characters, keyword near the start), description (130–160 characters), slug (short, English, lowercase words with hyphens, 3–6 words), keyword (the best search phrase in " + LN + "), excerpt (two sentences for the article card), faq (3 questions customers really ask, answered only from the article).\n\nTitle: " + v.title + "\nCurrent keyword: " + (v.keyword || "—") + "\n\nArticle:\n" + v.body.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 30000),
      { type: "object", properties: { seoTitle: { type: "string" }, description: { type: "string" }, slug: { type: "string" }, keyword: { type: "string" }, excerpt: { type: "string" }, faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"], additionalProperties: false } } }, required: ["seoTitle", "description", "slug", "keyword", "excerpt", "faq"], additionalProperties: false });
    if (kind === "translate") {
      var src = {}; BF.forEach(function (f) { src[f] = bp[f]; }); src.body = bp.body;
      var n = 0; b.textContent = "⏳ جارٍ الترجمة… 0 / 4";
      job = Promise.all(["en", "ru", "tr", "pt"].map(function (l) { return aiTranslate(src, l, ["body"]).then(function (r) { n++; b.textContent = "⏳ جارٍ الترجمة… " + n + " / 4"; return [l, r]; }); }));
    }
    box.classList.add("busy"); if (kind !== "translate") b.textContent = "⏳ يعمل المساعد… (قد يأخذ دقيقة)";
    job.then(function (r) {
      if (!bp) return; aiUndo = undo;
      if (kind === "translate") { bp.i18n = bp.i18n || {}; r.forEach(function (x) { var t = x[1]; bp.i18n[x[0]] = { title: t.title || "", body: t.body || "", seoTitle: t.seoTitle || "", description: t.description || "", excerpt: t.excerpt || "", coverAlt: t.coverAlt || "", keyword: t.keyword || "", faq: t.faq || [] }; }); showLang(bLang); toast("تمت الترجمة إلى الإنجليزية والروسية والتركية والبرتغالية ✓ — افتح كل لغة وراجعها قبل الحفظ.", "ok"); }
      else {
        if (r.html) { rte.innerHTML = toEditor(r.html); showImgs(); }
        if (kind === "draft" && !$("#bTitle").value.trim() && r.title) $("#bTitle").value = r.title;
        if (kind === "seo") {
          $("#bSeo").value = r.seoTitle || ""; $("#bDesc").value = r.description || ""; $("#bEx").value = r.excerpt || "";
          if (!$("#bKey").value.trim()) $("#bKey").value = r.keyword || ""; else if (r.keyword && r.keyword !== $("#bKey").value.trim()) toast("اقترح المساعد كلمة مفتاحية: «" + r.keyword + "» — غيّرها بنفسك إن أعجبتك.");
          var sl = String(r.slug || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""); if (!$("#bSlug").value.trim() && sl) $("#bSlug").value = sl;
          if (Array.isArray(r.faq) && r.faq.length) { syncFaq(); bp._faq = bp._faq.filter(function (f) { return f.q && f.a; }).concat(r.faq); drawFaq(); }
        }
        check(); toast("جاهز ✓ — راجع النص قبل الحفظ.", "ok");
      }
      $("#aiUndo").hidden = false;
    }).catch(function (e) { toast(aiErr(e), "bad"); }).then(function () { box.classList.remove("busy"); b.textContent = label; });
  });
  $("#aiUndo").addEventListener("click", function () {
    if (!aiUndo || !bp) return; var u = aiUndo;
    BF.forEach(function (f) { bp[f] = u.ar[f]; }); bp.i18n = u.i18n; aiUndo = null; $("#aiUndo").hidden = true; showLang(u.lang);
  });

  /* assistant: translate the generic editor's texts and the cabin description */
  $("#gAi").addEventListener("click", function () {
    var b = this, label = b.textContent; gStash();
    var src = {}; trFields().forEach(function (f) { if (go[f.k]) src[f.k] = go[f.k]; });
    if (!Object.keys(src).length) { toast("اكتب النصوص بالعربية أولاً.", "bad"); return; }
    b.disabled = true; b.textContent = "⏳ جارٍ الترجمة…";
    Promise.all(["en", "ru", "tr", "pt"].map(function (l) { return aiTranslate(src, l).then(function (r) { return [l, r]; }); }))
      .then(function (rs) { go.i18n = go.i18n || {}; rs.forEach(function (x) { var cur = go.i18n[x[0]] = go.i18n[x[0]] || {}; Object.keys(x[1]).forEach(function (k) { if (!cur[k]) cur[k] = x[1][k]; }); }); gShowLang(gLang); toast("تمت الترجمة ✓ — راجع كل لغة قبل الحفظ.", "ok"); })
      .catch(function (e) { toast(aiErr(e), "bad"); }).then(function () { b.disabled = false; b.textContent = label; });
  });
  $("#cAi").addEventListener("click", function () {
    var b = this, label = b.textContent, ar = $("#cNote").value.trim();
    if (!ar) { toast("اكتب الوصف بالعربية أولاً.", "bad"); return; }
    b.disabled = true; b.textContent = "⏳ جارٍ الترجمة…";
    Promise.all(["en", "ru", "tr", "pt"].filter(function (l) { return !$("#cNote_" + l).value.trim(); }).map(function (l) { return aiTranslate({ note: ar }, l).then(function (r) { $("#cNote_" + l).value = r.note || ""; }); }))
      .then(function () { toast("تمت الترجمة ✓ — راجعها قبل الحفظ.", "ok"); }).catch(function (e) { toast(aiErr(e), "bad"); }).then(function () { b.disabled = false; b.textContent = label; });
  });

  /* ---------- changes + save ---------- */
  function priceDirty() {
    if (!db || !F.prices.orig) return [];
    var o = F.prices.orig, out = [];
    Object.keys(db.superCup.matches).forEach(function (id) { CATS.forEach(function (c) { if (db.superCup.matches[id][c[0]] !== o.superCup.matches[id][c[0]]) out.push("sc." + id + "." + c[0]); }); });
    db.packages.forEach(function (p, i) { if (p.priceFrom !== o.packages[i].priceFrom) out.push("pk." + i); });
    if (JSON.stringify(db.currency) !== JSON.stringify(o.currency)) out.push("currency");
    return out;
  }
  function cabDirty() { return F.cabins.db && JSON.stringify(F.cabins.db.cabins) !== JSON.stringify(F.cabins.orig.cabins); }
  function genDirty(k) { return F[k].db && JSON.stringify(F[k].db[F[k].list]) !== JSON.stringify(F[k].orig[F[k].list]); }
  function dirtyCount() { return priceDirty().length + (cabDirty() ? 1 : 0) + GEN.filter(genDirty).length; }
  function markChanged() { var d = priceDirty(); $$("input[data-key]").forEach(function (el) { el.parentNode.classList.toggle("changed", d.indexOf(el.dataset.key) > -1); }); }
  function update() {
    var n = priceDirty().length, c = cabDirty(), parts = [];
    if (n) parts.push(n === 1 ? "تغيير واحد في الأسعار" : n === 2 ? "تغييران في الأسعار" : n + (n <= 10 ? " تغييرات في الأسعار" : " تغييراً في الأسعار"));
    if (c) parts.push("تعديلات على الأكواخ");
    var GL = { events: "المباريات", hotels: "الفنادق", flights: "الطيران", blog: "المدونة" }, g = GEN.filter(genDirty);
    g.forEach(function (k) { parts.push("تعديلات على " + GL[k]); });
    $("#bar").classList.toggle("on", !!(n || c || g.length));
    $("#count").firstChild.nodeValue = parts.length ? parts.join(" + ") + " — غير محفوظة" : "لا توجد تغييرات";
    markChanged();
  }
  $("#undo").addEventListener("click", function () { F.prices.db = clone(F.prices.orig); F.cabins.db = clone(F.cabins.orig); GEN.forEach(function (k) { F[k].db = clone(F[k].orig); }); db = F.prices.db; render(); });
  window.addEventListener("beforeunload", function (e) { if (dirtyCount()) { e.preventDefault(); e.returnValue = ""; } });

  function put(k, msg) {
    var f = F[k], body = { message: msg, content: b64enc(JSON.stringify(f.db, null, 2) + "\n"), branch: BRANCH };
    if (f.sha) body.sha = f.sha;
    return gh("PUT", f.path, body).then(function (r) {
      if (!r.ok) throw r.status;
      return r.json().then(function (j) { f.sha = j.content.sha; f.orig = clone(f.db); });
    });
  }
  $("#save").addEventListener("click", function () {
    var btn = this, n = priceDirty().length, c = cabDirty(), chain = Promise.resolve();
    btn.disabled = true; btn.textContent = "جارٍ الحفظ…";
    if (n) { db.updated = today(); chain = chain.then(function () { return put("prices", "تحديث الأسعار من لوحة التحكم (" + n + " " + (n === 1 ? "تغيير" : "تغييرات") + ")"); }); }
    if (c) { F.cabins.db.updated = today(); chain = chain.then(function () { return put("cabins", "تحديث الأكواخ من لوحة التحكم (" + F.cabins.db.cabins.length + " كوخ)"); }); }
    GEN.filter(genDirty).forEach(function (k) { F[k].db.updated = today(); chain = chain.then(function () { return put(k, "تحديث " + { events: "المباريات", hotels: "الفنادق", flights: "وجهات الطيران", blog: "المدونة" }[k] + " من لوحة التحكم"); }); });
    chain.then(function () {
      btn.disabled = false; btn.textContent = "حفظ التغييرات";
      $("#upd").textContent = "آخر تحديث للأسعار: " + (db.updated || "—"); update(); renderCabs(); GEN.forEach(renderGen); renderBlog();
      toast("تم الحفظ ✓ — تظهر التغييرات على الموقع خلال 2–5 دقائق.", "ok");
    }).catch(function (st) {
      btn.disabled = false; btn.textContent = "حفظ التغييرات"; update();
      toast(typeof st === "number" ? why(st) : "تعذّر الاتصال. حاول مرة أخرى.", "bad");
    });
  });

  /* ---------- start ---------- */
  token = getTok();
  if (token) { $("#app").hidden = false; load(); } else showLogin();
})();
