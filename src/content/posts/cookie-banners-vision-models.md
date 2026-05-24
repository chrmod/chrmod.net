---
title: "Cookie banners make vision models hallucinate webpage content"
description: "9 US news sites × 2 variants × 10 trials = 180 vision-API calls. With cookie banners on screen, the model returns empty arrays a third of the time — or worse, invents plausible-sounding headlines."
date: 2026-05-21
tags: ["ai", "vision", "browsers", "ghostery", "scraping"]
readTime: "10 min read"
draft: false
excerpt: "When a cookie banner is on screen at screenshot time, vision models often invent plausible headlines instead of failing loudly. 180 API calls across 9 news sites quantify it."
hnUrl: "https://news.ycombinator.com/item?id=48256478"
---

<style>
  /* Hide the standard post chrome — this post brings its own title + meta. */
  body:has(.cookies-post) main.post .crumbs,
  body:has(.cookies-post) main.post h1.title,
  body:has(.cookies-post) main.post .meta-strip,
  body:has(.cookies-post) main.post .endmark { display: none; }
  body:has(.cookies-post) main.post { padding: 0; }
  body:has(.cookies-post) main.post.wrap { max-width: none; padding: 0; }

  .post article .cookies-post {
    --cp-bg: #fbfaf6;
    --cp-fg: #1a1a1a;
    --cp-muted: #6b6b6b;
    --cp-rule: #e6e3d8;
    --cp-rule-strong: #c8c5b9;
    --cp-vanilla: #c93a4a;
    --cp-ghostery: #1f6dde;
    --cp-code-bg: #efebe0;
    background: var(--cp-bg);
    color: var(--cp-fg);
    margin: -28px calc(50% - 50vw) -80px;
    padding: 56px calc(50vw - 50%) 96px;
    font: 17px/1.6 -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Helvetica, Arial, sans-serif;
    max-width: none;
  }
  .post article .cookies-post * { max-width: none; }
  .post article .cookies-post-inner {
    max-width: 780px;
    margin: 0 auto;
    padding: 0 24px;
  }
  .post article .cookies-post h1 {
    font-size: 38px;
    line-height: 1.15;
    margin: 0 0 10px;
    letter-spacing: -0.5px;
    color: var(--cp-fg);
    font-family: inherit;
    font-weight: 700;
    text-transform: none;
  }
  .post article .cookies-post h1::before { content: none; }
  .post article .cookies-post h2 {
    font-size: 22px;
    margin: 44px 0 14px;
    letter-spacing: -0.2px;
    color: var(--cp-fg);
    font-family: inherit;
    font-weight: 700;
    text-transform: none;
  }
  .post article .cookies-post h2::before { content: none; }
  .post article .cookies-post .chart h2 { margin: 0 0 14px; font-size: 19px; }
  .post article .cookies-post h3 {
    font-size: 17px;
    margin: 24px 0 8px;
    color: var(--cp-fg);
    font-family: inherit;
    font-style: normal;
    font-weight: 700;
  }
  .post article .cookies-post p { margin: 0 0 16px; }
  .post article .cookies-post p.meta {
    color: var(--cp-muted);
    font-style: italic;
    font-size: 15px;
    margin-top: -4px;
  }
  .post article .cookies-post a {
    color: var(--cp-vanilla);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-thickness: auto;
  }
  .post article .cookies-post code {
    font: 14px/1 SFMono-Regular, Menlo, Consolas, monospace;
    background: var(--cp-code-bg);
    padding: 2px 5px;
    border-radius: 3px;
    border: 0;
    color: var(--cp-fg);
  }
  .post article .cookies-post pre {
    background: #14181f;
    color: #e8e8e8;
    padding: 14px 16px;
    border-radius: 6px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    border: 0;
    box-shadow: none;
    font-family: SFMono-Regular, Menlo, Consolas, monospace;
  }
  .post article .cookies-post pre::before { content: none; }
  .post article .cookies-post pre code {
    background: transparent;
    padding: 0;
    color: inherit;
    font-size: 12.5px;
    line-height: 1.45;
    white-space: pre-wrap;
    border: 0;
  }
  .post article .cookies-post hr {
    border: 0;
    border-top: 1px solid var(--cp-rule);
    margin: 40px 0;
  }
  .post article .cookies-post blockquote {
    margin: 16px 0;
    padding: 8px 16px;
    border-left: 3px solid var(--cp-rule);
    color: var(--cp-muted);
    font-style: italic;
    background: transparent;
  }
  .post article .cookies-post blockquote strong { color: var(--cp-fg); }
  .post article .cookies-post table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 24px;
    font-size: 14.5px;
  }
  .post article .cookies-post th, .post article .cookies-post td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--cp-rule);
    text-align: right;
    vertical-align: top;
  }
  .post article .cookies-post th:first-child, .post article .cookies-post td:first-child { text-align: left; }
  .post article .cookies-post th {
    font-weight: 600;
    color: var(--cp-muted);
    font-size: 12.5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--cp-rule-strong);
  }
  .post article .cookies-post ul, .post article .cookies-post ol {
    margin: 0 0 16px 0;
    padding-left: 24px;
  }
  .post article .cookies-post li { margin: 4px 0; }
  .post article .cookies-post li::marker { color: var(--cp-muted); }

  /* hero comparison */
  .post article .cookies-post .hero {
    margin: 24px 0 28px;
    padding: 24px 24px 16px;
    background: #fff;
    border: 1px solid var(--cp-rule);
    border-radius: 8px;
  }
  .post article .cookies-post .hero h2 { margin-top: 0; }
  .post article .cookies-post .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }
  @media (max-width: 720px) {
    .post article .cookies-post .hero-grid { grid-template-columns: 1fr; }
  }
  .post article .cookies-post .hero-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .post article .cookies-post .hero-head {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cp-rule);
    min-height: 56px;
  }
  .post article .cookies-post .hero-tag {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 3px;
    font-size: 12px;
    color: #fff;
    font-weight: 600;
    align-self: flex-start;
  }
  .post article .cookies-post .tag-vanilla { background: var(--cp-vanilla); }
  .post article .cookies-post .tag-ghostery { background: var(--cp-ghostery); }
  .post article .cookies-post .hero-cost {
    font: 11.5px/1.35 SFMono-Regular, Menlo, monospace;
    color: var(--cp-muted);
  }
  .post article .cookies-post .hero-cost strong { color: var(--cp-fg); }
  .post article .cookies-post .hero-screenshot img {
    width: 100%;
    height: auto;
    border: 1px solid var(--cp-rule);
    border-radius: 4px;
    display: block;
    margin: 0;
  }
  .post article .cookies-post .hero-output-label {
    font-size: 12px;
    color: var(--cp-muted);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .post article .cookies-post .hero-output pre {
    margin: 0;
    max-height: 280px;
    overflow-y: auto;
  }

  /* bar chart */
  .post article .cookies-post .chart {
    margin: 16px 0 32px;
    padding: 20px 22px;
    background: #fff;
    border: 1px solid var(--cp-rule);
    border-radius: 8px;
  }
  .post article .cookies-post .bar-row {
    display: grid;
    grid-template-columns: 110px 1fr 64px;
    gap: 12px;
    align-items: center;
    margin: 8px 0;
  }
  .post article .cookies-post .bar-label {
    font: 13px/1 SFMono-Regular, Menlo, monospace;
    color: var(--cp-muted);
  }
  .post article .cookies-post .bar-track {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .post article .cookies-post .bar-line {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    position: relative;
  }
  .post article .cookies-post .bar {
    height: 26px;
    border-radius: 3px;
    position: relative;
    flex-shrink: 0;
  }
  .post article .cookies-post .bar-vanilla { background: var(--cp-vanilla); }
  .post article .cookies-post .bar-ghostery { background: var(--cp-ghostery); }
  .post article .cookies-post .bar-num {
    font: 11.5px/1 SFMono-Regular, Menlo, monospace;
    white-space: nowrap;
  }
  .post article .cookies-post .bar-num-inside {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #fff;
  }
  .post article .cookies-post .bar-num-outside { color: var(--cp-muted); }
  .post article .cookies-post .whisker {
    position: absolute;
    top: 50%;
    height: 2px;
    background: rgba(0, 0, 0, 0.45);
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 2;
  }
  .post article .cookies-post .whisker::before,
  .post article .cookies-post .whisker::after {
    content: '';
    position: absolute;
    top: -4px;
    width: 2px;
    height: 10px;
    background: rgba(0, 0, 0, 0.45);
  }
  .post article .cookies-post .whisker::before { left: 0; }
  .post article .cookies-post .whisker::after { right: 0; }
  .post article .cookies-post .bar-saved {
    font: 13px/1 SFMono-Regular, Menlo, monospace;
    color: var(--cp-muted);
    text-align: right;
  }
  .post article .cookies-post .legend {
    margin: 12px 0 0 122px;
    font-size: 12.5px;
    color: var(--cp-muted);
    display: flex;
    gap: 20px;
  }
  .post article .cookies-post .legend i.swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
    border-radius: 2px;
    vertical-align: middle;
  }
  .post article .cookies-post .swatch-vanilla { background: var(--cp-vanilla); }
  .post article .cookies-post .swatch-ghostery { background: var(--cp-ghostery); }
</style>

<div class="cookies-post">
<div class="cookies-post-inner">

<h1>Cookie banners don't just block vision models—they cause them to hallucinate</h1>
<p class="meta">2026-05-21. 9 US news sites × 2 variants × 10 trials = 180 calls. Anthropic Sonnet 4.5 vision API. Methodology at the bottom.</p>

<p>When a cookie banner is on screen at the moment you screenshot a webpage and feed the screenshot to a vision model, the model often doesn't just fail to extract the headlines — it confidently invents plausible-sounding ones. Same page, same model, banner removed: it gets the headlines right.</p>

<p>Across 180 API calls — 9 US news sites, vanilla Chrome vs. Chrome + Ghostery (autoconsent strips the banner), 10 trials per cell — the vanilla model returned <strong>30/90 empty <code>articles</code> arrays (33%)</strong>. Ghostery returned <strong>0/90 empty (0%)</strong>. On <strong>5 of 9 sites</strong> (<code>theverge</code>, <code>npr</code>, <code>slate</code>, <code>vox</code>, <code>huffpost</code>), the median vanilla trial extracts <strong>zero</strong> real headlines — either empty, or confabulated entries that don't match anything on the page. On all 9 sites Ghostery extracts real headlines on every trial.</p>

<blockquote><strong>Takeaway, up front:</strong> if you ship a vision-based scraping pipeline or browser agent (Operator, Comet, Arc, browser-use, Skyvern, anything that screenshots a page and sends it to an LLM), an autoconsent/adblocker layer is a mandatory pre-processing step. Downstream code can't tell hallucinated headlines from real ones because the JSON is well-formed either way.</blockquote>

<section class="hero">
  <h2>See it happen: slate.com</h2>
  <div class="hero-grid">
    <div class="hero-col">
      <div class="hero-head">
        <div class="hero-tag tag-vanilla">Vanilla Chrome</div>
        <div class="hero-cost">articles: <strong>0</strong> · output: 337 tok · zero_articles</div>
      </div>
      <div class="hero-screenshot">
        <img src="/cookie-banners-vision/slate-vanilla.png" alt="Vanilla Chrome viewport on slate.com with cookie banner covering the page">
      </div>
      <div class="hero-output">
        <div class="hero-output-label">Model output (truncated):</div>
<pre><code>{
  "articles": [],
  "navigation": [
    "News &amp; Politics",
    "Culture",
    "Technology",
    "Business",
    "Life",
    "Advice",
    "Podcasts"
  ],
  "other": [
    "$5 Sale",
    "Slate Shop",
    "Games",
    "Newsletters",
    "Sign In",
    "We Care About Your Privacy",
    "We and our partners process data to provide:",
    "We and our 340 partners store and access personal data, like browsing data or unique identifiers, on your device...",
    "Use precise geolocation data. Actively scan device characteristics for identification..."
  ...</code></pre>
      </div>
    </div>
    <div class="hero-col">
      <div class="hero-head">
        <div class="hero-tag tag-ghostery">Chrome + Ghostery</div>
        <div class="hero-cost">articles: <strong>8</strong> · output: 339 tok · ok</div>
      </div>
      <div class="hero-screenshot">
        <img src="/cookie-banners-vision/slate-ghostery.png" alt="Chrome + Ghostery viewport on slate.com with the banner stripped by autoconsent">
      </div>
      <div class="hero-output">
        <div class="hero-output-label">Model output (truncated):</div>
<pre><code>{
  "articles": [
    "The Latest Literary Controversy Is All About Two Pages Out of Hundreds. I Read the Whole Thing.",
    "America's Hottest Primary Has Clues About What's Coming After Trump. It's Not Pretty.",
    "Maybe Trump Is Giving Us the Capital City We Deserve",
    "Trump's Efforts to Intimidate Elon Musk's Enemies Just Faced a Severe Setback",
    "Justice Jackson Seems to Be Warning Us About the Supreme Court's Next Voting Rights Target",
    "Is the Supreme Court's Abortion Pill Ruling Actually a Feint?",
    "Play Today's Pears 🍐",
    "Slate Mini Crossword for May 20, 2026"
  ],
  "navigation": [
    "$5 Sale",
    "Slate Shop",
    "Games",
    "Newsletters",
    "Sign In",
    "News &amp; Politics",
    "Culture",
    "Technology",
    "Business",
    "Life",
    "Advice",
    "Podcasts"
  ],
  "other": [
    "EXPERTS AND AESTHETES",
    "Search",
    "Light",
    "LAURA MILLER",
    "BEN JACOBS",
    "TRUMPWORLD",
    "THE LAW",
    "SLATE GAMES"
  ]
}</code></pre>
      </div>
    </div>
  </div>
</section>

<p>Same Slate homepage, same Anthropic Sonnet 4.5 vision model, same prompt — 10 trials on each variant. <strong>Vanilla Chrome:</strong> the model returned an empty array on 7 of 10 trials, fabricated content on the other 3. <strong>Chrome + Ghostery:</strong> the model returned the 6 actual top story headlines on all 10 trials.</p>

<h2>What the model hallucinates vs. what's actually on the page</h2>

<p>Three illustrative pairs from this run. Vanilla is on the left (fabricated entries from sites where the model returned <em>something</em> under the consent modal). Ghostery is on the right (what the actual top story was, recovered consistently across 10 trials with no banner in the way).</p>

<table>
  <thead>
    <tr><th>Site</th><th>Vanilla returned (fabricated)</th><th>Actual top story (Ghostery returned)</th></tr>
  </thead>
  <tbody>
    <tr><td>npr.org</td><td><em>"Defunding public broadcasting doesn't return money to taxpayers"</em></td><td><em>"Here's how Tuesday's primary elections played out, state by state"</em></td></tr>
    <tr><td>theverge.com</td><td><em>"Honda's new EV is a rebranded GM Blazer"</em></td><td><em>"Valve says games like Vampire Survivors fall under the 'Bullet Heaven' genre"</em></td></tr>
    <tr><td>usatoday.com</td><td><em>"New Google CEO Amar Pichawalla: What to know about the new leader"</em></td><td><em>"US-Cuba tensions escalate amid Raúl Castro indictment: Updates"</em></td></tr>
  </tbody>
</table>

<p>Vanilla returns syntactically valid JSON containing those fake titles. Sundar Pichai isn't named "Amar Pichawalla." NPR's top story isn't about defunding public broadcasting. theverge's top story isn't about Hondas. A pipeline parsing this output has no signal that anything is wrong.</p>

<p>More fabrications from the same run:</p>

<ul>
  <li><strong>usatoday vanilla</strong> also returned <em>"Police say man set three people on fire in Chicago"</em> and <em>"Eric Trump arrested on charges tied to Jan. 6? No, this is a fake photo."</em> Neither was on the page.</li>
  <li><strong>theguardian vanilla</strong> repeatedly returned three close-but-different paraphrases of a Stephen Colbert headline (<em>"hosts bid goodbye"</em>, <em>"hosts say goodbye"</em>, <em>"bids a complicated goodbye"</em>) — the real headline is a single different phrasing.</li>
  <li><strong>npr vanilla</strong> returned <em>"Cookie Consent &amp; Sponsorship Choices"</em> as an article on one trial. That's the modal title.</li>
</ul>

<section class="chart">
  <h2>Real headlines extracted per inventory call (median across 10 trials)</h2>

  <div class="bar-row">
    <div class="bar-label">theverge</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:0%"></div><span class="bar-num bar-num-outside">0.0 headlines</span></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:22.22%"><span class="bar-num bar-num-inside">2.0</span></div><div class="whisker" style="left:11.11%;width:22.22%" title="min 1 – max 3 across 10 trials"></div></div>
    </div>
    <div class="bar-saved">0 → 2.0</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">cnn</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:33.33%"><span class="bar-num bar-num-inside">3.0 headlines</span></div><div class="whisker" style="left:11.11%;width:22.22%" title="min 1 – max 3 across 10 trials"></div></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:66.66%"><span class="bar-num bar-num-inside">6.0</span></div><div class="whisker" style="left:44.44%;width:22.22%" title="min 4 – max 6 across 10 trials"></div></div>
    </div>
    <div class="bar-saved">+100%</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">npr</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:0%"></div><span class="bar-num bar-num-outside">0.0 headlines</span></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:44.44%"><span class="bar-num bar-num-inside">4.0</span></div><div class="whisker" style="left:33.33%;width:11.11%" title="min 3 – max 4 across 10 trials"></div></div>
    </div>
    <div class="bar-saved">0 → 4.0</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">theguardian</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:22.22%"><span class="bar-num bar-num-inside">2.0 headlines</span></div><div class="whisker" style="left:11.11%;width:11.11%" title="min 1 – max 2 across 10 trials"></div></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:33.33%"><span class="bar-num bar-num-inside">3.0</span></div></div>
    </div>
    <div class="bar-saved">+50%</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">usatoday</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:22.22%"><span class="bar-num bar-num-inside">2.0 headlines</span></div><div class="whisker" style="left:11.11%;width:44.44%" title="min 1 – max 5 across 10 trials"></div></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:66.66%"><span class="bar-num bar-num-inside">6.0</span></div><div class="whisker" style="left:33.33%;width:66.66%" title="min 3 – max 9 across 10 trials"></div></div>
    </div>
    <div class="bar-saved">+200%</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">slate</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:0%"></div><span class="bar-num bar-num-outside">0.0 headlines</span></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:77.77%"><span class="bar-num bar-num-inside">7.0</span></div><div class="whisker" style="left:66.66%;width:11.11%" title="min 6 – max 7 across 10 trials"></div></div>
    </div>
    <div class="bar-saved">0 → 7.0</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">vox</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:0%"></div><span class="bar-num bar-num-outside">0.0 headlines</span></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:11.11%"></div><span class="bar-num bar-num-outside">1.0</span><div class="whisker" style="left:11.11%;width:22.22%" title="min 1 – max 3 across 10 trials"></div></div>
    </div>
    <div class="bar-saved">0 → 1.0</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">huffpost</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:0%"></div><span class="bar-num bar-num-outside">0.0 headlines</span></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:22.22%"><span class="bar-num bar-num-inside">2.0</span></div></div>
    </div>
    <div class="bar-saved">0 → 2.0</div>
  </div>
  <div class="bar-row">
    <div class="bar-label">newsweek</div>
    <div class="bar-track">
      <div class="bar-line"><div class="bar bar-vanilla" style="width:44.44%"><span class="bar-num bar-num-inside">4.0 headlines</span></div></div>
      <div class="bar-line"><div class="bar bar-ghostery" style="width:44.44%"><span class="bar-num bar-num-inside">4.0</span></div></div>
    </div>
    <div class="bar-saved">0%</div>
  </div>

  <div class="legend">
    <span><i class="swatch swatch-vanilla"></i>Vanilla Chrome</span>
    <span><i class="swatch swatch-ghostery"></i>Chrome + Ghostery</span>
  </div>
</section>

<h2>Per-page numbers</h2>

<table>
  <thead>
    <tr><th>Page</th><th>Variant</th><th>Med real headlines (min / max across 10 trials)</th><th>Med array length</th><th>Zero-article trials</th></tr>
  </thead>
  <tbody>
    <tr><td>theverge</td><td>vanilla</td><td>0 (0 / 0)</td><td>0</td><td>7 / 10</td></tr>
    <tr><td>theverge</td><td>ghostery</td><td>2 (1 / 3)</td><td>2</td><td>0 / 10</td></tr>
    <tr><td>cnn</td><td>vanilla</td><td>3 (1 / 3)</td><td>8</td><td>0 / 10</td></tr>
    <tr><td>cnn</td><td>ghostery</td><td>6 (4 / 6)</td><td>7</td><td>0 / 10</td></tr>
    <tr><td>npr</td><td>vanilla</td><td>0 (0 / 0)</td><td>1</td><td>0 / 10</td></tr>
    <tr><td>npr</td><td>ghostery</td><td>4 (3 / 4)</td><td>4</td><td>0 / 10</td></tr>
    <tr><td>theguardian</td><td>vanilla</td><td>2 (1 / 2)</td><td>4</td><td>0 / 10</td></tr>
    <tr><td>theguardian</td><td>ghostery</td><td>3 (3 / 3)</td><td>3</td><td>0 / 10</td></tr>
    <tr><td>usatoday</td><td>vanilla</td><td>2 (1 / 5)</td><td>5</td><td>0 / 10</td></tr>
    <tr><td>usatoday</td><td>ghostery</td><td>6 (3 / 9)</td><td>6</td><td>0 / 10</td></tr>
    <tr><td>slate</td><td>vanilla</td><td>0 (0 / 0)</td><td>0</td><td>7 / 10</td></tr>
    <tr><td>slate</td><td>ghostery</td><td>7 (6 / 7)</td><td>8</td><td>0 / 10</td></tr>
    <tr><td>vox</td><td>vanilla</td><td>0 (0 / 0)</td><td>0</td><td>6 / 10</td></tr>
    <tr><td>vox</td><td>ghostery</td><td>1 (1 / 3)</td><td>1</td><td>0 / 10</td></tr>
    <tr><td>huffpost</td><td>vanilla</td><td>0 (0 / 0)</td><td>0</td><td>10 / 10</td></tr>
    <tr><td>huffpost</td><td>ghostery</td><td>2 (2 / 2)</td><td>3</td><td>0 / 10</td></tr>
    <tr><td>newsweek</td><td>vanilla</td><td>4 (4 / 4)</td><td>4</td><td>0 / 10</td></tr>
    <tr><td>newsweek</td><td>ghostery</td><td>4 (4 / 4)</td><td>4</td><td>0 / 10</td></tr>
  </tbody>
</table>

<p class="meta">"Real headlines extracted" counts how many distinct ground-truth headlines from the page a trial successfully captured. "Array length" is the raw size of the <code>articles</code> array the model returned. The two diverge when the model returns near-duplicates, abbreviated tags, or fabricated entries — the chart and analysis below use the "real headlines" metric.</p>

<h3>How we counted real headlines</h3>

<p>Raw array length isn't a fair quality proxy. CNN's homepage shows <em>two</em> layers of "headlines" — a 7-entry tag-cloud of short labels (<code>"Raul Castro indicted"</code>, <code>"Ebola outbreak"</code>, <code>"Putin and Xi"</code>) and a hero card with full article titles (<code>"94-year-old Castro is charged with conspiracy to kill US nationals, destruction of an aircraft and murder"</code>). Vanilla on CNN reliably extracts the tag-cloud; Ghostery reliably extracts the hero card. By raw array count, the tag-cloud (8 entries) looks better than the hero card (5–7 entries). By usefulness to a downstream consumer, the hero card wins by a mile. On theguardian, vanilla returns four entries that are three near-paraphrases of the same real headline plus one fabrication — four entries, but only one real story.</p>

<p>So we count <em>unique real headlines extracted per trial</em>:</p>

<ol>
  <li><strong>Build ground truth from Ghostery's repeated extractions.</strong> A candidate headline goes into ground truth for a page if it (a) is at least 25 characters long, (b) contains at least 4 meaningful (non-stopword) tokens, and (c) appears in at least 2 of the 10 Ghostery trials. The length filter (a, b) excludes tag-cloud labels like <code>"Cave divers"</code> or <code>"Ebola outbreak"</code> so the metric measures real article-title extraction rather than label-dumping. The repetition filter (c) excludes one-off Ghostery-side hallucinations.</li>
  <li><strong>Fuzzy-match</strong> each extracted entry against each ground-truth headline. We tokenize both, drop stopwords, and require at least 50% of the shorter side's tokens to appear in the longer. Under this rule, <code>"Late-night TV hosts bid goodbye to Stephen Colbert"</code> matches the real <code>"Late-night TV says goodbye to Stephen Colbert"</code> (paraphrase of the same headline), but <code>"Raul Castro indicted"</code> does <em>not</em> match <code>"94-year-old Castro is charged with conspiracy…"</code> (only one common meaningful token, "castro").</li>
  <li><strong>Count unique ground-truth headlines matched</strong> per trial. Each ground-truth entry counts at most once per trial, so repeated paraphrases of the same headline collapse into a single match.</li>
</ol>

<h2>Reading the table</h2>

<ul>
  <li><strong>Vanilla extracts zero real headlines (5 of 9 sites — theverge, npr, slate, vox, huffpost):</strong> the model either returns an empty array or fills it with fabricated entries that don't match any real headline on the page. Ghostery extracts the actual top stories. Breakdown: theverge (7/10 empty, 2 → 0 real headlines); npr (0/10 empty, 4 → 0 real headlines); slate (7/10 empty, 7 → 0 real headlines); vox (6/10 empty, 1 → 0 real headlines); huffpost (10/10 empty, 2 → 0 real headlines).</li>
  <li><strong>Mixed (cnn, theguardian, usatoday):</strong> vanilla returns a mix of real headlines and fabrications. The raw array length looks fine, but only some of the entries map to actual page content; Ghostery returns more distinct real headlines.</li>
  <li><strong>No effect (newsweek):</strong> both variants extract roughly the same set of real headlines. The consent banner is small or doesn't visually compete with the article body.</li>
</ul>

<h2>Why the model fails</h2>

<p>Two things the modal does to the image push the model away from the article content:</p>

<ol>
  <li><strong>Physical obstruction.</strong> On <code>slate</code>, <code>huffpost</code>, <code>vox</code> the modal sits over the upper-fold area and the article hero card is literally not in the pixels. At 1280×800 with the banner up, there's nothing to extract.</li>
  <li><strong>Attention hijacking.</strong> On <code>theverge</code>, <code>cnn</code>, <code>usatoday</code>, <code>theguardian</code> the article content is <em>physically still visible</em> around the edges, but the modal is the visually dominant element. The model's attention concentrates on the high-contrast modal text and the article snippets fade into background.</li>
</ol>

<p>The strongest evidence for the second mechanism: on <code>npr</code>, the consent banner is <em>bottom-anchored</em> and the page's top headline is fully visible above it in the vanilla viewport. The model still fails — fabricating NPR-style headlines like <em>"Defunding public broadcasting doesn't return money to taxpayers"</em> while the real top story about Tuesday's primaries sits right there in the pixels, unread.</p>

<h2>Takeaways — what to do if you ship a vision-based browser pipeline</h2>

<ol>
  <li><strong>Treat banner dismissal as a mandatory pre-processing step, not a "nice to have."</strong> Load an autoconsent layer (DuckDuckGo rulebase, Ghostery, Consent-O-Matic, Brave's built-in handling, or hand-rolled CMP-specific dismissers for your target sites) and <em>verify it actually fires</em> — check both the screenshot and the DOM after settle. Rule coverage varies per CMP deployment, and a silently-disabled extension is indistinguishable from no extension at all.</li>
  <li><strong>Add a regression test that asserts "the model returns the page's actual top headlines,"</strong> not just <em>some</em> <code>string[]</code>. The methodology in this post is a runnable template: pick 5–10 pages your product cares about, build a small ground-truth list, assert the model recovers ≥N of them.</li>
  <li><strong>Watch your output tokens, not just input.</strong> Cluttered viewports inflate output-token cost by 30–60% even when extraction succeeds. Image input is fixed (~1,300 tokens for a 1280×800 PNG); the variable cost is on the response side.</li>
  <li><strong>If you can't dismiss the banner, scroll past it before screenshotting.</strong> ~600px down usually leaves the article body visible while the banner stays anchored. Worse than dismissal, better than a banner-dominated screenshot.</li>
  <li><strong>Don't trust string-shaped LLM output to be grounded.</strong> Even when the JSON parses cleanly, the strings inside can be confabulated. Surface uncertainty downstream — confidence thresholds, second-pass cross-checks, or compare against a content-DOM extraction.</li>
</ol>

<p>The point isn't Ghostery specifically. The point is that <strong>some layer between your headless browser and your model needs to clear the banner</strong>, and "no banner clearing" is the silent-default state of every headless Chrome you spin up.</p>

<h2>Methodology</h2>

<p>Source code, raw API outputs per call, and all 180 screenshots are at <a href="https://github.com/ghostery/researches/tree/main/vlm-cookie-banner-may-2026">ghostery/researches/vlm-cookie-banner-may-2026</a>.</p>

<ul>
  <li><strong>Model:</strong> <code>claude-sonnet-4-5-20250929</code>, default temperature, <code>max_tokens=2048</code>, one API call per screenshot.</li>
  <li><strong>Setup:</strong> Chrome for Testing 148 + chromedriver, fresh isolated profile per trial, 5s settle, anti-bot fingerprints suppressed (<code>navigator.webdriver === false</code>, <code>--disable-blink-features=AutomationControlled</code>) so CMPs serve us the same payload they serve a human.</li>
  <li><strong>Pages:</strong> <code>theverge</code>, <code>cnn</code>, <code>npr</code>, <code>theguardian</code>, <code>usatoday</code>, <code>slate</code>, <code>vox</code>, <code>huffpost</code>, <code>newsweek</code>, loaded from a US (San Jose) IP. 9 pages × 2 variants × 10 trials = 180 calls.</li>
  <li><strong>Intervention:</strong> vanilla Chrome vs. Chrome + an unpacked Ghostery extension built with <code>npm run build chromium -- --automation</code> (skips onboarding, enables adblocker + autoconsent without a user click).</li>
  <li><strong>Prompt:</strong> required strict JSON escaping after early parse failures on headlines with nested quotes — 178/180 calls produced syntactically valid JSON in this run.</li>
  <li><strong>Ground truth for matching:</strong> built from Ghostery's extractions, keeping headlines that (a) are ≥25 characters, (b) contain ≥4 non-stopword tokens, (c) appear in ≥2 of 10 Ghostery trials. (a) and (b) exclude tag-cloud labels (<code>"Cave divers"</code>, <code>"Ebola outbreak"</code>); (c) excludes one-off Ghostery hallucinations.</li>
  <li><strong>Fuzzy match:</strong> an extracted entry matches a ground-truth headline if ≥50% of the shorter side's meaningful tokens appear in the longer side.</li>
</ul>

<p>Verbatim prompt:</p>

<blockquote><em>You are an inventory assistant looking at a webpage screenshot. Identify every visible element and categorize each. Output a single JSON object with these keys: <code>"articles"</code> — an array of plain string headlines (each entry is one headline string, not an object). <code>"navigation"</code> — an array of plain string nav link labels. <code>"other"</code> — an array of plain strings for cookie banners, modals, buttons, etc. CRITICAL: every string MUST be valid JSON. Escape any <code>"</code> inside a string as <code>\"</code>. Do not output objects, only plain strings. Do not include trailing commas. Be exhaustive within the visible viewport. Output ONLY the JSON object. No commentary, no code fences.</em></blockquote>

<p><strong>Not a max-tokens crash, not Anthropic-specific, not "you need Ghostery."</strong> Caveats: 178/180 calls produced syntactically valid JSON under 2048 output tokens (1 truncation, 1 parse failure — both vanilla npr); GPT vision and Gemini vision will hit the same attention-budget problem with different specific failure shapes; any browser layer that clears the banner before the screenshot will produce the same result Ghostery did here.</p>

<hr>

<p class="meta">Pricing context: image input ~1,300 tokens per 1280×800 PNG (Anthropic's formula). At Sonnet 4.5 list price ($3 input / $15 output per MTok), each inventory call costs ~$0.005–0.015 depending on output verbosity.</p>

</div>
</div>
