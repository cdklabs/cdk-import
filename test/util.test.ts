import * as testee from '../src/util';

test('should sanitize type names correctly', () => {
  expect(testee.sanitizeTypeName('Vendor::Service')).toBe('Service');
  expect(testee.sanitizeTypeName('Vendor::Service::Resource')).toBe('Resource');
  expect(testee.sanitizeTypeName('Vendor::ServiceName')).toBe('Servicename');
  expect(testee.sanitizeTypeName('Vendor::ServiceName::Resource')).toBe('Resource');
});

test('should sanitize file names correctly', () => {
  expect(testee.sanitizeFileName('Vendor::Service')).toBe('vendor-service.ts');
  expect(testee.sanitizeFileName('Vendor::Service::Resource')).toBe('vendor-service-resource.ts');
  expect(testee.sanitizeFileName('Vendor::ServiceName')).toBe('vendor-servicename.ts');
  expect(testee.sanitizeFileName('Vendor::ServiceName::Resource')).toBe('vendor-servicename-resource.ts');
});