// beforeEach(angular.mock.inject(function($httpBackend) {
//   $httpBackend.when('GET', '/projects').respond({
//     names: ['test']
//   });

//   $httpBackend.when('GET', '/projects/test').respond({
//     name: 'test',
//     description: '',
//     modules: ['mod']
//   });

//   $httpBackend.when('GET', '/projects/bogus').respond(400, {
//     error: 'Project at bogus does not exist.'
//   });

//   $httpBackend.when('PUT', '/projects/test').respond({
//     name: 'test',
//     description: 'New description.',
//     modules: ['mod']
//   });

//   $httpBackend.when('PUT', '/projects/new').respond({
//     name: 'new',
//     description: 'Test description.',
//     modules: []
//   });

//   $httpBackend.when('PUT', '/projects/').respond(404, 'Cannot PUT /projects/');

//   $httpBackend.when('DELETE', '/projects/test').respond({
//     name: 'test',
//     description: '',
//     modules: ['mod']
//   });

//   $httpBackend.when('DELETE', '/projects/bogus').respond(400, {
//     error: 'Project at bogus does not exist.'
//   });

//   $httpBackend.when('GET', '/projects/test/modules').respond(['mod']);

//   $httpBackend.when('GET', '/projects/bogus/modules').respond(400, {
//     error: 'Project at bogus does not exist.'
//   });

//   $httpBackend.when('GET', '/projects/test/modules/mod').respond({
//     editor: '/tools/example-tool/editor.html',
//     source: {
//       type: 'example'
//     }
//   });

//   $httpBackend.when('GET', '/projects/bogus/modules/mod').respond(400, {
//     error: 'Project at bogus does not exist.'
//   });

//   $httpBackend.when('GET', '/projects/test/modules/bogus').respond(400, {
//     error: 'ENOENT, open \'/Users/schoon/Projects/strongloop/asteroid-editor/projects/example/modules/bogus/module.json\''
//   });

//   $httpBackend.when('PUT', '/projects/test/modules/mod').respond({
//     editor: '/tools/example-tool/editor.html',
//     source: {
//       type: 'example',
//       key: 'Another provided value.'
//     }
//   });

//   $httpBackend.when('PUT', '/projects/test/modules/new').respond({
//     editor: '/tools/another-tool/editor.html',
//     source: {
//       type: 'another',
//       key: 42
//     }
//   });

//   $httpBackend.when('PUT', '/projects/bogus/modules/mod').respond(400, {
//     error: 'Project at bogus does not exist.'
//   });

//   $httpBackend.when('DELETE', '/projects/test/modules/mod').respond({
//     data: {}
//   });
// }));
