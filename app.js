const STORE_KEY = "openlearn.state.v1";
const THEME_KEY = "openlearn.theme";
const GITHUB_API = "https://api.github.com";
const GITHUB_DEVICE = "https://github.com/login/device/code";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
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
      clientId: "",
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
      <div>
        <h1>OpenLearn</h1>
        <p>GitHub hesabıyla kurs üret, herkes hesap açmadan dersleri okusun. İçerik JSON olarak repoda durur; video, ses ve ek materyaller harici URL ile bağlanır.</p>
        <div class="actions">
          <a class="button" href="#/studio">Kurs oluştur</a>
          <button class="button ghost" id="syncPublic" type="button">GitHub'dan yenile</button>
        </div>
      </div>
      <aside class="hero-panel" aria-label="OpenLearn mimarisi">
        <div class="terminal-head"><span></span><span></span><span></span></div>
        <div class="terminal-body">
          <div class="terminal-line"><strong>storage</strong><span>GitHub Contents API</span></div>
          <div class="terminal-line"><strong>auth</strong><span>Device Flow veya token</span></div>
          <div class="terminal-line"><strong>runtime</strong><span>statik HTML/CSS/JS</span></div>
          <div class="terminal-line"><strong>media</strong><span>harici URL</span></div>
        </div>
      </aside>
    </section>

    <section>
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
  const course = state.draft || createEmptyCourse();
  state.draft = course;
  saveState();
  const ownedCourses = getOwnedCourses();
  const canCreate = ownedCourses.length < MAX_COURSES_PER_USER;
  const canAddLesson = course.lessons.length < MAX_LESSONS_PER_COURSE;

  app.innerHTML = `
    <section class="studio-grid">
      <aside class="panel">
        <h2>GitHub Deposu</h2>
        <p class="muted">Kurslar tek bir JSON dosyası olarak repo içinde saklanır.</p>
        <div class="auth-grid">
          <div class="field">
            <label for="owner">Owner</label>
            <input id="owner" value="${escapeAttr(state.github.owner)}" placeholder="kullanici veya org" />
          </div>
          <div class="field">
            <label for="repo">Repo</label>
            <input id="repo" value="${escapeAttr(state.github.repo)}" />
          </div>
        </div>
        <div class="auth-grid">
          <div class="field">
            <label for="branch">Branch</label>
            <input id="branch" value="${escapeAttr(state.github.branch)}" />
          </div>
          <div class="field">
            <label for="path">Dosya</label>
            <input id="path" value="${escapeAttr(state.github.path)}" />
          </div>
        </div>
        <div class="actions">
          <button class="button" id="pullCourses" type="button">GitHub'dan çek</button>
          <button class="button ghost" id="pushCourses" type="button">GitHub'a kaydet</button>
        </div>
        <ul class="status-list">
          <li><span>Oturum</span><strong>${state.auth?.login ? `@${escapeHtml(state.auth.login)}` : "Yok"}</strong></li>
          <li><span>Benim kurslarım</span><strong>${ownedCourses.length}/${MAX_COURSES_PER_USER}</strong></li>
          <li><span>Depolama</span><strong>GitHub JSON</strong></li>
        </ul>

        <div class="section-head compact">
          <h2>Kurslarım</h2>
          <span class="muted small">${state.auth?.login ? "Sil / düzenle" : "Giriş gerekli"}</span>
        </div>
        <div class="manage-list">
          ${renderManagedCourses(ownedCourses)}
        </div>
      </aside>

      <section class="panel">
        <div class="section-head">
          <div>
            <h2>Kurs Düzenleyici</h2>
            <p class="muted">Kullanıcı başına 5 kurs, kurs başına 50 ders.</p>
          </div>
          <button class="button subtle" id="newDraft" type="button" ${canCreate ? "" : "disabled"}>Yeni</button>
        </div>

        ${renderDraftPreview(course)}

        <div class="split">
          <div class="field">
            <label for="title">Kurs adı</label>
            <input id="title" value="${escapeAttr(course.title)}" />
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

        <div class="section-head">
          <div>
            <h2>Dersler</h2>
            <p class="muted">${course.lessons.length}/${MAX_LESSONS_PER_COURSE} ders</p>
          </div>
          <button class="button ghost" id="addLesson" type="button" ${canAddLesson ? "" : "disabled"}>Ders ekle</button>
        </div>
        <div id="lessonEditors"></div>

        <div class="actions">
          <button class="button" id="saveDraft" type="button">Yerel kaydet</button>
          <button class="button ghost" id="publishDraft" type="button">Listeye ekle</button>
          <button class="button danger" id="deleteDraft" type="button">Bu kursu sil</button>
        </div>
      </section>
    </section>
  `;

  bindStudio();
  paintLessonEditors();
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
  ["owner", "repo", "branch", "path"].forEach((id) => {
    document.querySelector(`#${id}`).addEventListener("input", (event) => {
      state.github[id] = event.target.value.trim();
      saveState();
    });
  });

  document.querySelector("#pullCourses").addEventListener("click", fetchCoursesFromGitHub);
  document.querySelector("#pushCourses").addEventListener("click", pushCoursesToGitHub);
  document.querySelector("#newDraft").addEventListener("click", () => {
    if (!state.auth?.login) return toast("Yeni kurs için GitHub girişi gerekli.");
    if (getOwnedCourses().length >= MAX_COURSES_PER_USER) {
      return toast(`Bir kullanıcı en fazla ${MAX_COURSES_PER_USER} kurs oluşturabilir.`);
    }
    state.draft = createEmptyCourse();
    state.draft.owner = state.auth.login;
    saveState();
    renderStudio();
  });
  document.querySelector("#addLesson").addEventListener("click", () => {
    if (state.draft.lessons.length >= MAX_LESSONS_PER_COURSE) {
      return toast(`Bir kursta en fazla ${MAX_LESSONS_PER_COURSE} ders olabilir.`);
    }
    saveDraftFromForm({ silent: true });
    state.draft.lessons.push(createEmptyLesson(state.draft.lessons.length + 1));
    saveState();
    renderStudio();
  });
  document.querySelector("#saveDraft").addEventListener("click", saveDraftFromForm);
  document.querySelector("#publishDraft").addEventListener("click", publishDraft);
  document
    .querySelector("#deleteDraft")
    .addEventListener("click", () => deleteCourse(state.draft._originalId || state.draft.id));
  document.querySelectorAll("[data-edit-course]").forEach((button) => {
    button.addEventListener("click", () => editCourse(button.dataset.editCourse));
  });
  document.querySelectorAll("[data-delete-course]").forEach((button) => {
    button.addEventListener("click", () => deleteCourse(button.dataset.deleteCourse));
  });
  ["title", "description", "level", "bannerUrl", "logoUrl"].forEach((id) => {
    const field = document.querySelector(`#${id}`);
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
  holder.innerHTML = state.draft.lessons
    .map(
      (lesson, index) => `
        <div class="lesson-editor" data-lesson-editor="${index}">
          <div class="lesson-editor-row">
            <span class="lesson-index">${index + 1}</span>
            <div class="field">
              <label>Ders başlığı</label>
              <input data-field="title" value="${escapeAttr(lesson.title)}" />
            </div>
            <button class="button danger" type="button" data-remove="${index}">Sil</button>
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
            <textarea class="markdown-input" data-field="body">${escapeHtml(lesson.body)}</textarea>
          </div>
          <div class="field">
            <label>Quiz sorusu</label>
            <input data-field="quiz.question" value="${escapeAttr(lesson.quiz.question)}" />
          </div>
          <div class="field">
            <label>Quiz seçenekleri, satır satır</label>
            <textarea data-field="quiz.options">${escapeHtml(lesson.quiz.options.join("\n"))}</textarea>
          </div>
          <div class="field">
            <label>Doğru cevap numarası</label>
            <input data-field="quiz.answer" type="number" min="1" value="${Number(lesson.quiz.answer) + 1}" />
          </div>
        </div>
      `,
    )
    .join("");

  holder.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      if (state.draft.lessons.length <= 1) return toast("En az bir ders kalmalı.");
      state.draft.lessons.splice(Number(button.dataset.remove), 1);
      normalizeLessonTitles(state.draft);
      saveState();
      renderStudio();
    });
  });
}

function saveDraftFromForm(options = {}) {
  const draft = state.draft;
  draft.title = document.querySelector("#title").value.trim() || "Adsız kurs";
  draft.description = document.querySelector("#description").value.trim();
  draft.level = document.querySelector("#level").value;
  draft.owner = state.auth?.login || state.github.owner || "local";
  draft.bannerUrl = document.querySelector("#bannerUrl").value.trim();
  draft.logoUrl = document.querySelector("#logoUrl").value.trim();
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
  if (state.draft?.id === id) state.draft = createEmptyCourse();
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
  saveState();
  toast("Kurs yerel listeye eklendi. GitHub'a kaydet ile depoya yazabilirsin.");
  location.hash = `#/course/${state.draft.id}?lesson=0`;
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
    lessons: [createEmptyLesson(1), createEmptyLesson(2)],
  });
}

function createEmptyLesson(number) {
  return normalizeLesson({
    title: `Ders ${number}`,
    mediaType: "none",
    mediaUrl: "",
    embedHtml: "",
    body: "## Ders hedefi\n\nDers içeriğini buraya yazın.\n\n- Kısa not\n- Uygulama adımı\n\n[Harici kaynak](https://example.com)",
    quiz: {
      question: "Bu dersten ana çıkarım nedir?",
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
  const lessons =
    Array.isArray(course.lessons) && course.lessons.length
      ? course.lessons
      : [normalizeLesson({ title: "Ders 1" })];

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

  document.querySelector("#authPanel")?.remove();
  app.insertAdjacentHTML(
    "afterbegin",
    `
      <section class="panel" id="authPanel">
        <div class="section-head">
          <div>
            <h2>GitHub Girişi</h2>
            <p class="muted">Sıfır sunucu için GitHub Device Flow kullanılır. OAuth app yoksa fine-grained token da kabul edilir.</p>
          </div>
          <button class="icon-button" id="closeAuth" type="button" aria-label="Kapat">×</button>
        </div>
        <div class="auth-grid">
          <div class="field">
            <label for="clientId">GitHub OAuth Client ID</label>
            <input id="clientId" value="${escapeAttr(state.github.clientId)}" placeholder="Device Flow açık OAuth app" />
          </div>
          <div class="field">
            <label for="tokenInput">Alternatif token</label>
            <input id="tokenInput" type="password" placeholder="repo contents izni olan token" />
          </div>
        </div>
        <div class="actions">
          <button class="button" id="deviceLogin" type="button">Device Flow başlat</button>
          <button class="button ghost" id="tokenLogin" type="button">Token ile bağlan</button>
        </div>
        <p class="muted" id="deviceStatus"></p>
      </section>
    `,
  );

  document.querySelector("#closeAuth").addEventListener("click", () => {
    document.querySelector("#authPanel").remove();
  });
  document.querySelector("#tokenLogin").addEventListener("click", loginWithToken);
  document.querySelector("#deviceLogin").addEventListener("click", loginWithDeviceFlow);
}

async function loginWithToken() {
  const token = document.querySelector("#tokenInput").value.trim();
  if (!token) return toast("Token alanı boş.");
  await completeLogin(token);
}

async function loginWithDeviceFlow() {
  const clientId = document.querySelector("#clientId").value.trim();
  const status = document.querySelector("#deviceStatus");
  if (!clientId) return toast("Client ID gerekli.");

  state.github.clientId = clientId;
  saveState();
  status.textContent = "GitHub cihaz kodu alınıyor...";

  try {
    const device = await postForm(GITHUB_DEVICE, {
      client_id: clientId,
      scope: "repo user:email",
    });

    status.innerHTML = `Kod: <strong>${escapeHtml(device.user_code)}</strong> · <a href="${escapeAttr(device.verification_uri)}" target="_blank" rel="noreferrer">GitHub'da onayla</a>`;

    const token = await pollForToken(clientId, device);
    await completeLogin(token);
    document.querySelector("#authPanel")?.remove();
  } catch (error) {
    toast(error.message || "GitHub girişi tamamlanamadı.");
  }
}

async function pollForToken(clientId, device) {
  const started = Date.now();
  const expiresMs = Number(device.expires_in || 900) * 1000;
  let interval = Number(device.interval || 5) * 1000;

  while (Date.now() - started < expiresMs) {
    await wait(interval);
    const response = await postForm(GITHUB_TOKEN, {
      client_id: clientId,
      device_code: device.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });

    if (response.access_token) return response.access_token;
    if (response.error === "authorization_pending") continue;
    if (response.error === "slow_down") {
      interval += 5000;
      continue;
    }
    throw new Error(response.error_description || response.error || "OAuth hatası");
  }

  throw new Error("GitHub onay süresi doldu.");
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

async function postForm(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(data),
  });

  if (!response.ok) throw new Error(`GitHub OAuth ${response.status}`);
  return response.json();
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
