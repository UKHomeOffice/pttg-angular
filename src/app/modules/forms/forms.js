var formsModule = angular.module('hod.forms', ['ui.validate']);

var defaultAttrs = function (attrs, defaults) {
  _.each(defaults, function (def, key) {
    if (attrs[key] === undefined) {
      attrs.$set(key, def);
    }
  });

  if (!attrs['name']) {
    attrs.$set('name', getInputName(attrs));
  }

  if (!attrs['id']) {
    attrs.$set('id', attrs.name);
  }
};


var nameIndexCounter = 0;
var getInputName = function (attrs) {
  if (attrs.name) {
    return attrs.name;
  }
  if (attrs.label) {
    var n = attrs.label.replace(/[^a-zA-Z]/g, '').toLowerCase() + nameIndexCounter++;
    return n;
  }
  return 'input' + nameIndexCounter++;
};

formsModule.factory('FormsService', [function () {
  var register = {};

  this.registerForm = function (f) {
    var id = f.getId();
    register[id] = f;
  };

  return this;
}]);

formsModule.directive('hodForm', ['$anchorScroll', 'FormsService', function ($anchorScroll, FormsService) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      name: '@',
      submit: '=',
      displayErrors: '@',
      id: '@'
    },
    templateUrl: 'modules/forms/forms.html',

    controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
      var me = this;
      var objs = $scope.objs = [];
      $scope.errorList = [];

      defaultAttrs($attrs, {id: 'hodForm', name: 'hodForm', displayErrors: false });

      this.getId = function () {
        return $attrs.id;
      };

      FormsService.registerForm(this);

      this.getForm = function () {
        return $scope[$attrs['name'] + 'Form'];
      };

      this.getScope = function () {
        return $scope;
      };

      this.addObj = function (obj) {
        objs.push(obj);
      };

      this.validateForm = function () {
        var errorList = [];

        // check each component of the form
        _.each(objs, function (obj) {
          var inp = obj.getInput();
          if (inp.$valid) {
            // clear the components error message
            obj.displayError = '';
          } else {
            // show the message within the component
            obj.displayError = obj.errorMsg

            // add the error to the list of summary errors for the top of the page
            errorList.push({ id: obj.id, msg: obj.errorSummary, code: obj.errorCode });
          }
        });

        if (angular.toJson(errorList) !== angular.toJson($scope.errorList)) {
          $scope.errorList = errorList;
        }
        return errorList.length;
      };

      $scope.errorClicked = function (anchor) {
        $anchorScroll(anchor);
      };

      $scope.submitForm = function () {
        if (me.validateForm()) {
          $scope.showErrors = true;
        } else {
          $scope.showErrors = false;
        }

        if ($scope.submit) {
          $scope.submit();
        }
      };
    }],
  };
}]);


var getStandardTextDirective = function (conf) {
  return {
    restrict: 'E',
    require: '^^hodForm',
    scope: {
      field:    '=?',
      hint:     '@hint',
      name:     '@name',
      id:       '@id',
      label:    '@label',
      config:   '=?'
    },
    transclude: true,
    templateUrl: 'modules/forms/forms-text.html',
    compile: function(element, attrs) {
      defaultAttrs(attrs, {name: '', id: '', hint: '', label: ''});
      return function(scope, element, attrs, formCtrl) {
        scope.required = (attrs.required === 'false') ? false: true;

        scope.type = conf.type;
        scope.displayError = '';
        if (!scope.config) {
          scope.config = {};
        }

        if (scope.config.max) {
          attrs.$set('max', scope.config.max);
        };

        // set the default configs
        scope.config = angular.merge({
          errors: {
            required: {
              msg: 'Required',
              summary: attrs.label + ' is required'
            },
            numeric: {
              msg: 'Not numeric',
              summary: attrs.label + ' is not numeric'
            },
            max: {
              msg: 'Exceeds the maximum',
              summary: attrs.label + ' exceeds the maximum'
            }
          }
        }, scope.config);

        // register this component with the form controller
        formCtrl.addObj(scope);

        // set the maxlength
        scope.maxlength = (attrs.max) ? attrs.max.length : '';

        scope.getInput = function () {
          return formCtrl.getForm()[attrs.name];
        };

        scope.validfunc = function (val) {
          var validate = function () {

            if (scope.required && (_.isUndefined(val) || String(val).length === 0)) {
              // it is required (do this test before val is still a string)
              return {
                err: 'required',
                summary: scope.config.errors.required.summary,
                msg: scope.config.errors.required.msg
              };
            }

            if (scope.type === 'number') {
              // only apply these tests if its a number type
              val = Number(val);
              if (_.isNaN(val)) {
                // not a number
                return {
                  err: 'numeric',
                  summary: scope.config.errors.numeric.summary,
                  msg: scope.config.errors.numeric.msg
                };
              }

              if (attrs.max && val > Number(attrs.max)) {
                // is it greater than the max
                return {
                  err: 'max',
                  summary: scope.config.errors.max.summary,
                  msg: scope.config.errors.max.msg
                };
              }
            }

            return true;
          };

          var result = validate();
          if (result === true) {
            scope.errorCode = null;
            scope.errorMsg = '';
            scope.errorSummary = '';
            return true;
          }

          scope.errorCode = result.err;
          scope.errorMsg = result.msg;
          scope.errorSummary = result.summary;
          return false;
        };


        // scope.showErrors = function () {
        //   return (formCtrl.getScope().showErrors && scope.errorMsg) ? true: false;
        // };
      };
    },
  };
};


formsModule.directive('hodText', [function () {
  return getStandardTextDirective({type: 'text'});
}]);


formsModule.directive('hodNumber', [function () {
  return getStandardTextDirective({type: 'number'});
}]);


formsModule.directive('hodRadio', [function () {
  return {
    restrict: 'E',
    require: '^^hodForm',
    scope: {
      field: '=',
      hint: '@hint',
      name: '@name',
      id: '@id',
      label: '@label',
      options: '=',
      // required: '@?',
      config: '=?'
    },
    transclude: true,
    templateUrl: 'modules/forms/forms-radio.html',
    compile: function(element, attrs) {
      defaultAttrs(attrs, {hint: '', label: '', inline: false});
      return function(scope, element, attrs, formCtrl, transclude) {

        scope.displayError = '';
        if (!scope.config) {
          scope.config = {};
        }

        if (typeof attrs.required === 'string') {
          scope.config.required = (attrs.required === 'false') ? false: true;
        }

        // set the default configs
        scope.config = angular.merge({
          inline: false,
          required: true,
          errors: {
            required: {
              msg: 'Required',
              summary: attrs.label + ' is required'
            }
          }
        }, scope.config);

        //
        formCtrl.addObj(scope);

        scope.getSelectedOption = function () {
          return _.findWhere(scope.options, {value: scope.field});
        };

        scope.validfunc = function (val) {
          var selected = scope.getSelectedOption(val);
          var validate = function () {
            if (scope.config.required && _.isUndefined(selected)) {
              // it is required (do this test before val is still a string)
              return {
                err: 'required',
                summary: scope.config.errors.required.summary,
                msg: scope.config.errors.required.msg
              };
            }

            return true;
          };

          var result = validate();
          if (result === true) {
            scope.errorCode = null;
            scope.errorMsg = '';
            scope.errorSummary = '';
            return true;
          }

          scope.errorCode = result.err;
          scope.errorMsg = result.msg;
          scope.errorSummary = result.summary;
          return false;
        };

        scope.getInput = function () {
          return formCtrl.getForm()[attrs.name];
        };

        scope.radioClick = function (opt) {
          var formScope = formCtrl.getScope();
          var frm = formScope[formScope.name];
          scope.field = opt.value;
        };
      };
    }
  }
}]);


formsModule.directive('hodDate', [function () {
  return {
    restrict: 'E',
    require: '^^hodForm',
    scope: {
      field: '=',
      hint: '@hint',
      name: '@name',
      id: '@id',
      label: '@label',
      config: '=?'
    },
    transclude: true,
    templateUrl: 'modules/forms/forms-date.html',
    compile: function(element, attrs) {
      defaultAttrs(attrs, {hint: '', label: '', required: true});

      return function(scope, element, attrs, formCtrl) {
        scope.displayError = '';
        // scope.data = {
        //   day: '',
        //   month: '',
        //   year: ''
        // };

        if (!scope.config) {
          scope.config = {};
        }

        if (typeof attrs.required === 'string') {
          scope.config.required = (attrs.required === 'false') ? false: true;
        }

        // set the default configs
        scope.config = angular.merge({
          inline: false,
          required: true,
          errors: {
            required: {
              msg: 'Required',
              summary: attrs.label + ' is required'
            },
            invalid: {
              msg: 'Invalid',
              summary: attrs.label + ' is invalid'
            }
          }
        }, scope.config);

        //
        formCtrl.addObj(scope);

        scope.getInput = function () {
          return formCtrl.getForm()[attrs.name + '-year'];
        };

        scope.getData = function (input) {
          var data = {day:'', month: '', year: ''};
          if (typeof input === 'string') {
            var bits = input.split('-');
            if (Number(bits[0])) {
              data.year = Number(bits[0]);
            }

            if (Number(bits[1])) {
              data.month = Number(bits[1]);
            }

            if (Number(bits[2])) {
              data.day = Number(bits[2]);
            }
          }
          return data;
        };

        scope.data = scope.getData(scope.field);
        console.log('Date', scope.getData(scope.field));


        scope.dateChanged = function () {
          scope.validfunc();

          var d = scope.data.year;
          var before = scope.field;
          d += '-' + ((Number(scope.data.month) < 10) ? '0' + Number(scope.data.month) : scope.data.month);
          d += '-' + ((Number(scope.data.day) < 10) ? '0' + Number(scope.data.day) : scope.data.day);
          scope.field = d;
        };

        scope.isValid = function () {
          var validDay = (Number(scope.data.day) >= 1 && Number(scope.data.day) <= 31);
          var validMonth = (Number(scope.data.month) >= 1 && Number(scope.data.month) <= 12);
          var validYear = (Number(scope.data.year) >= 1000);
          return (validDay && validMonth && validYear);
        };

        scope.validfunc = function () {
          var validate = function () {
            if (scope.config.required && (scope.data.day + '' + scope.data.month + '' + scope.data.year).length === 0) {
              return {
                err: 'required',
                summary: scope.config.errors.required.summary,
                msg: scope.config.errors.required.msg
              };
            }

            if (!scope.isValid()) {
              return {
                err: 'invalid',
                summary: scope.config.errors.invalid.summary,
                msg: scope.config.errors.invalid.msg
              };
            }

            return true;
          };

          var result = validate();
          if (result === true) {
            scope.errorCode = null;
            scope.errorMsg = '';
            scope.errorSummary = '';
            scope.getInput().$setValidity('date', true);
            return true;
          }

          scope.getInput().$setValidity('date', false);
          scope.errorCode = result.err;
          scope.errorMsg = result.msg;
          scope.errorSummary = result.summary;
          return false;
        };

        scope.validfunc();
      };
    },

  }
}]);


formsModule.directive('hodSortCode', [function () {
  return {
    restrict: 'E',
    require: '^^hodForm',
    compile: function(element, attrs) {
      defaultAttrs(attrs, {hint: '', label: '', required: true, errorInline: 'Enter a valid sort code', error: 'The sort code is invalid'});

      return function(scope, element, attrs, formCtrl) {
        formCtrl.addObj(scope);
        scope.data = {part1: '', part2: '', part3: ''};

        if (scope.field.length >= 2) {
          scope.data.part1 = scope.field.substr(0, 2);
        }

        if (scope.field.length >= 4) {
          scope.data.part2 = scope.field.substr(2, 2);
        }

        if (scope.field.length === 6) {
          scope.data.part3 = scope.field.substr(4, 2);
        }

        scope.itChanged = function () {
          scope.field = scope.data.part1 + '' + scope.data.part2 + '' + scope.data.part3;
          scope.ok = scope.isValid();
          // formCtrl.updateErrors();
        };

        scope.isValid = function () {
          var pt1 = (!_.isNaN(Number(scope.data.part1)) && scope.data.part1.length === 2);
          var pt2 = (!_.isNaN(Number(scope.data.part2)) && scope.data.part2.length === 2);
          var pt3 = (!_.isNaN(Number(scope.data.part3)) && scope.data.part3.length === 2);

          return (pt1 && pt2 && pt3) ? true : false;
        };

        scope.showErrors = function () {
          return (formCtrl.getScope().showErrors() && !scope.ok) ? true: false;
        };

        scope.itChanged();
      };
    },
    scope: {
      field: '=',
      hint: '@hint',
      name: '@name',
      id: '@id',
      label: '@label',
      validFunc: '=',
      error: '@error',
      errorInline: '@errorInline',
      required: '@required'
    },
    transclude: true,
    templateUrl: 'modules/forms/forms-sortcode.html'
  }
}]);


formsModule.directive('hodSubmit', [function () {
  return {
    restrict: 'E',
    require: '^^hodForm',
    compile: function (element, attrs) {
      if (attrs.value === undefined) {
        attrs.$set('value', 'Submit');
      }
      return function(scope, element, attrs, formCtrl) {
        var formEl = formCtrl.getForm();
        scope.disable = function () {
          // return formEl.$invalid;
        }
      };
    },
    scope: {
      value: '@value'
    },
    templateUrl: 'modules/forms/forms-submit.html'
  }
}]);

