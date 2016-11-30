/* global describe by it browser expect element */

describe('HOD Forms:', function () {
  var submit
  var hodTextInstances
  describe('Text input:', function () {
    it('should have a forms test page just for text input', function () {
      browser.get('http://127.0.0.1:3000/#/forms-test/text')
      expect(element.all(by.tagName('h1')).first().getText()).toEqual('text')
      hodTextInstances = element.all(by.tagName('hod-text'))
      submit = element(by.tagName('hod-submit')).element(by.tagName('input'))
    })

    it('should automatically assign name values if not given as attributes', function () {
      expect(hodTextInstances.get(0).getAttribute('name')).toEqual('input0')
    })

    it('should automatically assign id values if not given as attributes', function () {
      expect(hodTextInstances.get(0).element(by.tagName('input')).getAttribute('id')).toEqual('input0')
    })

    it('should automatically assign id value if label is given', function () {
      expect(hodTextInstances.get(1).element(by.tagName('input')).getAttribute('id')).toEqual('thisismyfirsttest1')
    })

    it('should apply id, name and hint text', function () {
      var el = hodTextInstances.get(2)
      var inp = el.element(by.tagName('input'))
      var hint = el.element(by.css('.form-hint'))
      expect(el.getAttribute('name')).toEqual('forename')
      expect(inp.getAttribute('id')).toEqual('specficIDcanBeGiven')
      expect(hint.getText()).toEqual('Let me give you a clue')
    })

    describe('Object property binding via the field attribute', function () {
      var el = element(by.id('surnameTest'))
      var inp = element(by.id('surname'))
      var feedback = element(by.id('surnameFeedback')).element(by.tagName('span'))

      it('should be able to bind to an object property passed to it', function () {
        expect(el.getAttribute('field')).toEqual('values.surname')
        expect(inp.getAttribute('value')).toEqual('Stuart')
      })

      it('should alter the bound object property value when input text changes', function () {
        inp.sendKeys(' Craigen')
        expect(inp.getAttribute('value')).toEqual('Stuart Craigen')
        expect(feedback.getText()).toEqual('Stuart Craigen')
      })
    })

    describe('Validation:', function () {
      it('should not show any errors before the form is submitted', function () {
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
      })

      it('should submit the form', function () {
        submit.click()
      })

      it('should show error summary at top of page', function () {
        var errors = element(by.css('.error-summary'))
        var errorLis = errors.all(by.tagName('li'))
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy()
        expect(errorLis.count()).toEqual(2)
      })

      it('should show error messages next to invalid field', function () {
        var item = element(by.id('input0-error'))
        expect(item.isPresent()).toBeTruthy()
      })

      it('should not show error against valid field', function () {
        var error = element(by.id('surname-error'))
        expect(error.isPresent()).toBeFalsy()
      })

      it('should not show an error when a blank field has required="false"', function () {
        expect(element(by.id('forename-error')).isPresent()).toBeFalsy()
      })

      it('should not remove the error message when the field changes', function () {
        var el = element(by.id('input0-wrapper'))
        var inp = el.element(by.tagName('input'))
        inp.sendKeys('Something')
        expect(element(by.id('input0-error')).isPresent()).toBeTruthy()
      })

      it('should remove the error message when the invalid field has been corrected and submit is pressed', function () {
        submit.click()
        expect(element(by.id('input0-error')).isPresent()).toBeFalsy()
      })

      it('should remove all errors when all fields are valid', function () {
        // update the remaining fields to make them valid
        element(by.id('thisismyfirsttest1')).sendKeys('Testing, testing 123')
        element(by.id('specficIDcanBeGiven')).sendKeys('Stuart')

        // check that errors are still being displayed
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy()
        expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy()

        submit.click()

        // check that now that the form has been revalidated that no errors are showing
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
      })
    })
  })

  describe('Custom validator:', function () {
    describe('Value should begin with "a" or "A"', function () {
      it('should fail if blank', function () {
        var fn = element(by.id('specficIDcanBeGiven'))
        fn.clear()
        submit.click()
        expect(element(by.id('specficIDcanBeGiven-error')).isPresent()).toBeTruthy()
      })

      it('should pass if "a"', function () {
        var fn = element(by.id('specficIDcanBeGiven'))
        fn.clear().sendKeys('a')
        submit.click()
        expect(element(by.id('specficIDcanBeGiven-error')).isPresent()).toBeFalsy()
      })

      it('should fail if "za"', function () {
        var fn = element(by.id('specficIDcanBeGiven'))
        fn.clear().sendKeys('za')
        submit.click()
        expect(element(by.id('specficIDcanBeGiven-error')).isPresent()).toBeTruthy()
      })

      it('should pass if "A"', function () {
        var fn = element(by.id('specficIDcanBeGiven'))
        fn.clear().sendKeys('Adam')
        submit.click()
        expect(element(by.id('specficIDcanBeGiven-error')).isPresent()).toBeFalsy()
      })
    })
  })

  describe('Number input', function () {
    // by this time the form has been submitted several times
    it('should not show an error when the content is numeric', function () {
      expect(element(by.id('numTest-error')).isPresent()).toBeFalsy()
    })

    it('should error when the content is non numeric', function () {
      element(by.id('numTest')).sendKeys('a')

      submit.click()

      expect(element(by.id('numTest-error')).isPresent()).toBeTruthy()
      expect(element(by.id('numTest-error')).getText()).toEqual('Not numeric')
    })

    it('should error when the number input exceeds the max limit', function () {
      element(by.id('maxTest')).clear().sendKeys('124')
      submit.click()
      expect(element(by.id('maxTest-error')).getText()).toEqual('Exceeds the maximum')
      expect(element(by.id('maxTest-error')).isPresent()).toBeTruthy()
    })

    it('should not allow more characters than the string length of the max value', function () {
      var max = element(by.id('maxTest'))
      max.clear()
      max.sendKeys('111234abc')
      expect(max.getAttribute('value')).toEqual('111')
    })
  })
})
