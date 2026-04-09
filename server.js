const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

loadEnvFile(path.join(__dirname, ".env"));

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
};

const CITY_CODE_MAP = {
    cairo: "CAI",
    "القاهرة": "CAI",
    dubai: "DXB",
    "دبي": "DXB",
    istanbul: "IST",
    "اسطنبول": "IST",
    "إسطنبول": "IST",
    riyadh: "RUH",
    "الرياض": "RUH",
    jeddah: "JED",
    "جدة": "JED",
    london: "LON",
    "لندن": "LON",
    doha: "DOH",
    "الدوحة": "DOH",
    cairoairport: "CAI",
    sharjah: "SHJ",
    "الشارقة": "SHJ",
    abuDhabi: "AUH",
    "ابوظبي": "AUH",
    "أبوظبي": "AUH",
    kuwait: "KWI",
    "الكويت": "KWI",
    amman: "AMM",
    "عمان": "AMM",
    muscat: "MCT",
    "مسقط": "MCT",
    khartoum: "KRT",
    "الخرطوم": "KRT"
};

const CODE_CITY_MAP = {
    CAI: "Cairo",
    DXB: "Dubai",
    IST: "Istanbul",
    RUH: "Riyadh",
    JED: "Jeddah",
    LON: "London",
    DOH: "Doha",
    SHJ: "Sharjah",
    AUH: "Abu Dhabi",
    KWI: "Kuwait",
    AMM: "Amman",
    MCT: "Muscat",
    KRT: "Khartoum"
};

const CITY_NAME_ALIASES = {
    "\u0627\u0644\u0642\u0627\u0647\u0631\u0629": "CAI",
    "\u062f\u0628\u064a": "DXB",
    "\u0627\u0633\u0637\u0646\u0628\u0648\u0644": "IST",
    "\u0625\u0633\u0637\u0646\u0628\u0648\u0644": "IST",
    "\u0627\u0644\u0631\u064a\u0627\u0636": "RUH",
    "\u062c\u062f\u0629": "JED",
    "\u0644\u0646\u062f\u0646": "LON",
    "\u0627\u0644\u062f\u0648\u062d\u0629": "DOH",
    "\u0627\u0644\u0634\u0627\u0631\u0642\u0629": "SHJ",
    "\u0627\u0628\u0648\u0638\u0628\u064a": "AUH",
    "\u0623\u0628\u0648\u0638\u0628\u064a": "AUH",
    "\u0627\u0644\u0643\u0648\u064a\u062a": "KWI",
    "\u0639\u0645\u0627\u0646": "AMM",
    "\u0645\u0633\u0642\u0637": "MCT",
    "\u0627\u0644\u062e\u0631\u0637\u0648\u0645": "KRT"
};

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
            return;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, "");

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    stream.pipe(res);
    stream.on("error", () => {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal Server Error");
    });
}

function resolveCode(input) {
    if (!input) {
        return "";
    }

    const raw = String(input).trim();
    if (/^[A-Za-z]{3}$/.test(raw)) {
        return raw.toUpperCase();
    }

    const normalized = raw.toLowerCase().replace(/\s+/g, "");
    return CITY_NAME_ALIASES[normalized] || CITY_CODE_MAP[normalized] || "";
}

function getCityLabel(input, fallbackCode) {
    const raw = String(input || "").trim();
    const resolvedCode = resolveCode(raw) || fallbackCode || "";

    if (resolvedCode && CODE_CITY_MAP[resolvedCode]) {
        return CODE_CITY_MAP[resolvedCode];
    }

    if (/^[A-Za-z]{3}$/.test(raw) && CODE_CITY_MAP[raw.toUpperCase()]) {
        return CODE_CITY_MAP[raw.toUpperCase()];
    }

    return raw || resolvedCode;
}

function isWegoConfigured() {
    return Boolean(process.env.WEGO_API_TOKEN);
}

function buildSearchPayload(query) {
    const originCode = resolveCode(query.origin);
    const destinationCode = resolveCode(query.destination);

    if (!originCode || !destinationCode) {
        return {
            error: "Please use a supported city name or a 3-letter IATA airport code for origin and destination."
        };
    }

    const legs = [
        {
            departureAirportCode: originCode,
            arrivalAirportCode: destinationCode,
            outboundDate: query.departureDate
        }
    ];

    if (query.returnDate) {
        legs.push({
            departureAirportCode: destinationCode,
            arrivalAirportCode: originCode,
            outboundDate: query.returnDate
        });
    }

    return {
        search: {
            siteCode: process.env.WEGO_SITE_CODE || "EG",
            locale: process.env.WEGO_LOCALE || "en",
            currencyCode: process.env.WEGO_CURRENCY_CODE || "USD",
            deviceType: "DESKTOP",
            appType: "WEB_APP",
            adultsCount: Number(query.adults || 1),
            childrenCount: Number(query.children || 0),
            infantsCount: Number(query.infants || 0),
            cabin: "economy",
            legs,
            offset: 0,
            userLoggedIn: false,
            showWegoFares: true,
            showWegoFaresOnly: false,
            clientCreatedAt: new Date().toISOString()
        }
    };
}

async function wegoRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${process.env.WEGO_API_TOKEN}`,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(`Wego request failed (${response.status}): ${message}`);
    }

    return response.json();
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBestFare(trip) {
    if (!trip || !Array.isArray(trip.fares) || trip.fares.length === 0) {
        return null;
    }

    return trip.fares
        .slice()
        .sort((a, b) => (a?.price?.totalAmountUsd ?? Infinity) - (b?.price?.totalAmountUsd ?? Infinity))[0];
}

function normalizeTrip(trip, currencyCode) {
    const fare = getBestFare(trip);
    const firstLeg = trip?.legs?.[0];
    const secondLeg = trip?.legs?.[1];
    const provider = fare?.provider || {};
    const segments = firstLeg?.segments || [];

    return {
        id: trip?.id || "",
        price: fare?.price?.totalAmount ?? null,
        currency: fare?.price?.currencyCode || currencyCode || "USD",
        providerName: provider.name || "Unknown Provider",
        providerType: provider.type || "ota",
        handoffUrl: fare?.handoffUrl || "",
        refundable: Boolean(fare?.refundable),
        exchangeable: Boolean(fare?.exchangeable),
        route: {
            originCode: firstLeg?.departureAirportCode || "",
            destinationCode: firstLeg?.arrivalAirportCode || "",
            originCity: segments[0]?.departureCityName || getCityLabel(firstLeg?.departureAirportCode, firstLeg?.departureAirportCode) || "",
            destinationCity: segments[segments.length - 1]?.arrivalCityName || getCityLabel(firstLeg?.arrivalAirportCode, firstLeg?.arrivalAirportCode) || ""
        },
        outbound: {
            departureTime: firstLeg?.departureTime || "",
            arrivalTime: firstLeg?.arrivalTime || "",
            duration: firstLeg?.duration || "",
            stops: firstLeg?.stopoversCount ?? 0,
            airline: segments[0]?.airlineName || ""
        },
        inbound: secondLeg
            ? {
                  departureTime: secondLeg.departureTime || "",
                  arrivalTime: secondLeg.arrivalTime || "",
                  duration: secondLeg.duration || "",
                  stops: secondLeg.stopoversCount ?? 0,
                  airline: secondLeg.segments?.[0]?.airlineName || ""
              }
            : null
    };
}

async function fetchWegoResults(query) {
    const payload = buildSearchPayload(query);
    if (payload.error) {
        throw new Error(payload.error);
    }

    const created = await wegoRequest("https://affiliate-api.wego.com/metasearch/flights/searches", {
        method: "POST",
        body: JSON.stringify(payload)
    });

    const searchId = created?.search?.id || created?.id;
    if (!searchId) {
        throw new Error("Wego did not return a search ID.");
    }

    let offset = 0;
    let stablePolls = 0;
    let previousCount = -1;
    let latestResponse = null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
        const pollUrl = new URL(`https://affiliate-api.wego.com/metasearch/flights/searches/${searchId}/results`);
        pollUrl.searchParams.set("offset", String(offset));
        pollUrl.searchParams.set("locale", process.env.WEGO_LOCALE || "en");
        pollUrl.searchParams.set("currencyCode", process.env.WEGO_CURRENCY_CODE || "USD");

        const polled = await wegoRequest(pollUrl.toString());
        latestResponse = polled;

        const count = Number(polled?.count || 0);
        if (count === previousCount) {
            stablePolls += 1;
        } else {
            stablePolls = 0;
        }

        previousCount = count;
        offset += count;

        if (stablePolls >= 1) {
            break;
        }

        await sleep(500 + attempt * 500);
    }

    const trips = Array.isArray(latestResponse?.trips) ? latestResponse.trips.slice(0, 6) : [];
    const tripDetails = await Promise.all(
        trips.map(async (trip) => {
            const detailUrl = new URL(`https://affiliate-api.wego.com/metasearch/flights/trips/${encodeURIComponent(trip.id)}`);
            detailUrl.searchParams.set("locale", process.env.WEGO_LOCALE || "en");
            detailUrl.searchParams.set("currencyCode", process.env.WEGO_CURRENCY_CODE || "USD");

            try {
                const detail = await wegoRequest(detailUrl.toString());
                return normalizeTrip(detail?.trip || trip, process.env.WEGO_CURRENCY_CODE || "USD");
            } catch (error) {
                return normalizeTrip(trip, process.env.WEGO_CURRENCY_CODE || "USD");
            }
        })
    );

    return {
        source: "wego_live",
        searchId,
        currency: process.env.WEGO_CURRENCY_CODE || "USD",
        trips: tripDetails.filter((trip) => trip.price !== null)
    };
}

function buildMockResults(query) {
    const originCode = resolveCode(query.origin) || String(query.origin || "").trim().toUpperCase();
    const destinationCode = resolveCode(query.destination) || String(query.destination || "").trim().toUpperCase();
    const currency = "USD";

    return {
        source: "mock",
        currency,
        note: "Live Wego credentials are not configured yet. These are demo cards to complete the UI flow.",
        trips: [
            {
                id: "mock-1",
                price: 299,
                currency,
                providerName: "Wego Demo Fare",
                providerType: "ota",
                handoffUrl: "",
                refundable: true,
                exchangeable: false,
                route: {
                    originCode,
                    destinationCode,
                    originCity: getCityLabel(query.origin, originCode),
                    destinationCity: getCityLabel(query.destination, destinationCode)
                },
                outbound: {
                    departureTime: "08:15",
                    arrivalTime: "12:05",
                    duration: "3h 50m",
                    stops: 0,
                    airline: "Demo Airways"
                },
                inbound: query.returnDate
                    ? {
                          departureTime: "18:40",
                          arrivalTime: "22:20",
                          duration: "3h 40m",
                          stops: 0,
                          airline: "Demo Airways"
                      }
                    : null
            },
            {
                id: "mock-2",
                price: 245,
                currency,
                providerName: "Budget Link",
                providerType: "ota",
                handoffUrl: "",
                refundable: false,
                exchangeable: false,
                route: {
                    originCode,
                    destinationCode,
                    originCity: getCityLabel(query.origin, originCode),
                    destinationCity: getCityLabel(query.destination, destinationCode)
                },
                outbound: {
                    departureTime: "11:30",
                    arrivalTime: "16:35",
                    duration: "5h 05m",
                    stops: 1,
                    airline: "Regional Connect"
                },
                inbound: query.returnDate
                    ? {
                          departureTime: "09:20",
                          arrivalTime: "14:15",
                          duration: "4h 55m",
                          stops: 1,
                          airline: "Regional Connect"
                      }
                    : null
            },
            {
                id: "mock-3",
                price: 338,
                currency,
                providerName: "Official Airline",
                providerType: "airline",
                handoffUrl: "",
                refundable: true,
                exchangeable: true,
                route: {
                    originCode,
                    destinationCode,
                    originCity: getCityLabel(query.origin, originCode),
                    destinationCity: getCityLabel(query.destination, destinationCode)
                },
                outbound: {
                    departureTime: "19:00",
                    arrivalTime: "22:25",
                    duration: "3h 25m",
                    stops: 0,
                    airline: "Official Airline"
                },
                inbound: query.returnDate
                    ? {
                          departureTime: "07:10",
                          arrivalTime: "10:40",
                          duration: "3h 30m",
                          stops: 0,
                          airline: "Official Airline"
                      }
                    : null
            }
        ]
    };
}

async function handleFlightSearch(reqUrl, res) {
    const query = {
        origin: reqUrl.searchParams.get("origin") || "",
        destination: reqUrl.searchParams.get("destination") || "",
        departureDate: reqUrl.searchParams.get("departureDate") || "",
        returnDate: reqUrl.searchParams.get("returnDate") || "",
        adults: reqUrl.searchParams.get("adults") || "1",
        children: reqUrl.searchParams.get("children") || "0",
        infants: reqUrl.searchParams.get("infants") || "0"
    };

    if (!query.origin || !query.destination || !query.departureDate) {
        sendJson(res, 400, {
            error: "origin, destination, and departureDate are required."
        });
        return;
    }

    try {
        const payload = isWegoConfigured() ? await fetchWegoResults(query) : buildMockResults(query);
        sendJson(res, 200, payload);
    } catch (error) {
        sendJson(res, 500, {
            error: error.message,
            fallback: buildMockResults(query)
        });
    }
}

function handleStatic(reqUrl, res) {
    let pathname = decodeURIComponent(reqUrl.pathname);
    if (pathname === "/") {
        pathname = "/index.html";
    }

    const filePath = path.join(ROOT, pathname);
    const normalizedPath = path.normalize(filePath);

    if (!normalizedPath.startsWith(ROOT)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
    }

    fs.stat(normalizedPath, (error, stats) => {
        if (error || !stats.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not Found");
            return;
        }

        sendFile(res, normalizedPath);
    });
}

const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);

    if (reqUrl.pathname === "/api/flights/search" && req.method === "GET") {
        await handleFlightSearch(reqUrl, res);
        return;
    }

    if (reqUrl.pathname === "/api/health") {
        sendJson(res, 200, {
            ok: true,
            wegoConfigured: isWegoConfigured(),
            mode: isWegoConfigured() ? "live" : "demo"
        });
        return;
    }

    handleStatic(reqUrl, res);
});

server.listen(PORT, () => {
    console.log(`RedStar Travel server running at http://localhost:${PORT}`);
});
