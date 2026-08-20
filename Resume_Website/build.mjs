/**
 * Optional content build script (zero runtime dependencies).
 *
 * Edit assets/data/resume.json, then run:  node build.mjs
 * It regenerates the Experience and Capabilities sections inside index.html
 * between the BUILD:* markers, so you can update content without touching UI.
 *
 * Node 18+ required. This does NOT run on the server; it is a local authoring tool.
 */
import { readFileSync, writeFileSync } from "node:fs";

const esc = (s = "") =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const data = JSON.parse(readFileSync("./assets/data/resume.json", "utf8"));

/* ---- Experience ---- */
function expItem(x) {
  const bullets = x.responsibilities.map((b) => `            <li>${b}</li>`).join("\n");
  const tags = (x.skills || []).map((t) => `<li>${esc(t)}</li>`).join("");
  return `        <article class="exp-item" data-reveal>
          <div class="exp-top">
            <div class="exp-title"><strong>${esc(x.role)}</strong> · <span class="exp-company">${esc(x.company)}</span></div>
            <div class="exp-dates">${esc(x.start)} — ${esc(x.end)}</div>
          </div>
          <div class="exp-loc">${esc(x.location)}</div>
          <p class="exp-lead">${x.lead}</p>
          <p class="exp-subhead">Responsibilities &amp; outcomes</p>
          <ul class="exp-bullets">
${bullets}
          </ul>
          <ul class="tags">${tags}</ul>
        </article>`;
}

function earlierBlock(list) {
  const items = list
    .map(
      (e) => `            <li><div class="earlier-role"><strong>${esc(e.role)}</strong> · ${esc(e.company)}</div><div class="earlier-meta">${esc(e.location)} · ${esc(e.start)} — ${esc(e.end)}</div><p>${e.note}</p></li>`
    )
    .join("\n");
  return `        <div class="earlier" data-reveal>
          <h3 class="earlier-title">Earlier experience</h3>
          <ul class="earlier-list">
${items}
          </ul>
        </div>`;
}

const experienceHtml =
  data.experience.map(expItem).join("\n\n") + "\n\n" + earlierBlock(data.earlierExperience);

/* ---- Skills ---- */
const skillsHtml = `        <div class="skills-grid">
${data.skillGroups
  .map(
    (g) =>
      `          <div class="skill-card" data-reveal><h3>${esc(g.name)}</h3><ul>${g.skills
        .map((s) => `<li>${esc(s)}</li>`)
        .join("")}</ul></div>`
  )
  .join("\n")}
        </div>`;

/* ---- Inject ---- */
function inject(html, name, payload) {
  const start = `<!-- BUILD:${name}:START -->`;
  const end = `<!-- BUILD:${name}:END -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!re.test(html)) {
    throw new Error(`Markers for ${name} not found in index.html`);
  }
  return html.replace(re, `${start}\n${payload}\n        ${end}`);
}

let html = readFileSync("./index.html", "utf8");
html = inject(html, "EXPERIENCE", experienceHtml);
html = inject(html, "SKILLS", skillsHtml);
writeFileSync("./index.html", html, "utf8");

console.log("✓ index.html regenerated from resume.json");
console.log(`  Experience roles: ${data.experience.length} + earlier: ${data.earlierExperience.length}`);
console.log(`  Skill groups: ${data.skillGroups.length}`);
