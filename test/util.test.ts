import * as testee from '../src/util';

test('should sanitize type names correctly', () => {
  expect(testee.sanitizeTypeName('Vendor::Service')).toBe('Service');
  expect(testee.sanitizeTypeName('Vendor::Service::Resource')).toBe('Resource');
  expect(testee.sanitizeTypeName('Vendor::ServiceName')).toBe('Servicename');
  expect(testee.sanitizeTypeName('Vendor::ServiceName::Resource')).toBe('Resource');
});
