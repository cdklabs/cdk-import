import * as testee from '../src/util';

test('should sanitize type names correctly', () => {
  expect(testee.sanitizeTypeName('Vendor::Service')).toBe('Service');
  expect(testee.sanitizeTypeName('Vendor::Service::Resource')).toBe('Resource');
  expect(testee.sanitizeTypeName('Vendor::ServiceName')).toBe('ServiceName');
  expect(testee.sanitizeTypeName('Vendor::ServiceName::Resource')).toBe('Resource');
});

test('modules should include the type name with a Module suffix', () => {
  expect(testee.sanitizeTypeName('JFrog::Linux::Bastion::MODULE')).toBe('BastionModule');
});
