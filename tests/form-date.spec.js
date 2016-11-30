/* global describe by it browser expect element protractor */

describe('HOD Forms:', function () {
  var submit

  describe('Date', function () {
    describe('Dates', function () {
      it('should have a forms test page just for date tests', function () {
        browser.get('http://127.0.0.1:3000/#/forms-test/date')
        expect(element.all(by.tagName('h1')).first().getText()).toEqual('date')
        submit = element(by.tagName('hod-submit')).element(by.tagName('input'))
      })

      it('should not display any errors messages before the form is submitted', function () {
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
      })

      it('should display an error message after the form is submitted', function () {
        submit.click()
        expect(element(by.css('.error-summary')).isPresent()).toBeTruthy()
        expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy()
      })

      it('should be reporting that the start date is required', function () {
        expect(element(by.id('error-summary-list')).all(by.tagName('li')).first().getText()).toEqual('Cannot accept this value for start date')
        expect(element(by.id('startdate0-error')).getText()).toEqual('Enter a valid start date')
      })

      it('should report that dates are invalid', function () {
        // make the start date invalid rather than blank
        element(by.id('startdate0Day')).sendKeys('13')

        // blank the year on the end date
        element(by.id('enddate1Year')).sendKeys(protractor.Key.BACK_SPACE)

        submit.click()

        expect(element(by.id('error-summary-list')).all(by.tagName('li')).get(0).getText()).toEqual('The start date is invalid')
        expect(element(by.id('startdate0-error')).getText()).toEqual('Enter a valid start date')
      })

      it('should display custom error messages', function () {
        expect(element(by.id('error-summary-list')).all(by.tagName('li')).get(1).getText()).toEqual('The end date is unacceptable')
        expect(element(by.id('enddate1-error')).getText()).toEqual('No good')
      })

      it('should remove all errors when dates are once again correct', function () {
        element(by.id('startdate0Day')).sendKeys('13')
        element(by.id('startdate0Month')).sendKeys('5')
        element(by.id('startdate0Year')).sendKeys('1974')
        element(by.id('enddate1Year')).sendKeys('4')

        submit.click()
        expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
        expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
      })

      it('should be showing feedback dates of 1974-05-13', function () {
        // ensure that the correct model value is being updated
        expect(element(by.id('startFeedback')).getText()).toEqual('1974-05-13')
        expect(element(by.id('endFeedback')).getText()).toEqual('1974-05-13')
      })
    })
return
    describe('Max date', function () {
      var dobDay = element(by.id('dobDay'))
      var dobMonth = element(by.id('dobMonth'))
      var dobYear = element(by.id('dobYear'))

      describe('Date entered is after (greater than) the maximum date', function () {
        it('should fail if Date 1 day greater', function () {
          dobDay.sendKeys('14')
          dobMonth.sendKeys('5')
          dobYear.sendKeys('1974')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeTruthy()
          expect(element(by.css('.error-summary')).isPresent()).toBeTruthy()
          expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy()
        })

        it('should fail if Date 1 month greater', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('6')
          dobYear.clear().sendKeys('1974')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeTruthy()
        })

        it('should fail if Date 1 year greater', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1975')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeTruthy()
        })
      })

      describe('Date entered is before (less than) the maximum date', function () {
        it('should pass if Date 1 day less than', function () {
          dobDay.clear().sendKeys('12')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1974')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
        })

        it('should pass if Date 1 month less than', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('4')
          dobYear.clear().sendKeys('1974')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
        })

        it('should pass if Date 1 year less than', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1973')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
        })
      })

      describe('Date entered is equal to the maximum date', function () {
        it('should pass if Date is equal to max date', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1974')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
        })
      })
    })

    describe('Min date', function () {
      var dobDay = element(by.id('dobDay'))
      var dobMonth = element(by.id('dobMonth'))
      var dobYear = element(by.id('dobYear'))

      describe('Date entered is before (less than) the minimum date', function () {
        it('should fail if Date 1 day before', function () {
          dobDay.clear().sendKeys('12')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1950')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeTruthy()
          expect(element(by.css('.error-summary')).isPresent()).toBeTruthy()
          expect(element(by.css('.form-group.error')).isPresent()).toBeTruthy()
        })

        it('should fail if Date 1 month before', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('4')
          dobYear.clear().sendKeys('1950')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeTruthy()
        })

        it('should fail if Date 1 year before', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1949')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeTruthy()
        })
      })

      describe('Date entered is before (greater than) the minimum date', function () {
        it('should pass if Date 1 day greater than', function () {
          dobDay.clear().sendKeys('14')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1950')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
        })

        it('should pass if Date 1 month greater than', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('6')
          dobYear.clear().sendKeys('1950')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
        })

        it('should pass if Date 1 year greater than', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1951')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
        })
      })

      describe('Date entered is equal to the minimum date', function () {
        it('should pass if Date is equal to min date', function () {
          dobDay.clear().sendKeys('13')
          dobMonth.clear().sendKeys('5')
          dobYear.clear().sendKeys('1950')

          submit.click()
          expect(element(by.id('dob-error')).isPresent()).toBeFalsy()
          expect(element(by.css('.error-summary')).isPresent()).toBeFalsy()
          expect(element(by.css('.form-group.error')).isPresent()).toBeFalsy()
        })
      })
    })
  })
})
