const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");
const { test } = require("node:test");

// Run against a local production server or a Vercel preview deployment.
const baseUrl = process.env.PORTFOLIO_TEST_URL;
const options = {
  skip: !baseUrl && "Set PORTFOLIO_TEST_URL to a running site",
};

async function get(route) {
  return fetch(new URL(route, baseUrl), { signal: AbortSignal.timeout(15000) });
}

async function page(route) {
  const response = await get(route);
  assert.equal(response.status, 200, route);
  return response.text();
}

async function stylesheets(html, route = "/") {
  const hrefs = [
    ...html.matchAll(
      /<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"/g,
    ),
  ].map((match) => match[1].replaceAll("&amp;", "&"));
  assert.ok(hrefs.length, "The document should load its stylesheet");
  return Promise.all(
    [...new Set(hrefs)].map(async (href) => {
      const response = await get(new URL(href, new URL(route, baseUrl)));
      assert.equal(response.status, 200, href);
      return { url: response.url, css: await response.text() };
    }),
  );
}

async function styles(html, route = "/") {
  const sheets = await stylesheets(html, route);
  return sheets.map(({ css }) => css).join("\n");
}

test(
  "V2 is the homepage and V1 retains its original cover and credentials",
  options,
  async () => {
    const [current, archive] = await Promise.all([page("/"), page("/v1")]);
    assert.match(current, /A practical toolkit\./);
    assert.match(current, /data-engine-status/);
    assert.doesNotMatch(current, /PORTFOLIO \/ COVER SHEET/);
    assert.match(archive, /PORTFOLIO \/ COVER SHEET/);
    assert.match(
      archive,
      /Each certification treated as a certified component/,
    );
    const credentials = archive.match(
      /<section\b[^>]*id="certifications"[\s\S]*?<\/section>/,
    )?.[0];
    assert.ok(credentials, "V1 should retain its credentials section");
    assert.equal((credentials.match(/class="spec-card /g) || []).length, 5);
    assert.doesNotMatch(archive, /data-engine-status|A practical toolkit\./);
    const canonical = (html) =>
      new URL(html.match(/rel="canonical" href="([^"]+)"/)?.[1]).href;
    assert.equal(canonical(current), "https://tarekrahman.vercel.app/");
    assert.equal(canonical(archive), "https://tarekrahman.vercel.app/v1");

    const [currentStyles, archiveStyles] = await Promise.all([
      styles(current),
      styles(archive, "/v1"),
    ]);
    assert.match(currentStyles, /font-family:__Inter_/);
    assert.doesNotMatch(currentStyles, /font-family:__Newsreader_/);
    assert.match(archiveStyles, /font-family:__Newsreader_/);
    assert.match(archiveStyles, /font-family:__Special_Elite_/);
    assert.doesNotMatch(archiveStyles, /font-family:__Inter_/);
  },
);

test(
  "Both versions serve valid local WOFF2 fonts without Google font URLs",
  options,
  async () => {
    const origin = new URL(baseUrl).origin;
    const googleFonts = /fonts\.(?:googleapis|gstatic)\.com/i;
    const fontUrls = new Set();

    await Promise.all(
      ["/", "/v1"].map(async (route) => {
        const html = await page(route);
        assert.doesNotMatch(html, googleFonts, route);
        const sheets = await stylesheets(html, route);
        let fileCount = 0;

        for (const { url: sheetUrl, css } of sheets) {
          assert.doesNotMatch(css, googleFonts, sheetUrl);
          for (const [, face] of css.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
            for (const [, sources] of face.matchAll(/\bsrc\s*:\s*([^;]+)/gi)) {
              for (const source of sources.matchAll(
                /url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)]+))\s*\)/gi,
              )) {
                const fontUrl = new URL(
                  source[1] || source[2] || source[3],
                  sheetUrl,
                );
                assert.equal(fontUrl.origin, origin, fontUrl.href);
                fontUrls.add(fontUrl.href);
                fileCount++;
              }
            }
          }
        }
        assert.ok(fileCount > 0, `${route} should load font files`);
      }),
    );

    await Promise.all(
      [...fontUrls].map(async (url) => {
        const response = await get(url);
        assert.equal(response.status, 200, url);
        assert.equal(new URL(response.url).origin, origin, response.url);
        const bytes = Buffer.from(await response.arrayBuffer());
        assert.equal(bytes.toString("ascii", 0, 4), "wOF2", url);
      }),
    );
  },
);

test(
  "Archived images, logos, icons and PDFs resolve to the frozen files",
  options,
  async () => {
    const files = [
      "images/profile-c.jpg",
      "images/tesla-turbine-cad.png",
      "images/tesla-turbine-setup.png",
      "logos/autocad_vector_logo.svg",
      "logos/solidworks-vector-logo.svg",
      "favicon.svg",
      "icon.svg",
      "og.png",
      "Tarek Rahman Resume-1 Page.pdf",
      "Tarek Rahman Resume-2 Page.pdf",
    ];
    await Promise.all(
      files.map(async (file) => {
        const response = await get(
          `/v1/${file.split("/").map(encodeURIComponent).join("/")}`,
        );
        assert.equal(response.status, 200, file);
        const expected = await readFile(
          path.join(__dirname, "../public/v1", file),
        );
        assert.deepEqual(
          Buffer.from(await response.arrayBuffer()),
          expected,
          file,
        );
      }),
    );
  },
);

test(
  "Both PDF viewers serve their own files and reject invalid selections",
  options,
  async () => {
    for (const prefix of ["", "/v1"]) {
      for (const version of [1, 2]) {
        const response = await get(`${prefix}/api/pdf?file=${version}page`);
        assert.equal(response.status, 200);
        assert.match(response.headers.get("content-type"), /application\/pdf/);
        assert.match(response.headers.get("content-disposition"), /^inline;/);
        const expected = await readFile(
          path.join(
            __dirname,
            "../public",
            prefix.slice(1),
            `Tarek Rahman Resume-${version} Page.pdf`,
          ),
        );
        assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected);
      }
      for (const query of [
        "",
        "?file=missing",
        "?file=..%2F..%2Fpackage.json",
      ]) {
        assert.equal((await get(`${prefix}/api/pdf${query}`)).status, 400);
      }
    }
  },
);

test(
  "Unknown paths return 404 instead of either version's homepage",
  options,
  async () => {
    for (const route of [
      "/missing-version-check",
      "/v1/missing-version-check",
    ]) {
      assert.equal((await get(route)).status, 404);
    }
  },
);
