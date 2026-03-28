import type { Country, FormatOptions } from '../api/types.js';

function num(n: number): string {
  return n.toLocaleString('en-US');
}

function currencies(c?: Record<string, { name: string; symbol: string }>): string {
  if (!c) return 'N/A';
  return Object.entries(c)
    .map(([code, v]) => `${code} (${v.symbol}) — ${v.name}`)
    .join(', ');
}

function languages(l?: Record<string, string>): string {
  if (!l) return 'N/A';
  return Object.values(l).join(', ');
}

function callingCode(idd: { root?: string; suffixes?: string[] }): string {
  if (!idd.root) return 'N/A';
  if (idd.suffixes && idd.suffixes.length === 1) return `${idd.root}${idd.suffixes[0]}`;
  return idd.root;
}

export class CountryFormatter {
  static formatCountry(country: Country): string {
    const lines: string[] = [];
    lines.push(`${country.flag} ${country.name.common} (${country.name.official})`);
    if (country.capital?.length) lines.push(`  Capital: ${country.capital.join(', ')}`);
    lines.push(`  Region: ${country.region}${country.subregion ? ' / ' + country.subregion : ''}`);
    lines.push(`  Population: ${num(country.population)}`);
    lines.push(`  Area: ${num(country.area)} km²`);
    if (country.languages) lines.push(`  Languages: ${languages(country.languages)}`);
    if (country.currencies) lines.push(`  Currencies: ${currencies(country.currencies)}`);
    if (country.timezones) lines.push(`  Timezones: ${country.timezones.join(', ')}`);
    if (country.borders?.length) lines.push(`  Borders: ${country.borders.join(', ')}`);
    lines.push(`  Calling Code: ${callingCode(country.idd)}`);
    return lines.join('\n');
  }

  static formatCountryList(countries: Country[], options?: FormatOptions): string {
    let sorted = [...countries];
    const sortBy = options?.sortBy ?? 'name';
    const sortOrder = options?.sortOrder ?? 'asc';
    const limit = options?.limit;

    sorted.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.common.localeCompare(b.name.common);
      else if (sortBy === 'population') cmp = a.population - b.population;
      else if (sortBy === 'area') cmp = a.area - b.area;
      return sortOrder === 'desc' ? -cmp : cmp;
    });

    const total = sorted.length;
    if (limit && limit < sorted.length) {
      sorted = sorted.slice(0, limit);
    }

    const lines: string[] = [];
    sorted.forEach((c, i) => {
      const idx = `[${i + 1}]`.padEnd(5);
      const cap = c.capital?.join(', ') ?? 'N/A';
      lines.push(`${idx} ${c.flag} ${c.name.common} | ${cap} | Pop: ${num(c.population)}`);
    });

    if (limit && limit < total) {
      lines.push(`... and ${total - limit} more results`);
    }
    return lines.join('\n');
  }

  static formatComparison(countries: Country[], metrics: string[]): string {
    const headers = ['Metric', ...countries.map((c) => `${c.flag} ${c.name.common}`)];
    const rows: string[][] = [];

    for (const metric of metrics) {
      const row: string[] = [metric];
      for (const c of countries) {
        row.push(CountryFormatter.getMetricValue(c, metric));
      }
      rows.push(row);
    }

    return CountryFormatter.formatTable(headers, rows);
  }

  private static getMetricValue(c: Country, metric: string): string {
    switch (metric) {
      case 'population':
        return num(c.population);
      case 'area':
        return `${num(c.area)} km²`;
      case 'capital':
        return c.capital?.join(', ') ?? 'N/A';
      case 'region':
        return `${c.region}${c.subregion ? ' / ' + c.subregion : ''}`;
      case 'currencies':
        return currencies(c.currencies);
      case 'languages':
        return languages(c.languages);
      case 'timezones':
        return c.timezones?.length === 1 ? c.timezones[0] : `${c.timezones?.length ?? 0} zones`;
      case 'borders':
        return c.borders?.join(', ') ?? 'None';
      case 'callingCode':
        return callingCode(c.idd);
      case 'drivingSide':
        return c.car.side;
      case 'unMember':
        return c.unMember ? 'Yes' : 'No';
      case 'landlocked':
        return c.landlocked ? 'Yes' : 'No';
      default:
        return 'N/A';
    }
  }

  static formatBorders(country: Country, borders: Country[]): string {
    const lines: string[] = [];
    lines.push(`Borders of ${country.flag} ${country.name.common} (${borders.length} neighbors):`);
    lines.push('');
    for (const b of borders) {
      lines.push(
        `  ${b.flag} ${b.name.common} (${b.cca3}) — ${b.capital?.join(', ') ?? 'N/A'} — Pop: ${num(b.population)}`,
      );
    }
    if (borders.length === 0) {
      lines.push('  This country has no land borders (island nation or territory).');
    }
    return lines.join('\n');
  }

  static formatTable(headers: string[], rows: string[][]): string {
    const colWidths = headers.map((h, i) => {
      const maxRow = rows.reduce((max, row) => Math.max(max, (row[i] ?? '').length), 0);
      return Math.max(h.length, maxRow);
    });

    const sep = colWidths.map((w) => '-'.repeat(w)).join(' | ');
    const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');
    const dataLines = rows.map((row) =>
      row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | '),
    );

    return [headerLine, sep, ...dataLines].join('\n');
  }
}
