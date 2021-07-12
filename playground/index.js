const json2jsii = require('json2jsii');
const schema = require('./eks.schema.json');
const fs = require('fs');

const gen = new json2jsii.TypeGenerator({
  definitions: schema.definitions
});

gen.emitType('ClusterProps', schema);

// generate ClusterProps from the CFN registry schema
fs.writeFileSync('out.ts', gen.render());
