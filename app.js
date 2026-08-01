const STORE_KEY = "openlearn.state.v1";
const THEME_KEY = "openlearn.theme";
const TOKEN_URL =
  "https://github.com/settings/tokens/new?scopes=repo&description=OpenLearn";
const GITHUB_API = "https://api.github.com";
const MAX_COURSES_PER_USER = 5;
const MAX_LESSONS_PER_COURSE = 50;

const sampleCourses = [
  {
    id: "github-ile-portfolyo",
    title: "GitHub ile Portfolyo",
    description:
      "Fork, commit, branch ve pull request akışını kısa etkileşimlerle öğrenin.",
    bannerUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "",
    level: "Başlangıç",
    owner: "openlearn",
    updatedAt: "2026-07-22",
    external: false,
    lessons: [
      {
        title: "Ders 1: Repository Mantığı",
        mediaType: "video",
        mediaUrl: "https://www.youtube.com/embed/RGOj5yH7evk",
        body:
          "Repository bir proje klasörü ve geçmiş defteridir. Her commit, öğrenme yolculuğundaki küçük ve geri alınabilir bir kayıttır.\n\nBu derste ana hedef: yeni bir repo açmak, README yazmak ve ilk commit'i göndermek.",
        quiz: {
          question: "Commit neyi temsil eder?",
          options: [
            "Projedeki bir değişiklik kaydını",
            "Sadece GitHub profil fotoğrafını",
            "Silinmiş dosyaları kalıcı yok etmeyi",
          ],
          answer: 0,
        },
      },
      {
        title: "Ders 2: Pull Request",
        mediaType: "url",
        mediaUrl: "https://docs.github.com/en/pull-requests",
        body:
          "Pull request, bir değişikliği tartışmaya ve gözden geçirmeye açar. Kurs üretirken de aynı yaklaşım işe yarar: içerik küçük parçalara ayrılır, sonra birlikte iyileştirilir.",
        quiz: {
          question: "Pull request ne zaman kullanılır?",
          options: [
            "Değişiklikleri inceletmek ve birleştirmek için",
            "Sadece video yüklemek için",
            "Şifre değiştirmek için",
          ],
          answer: 0,
        },
      },
    ],
  },
  {
    id: "javascript-temelleri",
    title: "JavaScript Temelleri",
    description:
      "Değişkenler, fonksiyonlar ve DOM ile küçük tarayıcı deneyleri yapın.",
    bannerUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    logoUrl: "",
    level: "Orta",
    owner: "openlearn",
    updatedAt: "2026-07-18",
    external: false,
    lessons: [
      {
        title: "Ders 1: Değerler",
        mediaType: "none",
        mediaUrl: "",
        body:
          "JavaScript'te değerler string, number, boolean, object ve daha fazlası olabilir. Küçük örneklerle başlayıp ekranda sonucu görmeye odaklanın.",
        quiz: {
          question: "Hangi ifade bir string değeridir?",
          options: ["\"OpenLearn\"", "42", "true"],
          answer: 0,
        },
      },
      {
        title: "Ders 2: Fonksiyonlar",
        mediaType: "none",
        mediaUrl: "",
        body:
          "Fonksiyonlar, tekrar eden davranışları isimlendirme yoludur. Parametre alabilir, değer döndürebilir ve kullanıcı etkileşimlerine bağlanabilir.",
        quiz: {
          question: "Fonksiyonların temel yararı nedir?",
          options: [
            "Tekrar eden davranışı yeniden kullanmak",
            "CSS dosyalarını silmek",
            "Tarayıcıyı kapatmak",
          ],
          answer: 0,
        },
      },
    ],
  },
];

const state = loadState();
const app = document.querySelector("#app");
const authButton = document.querySelector("#authButton");
const themeToggle = document.querySelector("#themeToggle");

init();

function init() {
  document.documentElement.dataset.theme =
    localStorage.getItem(THEME_KEY) || "light";
  themeToggle.addEventListener("click", toggleTheme);
  authButton.addEventListener("click", () => renderAuthModal());
  window.addEventListener("hashchange", render);
  updateAuthButton();
  render();
}

function loadState() {
  const fallback = {
    auth: null,
    github: {
      owner: "",
      repo: "openlearn-courses",
      branch: "main",
      path: "courses.json",
    },
    courses: sampleCourses,
  };

  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    return normalizeState({ ...fallback, ...stored });
  } catch {
    return normalizeState(fallback);
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
}

function route() {
  const [path, query = ""] = location.hash.replace(/^#\/?/, "").split("?");
  const parts = path.split("/").filter(Boolean);
  return { parts, params: new URLSearchParams(query) };
}

function render() {
  const { parts, params } = route();
  setActiveNav(parts[0] || "home");

  if (parts[0] === "course") {
    renderCourse(parts[1], Number(params.get("lesson") || 0));
  } else if (parts[0] === "studio") {
    renderStudio();
  } else {
    renderHome();
  }

  app.focus({ preventScroll: true });
}

function setActiveNav(key) {
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.routeLink === key);
  });
}

function updateAuthButton() {
  authButton.textContent = state.auth?.login
    ? `@${state.auth.login}`
    : "GitHub ile giriş";
}

function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <h1>OpenLearn</h1>
        <p>GitHub hesabınla kurs oluştur, herkes hesap açmadan okusun. Sade, sunucusuz.</p>
        <div class="actions">
          <a class="button" href="#/studio">Kurs oluştur</a>
          <button class="button ghost" id="syncPublic" type="button">GitHub'dan yenile</button>
        </div>
      </div>
    </section>

    <section class="catalog">
      <div class="toolbar">
        <div class="search">
          <input id="searchInput" type="search" placeholder="Kurs ara..." autocomplete="off" />
        </div>
        <select id="levelFilter" aria-label="Seviye filtresi">
          <option value="">Tüm seviyeler</option>
          <option>Başlangıç</option>
          <option>Orta</option>
          <option>İleri</option>
        </select>
        <span class="muted small" id="courseCount"></span>
      </div>
      <div class="course-grid" id="courseGrid"></div>
    </section>
  `;

  const searchInput = document.querySelector("#searchInput");
  const levelFilter = document.querySelector("#levelFilter");
  const syncPublic = document.querySelector("#syncPublic");

  searchInput.addEventListener("input", paintCourseGrid);
  levelFilter.addEventListener("change", paintCourseGrid);
  syncPublic.addEventListener("click", fetchCoursesFromGitHub);
  paintCourseGrid();
}

function paintCourseGrid() {
  const grid = document.querySelector("#courseGrid");
  const count = document.querySelector("#courseCount");
  const q = document.querySelector("#searchInput")?.value.trim().toLowerCase() || "";
  const level = document.querySelector("#levelFilter")?.value || "";
  const courses = state.courses.filter((course) => {
    const haystack = `${course.title} ${course.description} ${course.owner}`.toLowerCase();
    return (!q || haystack.includes(q)) && (!level || course.level === level);
  });

  count.textContent = `${courses.length} kurs`;
  grid.innerHTML = "";

  if (!courses.length) {
    grid.innerHTML = `<div class="empty">Aramana uyan kurs bulunamadı.</div>`;
    return;
  }

  const template = document.querySelector("#courseCardTemplate");
  courses.forEach((course) => {
    const card = template.content.cloneNode(true);
    const banner = card.querySelector(".course-card-banner");
    const logo = card.querySelector(".course-logo");
    banner.style.backgroundImage = course.bannerUrl
      ? `url("${escapeCssUrl(course.bannerUrl)}")`
      : "";
    logo.textContent = course.logoUrl ? "" : getInitials(course.title);
    if (course.logoUrl) {
      logo.style.backgroundImage = `url("${escapeCssUrl(course.logoUrl)}")`;
    }
    card.querySelector(".pill").textContent = course.level || "Genel";
    card.querySelector(".small").textContent = course.owner || "OpenLearn";
    card.querySelector("h3").textContent = course.title;
    card.querySelector("p").textContent = course.description;
    card.querySelector(".lesson-count").textContent = `${course.lessons.length} ders`;
    card.querySelector("a").href = `#/course/${encodeURIComponent(course.id)}?lesson=0`;
    grid.append(card);
  });
}

function renderCourse(id, lessonIndex) {
  const course = state.courses.find((item) => item.id === id);
  if (!course) {
    app.innerHTML = `<div class="empty">Kurs bulunamadı.</div>`;
    return;
  }

  if (!course.lessons.length) {
    app.innerHTML = `
      <section class="lesson-layout">
        <aside class="lesson-nav">
          <a class="active" href="#/course/${encodeURIComponent(course.id)}?lesson=0">
            <span class="lesson-index">0</span>
            <span>Boş kurs</span>
          </a>
        </aside>
        <article class="lesson-main">
          ${renderCoursePreviewHero(course)}
          <div class="meta-row">
            <span class="pill">${escapeHtml(course.level || "Genel")}</span>
            <span class="muted small">${escapeHtml(course.title)}</span>
          </div>
          <h1>Bu kursta henüz ders yok</h1>
          <p>${escapeHtml(course.description)}</p>
          <div class="empty">Kurs oluşturuldu. Studio'dan "Ders ekle" butonuyla içerik ekleyebilirsin.</div>
          <div class="lesson-actions">
            <a class="button" href="#/studio">Studio'da düzenle</a>
            <a class="button subtle" href="#/">Kurslara dön</a>
          </div>
        </article>
      </section>
    `;
    return;
  }

  const safeIndex = Math.max(0, Math.min(lessonIndex, course.lessons.length - 1));
  const lesson = course.lessons[safeIndex];

  app.innerHTML = `
    <section class="lesson-layout">
      <aside class="lesson-nav">
        ${course.lessons
          .map(
            (item, index) => `
              <a class="${index === safeIndex ? "active" : ""}" href="#/course/${course.id}?lesson=${index}">
                <span class="lesson-index">${index + 1}</span>
                <span>${escapeHtml(item.title || `Ders ${index + 1}`)}</span>
              </a>
            `,
          )
          .join("")}
      </aside>
      <article class="lesson-main">
        ${renderCoursePreviewHero(course)}
        <div class="meta-row">
          <span class="pill">${escapeHtml(course.level || "Genel")}</span>
          <span class="muted small">${escapeHtml(course.title)}</span>
        </div>
        <h1>${escapeHtml(lesson.title)}</h1>
        <p>${escapeHtml(course.description)}</p>
        <div class="lesson-content">
          ${renderMedia(lesson)}
          <div class="markdown">${renderMarkdown(lesson.body || "")}</div>
          ${renderQuiz(lesson.quiz)}
        </div>
        <div class="lesson-actions">
          <a class="button ghost ${safeIndex === 0 ? "hidden" : ""}" href="#/course/${course.id}?lesson=${safeIndex - 1}">Önceki</a>
          <a class="button ${safeIndex === course.lessons.length - 1 ? "hidden" : ""}" href="#/course/${course.id}?lesson=${safeIndex + 1}">Sonraki ders</a>
          <a class="button subtle" href="#/">Kurslara dön</a>
        </div>
      </article>
    </section>
  `;

  document.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => checkAnswer(button));
  });
}

function renderMedia(lesson) {
  if (lesson.mediaType === "embed" && lesson.embedHtml) {
    return `<div class="media-frame embed-frame">${sanitizeEmbed(lesson.embedHtml)}</div>`;
  }

  if (!lesson.mediaUrl || lesson.mediaType === "none") return "";
  const url = escapeAttr(lesson.mediaUrl);

  if (lesson.mediaType === "video") {
    return `<div class="media-frame"><iframe src="${url}" title="Ders videosu" allowfullscreen></iframe></div>`;
  }

  if (lesson.mediaType === "audio") {
    return `<div class="media-frame"><audio src="${url}" controls></audio></div>`;
  }

  if (lesson.mediaType === "image") {
    return `<figure class="image-frame"><img src="${url}" alt="" loading="lazy" /></figure>`;
  }

  return `<p><a class="button ghost" href="${url}" target="_blank" rel="noreferrer">Harici materyali aç</a></p>`;
}

function renderCoursePreviewHero(course) {
  if (!course.bannerUrl && !course.logoUrl) return "";
  return `
    <div class="course-preview-hero" style="${course.bannerUrl ? backgroundStyle(course.bannerUrl) : ""}">
      <span class="course-preview-logo" style="${course.logoUrl ? backgroundStyle(course.logoUrl) : ""}">
        ${course.logoUrl ? "" : escapeHtml(getInitials(course.title))}
      </span>
    </div>
  `;
}

function renderQuiz(quiz) {
  if (!quiz?.question || !quiz.options?.length) return "";
  return `
    <div class="quiz" data-correct="${Number(quiz.answer || 0)}">
      <strong>${escapeHtml(quiz.question)}</strong>
      ${quiz.options
        .map(
          (option, index) =>
            `<button class="button ghost" type="button" data-answer="${index}">${escapeHtml(option)}</button>`,
        )
        .join("")}
      <div class="quiz-result"></div>
    </div>
  `;
}

function checkAnswer(button) {
  const quiz = button.closest(".quiz");
  const result = quiz.querySelector(".quiz-result");
  const correct = Number(quiz.dataset.correct);
  const selected = Number(button.dataset.answer);
  result.textContent =
    selected === correct ? "Doğru. Devam edebilirsin." : "Yakınsın, bir kez daha dene.";
  result.style.color = selected === correct ? "var(--good)" : "var(--warn)";
}

function renderStudio() {
  if (!state.draft) state.draft = createEmptyCourse();
  const course = state.draft;
  const live = isCourseLive(course);
  if (!live) state.draftMode = "info";
  if (live && !state.draftMode) state.draftMode = "lessons";
  const ownedCourses = getOwnedCourses();
  const canCreate = ownedCourses.length < MAX_COURSES_PER_USER;
  const canAddLesson = course.lessons.length < MAX_LESSONS_PER_COURSE;
  saveState();

  app.innerHTML = `
    <section class="studio-grid">
      <aside class="panel studio-side">
        <div class="section-head compact">
          <h2>Kurslarım</h2>
          <span class="muted small">${ownedCourses.length}/${MAX_COURSES_PER_USER}</span>
        </div>
        <div class="manage-list">
          ${renderManagedCourses(ownedCourses)}
        </div>
        <div class="actions">
          <button class="button" id="newDraft" type="button" ${canCreate ? "" : "disabled"}>+ Yeni kurs</button>
          <button class="button ghost" id="pullCourses" type="button" title="GitHub'dan kursları çek">Çek</button>
          <button class="button ghost" id="pushCourses" type="button" title="Kursları GitHub'a kaydet">Kaydet</button>
        </div>
      </aside>

      <section class="panel studio-main">
        ${renderStudioMain(course, live, canAddLesson)}
      </section>
    </section>
  `;

  bindStudio();
  if (live && state.draftMode === "lessons") paintLessonEditors();
}

function isCourseLive(course) {
  if (course._originalId) return true;
  return state.courses.some((item) => item.id === course.id);
}

function renderStudioMain(course, live, canAddLesson) {
  if (!live || state.draftMode === "info") {
    return `
      <div class="section-head">
        <div>
          <h2>Kurs Oluştur</h2>
          <p class="muted">Önce kursu oluştur. Canlıya alınca dersleri sağdan eklersin.</p>
        </div>
        ${live ? `<button class="button subtle" id="backToLessons" type="button">Derslere dön</button>` : ""}
      </div>

      ${renderDraftPreview(course)}

      <div class="split">
        <div class="field">
          <label for="title">Kurs adı</label>
          <input id="title" value="${escapeAttr(course.title)}" placeholder="Örnek: React'e Giriş" />
        </div>
        <div class="field">
          <label for="level">Seviye</label>
          <select id="level">
            ${["Başlangıç", "Orta", "İleri"].map((level) => `<option ${course.level === level ? "selected" : ""}>${level}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="description">Kısa açıklama</label>
        <textarea id="description">${escapeHtml(course.description)}</textarea>
      </div>
      <div class="split">
        <div class="field">
          <label for="bannerUrl">Banner URL</label>
          <input id="bannerUrl" value="${escapeAttr(course.bannerUrl || "")}" placeholder="https://.../banner.jpg" />
        </div>
        <div class="field">
          <label for="logoUrl">Logo URL</label>
          <input id="logoUrl" value="${escapeAttr(course.logoUrl || "")}" placeholder="https://.../logo.png" />
        </div>
      </div>

      <div class="actions editor-actions">
        <button class="button" id="publishDraft" type="button">${live ? "Değişiklikleri kaydet" : "Kursu oluştur ve canlıya al"}</button>
        <button class="button ghost" id="saveDraft" type="button">Taslak kaydet</button>
      </div>
    `;
  }

  return `
    <div class="section-head">
      <div>
        <h2>${escapeHtml(course.title)}</h2>
        <p class="muted">${escapeHtml(course.level || "Genel")} · ${course.lessons.length}/${MAX_LESSONS_PER_COURSE} ders</p>
      </div>
      <button class="button subtle" id="editInfo" type="button">Bilgileri düzenle</button>
    </div>

    <div class="section-head lessons-head">
      <div>
        <h2>Dersler</h2>
        <p class="muted">Dersleri sağdan ekle; video, görsel veya markdown içerik kullan.</p>
      </div>
      <button class="button" id="addLesson" type="button" ${canAddLesson ? "" : "disabled"}>+ Ders ekle</button>
    </div>
    <div id="lessonEditors"></div>

    <div class="actions editor-actions">
      <button class="button danger" id="deleteDraft" type="button">Bu kursu sil</button>
    </div>
  `;
}

function renderDraftPreview(course) {
  return `
    <div class="draft-preview" id="draftPreview">
      <div class="draft-preview-banner" data-preview-banner style="${course.bannerUrl ? backgroundStyle(course.bannerUrl) : ""}">
        <span class="draft-preview-logo" data-preview-logo style="${course.logoUrl ? backgroundStyle(course.logoUrl) : ""}">
          ${course.logoUrl ? "" : escapeHtml(getInitials(course.title))}
        </span>
      </div>
      <div>
        <div class="meta-row">
          <span class="pill" data-preview-level>${escapeHtml(course.level || "Genel")}</span>
          <span class="muted small" data-preview-count>${course.lessons.length}/${MAX_LESSONS_PER_COURSE} ders</span>
        </div>
        <h3 data-preview-title>${escapeHtml(course.title)}</h3>
        <p data-preview-description>${escapeHtml(course.description)}</p>
      </div>
    </div>
  `;
}

function updateDraftPreview() {
  const title = document.querySelector("#title")?.value.trim() || "Adsız kurs";
  const description = document.querySelector("#description")?.value.trim() || "";
  const level = document.querySelector("#level")?.value || "Genel";
  const bannerUrl = document.querySelector("#bannerUrl")?.value.trim() || "";
  const logoUrl = document.querySelector("#logoUrl")?.value.trim() || "";
  const banner = document.querySelector("[data-preview-banner]");
  const logo = document.querySelector("[data-preview-logo]");

  document.querySelector("[data-preview-title]").textContent = title;
  document.querySelector("[data-preview-description]").textContent = description;
  document.querySelector("[data-preview-level]").textContent = level;
  banner.style.backgroundImage = bannerUrl ? `url("${escapeCssUrl(bannerUrl)}")` : "";
  logo.style.backgroundImage = logoUrl ? `url("${escapeCssUrl(logoUrl)}")` : "";
  logo.textContent = logoUrl ? "" : getInitials(title);
}

function renderManagedCourses(courses) {
  if (!state.auth?.login) {
    return `<div class="empty compact-empty">GitHub ile giriş yaptıktan sonra kurslarını burada yönetebilirsin.</div>`;
  }

  if (!courses.length) {
    return `<div class="empty compact-empty">Henüz kursun yok.</div>`;
  }

  return courses
    .map(
      (course) => `
        <div class="manage-item">
          <div>
            <strong>${escapeHtml(course.title)}</strong>
            <span class="muted small">${course.lessons?.length || 0} ders</span>
          </div>
          <div class="actions">
            <button class="button small ghost" type="button" data-edit-course="${escapeAttr(course.id)}">Düzenle</button>
            <button class="button small danger" type="button" data-delete-course="${escapeAttr(course.id)}">Sil</button>
          </div>
        </div>
      `,
    )
    .join("");
}

function bindStudio() {
  const on = (selector, handler) => {
    const node = document.querySelector(selector);
    if (node) node.addEventListener("click", handler);
  };

  on("#pullCourses", fetchCoursesFromGitHub);
  on("#pushCourses", pushCoursesToGitHub);
  on("#newDraft", () => {
    if (!state.auth?.login) return toast("Yeni kurs için GitHub girişi gerekli.");
    if (getOwnedCourses().length >= MAX_COURSES_PER_USER) {
      return toast(`Bir kullanıcı en fazla ${MAX_COURSES_PER_USER} kurs oluşturabilir.`);
    }
    state.draft = createEmptyCourse();
    state.draft.owner = state.auth.login;
    state.draftMode = "info";
    saveState();
    renderStudio();
  });
  on("#addLesson", () => {
    if (state.draft.lessons.length >= MAX_LESSONS_PER_COURSE) {
      return toast(`Bir kursta en fazla ${MAX_LESSONS_PER_COURSE} ders olabilir.`);
    }
    saveDraftFromForm({ silent: true });
    state.draft.lessons.push(createEmptyLesson(state.draft.lessons.length + 1));
    saveState();
    renderStudio();
  });
  on("#saveDraft", saveDraftFromForm);
  on("#publishDraft", publishDraft);
  on("#backToLessons", () => {
    state.draftMode = "lessons";
    saveState();
    renderStudio();
  });
  on("#editInfo", () => {
    state.draftMode = "info";
    saveState();
    renderStudio();
  });
  on("#deleteDraft", () => deleteCourse(state.draft._originalId || state.draft.id));
  document.querySelectorAll("[data-edit-course]").forEach((button) => {
    button.addEventListener("click", () => editCourse(button.dataset.editCourse));
  });
  document.querySelectorAll("[data-delete-course]").forEach((button) => {
    button.addEventListener("click", () => deleteCourse(button.dataset.deleteCourse));
  });
  ["title", "description", "level", "bannerUrl", "logoUrl"].forEach((id) => {
    const field = document.querySelector(`#${id}`);
    if (!field) return;
    const syncPreview = () => {
      saveDraftFromForm({ silent: true, noNormalize: true });
      updateDraftPreview();
    };
    field.addEventListener("input", syncPreview);
    field.addEventListener("change", syncPreview);
  });
}

function paintLessonEditors() {
  const holder = document.querySelector("#lessonEditors");

  if (!state.draft.lessons.length) {
    holder.innerHTML = `<div class="empty compact-empty">Henüz ders yok. Dersler isteğe bağlıdır — "Ders ekle" ile başla ya da kursu olduğu gibi yayınla.</div>`;
    return;
  }

  holder.innerHTML = state.draft.lessons
    .map(
      (lesson, index) => `
        <div class="lesson-editor" data-lesson-editor="${index}">
          <div class="lesson-editor-head">
            <span class="lesson-index">${index + 1}</span>
            <div class="field">
              <label>Ders başlığı</label>
              <input data-field="title" value="${escapeAttr(lesson.title)}" placeholder="Ders ${index + 1}" />
            </div>
            <button class="button danger small" type="button" data-remove="${index}">Sil</button>
          </div>
          <div class="split">
            <div class="field">
              <label>Medya tipi</label>
              <select data-field="mediaType">
                ${["none", "video", "image", "audio", "embed", "url"].map((type) => `<option value="${type}" ${lesson.mediaType === type ? "selected" : ""}>${type}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label>Harici URL</label>
              <input data-field="mediaUrl" value="${escapeAttr(lesson.mediaUrl)}" placeholder="https://..." />
            </div>
          </div>
          <div class="field">
            <label>HTML embed</label>
            <textarea data-field="embedHtml" placeholder="<iframe ...></iframe>">${escapeHtml(lesson.embedHtml || "")}</textarea>
          </div>
          <div class="field">
            <label>Ders içeriği Markdown</label>
            <textarea class="markdown-input" data-field="body" placeholder="## Ders hedefi&#10;&#10;Markdown destekli içerik. Başlık, liste, link ve kod ekleyebilirsin.">${escapeHtml(lesson.body)}</textarea>
          </div>
          <div class="quiz-fields">
            <div class="quiz-fields-head">
              <span class="pill">Quiz</span>
              <span class="muted small">İsteğe bağlı</span>
            </div>
            <div class="field">
              <label>Quiz sorusu</label>
              <input data-field="quiz.question" value="${escapeAttr(lesson.quiz.question)}" />
            </div>
            <div class="field">
              <label>Seçenekler, satır satır</label>
              <textarea data-field="quiz.options">${escapeHtml(lesson.quiz.options.join("\n"))}</textarea>
            </div>
            <div class="field">
              <label>Doğru cevap numarası</label>
              <input data-field="quiz.answer" type="number" min="1" value="${Number(lesson.quiz.answer) + 1}" />
            </div>
          </div>
        </div>
      `,
    )
    .join("");

  holder.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      state.draft.lessons.splice(Number(button.dataset.remove), 1);
      normalizeLessonTitles(state.draft);
      saveState();
      renderStudio();
    });
  });

  holder.querySelectorAll("[data-field]").forEach((field) => {
    const sync = () => saveDraftFromForm({ silent: true, noNormalize: true });
    field.addEventListener("input", sync);
    field.addEventListener("change", sync);
  });
}

function saveDraftFromForm(options = {}) {
  const draft = state.draft;
  const title = document.querySelector("#title");
  const description = document.querySelector("#description");
  const level = document.querySelector("#level");
  const bannerUrl = document.querySelector("#bannerUrl");
  const logoUrl = document.querySelector("#logoUrl");

  if (title) draft.title = title.value.trim() || "Adsız kurs";
  if (description) draft.description = description.value.trim();
  if (level) draft.level = level.value;
  if (bannerUrl) draft.bannerUrl = bannerUrl.value.trim();
  if (logoUrl) draft.logoUrl = logoUrl.value.trim();
  draft.owner = state.auth?.login || "local";
  draft.id = slugify(draft.title);

  document.querySelectorAll("[data-lesson-editor]").forEach((editor) => {
    const index = Number(editor.dataset.lessonEditor);
    const lesson = draft.lessons[index];
    editor.querySelectorAll("[data-field]").forEach((field) => {
      assignLessonValue(lesson, field.dataset.field, field.value);
    });
  });

  if (!options.noNormalize) normalizeLessonTitles(draft);
  draft.updatedAt = new Date().toISOString().slice(0, 10);
  saveState();
  if (!options.silent) toast("Taslak kaydedildi.");
}

function assignLessonValue(lesson, field, value) {
  if (field === "quiz.question") lesson.quiz.question = value.trim();
  else if (field === "quiz.options") {
    lesson.quiz.options = value.split("\n").map((item) => item.trim()).filter(Boolean);
  } else if (field === "quiz.answer") {
    lesson.quiz.answer = Math.max(0, Number(value || 1) - 1);
  } else if (field === "embedHtml") {
    lesson.embedHtml = value.trim();
  } else {
    lesson[field] = value.trim();
  }
}

function editCourse(id) {
  const course = state.courses.find((item) => item.id === id);
  if (!course) return toast("Kurs bulunamadı.");
  if (state.auth?.login !== course.owner) return toast("Sadece kendi kurslarını düzenleyebilirsin.");
  state.draft = clone(course);
  state.draft._originalId = course.id;
  state.draftMode = "lessons";
  saveState();
  renderStudio();
}

function deleteCourse(id) {
  if (!state.auth?.login) return toast("Kurs silmek için GitHub girişi gerekli.");
  const course = state.courses.find((item) => item.id === id);
  if (!course) return toast("Silinecek kurs bulunamadı.");
  if (course.owner !== state.auth.login) return toast("Sadece kendi kurslarını silebilirsin.");
  const ok = confirm(`"${course.title}" kursu silinsin mi?`);
  if (!ok) return;
  state.courses = state.courses.filter((item) => item.id !== id);
  if (state.draft?.id === id || state.draft?._originalId === id) {
    state.draft = createEmptyCourse();
    state.draftMode = "info";
  }
  saveState();
  toast("Kurs silindi. GitHub'a kaydet ile depoya yazabilirsin.");
  renderStudio();
}

function publishDraft() {
  if (!state.auth?.login) return toast("Kurs yayınlamak için GitHub girişi gerekli.");
  saveDraftFromForm();
  if (state.draft.lessons.length > MAX_LESSONS_PER_COURSE) {
    return toast(`Bir kursta en fazla ${MAX_LESSONS_PER_COURSE} ders olabilir.`);
  }
  const originalId = state.draft._originalId || state.draft.id;
  const index = state.courses.findIndex((course) => course.id === originalId);
  if (index >= 0 && state.courses[index].owner !== state.auth.login) {
    return toast("Sadece kendi kurslarını düzenleyebilirsin.");
  }
  if (index < 0 && getOwnedCourses().length >= MAX_COURSES_PER_USER) {
    return toast(`Bir kullanıcı en fazla ${MAX_COURSES_PER_USER} kurs oluşturabilir.`);
  }
  const published = clone(state.draft);
  delete published._originalId;
  if (index >= 0) state.courses[index] = published;
  else state.courses.unshift(published);
  state.draft = clone(published);
  state.draft._originalId = published.id;
  state.draftMode = "lessons";
  saveState();
  toast("Kurs canlıya alındı. Dersleri sağdan ekleyebilirsin.");
  renderStudio();
}

function createEmptyCourse() {
  return normalizeCourse({
    id: "yeni-kurs",
    title: "Yeni Kurs",
    description: "Kısa ve net bir kurs açıklaması.",
    bannerUrl: "",
    logoUrl: "",
    level: "Başlangıç",
    owner: state.auth?.login || "local",
    updatedAt: new Date().toISOString().slice(0, 10),
    lessons: [],
  });
}

function createEmptyLesson(number) {
  return normalizeLesson({
    title: `Ders ${number}`,
    mediaType: "none",
    mediaUrl: "",
    embedHtml: "",
    body: "",
    quiz: {
      question: "",
      options: ["Doğru seçenek", "Diğer seçenek", "Başka seçenek"],
      answer: 0,
    },
  });
}

function normalizeState(nextState) {
  nextState.courses = (nextState.courses || []).map(normalizeCourse);
  if (nextState.draft) nextState.draft = normalizeCourse(nextState.draft);
  return nextState;
}

function normalizeCourse(course = {}) {
  const title = course.title || "Adsız kurs";
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];

  return {
    id: course.id || slugify(title),
    title,
    description: course.description || "",
    bannerUrl: course.bannerUrl || "",
    logoUrl: course.logoUrl || "",
    level: course.level || "Başlangıç",
    owner: course.owner || "local",
    updatedAt: course.updatedAt || new Date().toISOString().slice(0, 10),
    lessons: lessons.slice(0, MAX_LESSONS_PER_COURSE).map(normalizeLesson),
    ...(course._originalId ? { _originalId: course._originalId } : {}),
  };
}

function normalizeLesson(lesson = {}) {
  const quiz = lesson.quiz || {};
  const options =
    Array.isArray(quiz.options) && quiz.options.length
      ? quiz.options
      : ["Doğru seçenek", "Diğer seçenek", "Başka seçenek"];

  return {
    title: lesson.title || "Ders",
    mediaType: lesson.mediaType || "none",
    mediaUrl: lesson.mediaUrl || "",
    embedHtml: lesson.embedHtml || "",
    body: lesson.body || "",
    quiz: {
      question: quiz.question || "",
      options,
      answer: Number.isFinite(Number(quiz.answer)) ? Number(quiz.answer) : 0,
    },
  };
}

function normalizeLessonTitles(course) {
  course.lessons.forEach((lesson, index) => {
    const clean = lesson.title.replace(/^Ders\s+\d+\s*:?\s*/i, "").trim();
    lesson.title = clean ? `Ders ${index + 1}: ${clean}` : `Ders ${index + 1}`;
  });
}

async function renderAuthModal() {
  if (state.auth?.token) {
    state.auth = null;
    saveState();
    updateAuthButton();
    toast("GitHub oturumu kapatıldı.");
    return;
  }

  document.querySelector("#authModal")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "authModal";
  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="GitHub girişi">
      <div class="section-head">
        <div>
          <h2>GitHub Girişi</h2>
          <p class="muted">GitHub'da kısa bir erişim jetonu oluşturup yapıştırman yeterli.</p>
        </div>
        <button class="icon-button" id="closeAuth" type="button" aria-label="Kapat">×</button>
      </div>

      <div class="field">
        <label for="tokenInput">GitHub token</label>
        <input id="tokenInput" type="password" placeholder="ghp_... veya github_pat_..." autocomplete="off" />
      </div>
      <div class="actions">
        <button class="button" id="tokenLogin" type="button">Token ile bağlan</button>
        <a class="button ghost" href="${TOKEN_URL}" target="_blank" rel="noreferrer">Token oluştur</a>
      </div>
    </div>
  `;

  document.body.append(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.remove();
  });
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") overlay.remove();
  });
  document.querySelector("#closeAuth").addEventListener("click", () => overlay.remove());
  document.querySelector("#tokenLogin").addEventListener("click", loginWithToken);
}

async function loginWithToken() {
  const token = document.querySelector("#tokenInput").value.trim();
  if (!token) return toast("Token alanı boş.");
  await completeLogin(token);
}

async function completeLogin(token) {
  const user = await githubRequest("/user", { token });
  state.auth = { token, login: user.login, avatarUrl: user.avatar_url };
  if (!state.github.owner) state.github.owner = user.login;
  saveState();
  updateAuthButton();
  toast(`GitHub bağlandı: @${user.login}`);
}

async function fetchCoursesFromGitHub() {
  const cfg = state.github;
  if (!cfg.owner || !cfg.repo || !cfg.path) return toast("GitHub depo ayarları eksik.");

  try {
    const content = await readRepoFile();
    const parsed = JSON.parse(content.text);
    state.courses = (Array.isArray(parsed) ? parsed : parsed.courses || []).map(
      normalizeCourse,
    );
    saveState();
    toast("Kurslar GitHub'dan yenilendi.");
    render();
  } catch (error) {
    toast(error.message || "GitHub okuma başarısız.");
  }
}

async function pushCoursesToGitHub() {
  if (!state.auth?.token) return toast("GitHub'a yazmak için giriş gerekli.");
  const cfg = state.github;
  if (!cfg.owner || !cfg.repo || !cfg.path) return toast("GitHub depo ayarları eksik.");

  try {
    let sha;
    try {
      sha = (await readRepoFile()).sha;
    } catch {
      sha = undefined;
    }

    const body = {
      message: "Update OpenLearn courses",
      content: btoa(unescape(encodeURIComponent(JSON.stringify({ courses: state.courses }, null, 2)))),
      branch: cfg.branch || "main",
      ...(sha ? { sha } : {}),
    };

    await githubRequest(
      `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponentPath(cfg.path)}`,
      {
        method: "PUT",
        token: state.auth.token,
        body,
      },
    );

    toast("Kurslar GitHub'a kaydedildi.");
  } catch (error) {
    toast(error.message || "GitHub yazma başarısız.");
  }
}

async function readRepoFile() {
  const cfg = state.github;
  const branch = encodeURIComponent(cfg.branch || "main");
  const file = await githubRequest(
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURIComponentPath(cfg.path)}?ref=${branch}`,
    { token: state.auth?.token },
  );
  return {
    sha: file.sha,
    text: decodeURIComponent(escape(atob(file.content.replace(/\n/g, "")))),
  };
}

async function githubRequest(path, options = {}) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
  };
  const response = await fetch(`${GITHUB_API}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API ${response.status}`);
  }

  return response.json();
}

function renderMarkdown(text) {
  const lines = escapeHtml(text).split("\n");
  const html = [];
  let list = [];

  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (/^- /.test(trimmed)) {
      list.push(trimmed.replace(/^- /, ""));
      return;
    }

    flushList();

    if (/^### /.test(trimmed)) html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
    else if (/^## /.test(trimmed)) html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
    else if (/^# /.test(trimmed)) html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
    else html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  });

  flushList();
  return html.join("");
}

function inlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function sanitizeEmbed(html = "") {
  const source = html.trim();
  if (!source) return "";
  const template = document.createElement("template");
  template.innerHTML = source;
  const iframe = template.content.querySelector("iframe");
  if (!iframe) {
    return `<div class="empty compact-empty">Embed için iframe HTML kullanın.</div>`;
  }

  const src = iframe.getAttribute("src") || "";
  if (!/^https:\/\//i.test(src)) {
    return `<div class="empty compact-empty">Embed kaynağı https olmalı.</div>`;
  }

  return `<iframe src="${escapeAttr(src)}" title="${escapeAttr(iframe.getAttribute("title") || "Ders embed")}" allow="${escapeAttr(iframe.getAttribute("allow") || "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture")}" allowfullscreen></iframe>`;
}

function slugify(value) {
  return (
    value
      .toLocaleLowerCase("tr")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "kurs"
  );
}

function encodeURIComponentPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function escapeCssUrl(value = "") {
  return String(value).replace(/["\\\n\r]/g, "");
}

function backgroundStyle(value = "") {
  return `background-image: url(&quot;${escapeAttr(escapeCssUrl(value))}&quot;)`;
}

function getInitials(value = "") {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toLocaleUpperCase("tr") || "")
      .join("") || "OL"
  );
}

function getOwnedCourses() {
  if (!state.auth?.login) return [];
  return state.courses.filter((course) => course.owner === state.auth.login);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toast(message) {
  const stack = document.querySelector("#toastStack");
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  stack.append(node);
  setTimeout(() => node.remove(), 4200);
}
