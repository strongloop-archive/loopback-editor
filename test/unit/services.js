describe('Services', function () {
  function fail(test) {
    return function (reason) {
      test.fail(reason);
    };
  }

  function expectToFail(test) {
    return function () {
      test.fail(new Error('Expected to fail.'));
    };
  }

  beforeEach(angular.mock.module('asteroid.services'));

  beforeEach(angular.mock.inject(function($httpBackend) {
    $httpBackend.when('GET', '/projects').respond({
      names: ['test']
    });

    $httpBackend.when('GET', '/projects/test').respond({
      name: 'test',
      description: '',
      modules: ['mod']
    });

    $httpBackend.when('GET', '/projects/bogus').respond(400, {
      error: 'Project at bogus does not exist.'
    });

    $httpBackend.when('PUT', '/projects/test').respond({
      name: 'test',
      description: 'New description.',
      modules: ['mod']
    });

    $httpBackend.when('PUT', '/projects/new').respond({
      name: 'new',
      description: 'Test description.',
      modules: []
    });

    $httpBackend.when('PUT', '/projects/').respond(404, 'Cannot PUT /projects/');

    $httpBackend.when('DELETE', '/projects/test').respond({
      name: 'test',
      description: '',
      modules: ['mod']
    });

    $httpBackend.when('DELETE', '/projects/bogus').respond(400, {
      error: 'Project at bogus does not exist.'
    });

    $httpBackend.when('GET', '/projects/test/modules').respond(['mod']);

    $httpBackend.when('GET', '/projects/bogus/modules').respond(400, {
      error: 'Project at bogus does not exist.'
    });

    $httpBackend.when('GET', '/projects/test/modules/mod').respond({
      editor: '/tools/example-tool/editor.html',
      source: {
        type: 'example'
      }
    });

    $httpBackend.when('GET', '/projects/bogus/modules/mod').respond(400, {
      error: 'Project at bogus does not exist.'
    });

    $httpBackend.when('GET', '/projects/test/modules/bogus').respond(400, {
      error: 'ENOENT, open \'/projects/test/modules/bogus/module.json\''
    });

    $httpBackend.when('PUT', '/projects/test/modules/mod', {
      type: 'example',
      key: 'Another provided value.'
    }).respond({
      editor: '/tools/example-tool/editor.html',
      source: {
        type: 'example',
        key: 'Another provided value.'
      }
    });

    $httpBackend.when('PUT', '/projects/test/modules/new', {
      type: 'another',
      key: 42
    }).respond({
      editor: '/tools/another-tool/editor.html',
      source: {
        type: 'another',
        key: 42
      }
    });

    $httpBackend.when('PUT', '/projects/bogus/modules/mod').respond(400, {
      error: 'Project at bogus does not exist.'
    });

    $httpBackend.when('DELETE', '/projects/test/modules/mod').respond({
      editor: '/tools/example-tool/editor.html',
      source: {
        type: 'example'
      }
    });

    $httpBackend.when('DELETE', '/projects/bogus/modules/mod').respond(400, {
      error: 'Project at bogus does not exist.'
    });

    $httpBackend.when('DELETE', '/projects/test/modules/bogus').respond(400, {
      error: 'ENOENT, open \'/projects/test/modules/bogus/module.json\''
    });
  }));

  afterEach(angular.mock.inject(function($httpBackend) {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }));

  describe('LocalStorage', function () {
    it('should exist', angular.mock.inject(function (LocalStorage) {
      expect(LocalStorage).not.toEqual(null);
    }));

    it('should return null for bogus keys', angular.mock.inject(function (LocalStorage) {
      expect(LocalStorage.get('bogus')).toEqual(null);
    }));

    it('should return the proper value for set keys', angular.mock.inject(function (LocalStorage) {
      expect(LocalStorage.set('foo', 'bar')).toEqual('bar');
      expect(LocalStorage.get('foo')).toEqual('bar');
    }));
  });

  describe('Workspace', function () {
    var Workspace;
    var $httpBackend;
    var $rootScope;

    beforeEach(angular.mock.inject(function ($injector) {
      Workspace = $injector.get('Workspace');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope = $injector.get('$rootScope');
    }));

    it('should exist', function () {
      expect(Workspace).not.toEqual(null);
    });

    describe('getProjects', function () {
      it('should return an Array of Project names', function () {
        Workspace.getProjects()
          .then(function (data) {
            expect(data).toEqual({
              names: ['test']
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('getProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.getProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project does not exist', function () {
        Workspace.getProject('bogus')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return an Object', function () {
        Workspace.getProject('test')
          .then(function (data) {
            expect(data).toBeA('object');
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });

      it('should return the name', function () {
        Workspace.getProject('test')
          .then(function (data) {
            expect(data).toHaveProperty('name', 'test');
          });

        $httpBackend.flush();
      });

      it('should return the description', function () {
        Workspace.getProject('test')
          .then(function (data) {
            expect(data).toHaveProperty('description', '');
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });

      it('should return an Array of Module names', function () {
        Workspace.getProject('test')
          .then(function (data) {
            expect(data).toHaveProperty('modules');
            expect(data.modules).toEqual(['mod']);
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('createProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.createProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project name is empty', function () {
        Workspace.createProject('')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return the newly-created Project', function () {
        Workspace.createProject('new', { description: 'Test description.' })
          .then(function (data) {
            expect(data).toEqual({
              name: 'new',
              description: 'Test description.',
              modules: []
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });

      it('should support updating existing Projects', function () {
        Workspace.createProject('test', { description: 'New description.' })
          .then(function (data) {
            expect(data).toEqual({
              name: 'test',
              description: 'New description.',
              modules: ['mod']
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('removeProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.removeProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project does not exist', function () {
        Workspace.removeProject('bogus')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return the removed Project', function () {
        Workspace.removeProject('test')
          .then(function (data) {
            expect(data).toEqual({
              name: 'test',
              description: '',
              modules: ['mod']
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('getModulesForProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.getModulesForProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project does not exist', function () {
        Workspace.getModulesForProject('bogus')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return an Array of Module names', function () {
        Workspace.getModulesForProject('test')
          .then(function (data) {
            expect(data).toEqual(['mod']);
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('getModuleForProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.getModuleForProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project does not exist', function () {
        Workspace.getModuleForProject('bogus', 'mod')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return an Error if the Module name is not specified', function () {
        Workspace.getModuleForProject('test')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Module does not exist', function () {
        Workspace.getModuleForProject('test', 'bogus')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return an Object', function () {
        Workspace.getModuleForProject('test', 'mod')
          .then(function (data) {
            expect(data).toBeA('object');
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });

      it('should return the editor URL', function () {
        Workspace.getModuleForProject('test', 'mod')
          .then(function (data) {
            expect(data).toHaveProperty('editor', '/tools/example-tool/editor.html');
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });

      it('should return the source document', function () {
        Workspace.getModuleForProject('test', 'mod')
          .then(function (data) {
            expect(data).toHaveProperty('source');
            expect(data.source).toEqual({
              type: 'example'
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('addModuleToProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.addModuleToProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project does not exist', function () {
        Workspace.addModuleToProject('bogus', 'mod', { type: 'another' })
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return an Error if the Module name is not specified', function () {
        Workspace.addModuleToProject('test', null, { type: 'another' })
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Module type is not specified', function () {
        Workspace.addModuleToProject('test', 'new', {})
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return the newly-created Module', function () {
        Workspace.addModuleToProject('test', 'new', {
          type: 'another',
          key: 42
        })
          .then(function (data) {
            expect(data).toEqual({
              editor: '/tools/another-tool/editor.html',
              source: {
                type: 'another',
                key: 42
              }
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });

      it('should support updating existing Modules', function () {
        Workspace.addModuleToProject('test', 'mod', {
          type: 'example',
          key: 'Another provided value.'
        })
          .then(function (data) {
            expect(data).toEqual({
              editor: '/tools/example-tool/editor.html',
              source: {
                type: 'example',
                key: 'Another provided value.'
              }
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });

    describe('removeModuleFromProject', function () {
      it('should return an Error if the Project name is not specified', function () {
        Workspace.removeModuleFromProject()
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Project does not exist', function () {
        Workspace.removeModuleFromProject('bogus', 'mod')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return an Error if the Module name is not specified', function () {
        Workspace.removeModuleFromProject('test')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $rootScope.$apply();
      });

      it('should return an Error if the Module does not exist', function () {
        Workspace.removeModuleFromProject('test', 'bogus')
          .then(expectToFail(this), function (reason) {
            expect(reason).not.toEqual(null);
          });

        $httpBackend.flush();
      });

      it('should return the removed Module', function () {
        Workspace.removeModuleFromProject('test', 'mod')
          .then(function (data) {
            expect(data).toEqual({
              editor: '/tools/example-tool/editor.html',
              source: {
                type: 'example'
              }
            });
          })
          .then(null, fail(this));

        $httpBackend.flush();
      });
    });
  });
});
