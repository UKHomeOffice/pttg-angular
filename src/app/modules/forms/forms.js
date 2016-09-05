var formsModule = angular.module('hod.forms', ['ui.validate']);


/**
  * utiltity function to ensure some default key/values are present
  * in the attribute object - the original attribute object is modifed
  * @param object current angular attribute object
  * @param object defaults object key-value pairs of defaults
  * @return void the original attribute object is modifed
*/
var defaultAttrs = function (attrs, defaults) {
  _.each(defaults, function (def, key) {
    if (attrs[key] === undefined) {
      attrs.$set(key, def);
    }
  });

  // force an attribute name - this function is used exclusively for form input type structures
  if (!attrs['name']) {
    attrs.$set('name', getInputName(attrs));
  }

  // // force an ID
  // if (!attrs['id']) {
  //   attrs.$set('id', attrs.name);
  // }
};


// use a global counter to ensure uniqueness when generating an input name
var nameIndexCounter = 0;


/**
  * try to determine a suitable name for an input element
  * if no name is specified in the attributes then create one from the label
  * @param object angular directive attribute object
  * @return string the name to use
*/
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

var lcFirst = function (str) {
  return str.substr(0, 1).toLowerCase() + str.substr(1);
};


/**
  * create the FormsService static to handle global form functions
*/
formsModule.factory('FormsService', ['$rootScope', function ($rootScope) {
  var register = {};
  var me = this;
  this.registerForm = function (f) {
    var id = f.getId();
    register[id] = f;
  };

  /**
    * look at the scope and configuration of a specific element
    * if it has specific error messages defined for that element
    * then return them otherwise return a default message
  */
  this.getError = function (err, scope) {
    // default errors
    var errorObj = {
      err: err,
      summary: 'The ' + lcFirst(scope.label) + ' is invalid',
      msg: 'Enter a valid ' + lcFirst(scope.label)
    };


    if (scope.config && scope.config.errors && scope.config.errors[err]) {
      // are any specific messages supplied for the summary or msg
      if (scope.config.errors[err].summary) {
        errorObj.summary = scope.config.errors[err].summary;
      }

      if (scope.config.errors[err].msg) {
        errorObj.msg = scope.config.errors[err].msg;
      }
    }

    return errorObj;
  };

  /**
    * element directives hod-text and hod-number share 99% of the same code
    * so define everything here and both directives can use it
  */
  this.getStandardTextDirective = function (conf) {
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
        defaultAttrs(attrs, {name: '', hint: '', label: ''});
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
            id: attrs.name,
            hidden: false,
            errors: {
              numeric: {
                msg: 'Not numeric',
                summary: attrs.label + ' is not numeric'
              },
              max: {
                msg: 'Exceeds the maximum',
                summary: attrs.label + ' exceeds the maximum'
              }
            },
            classes: {
              'form-control-1-4': true
            },
            prefix: '',
            suffix: '',
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

              if (scope.hidden) {
                // return true;
              }

              if (scope.required && (_.isUndefined(val) || String(val).length === 0)) {
                // it is required (do this test before val is still a string)
                return me.getError('required', scope);
              }

              if (scope.type === 'number') {
                // only apply these tests if its a number type
                val = Number(val);
                if (_.isNaN(val)) {
                  // not a number
                  return me.getError('numeric', scope);
                }

                if (attrs.max && val > Number(attrs.max)) {
                  // is it greater than the max
                  return me.getError('max', scope);
                }
              }
              return true;
            };

            var result = validate();
            $rootScope.$applyAsync();
            if (result === true) {
              scope.error = {code: '', summary: '', msg: ''};
              return true;
            }

            scope.error = result;
            return false;
          };

          // scope.validfunc();
        };
      },
    };
  };

  return this;
}]);


/**
  * A directive for the overall hod-form tag
*/
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

    controller: ['$scope', '$element', '$attrs', '$window', '$timeout', function($scope, $element, $attrs, $window, $timeout) {
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

          if (obj.config.hidden) {
            console.log('HIDDEN', obj, inp.$valid);
            return;
          }

          if (inp.$valid) {
            // clear the components error message
            console.log('VALID', obj.config.id, inp.$valid);
            obj.displayError = '';
          } else {
            // show the message within the component
            console.log('INVALID', obj.config.id, inp.$valid);
            obj.displayError = obj.error.msg

            switch (obj.type) {
              case 'text':
              case 'number':
                a = obj.config.id;
                break;

              case 'date':
                a = obj.config.id + 'Day';
                break;

              case 'sortcode':
                a = obj.config.id + 'Part1';
                break;

              default:
                a = obj.config.id + '0';
            }

            // add the error to the list of summary errors for the top of the page
            errorList.push({ id: obj.id, msg: obj.error.summary, code: obj.error.errorCode, anchor: a});
          }
        });
        // console.log(errorList);
        if (angular.toJson(errorList) !== angular.toJson($scope.errorList)) {
          $scope.errorList = errorList;
        }
        return errorList.length;
      };

      $scope.errorClicked = function (anchor) {
        var e = angular.element(document.getElementById(anchor));
        // console.log('errorClicked', anchor, e);
        if (e[0]) {
          e[0].focus();
        }
      };

      $scope.submitForm = function () {
        var isValid = (me.validateForm() === 0) ? true : false ;
        if (isValid) {
          $scope.showErrors = !isValid;
          $timeout(function () {
            var e = angular.element(document.querySelector('.error-summary'));
            if (e[0]) {
              e[0].focus();
            }
          });
        } else {
          $scope.showErrors = !isValid;
        }

        if ($scope.submit) {
          $scope.submit(isValid, $scope, me);
        }
      };
    }],
  };
}]);


formsModule.directive('hodText', ['FormsService', function (FormsService) {
  return FormsService.getStandardTextDirective({type: 'text'});
}]);


formsModule.directive('hodNumber', ['FormsService', function (FormsService) {
  return FormsService.getStandardTextDirective({type: 'number'});
}]);


formsModule.directive('hodRadio', ['FormsService', function (FormsService) {
  return {
    restrict: 'E',
    require: '^^hodForm',
    scope: {
      field: '=',
      hint: '@hint',
      name: '@name',
      label: '@label',
      options: '=',
      config: '=?'
    },
    transclude: true,
    templateUrl: 'modules/forms/forms-radio.html',
    compile: function(element, attrs) {
      defaultAttrs(attrs, {hint: '', label: '', inline: false});
      return function(scope, element, attrs, formCtrl, transclude) {
        scope.type = 'radio';
        scope.displayError = '';
        if (!scope.config) {
          scope.config = {};
        }

        if (typeof attrs.required === 'string') {
          scope.config.required = (attrs.required === 'false') ? false: true;
        }

        // set the default configs
        scope.config = angular.merge({
          id: attrs.name,
          hidden: false,
          inline: false,
          required: true,
          errors: {
            required: {
              summary: 'The ' + lcFirst(scope.label) + ' option is invalid',
              msg: 'Select an option'
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
              return FormsService.getError('required', scope);
            }

            return true;
          };

          var result = validate();
          if (result === true) {
            scope.error = {code: '', summary: '', msg: ''};
            return true;
          }

          scope.error = result;
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


formsModule.directive('hodDate', ['FormsService', function (FormsService) {
  return {
    restrict: 'E',
    require: '^^hodForm',
    scope: {
      field: '=',
      hint: '@hint',
      name: '@name',
      label: '@label',
      config: '=?'
    },
    transclude: true,
    templateUrl: 'modules/forms/forms-date.html',
    compile: function(element, attrs) {
      defaultAttrs(attrs, {hint: '', label: '', required: true});

      return function(scope, element, attrs, formCtrl) {
        scope.type = 'date';
        scope.displayError = '';

        if (!scope.config) {
          scope.config = {};
        }

        if (typeof attrs.required === 'string') {
          scope.config.required = (attrs.required === 'false') ? false: true;
          // console.log(scope.config);
        }

        // set the default configs
        scope.config = angular.merge({
          id: attrs.name,
          hidden: false,
          inline: false,
          required: true,
          errors: {
            max: {
              msg: 'Date is after the max date',
              summary: attrs.label + ' is invalid'
            },
            min: {
              msg: 'Date is before the min date',
              summary: attrs.label + ' is invalid'
            }
          }
        }, scope.config);

        console.log('Date', scope.config.id);

        //
        formCtrl.addObj(scope);

        scope.getInput = function () {
          return formCtrl.getForm()[attrs.name + 'Year'];
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


        scope.dateChanged = function () {
          if (scope.config.hidden) {
            return;
          }
          var mom = moment(scope.data.year + '-' + scope.data.month + '-' + scope.data.day, 'YYYY-MM-DD');
          scope.field = mom.format('YYYY-MM-DD');
          scope.validfunc();
        };

        scope.isValid = function () {
          var validDay = (Number(scope.data.day) >= 1 && Number(scope.data.day) <= 31);
          var validMonth = (Number(scope.data.month) >= 1 && Number(scope.data.month) <= 12);
          var validYear = (Number(scope.data.year) >= 1000);
          return (validDay && validMonth && validYear);
        };

        scope.isBlank = function () {
          return ((scope.data.day + '' + scope.data.month + '' + scope.data.year).length === 0) ? true : false;
        };

        scope.validfunc = function () {
          if (scope.config.hidden) {
            return true;
          }
          var validate = function () {
            if (scope.isBlank()) {
              if (scope.config.required) {
                // field is blank but is required
                return FormsService.getError('required', scope);
              } else {
                // field is blank but this is not a required field
                return true;
              }
            }

            if (!scope.isValid(scope.field)) {
              return FormsService.getError('invalid', scope);
            }

            if (scope.config.max) {
              var maxDate = moment(scope.field, 'YYYY-MM-DD');
              var inputDate = moment(scope.config.max, 'YYYY-MM-DD');
              if (inputDate.isBefore(maxDate)) {
                return FormsService.getError('max', scope);
              }
            }

            if (scope.config.min) {
              var minDate = moment(scope.field, 'YYYY-MM-DD');
              var inputDate = moment(scope.config.min, 'YYYY-MM-DD');
              if (inputDate.isAfter(minDate)) {
                return FormsService.getError('min', scope);
              }
            }

            return true;
          };

          var result = validate();

          if (result === true) {
            scope.error = {code: '', summary: '', msg: ''};
            scope.getInput().$setValidity('date', true);
            return true;
          }
          scope.getInput().$setValidity('date', false);
          scope.error = result;
          return false;
        };

        scope.validfunc();
      };
    },
  }
}]);


formsModule.directive('hodSortcode', ['FormsService', function (FormsService) {
  return {
    restrict: 'E',
    require: '^^hodForm',
    transclude: true,
    templateUrl: 'modules/forms/forms-sortcode.html',
    scope: {
      field: '=',
      hint: '@hint',
      name: '@name',
      label: '@label',
      config: '=?'
    },
    compile: function(element, attrs) {
      defaultAttrs(attrs, {hint: '', label: '', required: true});
      return function(scope, element, attrs, formCtrl) {
        scope.type = 'sortcode';
        scope.displayError = '';

        if (!scope.config) {
          scope.config = {};
        }

        if (typeof attrs.required === 'string') {
          scope.config.required = (attrs.required === 'false') ? false: true;
        }

        // set the default configs
        scope.config = angular.merge({
          id: attrs.name,
          hidden: false,
          inline: false,
          required: true,
          errors: {
            // required: {
            //   msg: 'Required',
            //   summary: attrs.label + ' is required'
            // },
            // invalid: {
            //   msg: 'Invalid',
            //   summary: attrs.label + ' is invalid'
            // }
          }
        }, scope.config);

        //
        formCtrl.addObj(scope);

        scope.getInput = function () {
          return formCtrl.getForm()[attrs.name + 'Part1'];
        };

        scope.getData = function (input) {
          var data = {};
          if (typeof input === 'string') {
            data.part1 = input.substr(0,2);
            data.part2 = input.substr(2,2);
            data.part3 = input.substr(4,2);
          }

          return data;
        };

        scope.data = scope.getData(scope.field);

        scope.itChanged = function () {
          var str = scope.data.part1 + '' + scope.data.part2 + '' + scope.data.part3;
          scope.field = str;
          scope.validfunc();
        };

        scope.isValid = function () {
          var pt1 = Number(scope.data.part1);
          var pt2 = Number(scope.data.part2);
          var pt3 = Number(scope.data.part3);

          if (scope.field.length !== 6) {
            return false;
          }

          return ((pt1 > 0 && pt1 <= 99) &&
                  (pt2 > 0 && pt2 <= 99) &&
                  (pt3 > 0 && pt3 <= 99)) ? true : false;
        };

        scope.isBlank = function () {
          return (scope.field.length === 0) ? true : false;
        };

        scope.validfunc = function () {
          if (scope.config.hidden) {
            return true;
          }
          var validate = function () {
            if (scope.isBlank()) {
              if (scope.config.required) {
                // field is blank but is required
                return FormsService.getError('required', scope);
              } else {
                // field is blank but this is not a required field
                return true;
              }
            }

            if (!scope.isValid(scope.field)) {
              return FormsService.getError('invalid', scope);
            }

            return true;
          };

          var result = validate();
          if (result === true) {
            scope.error = {code: '', summary: '', msg: ''};
            scope.getInput().$setValidity('sortcode', true);
            return true;
          }
          scope.getInput().$setValidity('sortcode', false);
          scope.error = result;
          return false;
        };

        _.defer(function () {
          scope.validfunc();
        });
      }
    }
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
        scope.type = 'submit';
        var formEl = formCtrl.getForm();
        scope.disable = function () {

        }
      };
    },
    scope: {
      value: '@value'
    },
    templateUrl: 'modules/forms/forms-submit.html'
  }
}]);
