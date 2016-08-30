
describe('Radio items', function () {
  var studentType;
  var submit;
  var options;
  describe('Student type example with 4 options', function () {
    it('should have a forms test page just for radio input', function () {
      browser.get('http://127.0.0.1:3000/#/forms-test/radio');
      submit = element(by.tagName('hod-submit')).element(by.tagName('input'));
      expect(element.all(by.tagName('h1')).first().getText()).toEqual('radio');
    });

    it('should have a radio instance: student-type', function () {
      studentType = element(by.id('student-type-form-group'));
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