import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import nunjucks from "nunjucks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const templatesDir = path.join(rootDir, "templates");
const distDir = path.join(rootDir, "dist");
const allowedThemes = new Set(["irish", "british", "spanish", "german", "polish", "italian"]);

async function readJson(fileName) {
  const raw = await fs.readFile(path.join(contentDir, fileName), "utf8");
  return JSON.parse(raw);
}

function normalisePhoneHref(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

function createRenderer() {
  return nunjucks.configure(templatesDir, {
    autoescape: true,
    noCache: true
  });
}

async function copyDirectory(source, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true, force: true });
}

async function ensureDirectory(target) {
  await fs.mkdir(target, { recursive: true });
}

async function writePage(renderer, template, outputFile, context) {
  const html = renderer.render(template, context);
  const outputPath = path.join(distDir, outputFile);
  await ensureDirectory(path.dirname(outputPath));
  await fs.writeFile(outputPath, html, "utf8");
}

function withDerivedData(site) {
  const candidateTheme = String(site.theme || "irish").toLowerCase();
  const theme = allowedThemes.has(candidateTheme) ? candidateTheme : "irish";
  return {
    ...site,
    theme,
    themeClass: `theme-${theme}`,
    contact: {
      ...site.contact,
      phoneHref: site.contact.phoneLink || normalisePhoneHref(site.contact.phoneDisplay)
    }
  };
}

export async function buildSite() {
  const site = await readJson("site.json");
  const renderer = createRenderer();
  const siteData = withDerivedData(site);
  const year = new Date().getFullYear();
  const generatedAt = new Date().toISOString();

  await ensureDirectory(distDir);

  await Promise.all([
    copyDirectory(path.join(rootDir, "src", "assets"), path.join(distDir, "assets")),
    copyDirectory(path.join(contentDir, "media"), path.join(distDir, "assets", "images", "uploads")),
    copyDirectory(path.join(contentDir, "files"), path.join(distDir, "assets", "files"))
  ]);

  const baseContext = {
    site: siteData,
    year
  };

  await Promise.all([
    writePage(renderer, "pages/index.njk", "index.html", {
      ...baseContext,
      pageTitle: siteData.siteTitle,
      pageDescription: siteData.siteDescription
    }),
    writePage(renderer, "pages/gdpr.njk", "gdpr.html", {
      ...baseContext,
      bodyClass: "legal-page",
      pageTitle: `GDPR | ${siteData.businessName}`,
      pageDescription: `Data protection information for ${siteData.businessName}.`
    }),
    writePage(renderer, "pages/privacy.njk", "privacy.html", {
      ...baseContext,
      bodyClass: "legal-page",
      pageTitle: `Privacy | ${siteData.businessName}`,
      pageDescription: `Privacy information for ${siteData.businessName}.`
    }),
    writePage(renderer, "pages/terms.njk", "terms.html", {
      ...baseContext,
      bodyClass: "legal-page",
      pageTitle: `Terms | ${siteData.businessName}`,
      pageDescription: `Website terms for ${siteData.businessName}.`
    })
  ]);

  await fs.writeFile(
    path.join(distDir, "build-meta.json"),
    JSON.stringify(
      {
        generatedAt,
        businessName: siteData.businessName
      },
      null,
      2
    ),
    "utf8"
  );

  return {
    generatedAt,
    distDir
  };
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirectRun) {
  buildSite().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
