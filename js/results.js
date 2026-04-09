const resultsTranslations = {
    en: {
        eyebrow: 'Live Flight Search',
        title: 'We are checking prices and providers for your trip.',
        subtitle: 'Results are shown inside RedStar Travel and can switch to live Wego data once your API token is configured.',
        loading: 'Loading results...',
        searchSummary: 'Search Summary',
        sourceLive: 'Source: live Wego results',
        sourceMock: 'Source: demo fallback while API credentials are not configured',
        sourceFallback: 'Source: fallback results because live search returned an error',
        localFallbackNote: 'These options are shown locally because live flight API access is not available on the current host.',
        lowestPrice: 'Lowest price',
        provider: 'Provider',
        route: 'Route',
        outbound: 'Outbound',
        inbound: 'Return',
        duration: 'Duration',
        stops: 'Stops',
        refundable: 'Refundable',
        exchangeable: 'Exchangeable',
        official: 'Official airline',
        agency: 'Agency / OTA',
        openProvider: 'Open Provider',
        unavailable: 'Booking link not available yet',
        oneWay: 'One way',
        roundTrip: 'Round trip',
        noResults: 'No trips were returned for this search yet.',
        badQuery: 'Missing search details. Please go back and search again.',
        yes: 'Yes',
        no: 'No',
        adults: 'Adults',
        children: 'Children',
        infants: 'Infants',
        stopLabel: (count) => (count === 0 ? 'Direct' : `${count} stop${count > 1 ? 's' : ''}`)
    },
    ar: {
        eyebrow: 'بحث رحلات حي',
        title: 'نقوم الآن بفحص الأسعار ومزودي الحجز لرحلتك.',
        subtitle: 'تظهر النتائج داخل موقع ريدستار، ويمكن تحويلها إلى بيانات Wego الحية عند إضافة مفتاح الواجهة البرمجية.',
        loading: 'جارٍ تحميل النتائج...',
        searchSummary: 'ملخص البحث',
        sourceLive: 'المصدر: نتائج Wego الحية',
        sourceMock: 'المصدر: نتائج تجريبية إلى حين إضافة بيانات الربط',
        sourceFallback: 'المصدر: نتائج بديلة لأن البحث الحي أعاد خطأ',
        localFallbackNote: 'هذه الخيارات معروضة محليًا لأن واجهة الرحلات الحية غير متاحة على الخادم الحالي.',
        lowestPrice: 'أقل سعر',
        provider: 'مزود الحجز',
        route: 'المسار',
        outbound: 'الذهاب',
        inbound: 'العودة',
        duration: 'المدة',
        stops: 'التوقفات',
        refundable: 'قابل للاسترداد',
        exchangeable: 'قابل للتغيير',
        official: 'شركة طيران رسمية',
        agency: 'وكالة / OTA',
        openProvider: 'فتح مزود الحجز',
        unavailable: 'رابط الحجز غير متوفر بعد',
        oneWay: 'ذهاب فقط',
        roundTrip: 'ذهاب وعودة',
        noResults: 'لم يتم العثور على رحلات لهذا البحث حتى الآن.',
        badQuery: 'بيانات البحث ناقصة. عد للصفحة السابقة وابدأ البحث من جديد.',
        yes: 'نعم',
        no: 'لا',
        adults: 'بالغون',
        children: 'أطفال',
        infants: 'رضع',
        stopLabel: (count) => (count === 0 ? 'مباشر' : `${count} توقف`)
    }
};

const airportCityMap = {
    CAI: 'Cairo',
    DXB: 'Dubai',
    IST: 'Istanbul',
    RUH: 'Riyadh',
    JED: 'Jeddah',
    LON: 'London',
    DOH: 'Doha',
    SHJ: 'Sharjah',
    AUH: 'Abu Dhabi',
    KWI: 'Kuwait',
    AMM: 'Amman',
    MCT: 'Muscat',
    KRT: 'Khartoum'
};

function buildClientFallbackResults(query, t) {
    const originCode = String(query.origin || '').trim().toUpperCase();
    const destinationCode = String(query.destination || '').trim().toUpperCase();
    const originCity = airportCityMap[originCode] || formatPlaceLabel(query.origin) || 'Origin';
    const destinationCity = airportCityMap[destinationCode] || formatPlaceLabel(query.destination) || 'Destination';
    const isRoundTrip = Boolean(query.returnDate);

    return {
        source: 'mock',
        note: t.localFallbackNote,
        trips: [
            {
                providerName: 'Qatar Airways',
                providerType: 'airline',
                price: 299,
                currency: 'USD',
                handoffUrl: 'https://www.qatarairways.com/',
                route: {
                    originCity,
                    originCode,
                    destinationCity,
                    destinationCode
                },
                outbound: {
                    departureTime: '08:25',
                    arrivalTime: '12:10',
                    duration: '3h 45m',
                    stops: 0
                },
                inbound: isRoundTrip ? {
                    departureTime: '18:40',
                    arrivalTime: '22:25',
                    duration: '3h 45m',
                    stops: 0
                } : null,
                refundable: true,
                exchangeable: true
            },
            {
                providerName: 'Turkish Airlines',
                providerType: 'airline',
                price: 345,
                currency: 'USD',
                handoffUrl: 'https://www.turkishairlines.com/',
                route: {
                    originCity,
                    originCode,
                    destinationCity,
                    destinationCode
                },
                outbound: {
                    departureTime: '14:05',
                    arrivalTime: '18:50',
                    duration: '4h 45m',
                    stops: 1
                },
                inbound: isRoundTrip ? {
                    departureTime: '09:35',
                    arrivalTime: '14:20',
                    duration: '4h 45m',
                    stops: 1
                } : null,
                refundable: false,
                exchangeable: true
            },
            {
                providerName: 'Booking Partner',
                providerType: 'agency',
                price: 389,
                currency: 'USD',
                handoffUrl: 'https://www.skyscanner.net/',
                route: {
                    originCity,
                    originCode,
                    destinationCity,
                    destinationCode
                },
                outbound: {
                    departureTime: '21:10',
                    arrivalTime: '02:25',
                    duration: '5h 15m',
                    stops: 1
                },
                inbound: isRoundTrip ? {
                    departureTime: '11:15',
                    arrivalTime: '16:30',
                    duration: '5h 15m',
                    stops: 1
                } : null,
                refundable: false,
                exchangeable: false
            }
        ]
    };
}

function getResultsLang() {
    return localStorage.getItem('redstar_lang') || 'en';
}

function getSearchParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        origin: params.get('origin') || '',
        destination: params.get('destination') || '',
        departureDate: params.get('departureDate') || '',
        returnDate: params.get('returnDate') || '',
        adults: params.get('adults') || '1',
        children: params.get('children') || '0',
        infants: params.get('infants') || '0'
    };
}

function formatPassengerSummary(query, t) {
    return `${query.adults} ${t.adults} • ${query.children} ${t.children} • ${query.infants} ${t.infants}`;
}

function formatPlaceLabel(value) {
    const raw = String(value || '').trim();
    const upper = raw.toUpperCase();

    if (/^[A-Z]{3}$/.test(upper) && airportCityMap[upper]) {
        return `${airportCityMap[upper]} (${upper})`;
    }

    return raw;
}

function formatSearchSummary(query, t) {
    const type = query.returnDate ? t.roundTrip : t.oneWay;
    return `
        <span class="kicker">${t.searchSummary}</span>
        <h2>${formatPlaceLabel(query.origin)} → ${formatPlaceLabel(query.destination)}</h2>
        <div class="meta-row">
            <span>${type}</span>
            <span>${query.departureDate}${query.returnDate ? ` - ${query.returnDate}` : ''}</span>
            <span>${formatPassengerSummary(query, t)}</span>
        </div>
    `;
}

function renderResults(payload, query) {
    const lang = getResultsLang();
    const t = resultsTranslations[lang];
    const status = document.getElementById('resultsStatus');
    const grid = document.getElementById('resultsGrid');
    const summary = document.getElementById('searchSummary');

    summary.innerHTML = formatSearchSummary(query, t);
    grid.innerHTML = '';

    const sourceText = payload.source === 'wego_live' ? t.sourceLive : payload.source === 'mock' ? t.sourceMock : t.sourceFallback;
    status.innerHTML = `<strong>${sourceText}</strong>${payload.note ? `<p style="margin-top: 10px; color: var(--muted);">${payload.note}</p>` : ''}`;

    const trips = payload.trips || [];
    if (trips.length === 0) {
        grid.innerHTML = `<article class="detail-card"><h3>${t.noResults}</h3></article>`;
        return;
    }

    trips.slice().sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)).forEach((trip) => {
        const card = document.createElement('article');
        card.className = 'detail-card';

        const providerType = trip.providerType === 'airline' ? t.official : t.agency;
        const buttonHtml = trip.handoffUrl
            ? `<a class="button button-primary" href="${trip.handoffUrl}" target="_blank" rel="noopener noreferrer">${t.openProvider}</a>`
            : `<span style="color: var(--muted); font-weight: 700;">${t.unavailable}</span>`;

        card.innerHTML = `
            <span class="kicker">${t.lowestPrice}</span>
            <h3>${trip.price} ${trip.currency}</h3>
            <div class="meta-row">
                <span>${t.provider}: ${trip.providerName}</span>
                <span>${providerType}</span>
            </div>
            <p><strong>${t.route}:</strong> ${trip.route.originCity} (${trip.route.originCode}) → ${trip.route.destinationCity} (${trip.route.destinationCode})</p>
            <div class="meta-row">
                <span>${t.outbound}: ${trip.outbound.departureTime} - ${trip.outbound.arrivalTime}</span>
                <span>${t.duration}: ${trip.outbound.duration}</span>
                <span>${t.stops}: ${t.stopLabel(trip.outbound.stops)}</span>
            </div>
            ${trip.inbound ? `<div class="meta-row"><span>${t.inbound}: ${trip.inbound.departureTime} - ${trip.inbound.arrivalTime}</span><span>${t.duration}: ${trip.inbound.duration}</span><span>${t.stops}: ${t.stopLabel(trip.inbound.stops)}</span></div>` : ''}
            <div class="meta-row">
                <span>${t.refundable}: ${trip.refundable ? t.yes : t.no}</span>
                <span>${t.exchangeable}: ${trip.exchangeable ? t.yes : t.no}</span>
            </div>
            <div class="hero-actions">${buttonHtml}</div>
        `;

        grid.appendChild(card);
    });
}

async function initResultsPage() {
    const query = getSearchParams();
    const lang = getResultsLang();
    const t = resultsTranslations[lang];
    const status = document.getElementById('resultsStatus');

    document.getElementById('resultsEyebrow').textContent = t.eyebrow;
    document.getElementById('resultsTitle').textContent = t.title;
    document.getElementById('resultsSubtitle').textContent = t.subtitle;
    status.textContent = t.loading;

    if (!query.origin || !query.destination || !query.departureDate) {
        status.textContent = t.badQuery;
        return;
    }

    const requestUrl = new URL('/api/flights/search', window.location.origin);
    Object.entries(query).forEach(([key, value]) => {
        if (value) {
            requestUrl.searchParams.set(key, value);
        }
    });

    try {
        const response = await fetch(requestUrl.toString(), {
            headers: {
                Accept: 'application/json'
            }
        });
        const contentType = response.headers.get('content-type') || '';

        if (!response.ok || !contentType.includes('application/json')) {
            renderResults(buildClientFallbackResults(query, t), query);
            return;
        }

        const payload = await response.json();
        renderResults(payload.fallback || payload, query);
    } catch (error) {
        renderResults(buildClientFallbackResults(query, t), query);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'results') {
        initResultsPage();
    }
});

document.addEventListener('redstar:language-changed', () => {
    if (document.body.dataset.page === 'results') {
        initResultsPage();
    }
});
