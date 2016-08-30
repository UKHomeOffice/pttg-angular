// spec.js
describe('HOD Forms:', function () {
  var submit;
  var form;

  describe('Text input', function () {
    var hodTextInstances;
    it('should have a forms test page just for text input', function () {
      browser.get('http://127.0.0.1:3000/#/forms-test/text');
      expect(element.all(by.tagName('h1')).first().getText()).toEqual('text');
      hodTextInstances = element.all(by.tagName('hod-text'));
      submit = element(by.tagName('hod-submit')).element(by.tagName('input'));
    });


    it('should automatically assign name values if not given as attributes', function () {
      expect(hodTextInstances.get(0).getAttribute('name')).toEqual('input0');
    });


    it('should automatically assign id values if not given as attributes', function () {
      expect(hodTextInstances.get(0).getAttribute('id')).toEqual('input0');
    });


    it('should automatically assign id value if label is given', function () {
      expect(hodTextInstances.get(1).getAttribute('id')).toEqual('thisismyfirsttest1');
    });


    it('should apply id, name and hint text', function () {
      var el = element.all(by.id('forename_id')).first();
      var inp = el.element(by.tagName('input'));
      var hint = el.element(by.css('.form-hint'));
      expect(el.getAttribute('name')).toEqual('forename');
      expect(inp.getAttribute('id')).toEqual('forename_id-input');
      expect(hint.getText()).toEqual('Let me give you a clue');
    });


    describe('Object property binding via the field attribute', function () {
      var el = element(by.id('surname'));
      var inp = element(by.id('surname-input'));
      var feedback = element(by.id('surnameFeedback')).element(by.tagName('span'));


      it('should be able to bind to an object property passed to it', function () {
        expect(el.getAttribute('field')).toEqual('values.surname');
        expect(inp.getAttribute('value')).toEqual('Stuart');
      });


      it('should alter the bound object property value when input text changes', function () {
        inp.sendKeys(' Craigen');
        expect(inp.getAttribute('value')).toEqual('Stuart Craigen');
        expect(feedback.getText()).toEqual('Stuart Craigen');
      });
    });


    describe('Basic error messages', function () {
      it('should not show any errors before the form is submitted', function () {
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
      });


      it('should submit the form', function () {
        submit.click();
      });

      it('should show error summary at top of page', function () {
        var errors = element(by.css('.error-summary'));
        var errorLis = errors.all(by.tagName('li'));
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
        expect(errorLis.count()).toEqual(2);
      });

      it('should show error messages next to invalid field', function () {
        var item = element(by.id('input0-error-message'));
        expect(item.isPresent()).toBeTruthy();
      });

      it('should not show error against valid field', function () {
        var error = element(by.id('surname-error-message'));
        expect(error.isPresent()).toBeFalsy();
      });

      it('should not show an error when a blank field has required="false"', function () {
        expect(element(by.id('forename-error-message')).isPresent()).toBeFalsy();
      });

      it('should not remove the error message when the field changes', function () {
        var el = element(by.id('input0'));
        var inp = el.element(by.tagName('input'));
        inp.sendKeys('Something');
        expect(element(by.id('input0-error-message')).isPresent()).toBeTruthy();
      });

      it('should remove the error message when the invalid field has been corrected and submit is pressed', function () {
        submit.click();
        expect(element(by.id('input0-error-message')).isPresent()).toBeFalsy();
      });

      it('should remove all errors when all fields are valid', function () {
        // update the remaining fields to make them valid
        element(by.id('thisismyfirsttest1-input')).sendKeys('Testing, testing 123');
        element(by.id('forename_id-input')).sendKeys('Stuart');

        // check that errors are still being displayed
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy();

        submit.click();

        // check that now that the form has been revalidated that no errors are showing
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
      });
    });
  });

  describe('Number input', function () {
    // by this time the form has been submitted several times
    it('should not show an error when the content is numeric', function () {
      expect(element(by.id('numTest-error-message')).isPresent()).toBeFalsy();
    });

    it('should error when the content is non numeric', function () {
      element(by.id('numTest-input')).sendKeys('a');

      submit.click();

      expect(element(by.id('numTest-error-message')).isPresent()).toBeTruthy();
      expect(element(by.id('numTest-error-message')).getText()).toEqual('Not numeric');
    });

    it('should error when the number input exceeds the max limit', function () {
      element(by.id('maxTest-input')).clear().sendKeys('124');
      submit.click();
      expect(element(by.id('maxTest-error-message')).getText()).toEqual('Exceeds the maximum');
      expect(element(by.id('maxTest-error-message')).isPresent()).toBeTruthy();
    });

    it('should not allow more characters than the string length of the max value', function () {
      var max = element(by.id('maxTest-input'));
      max.clear();
      max.sendKeys('111234abc');
      expect(max.getAttribute('value')).toEqual('111');
    });
  });

  describe('Radio items', function () {
    var studentType;
    var options;
    describe('Student type example with 4 options', function () {
      it('should have a forms test page just for radio input', function () {
        browser.get('http://127.0.0.1:3000/#/forms-test/radio');
        expect(element.all(by.tagName('h1')).first().getText()).toEqual('radio');
      });

      it('should have a radio instance: student-type', function () {
        studentType = element(by.id('student-type'));
        expect(studentType.isPresent()).toBeTruthy();
      });

      it('should have 4 options', function () {
        options = studentType.all(by.tagName('input'));
        expect(options.count()).toEqual(4);
      });

      it('should not show any item as being selected', function () {
        expect(studentType.element(by.css(':checked')).isPresent()).toBeFalsy();
      });

      it('should not display any errors messages before the form is submitted', function () {
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
      });

      it('should display an error message after the form is submitted', function () {
        submit.click();
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy();
      });

      it('should no longer show any errors when a radio item is clicked and the form resubmitted', function () {
        options.get(2).click();
        submit.click();
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
      });

      it('should show that the selected item has a value of "pgdd"', function () {
        var pgdd = studentType.element(by.css(':checked'));
        expect(pgdd.isPresent()).toBeTruthy();
        expect(pgdd.getAttribute('value')).toEqual('pgdd');
      });
    });
  });

  describe('Date', function () {
    describe('Dates', function () {
      it('should have a forms test page just for date tests', function () {
        browser.get('http://127.0.0.1:3000/#/forms-test/date');
        expect(element.all(by.tagName('h1')).first().getText()).toEqual('date');
      });

      it('should not display any errors messages before the form is submitted', function () {
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
      });

      it('should display an error message after the form is submitted', function () {
        submit.click();
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy();
      });

      it('should be reporting that the start date is required', function () {
        expect(element(by.id('error-summary-list')).all(by.tagName('li')).first().getText()).toEqual('The start date is invalid');
        expect(element(by.id('startdate0-error-message')).getText()).toEqual('Enter a valid start date');
      });

      it('should report that dates are invalid', function () {
        // make the start date invalid rather than blank
        element(by.id('startdate0Day')).sendKeys('13');

        // blank the year on the end date
        element(by.id('enddate1Year')).sendKeys(protractor.Key.BACK_SPACE);

        submit.click();

        expect(element(by.id('error-summary-list')).all(by.tagName('li')).get(0).getText()).toEqual('The start date is invalid');
        expect(element(by.id('startdate0-error-message')).getText()).toEqual('Enter a valid start date');
      });

      it('should display custom error messages', function () {
        expect(element(by.id('error-summary-list')).all(by.tagName('li')).get(1).getText()).toEqual('The end date is unacceptable');
        expect(element(by.id('enddate1-error-message')).getText()).toEqual('No good');
      });

      it('should remove all errors when dates are once again correct', function () {
        element(by.id('startdate0Day')).sendKeys('13');
        element(by.id('startdate0Month')).sendKeys('5');
        element(by.id('startdate0Year')).sendKeys('1974');
        element(by.id('enddate1Year')).sendKeys('4');

        submit.click();
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
      });

      it('should be showing feedback dates of 1974-05-13', function () {
        // ensure that the correct model value is being updated
        expect(element(by.id('startFeedback')).getText()).toEqual('1974-05-13');
        expect(element(by.id('endFeedback')).getText()).toEqual('1974-05-13');
      });

    });

    describe('Max date', function () {

      var dobElement = element(by.id('dob'));
      var dobDay = element(by.id('dobDay'));
      var dobMonth = element(by.id('dobMonth'));
      var dobYear = element(by.id('dobYear'));

      describe('Date entered is after (greater than) the maximum date', function () {
        it('should fail if Date 1 day greater', function () {
          dobDay.sendKeys('14');
          dobMonth.sendKeys('5');
          dobYear.sendKeys('1974');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeTruthy();
          expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
          expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy();
        });

        it('should fail if Date 1 month greater', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('6');
          dobYear.clear().sendKeys('1974');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeTruthy();
        });

        it('should fail if Date 1 year greater', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1975');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeTruthy();
        });

      });

      describe('Date entered is before (less than) the maximum date', function () {
        it('should pass if Date 1 day less than', function () {
          dobDay.clear().sendKeys('12');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1974');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
        });

        it('should pass if Date 1 month less than', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('4');
          dobYear.clear().sendKeys('1974');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
        });

        it('should pass if Date 1 year less than', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1973');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
        });
      });

      describe('Date entered is equal to the maximum date', function () {
        it('should pass if Date is equal to max date', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1974');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
        });
      });
    });

    describe('Min date', function () {

      var dobElement = element(by.id('dob'));
      var dobDay = element(by.id('dobDay'));
      var dobMonth = element(by.id('dobMonth'));
      var dobYear = element(by.id('dobYear'));

      describe('Date entered is before (less than) the minimum date', function () {
        it('should fail if Date 1 day before', function () {
          dobDay.clear().sendKeys('12');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1950');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeTruthy();
          expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
          expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy();
        });

        it('should fail if Date 1 month before', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('4');
          dobYear.clear().sendKeys('1950');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeTruthy();
        });

        it('should fail if Date 1 year before', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1949');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeTruthy();
        });

      });

      describe('Date entered is before (greater than) the minimum date', function () {
        it('should pass if Date 1 day greater than', function () {
          dobDay.clear().sendKeys('14');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1950');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
        });

        it('should pass if Date 1 month greater than', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('6');
          dobYear.clear().sendKeys('1950');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
        });

        it('should pass if Date 1 year greater than', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1951');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
        });
      });

      describe('Date entered is equal to the minimum date', function () {
        it('should pass if Date is equal to min date', function () {
          dobDay.clear().sendKeys('13');
          dobMonth.clear().sendKeys('5');
          dobYear.clear().sendKeys('1950');

          submit.click();
          expect(element(by.id('dob-error-message')).isPresent()).toBeFalsy();
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy();
        });
      });
    });

  });

  describe('Sortcode', function () {
    var sortcodeElement = element(by.id('sortcode0'));
    var sortcodePt1 = element(by.id('sortcode0-part1'));
    var sortcodePt2 = element(by.id('sortcode0-part2'));
    var sortcodePt3 = element(by.id('sortcode0-part3'));

    it('should have a forms test page just for sortcode tests', function () {
      browser.get('http://127.0.0.1:3000/#/forms-test/sortcode');
      expect(element.all(by.tagName('h1')).first().getText()).toEqual('sortcode');
    });

    it('should have the start values defined by the field object', function () {
      expect(sortcodePt1.getAttribute('value')).toEqual('12');
      expect(sortcodePt2.getAttribute('value')).toEqual('34');
      expect(sortcodePt3.getAttribute('value')).toEqual('56');
      expect(element(by.id('sortcodeFeedback')).getText()).toEqual('123456');
    });

    it ('should respect the required attribute', function () {
      // no errors should be present at this point
      submit.click();
      expect(element(by.id('sortcode0-error-message')).isPresent()).toBeFalsy();
      expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();

      // blank sortcode1 which is required sortcode2 is not
      sortcodePt1.clear();
      sortcodePt2.clear();
      sortcodePt3.clear();

      submit.click();
      expect(element(by.id('sortcode0-error-message')).isPresent()).toBeTruthy();
      expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
      expect(element(by.id('sortcodeFeedback')).getText()).toEqual('');
    });

    it('should accept numeric characters', function () {
      // fill the first sort code correctly again
      sortcodePt1.clear().sendKeys('11');
      sortcodePt2.clear().sendKeys('22');
      sortcodePt3.clear().sendKeys('33');

      submit.click();
      expect(element(by.id('sortcode0-error-message')).isPresent()).toBeFalsy();
      expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
      expect(element(by.id('sortcodeFeedback')).getText()).toEqual('112233');
    });

    it('should reject non numeric characters', function () {
      // wrong
      sortcodePt1.clear().sendKeys('a1');
      sortcodePt2.clear().sendKeys('b2');
      sortcodePt3.clear().sendKeys('88');

      submit.click();
      expect(element(by.id('sortcode0-error-message')).isPresent()).toBeTruthy();
      expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
      expect(element(by.id('sortcodeFeedback')).getText()).toEqual('a1b288');
    });

    it('should reject values of single digit', function () {
      // wrong
      sortcodePt1.clear().sendKeys('1');
      sortcodePt2.clear().sendKeys('1');
      sortcodePt3.clear().sendKeys('1');

      submit.click();
      expect(element(by.id('sortcode0-error-message')).isPresent()).toBeTruthy();
      expect(element(by.css('.error-summary')).isPresent()).toBeTruthy();
      expect(element(by.id('sortcodeFeedback')).getText()).toEqual('111');
    });

    it('should accept values less than 10 if preceeded by zero', function () {
      // wrong
      sortcodePt1.clear().sendKeys('01');
      sortcodePt2.clear().sendKeys('01');
      sortcodePt3.clear().sendKeys('01');

      submit.click();
      expect(element(by.id('sortcode0-error-message')).isPresent()).toBeFalsy();
      expect(element(by.css('.error-summary')).isPresent()).toBeFalsy();
      expect(element(by.id('sortcodeFeedback')).getText()).toEqual('010101');
    });
  });
});


