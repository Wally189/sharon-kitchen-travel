process.env.BASE_PATH ||= "/sharon-kitchen-travel";
process.env.OUTPUT_DIR ||= "docs";
process.env.PUBLIC_SITE_ONLY ||= "1";
process.env.PUBLIC_ADMIN_URL ||= "https://sharon-kitchen-travel-1nko.vercel.app/admin/index.html";

const { buildSite } = await import("./build-site.mjs");

buildSite().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
