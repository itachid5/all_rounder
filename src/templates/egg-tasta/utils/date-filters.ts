export type DateRangeKey = 
  | 'today' 
  | 'yesterday' 
  | '7days' 
  | '30days' 
  | 'this_month' 
  | 'last_month' 
  | 'this_year' 
  | 'all' 
  | 'custom';

export interface DateFilterOptions {
  range?: string;
  from?: string;
  to?: string;
}

export interface DateBoundariesResult {
  activeRange: DateRangeKey;
  displayFrom: string; // YYYY-MM-DD
  displayTo: string;   // YYYY-MM-DD
  startDate: Date | null;
  endDate: Date | null;
}

export const QUICK_FILTERS: { key: DateRangeKey; labelEn: string; labelBn: string }[] = [
  { key: 'today', labelEn: 'Today', labelBn: 'আজ' },
  { key: 'yesterday', labelEn: 'Yesterday', labelBn: 'গতকাল' },
  { key: '7days', labelEn: 'Last 7 Days', labelBn: 'গত ৭ দিন' },
  { key: '30days', labelEn: 'Last 30 Days', labelBn: 'গত ৩০ দিন' },
  { key: 'this_month', labelEn: 'This Month', labelBn: 'এই মাস' },
  { key: 'last_month', labelEn: 'Last Month', labelBn: 'গত মাস' },
  { key: 'this_year', labelEn: 'This Year', labelBn: 'এই বছর' },
  { key: 'all', labelEn: 'All Time', labelBn: 'সর্বমোট' },
];

export function computeDateBoundaries(
  options: DateFilterOptions, 
  timezone: string = 'Asia/Dhaka'
): DateBoundariesResult {
  const { range, from, to } = options;
  const now = new Date();

  const ymdFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const todayYMD = ymdFormatter.format(now);
  const [tYear, tMonth, tDay] = todayYMD.split('-').map(Number);

  if (from && to) {
    return {
      activeRange: 'custom',
      displayFrom: from,
      displayTo: to,
      startDate: new Date(`${from}T00:00:00.000`),
      endDate: new Date(`${to}T23:59:59.999`)
    };
  }

  const selectedRange = (range || 'today') as DateRangeKey;

  if (selectedRange === 'all') {
    return {
      activeRange: 'all',
      displayFrom: '',
      displayTo: '',
      startDate: null,
      endDate: null
    };
  }

  if (selectedRange === 'yesterday') {
    const yDate = new Date(Date.UTC(tYear, tMonth - 1, tDay - 1));
    const ymd = yDate.toISOString().split('T')[0];
    return {
      activeRange: 'yesterday',
      displayFrom: ymd,
      displayTo: ymd,
      startDate: new Date(`${ymd}T00:00:00.000`),
      endDate: new Date(`${ymd}T23:59:59.999`)
    };
  }

  if (selectedRange === '7days') {
    const startDateObj = new Date(Date.UTC(tYear, tMonth - 1, tDay - 6));
    const fromYMD = startDateObj.toISOString().split('T')[0];
    return {
      activeRange: '7days',
      displayFrom: fromYMD,
      displayTo: todayYMD,
      startDate: new Date(`${fromYMD}T00:00:00.000`),
      endDate: new Date(`${todayYMD}T23:59:59.999`)
    };
  }

  if (selectedRange === '30days') {
    const startDateObj = new Date(Date.UTC(tYear, tMonth - 1, tDay - 29));
    const fromYMD = startDateObj.toISOString().split('T')[0];
    return {
      activeRange: '30days',
      displayFrom: fromYMD,
      displayTo: todayYMD,
      startDate: new Date(`${fromYMD}T00:00:00.000`),
      endDate: new Date(`${todayYMD}T23:59:59.999`)
    };
  }

  if (selectedRange === 'this_month') {
    const firstDay = `${tYear}-${String(tMonth).padStart(2, '0')}-01`;
    return {
      activeRange: 'this_month',
      displayFrom: firstDay,
      displayTo: todayYMD,
      startDate: new Date(`${firstDay}T00:00:00.000`),
      endDate: new Date(`${todayYMD}T23:59:59.999`)
    };
  }

  if (selectedRange === 'last_month') {
    const lmYear = tMonth === 1 ? tYear - 1 : tYear;
    const lmMonth = tMonth === 1 ? 12 : tMonth - 1;
    const firstDay = `${lmYear}-${String(lmMonth).padStart(2, '0')}-01`;
    const lastDayNum = new Date(lmYear, lmMonth, 0).getDate();
    const lastDay = `${lmYear}-${String(lmMonth).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
    return {
      activeRange: 'last_month',
      displayFrom: firstDay,
      displayTo: lastDay,
      startDate: new Date(`${firstDay}T00:00:00.000`),
      endDate: new Date(`${lastDay}T23:59:59.999`)
    };
  }

  if (selectedRange === 'this_year') {
    const firstDay = `${tYear}-01-01`;
    return {
      activeRange: 'this_year',
      displayFrom: firstDay,
      displayTo: todayYMD,
      startDate: new Date(`${firstDay}T00:00:00.000`),
      endDate: new Date(`${todayYMD}T23:59:59.999`)
    };
  }

  // Default: Today
  return {
    activeRange: 'today',
    displayFrom: todayYMD,
    displayTo: todayYMD,
    startDate: new Date(`${todayYMD}T00:00:00.000`),
    endDate: new Date(`${todayYMD}T23:59:59.999`)
  };
}

export function shiftPeriod(fromStr: string, toStr: string, direction: 'prev' | 'next'): { from: string; to: string } {
  if (!fromStr || !toStr) return { from: '', to: '' };
  
  const s = new Date(`${fromStr}T00:00:00.000Z`);
  const e = new Date(`${toStr}T23:59:59.999Z`);
  const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / (24 * 3600 * 1000)));
  
  const shiftMs = days * 24 * 3600 * 1000 * (direction === 'prev' ? -1 : 1);
  const newS = new Date(s.getTime() + shiftMs);
  const newE = new Date(e.getTime() + shiftMs);
  
  return {
    from: newS.toISOString().split('T')[0],
    to: newE.toISOString().split('T')[0]
  };
}

export function formatFilterDisplayBanner(
  activeRange: DateRangeKey,
  displayFrom: string,
  displayTo: string,
  timezone: string = 'Asia/Dhaka',
  language: string = 'en'
): string {
  const isBn = language === 'bn';
  const locale = isBn ? 'bn-BD' : 'en-GB';
  const now = new Date();

  if (activeRange === 'today') {
    const formatted = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(now);
    return isBn ? `আজ • ${formatted}` : `Today • ${formatted}`;
  }

  if (activeRange === 'yesterday') {
    const yDate = new Date(now.getTime() - 24 * 3600 * 1000);
    const formatted = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(yDate);
    return isBn ? `গতকাল • ${formatted}` : `Yesterday • ${formatted}`;
  }

  if (activeRange === '7days') return isBn ? 'গত ৭ দিন' : 'Last 7 Days';
  if (activeRange === '30days') return isBn ? 'গত ৩০ দিন' : 'Last 30 Days';
  if (activeRange === 'this_month') return isBn ? 'এই মাস' : 'This Month';
  if (activeRange === 'last_month') return isBn ? 'গত মাস' : 'Last Month';
  if (activeRange === 'this_year') return isBn ? 'এই বছর' : 'This Year';
  if (activeRange === 'all') return isBn ? 'সর্বমোট' : 'All Time';

  if (displayFrom && displayFrom === displayTo) {
    const [y, m, d] = displayFrom.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat(locale, {
      timeZone: 'UTC',
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(dateObj);
  }

  if (displayFrom && displayTo) {
    const [fy, fm, fd] = displayFrom.split('-').map(Number);
    const [ty, tm, td] = displayTo.split('-').map(Number);
    
    const fromObj = new Date(Date.UTC(fy, fm - 1, fd));
    const toObj = new Date(Date.UTC(ty, tm - 1, td));

    const fromFormatted = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: 'short' }).format(fromObj);
    const toFormatted = new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).format(toObj);

    return `${fromFormatted} – ${toFormatted}`;
  }

  const defaultFormatted = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(now);
  return isBn ? `আজ • ${defaultFormatted}` : `Today • ${defaultFormatted}`;
}
