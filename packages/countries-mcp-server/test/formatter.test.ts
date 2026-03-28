import { describe, it, expect } from 'vitest';
import { CountryFormatter } from '../src/utils/formatter.js';
import type { Country } from '../src/api/types.js';
import peruFixture from './fixtures/country-peru.json';
import countryListFixture from './fixtures/country-list.json';

const peru = peruFixture as unknown as Country;
const countries = countryListFixture as unknown as Country[];

describe('CountryFormatter', () => {
  describe('formatCountry', () => {
    it('should format a single country with all details', () => {
      const result = CountryFormatter.formatCountry(peru);
      expect(result).toContain('🇵🇪 Peru');
      expect(result).toContain('Republic of Peru');
      expect(result).toContain('Lima');
      expect(result).toContain('Americas');
      expect(result).toContain('South America');
      expect(result).toContain('32,971,854');
      expect(result).toContain('1,285,216 km²');
      expect(result).toContain('Spanish');
      expect(result).toContain('PEN');
      expect(result).toContain('UTC-05:00');
      expect(result).toContain('BOL');
      expect(result).toContain('+51');
    });

    it('should handle country without optional fields', () => {
      const minimal = {
        ...peru,
        capital: undefined,
        languages: undefined,
        currencies: undefined,
        borders: undefined,
        subregion: undefined,
        idd: { root: undefined, suffixes: undefined },
      } as unknown as Country;
      const result = CountryFormatter.formatCountry(minimal);
      expect(result).toContain('Peru');
      expect(result).not.toContain('Capital:');
      expect(result).not.toContain('Languages:');
      expect(result).not.toContain('Currencies:');
      expect(result).not.toContain('Borders:');
      expect(result).toContain('Calling Code: N/A');
      expect(result).toContain('Region: Americas');
      expect(result).not.toContain(' / ');
    });

    it('should handle idd root without suffixes', () => {
      const noSuffix = {
        ...peru,
        idd: { root: '+5', suffixes: ['1', '2', '3'] },
      } as unknown as Country;
      const result = CountryFormatter.formatCountry(noSuffix);
      expect(result).toContain('+5');
    });
  });

  describe('formatCountryList', () => {
    it('should format a list of countries', () => {
      const result = CountryFormatter.formatCountryList(countries);
      expect(result).toContain('France');
      expect(result).toContain('Germany');
      expect(result).toContain('Paris');
      expect(result).toContain('Berlin');
    });

    it('should sort by population descending', () => {
      const result = CountryFormatter.formatCountryList(countries, {
        sortBy: 'population',
        sortOrder: 'desc',
      });
      const lines = result.split('\n');
      expect(lines[0]).toContain('Germany');
      expect(lines[1]).toContain('France');
    });

    it('should limit results', () => {
      const result = CountryFormatter.formatCountryList(countries, { limit: 1 });
      expect(result).toContain('and 1 more results');
    });

    it('should sort by area ascending', () => {
      const result = CountryFormatter.formatCountryList(countries, {
        sortBy: 'area',
        sortOrder: 'asc',
      });
      const lines = result.split('\n');
      expect(lines[0]).toContain('Germany');
      expect(lines[1]).toContain('France');
    });
  });

  describe('formatComparison', () => {
    it('should format a comparison table', () => {
      const result = CountryFormatter.formatComparison(countries, ['population', 'area']);
      expect(result).toContain('population');
      expect(result).toContain('area');
      expect(result).toContain('Germany');
      expect(result).toContain('France');
    });

    it('should format all metric types', () => {
      const result = CountryFormatter.formatComparison(countries, [
        'population',
        'area',
        'capital',
        'region',
        'currencies',
        'languages',
        'timezones',
        'borders',
        'callingCode',
        'drivingSide',
        'unMember',
        'landlocked',
        'unknown_metric',
      ]);
      expect(result).toContain('population');
      expect(result).toContain('km²');
      expect(result).toContain('Berlin');
      expect(result).toContain('Europe');
      expect(result).toContain('EUR');
      expect(result).toContain('German');
      expect(result).toContain('right');
      expect(result).toContain('Yes');
      expect(result).toContain('No');
      expect(result).toContain('N/A');
    });
  });

  describe('formatBorders', () => {
    it('should format borders list', () => {
      const result = CountryFormatter.formatBorders(peru, countries);
      expect(result).toContain('Borders of');
      expect(result).toContain('Peru');
      expect(result).toContain('2 neighbors');
    });

    it('should handle no borders', () => {
      const island = { ...peru, borders: [] } as unknown as Country;
      const result = CountryFormatter.formatBorders(island, []);
      expect(result).toContain('no land borders');
    });
  });

  describe('formatTable', () => {
    it('should format an aligned table', () => {
      const result = CountryFormatter.formatTable(
        ['Name', 'Pop'],
        [
          ['Peru', '33M'],
          ['Germany', '83M'],
        ],
      );
      expect(result).toContain('Name');
      expect(result).toContain('Pop');
      expect(result).toContain('---');
    });
  });
});
