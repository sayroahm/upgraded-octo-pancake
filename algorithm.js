(function NBEPSearchEngine() {
  "use strict";

  const SITE_PAGES = [
    { url: "/",                title: "Home",                 tags: ["home", "nbep", "national bureau", "exploitation protection", "commissioner", "non-profit"] },
    { url: "/wanted",          title: "Most Wanted",          tags: ["most wanted", "wanted", "criminal", "suspect", "fugitive"] },
    { url: "/submit-a-tip",    title: "Submit a Tip",         tags: ["tip", "report", "crime", "submit", "anonymous"] },
    { url: "/news",            title: "News",                 tags: ["news", "update", "press", "announcement", "report"] },
    { url: "/info",            title: "What We Investigate",  tags: ["investigate", "cyber", "what we do", "cases", "mission"] },
    { url: "/resources",       title: "Resources",            tags: ["resources", "help", "victim", "cope", "software", "988", "consult", "support"] },
    { url: "/contact-us",      title: "Contact Us",           tags: ["contact", "email", "reach", "message", "support"] },
    { url: "/admin-login",     title: "Admin Login",          tags: ["admin", "login", "staff", "access", "portal"] },
    { url: "/404",             title: "Page Not Found",       tags: ["404", "not found", "missing", "error"] },
  ];

  const STOP_WORDS = new Set([
    "a","an","the","and","or","but","in","on","at","to","for",
    "of","with","by","from","is","are","was","were","be","been",
    "being","have","has","had","do","does","did","will","would",
    "could","should","may","might","shall","this","that","these",
    "those","it","its","we","our","you","your","they","their",
    "i","my","me","us","he","she","him","her","his"
  ]);

  function tokenise(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  }

  const corpus = []; 
  const invertedIndex = new Map(); 

  function buildDocument(page, bodyText) {
    const titleTokens = tokenise(page.title);
    const tagTokens   = page.tags.flatMap(t => tokenise(t));
    const bodyTokens  = tokenise(bodyText);
    const tokens = [
      ...titleTokens, ...titleTokens, ...titleTokens, ...titleTokens,
      ...tagTokens,   ...tagTokens,
      ...bodyTokens,
    ];

    return {
      id:       corpus.length,
      url:      page.url,
      title:    page.title,
      bodyText: bodyText.slice(0, 300),
      tokens,
    };
  }

  function buildInvertedIndex() {
    invertedIndex.clear();
    corpus.forEach((doc, docId) => {
      const termFreqMap = new Map();
      doc.tokens.forEach(t => termFreqMap.set(t, (termFreqMap.get(t) || 0) + 1));
      termFreqMap.forEach((count, term) => {
        const tf = count / doc.tokens.length;
        if (!invertedIndex.has(term)) invertedIndex.set(term, []);
        invertedIndex.get(term).push({ docId, tf });
      });
    });
  }
  function idf(term) {
    const N  = corpus.length;
    const df = (invertedIndex.get(term) || []).length;
    return Math.log((N + 1) / (df + 1)) + 1;
  }

  function tfidfScore(queryTokens, docId) {
    let score = 0;
    queryTokens.forEach(term => {
      const postings = invertedIndex.get(term) || [];
      const hit      = postings.find(p => p.docId === docId);
      if (hit) score += hit.tf * idf(term);
    });
    return score;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length];
  }

  function fuzzyExpand(token) {
    const matches = [token];
    invertedIndex.forEach((_, term) => {
      if (term !== token && Math.abs(term.length - token.length) <= 2) {
        if (levenshtein(token, term) <= 2) matches.push(term);
      }
    });
    return matches;
  }

  function medianOfThree(arr, lo, hi) {
    const mid = (lo + hi) >> 1;
    if (arr[lo].score < arr[mid].score) [arr[lo], arr[mid]] = [arr[mid], arr[lo]];
    if (arr[lo].score < arr[hi].score)  [arr[lo], arr[hi]]  = [arr[hi],  arr[lo]];
    if (arr[mid].score < arr[hi].score) [arr[mid], arr[hi]] = [arr[hi],  arr[mid]];
    return arr[mid].score;
  }

  function partitionDesc(arr, lo, hi) {
    const pivot = medianOfThree(arr, lo, hi);
    [arr[hi - 1], arr[hi]] = [arr[hi], arr[hi - 1]];
    let i = lo - 1;
    let j = hi - 1;
    while (true) {
      while (arr[++i].score > pivot);
      while (arr[--j].score < pivot);
      if (i >= j) break;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    [arr[i], arr[hi - 1]] = [arr[hi - 1], arr[i]];
    return i;
  }

  function _quickSort(arr, lo, hi) {
    if (hi - lo < 3) {
      for (let i = lo + 1; i <= hi; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= lo && arr[j].score < key.score) { arr[j + 1] = arr[j]; j--; }
        arr[j + 1] = key;
      }
      return;
    }
    const p = partitionDesc(arr, lo, hi);
    _quickSort(arr, lo,     p - 1);
    _quickSort(arr, p + 1,  hi);
  }

  function quickSortResults(arr) {
    if (arr.length < 2) return arr;
    _quickSort(arr, 0, arr.length - 1);
    return arr;
  }

  function search(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) return [];

    const queryTokens = tokenise(rawQuery);
    if (queryTokens.length === 0) return [];

    const expandedTokens = queryTokens.flatMap(t => fuzzyExpand(t));

    const currentPageResults = searchCurrentPage(rawQuery);

    const scored = corpus.map(doc => ({
      url:     doc.url,
      title:   doc.title,
      snippet: doc.bodyText,
      score:   tfidfScore(expandedTokens, doc.id),
    }));
    currentPageResults.forEach(hit => {
      const existing = scored.find(r => r.url === hit.url);
      if (existing) existing.score += 3.0;
      else scored.push(hit);
    });

    const nonZero = scored.filter(r => r.score > 0);
    quickSortResults(nonZero);

    return nonZero.slice(0, 7);
  }

  function searchCurrentPage(query) {
    const q    = query.toLowerCase();
    const hits = [];
    const seen = new Set();

    document.body.querySelectorAll("p, h1, h2, h3, h4, li, a, span, td").forEach(el => {
      const text = el.innerText || el.textContent || "";
      if (text.toLowerCase().includes(q)) {
        let snippet = text.trim().replace(/\s+/g, " ");
        if (snippet.length > 90) snippet = snippet.slice(0, 90) + "…";
        if (!seen.has(snippet)) {
          seen.add(snippet);
          hits.push({
            url:     window.location.pathname,
            title:   "Current Page",
            snippet: snippet,
            score:   0,  
          });
        }
      }
    });
    return hits.slice(0, 3);
  }

  async function fetchPageText(url) {
    try {
      const res = await fetch(url, { method: "GET", credentials: "same-origin" });
      if (!res.ok) return "";
      const html   = await res.text();
      const parser = new DOMParser();
      const doc    = parser.parseFromString(html, "text/html");
      // Strip scripts/styles from parsed doc
      doc.querySelectorAll("script, style, noscript").forEach(el => el.remove());
      return (doc.body?.innerText || doc.body?.textContent || "").replace(/\s+/g, " ").trim();
    } catch {
      return "";
    }
  }
  async function initSearchIndex() {
    const fetchJobs = SITE_PAGES.map(async page => {
      const bodyText = await fetchPageText(page.url);
      corpus.push(buildDocument(page, bodyText));
    });
    await Promise.allSettled(fetchJobs);
    buildInvertedIndex();
    console.log(
      `%c[NBEP Search] ✅ Indexed ${corpus.length} pages, ${invertedIndex.size} unique terms.`,
      "color:#39FF14; font-weight:700;"
    );
  }

  function highlight(text, query) {
    if (!text) return "";
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      return text.replace(new RegExp(`(${escaped})`, "gi"),
        "<mark style='background:#ffd900;color:#000;border-radius:2px;padding:0 2px;'>$1</mark>");
    } catch {
      return text;
    }
  }

  function renderDropdown(dropdown, results, query) {
    dropdown.innerHTML = "";

    if (results.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "padding:12px 14px;color:#888;font-size:13px;font-style:italic;";
      empty.textContent   = "No results found — try different keywords.";
      dropdown.appendChild(empty);
      dropdown.style.display = "block";
      return;
    }

    results.forEach((r, idx) => {
      const item = document.createElement("a");
      item.href       = r.url;
      item.style.cssText =
        "display:block;padding:10px 14px;border-bottom:1px solid #eee;" +
        "text-decoration:none;color:#222;transition:background 0.15s;";

      item.addEventListener("mouseenter", () => { item.style.background = "#f5f7ff"; });
      item.addEventListener("mouseleave", () => { item.style.background = ""; });

      const titleEl        = document.createElement("div");
      titleEl.style.cssText = "font-weight:700;font-size:14px;color:#000;";
      titleEl.innerHTML     = highlight(r.title, query);

      const snippetEl        = document.createElement("div");
      snippetEl.style.cssText = "font-size:12px;color:#555;margin-top:2px;line-height:1.4;";
      snippetEl.innerHTML     = r.snippet ? highlight(r.snippet, query) : r.url;

      const badge        = document.createElement("span");
      badge.style.cssText =
        "float:right;font-size:10px;background:#eef;color:#669;" +
        "border-radius:3px;padding:1px 5px;margin-left:6px;";
      badge.title     = "Relevance score";
      badge.textContent = `#${idx + 1}`;

      titleEl.appendChild(badge);
      item.appendChild(titleEl);
      item.appendChild(snippetEl);
      dropdown.appendChild(item);
    });

    dropdown.style.display = "block";
  }

  document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("toolbarSearch");
    if (!searchInput) {
      console.warn("[NBEP Search] ⚠ Could not find #toolbarSearch — aborting.");
      return;
    }

    let dropdown = document.getElementById("nbepSearchDropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id             = "nbepSearchDropdown";
      dropdown.style.cssText  =
        "position:fixed;top:70px;right:10px;width:320px;" +
        "background:#fff;border:1px solid #ccc;border-radius:8px;" +
        "box-shadow:0 6px 20px rgba(0,0,0,0.15);display:none;" +
        "z-index:9999;max-height:440px;overflow-y:auto;";
      document.body.appendChild(dropdown);
    }

    let clearBtn = searchInput.parentElement.querySelector(".nbep-clear-btn");
    if (!clearBtn) {
      clearBtn              = document.createElement("span");
      clearBtn.className    = "nbep-clear-btn";
      clearBtn.textContent  = "✕";
      clearBtn.style.cssText =
        "cursor:pointer;display:none;color:#aaa;font-size:14px;" +
        "margin-left:4px;transition:color 0.2s;";
      clearBtn.addEventListener("mouseenter", () => { clearBtn.style.color = "#555"; });
      clearBtn.addEventListener("mouseleave", () => { clearBtn.style.color = "#aaa"; });
      searchInput.parentElement.appendChild(clearBtn);
    }

    clearBtn.addEventListener("click", () => {
      searchInput.value       = "";
      dropdown.style.display  = "none";
      clearBtn.style.display  = "none";
      searchInput.focus();
    });

    let debounceTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();

      if (!query) {
        dropdown.style.display = "none";
        clearBtn.style.display = "none";
        return;
      }

      clearBtn.style.display = "inline";

      debounceTimer = setTimeout(() => {
        const results = search(query);
        renderDropdown(dropdown, results, query);
      }, 120);
    });

    searchInput.addEventListener("keydown", (e) => {
      const items = dropdown.querySelectorAll("a");
      const active = dropdown.querySelector("a.nbep-active");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!active) { items[0]?.classList.add("nbep-active"); items[0]?.focus(); }
        else {
          const next = [...items].indexOf(active) + 1;
          active.classList.remove("nbep-active");
          if (next < items.length) { items[next].classList.add("nbep-active"); items[next].focus(); }
        }
      }
      if (e.key === "Escape") {
        dropdown.style.display = "none";
        clearBtn.style.display = "none";
      }
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    initSearchIndex();
  });

})();
