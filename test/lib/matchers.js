beforeEach(function() {
  this.addMatchers({
    toBeA: function (type) {
      return (typeof this.actual) === type;
    },
    toHaveProperty: function (key, value) {
      var primary = this.actual && this.actual.hasOwnProperty(key);

      if (primary && arguments.length > 1) {
        return this.actual[key] === value;
      }

      return primary;
    }
  });
});
