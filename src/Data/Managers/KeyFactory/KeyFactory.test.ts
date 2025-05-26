import { KeyFactory } from '../KeyFactory';

describe('KeyFactory', () => {
  describe('constructor', () => {
    it('should initialize with sliceKey and optional key', () => {
      const factory = new KeyFactory('compilation', 'getCompileDetails');
      expect(factory['sliceKey']).toBe('compilation');
      expect(factory['key']).toBe('getCompileDetails');
    });

    it('should initialize with only sliceKey when key is not provided', () => {
      const factory = new KeyFactory('compilation');
      expect(factory['sliceKey']).toBe('compilation');
      expect(factory['key']).toBe('');
    });
  });

  describe('all()', () => {
    it('should return array with sliceKey and key', () => {
      const factory = new KeyFactory('compilation', 'getCompileDetails');
      expect(factory.all()).toEqual(['compilation', 'getCompileDetails']);
    });

    it('should return array with sliceKey and empty string when key is not provided', () => {
      const factory = new KeyFactory('compilation');
      expect(factory.all()).toEqual(['compilation', '']);
    });
  });

  describe('unique()', () => {
    it('should combine base keys with id', () => {
      const factory = new KeyFactory('compilation', 'getCompileDetails');
      expect(factory.unique('123')).toEqual(['compilation', 'getCompileDetails', '123']);
    });

    it('should combine base keys with id and extra keys', () => {
      const factory = new KeyFactory('compilation', 'getCompileDetails');
      expect(factory.unique('123', ['extra1', 'extra2'])).toEqual([
        'compilation',
        'getCompileDetails',
        '123',
        'extra1',
        'extra2'
      ]);
    });

    it('should work without extra keys', () => {
      const factory = new KeyFactory('compilation');
      expect(factory.unique('123')).toEqual(['compilation', '', '123']);
    });
  });
}); 