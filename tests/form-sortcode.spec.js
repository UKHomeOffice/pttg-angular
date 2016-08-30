describe('Sortcode', function () {
  var submit;
  var sortcodeElement = element(by.id('sortcode0'));
  var sortcodePt1 = element(by.id('sortcode0Part1'));
  var sortcodePt2 = element(by.id('sortcode0Part2'));
  var sortcodePt3 = element(by.id('sortcode0Part3'));

  it('should have a forms test page just for sortcode tests', function () {
    browser.get('http://127.0.0.1:3000/#/forms-test/sortcode');
    submit = element(by.tagName('hod-submit')).element(by.tagName('input'));
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