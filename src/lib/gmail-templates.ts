export interface LocalParseResult {
  merchant: string;
  amount: number;
  date: Date;
}

export function parseIndonesianDate(dateStr: string): Date {
  const months: Record<string, number> = {
    jan: 0, januari: 0,
    feb: 1, februari: 1,
    mar: 2, maret: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5,
    jul: 6, juli: 6,
    agu: 7, agustus: 7, ags: 7,
    sep: 8, september: 8, sept: 8,
    okt: 9, oktober: 9, oct: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11
  };
  
  const trimmed = dateStr.trim();
  const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    return new Date(Date.UTC(year, month, day));
  }

  const parts = trimmed.toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1];
    const year = parseInt(parts[2], 10);
    const month = months[monthName] !== undefined ? months[monthName] : new Date().getUTCMonth();
    return new Date(Date.UTC(year, month, day));
  }
  return new Date(trimmed);
}

export function parseIndonesianAmount(amountStr: string): number {
  let clean = amountStr.replace(/\s+/g, "");
  if (clean.endsWith(",00")) {
    clean = clean.substring(0, clean.length - 3);
  }
  clean = clean.replace(/\./g, "");
  clean = clean.replace(/,/g, ".");
  return parseFloat(clean);
}

export function matchLocalTemplate(subject: string, bodyText: string): LocalParseResult | null {
  const cleanSubject = subject.trim();
  const cleanBody = bodyText.replace(/\s+/g, " ");

  // 1. Mandiri QR
  if (/pembayaran berhasil/i.test(cleanSubject)) {
    const qrMatch = cleanBody.match(/penerima\s+(.*?)\s+-\s+id\s+tanggal\s+(.*?)\s+jam\s+(.*?)\s+wib\s+nominal\s+transaksi\s+rp\s+([\d\.,]+)/i);
    if (qrMatch) {
      const merchant = qrMatch[1].trim();
      const dateStr = qrMatch[2].trim();
      const amountStr = qrMatch[4];
      const amount = parseIndonesianAmount(amountStr);
      return { merchant, amount, date: parseIndonesianDate(dateStr) };
    }
  }

  // 2. Mandiri Top-up
  if (/top-up berhasil/i.test(cleanSubject)) {
    const topupMatch = cleanBody.match(/penyedia jasa\s+(.*?)\s+tanggal\s+(.*?)\s+jam\s+(.*?)\s+wib\s+nominal\s+top-up\s+rp\s+([\d\.,]+)/i);
    if (topupMatch) {
      const merchant = topupMatch[1].trim();
      const dateStr = topupMatch[2].trim();
      const amountStr = topupMatch[4];
      const amount = parseIndonesianAmount(amountStr);
      return { merchant, amount, date: parseIndonesianDate(dateStr) };
    }
  }

  return null;
}

export function matchDynamicPatterns(
  subject: string, 
  bodyText: string, 
  patterns: Array<{ subjectPattern: string; bodyPattern: string }>
): LocalParseResult | null {
  const cleanSubject = subject.trim();
  const cleanBody = bodyText.replace(/\s+/g, " ");

  for (const pat of patterns) {
    try {
      const subjectRegex = new RegExp(pat.subjectPattern, "i");
      if (!subjectRegex.test(cleanSubject)) continue;

      const bodyRegex = new RegExp(pat.bodyPattern, "i");
      const match = cleanBody.match(bodyRegex);

      if (match && match.groups) {
        const merchant = match.groups.merchant?.trim();
        const amountStr = match.groups.amount;
        const dateStr = match.groups.date?.trim();

        if (merchant && amountStr && dateStr) {
          const amount = parseIndonesianAmount(amountStr);
          const date = parseIndonesianDate(dateStr);
          return { merchant, amount, date };
        }
      }
    } catch (err) {
      console.error("[gmail-templates] Error executing dynamic regex template:", err);
    }
  }

  return null;
}
