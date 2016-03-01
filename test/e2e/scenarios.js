'use strict';

describe('Scheduler App', function() {

  it('should redirect index.html to index.html#/scheduler', function() {
    browser.get('app/index.html');
    browser.getLocationAbsUrl().then(function(url) {
        expect(url).toEqual('/scheduler');
      });
  });


  describe('Scheduler view', function() {

    beforeEach(function() {
      browser.get('app/index.html#/scheduler');
    });

    describe('Shedule items list', function() {
      it('should list all scheduled items', function () {
        var sheduleElems = element.all(by.repeater('item in schedule'));
        expect(sheduleElems.count()).toBe(2);
      });

      it('put an edit button in each item', function () {
        var editButtons = element.all(by.css('.edit'));
        expect(editButtons.count()).toBe(2);
      });

      it('put a remove button ineach item', function () {
        var removeButtons = element.all(by.css('.remove'));
        expect(removeButtons.count()).toBe(2);
      });

      it('should show the command to be run for each item', function () {
        var commands = element.all(by.binding('item.command'));
        expect(commands.count()).toBe(2);
      });

      it('should show job run information for each item', function () {
        var runSpecs = element.all(by.css('.run-specs'));
        expect(runSpecs.count()).toBe(2);
      });
    });


    describe('Shedule item display', function() {
      it('should have the edit button become the save button when clicked', function () {
        var buttons = element.all(by.css('.edit-button-container')).first();
        var editButton = buttons.element(by.css('.edit'));
        var saveButton = buttons.element(by.css('.save'));
        expect(saveButton.isPresent()).toBe(false);
        expect(editButton.isPresent()).toBe(true);
        editButton.click();
        expect(saveButton.isPresent()).toBe(true);
        expect(editButton.isPresent()).toBe(false);
      });

      it('should have the remove button become the cancel button when edit button is clicked', function () {
        var editButtons = element.all(by.css('.edit-button-container')).get(0);
        var removeButtons = element.all(by.css('.edit-button-container')).get(1);
        var editButton = editButtons.element(by.css('.edit'));
        var removeButton = removeButtons.element(by.css('.remove'));
        var cancelButton = removeButtons.element(by.css('.cancel'));
        expect(cancelButton.isPresent()).toBe(false);
        expect(removeButton.isPresent()).toBe(true);
        editButton.click();
        expect(cancelButton.isPresent()).toBe(true);
        expect(removeButton.isPresent()).toBe(false);
      });

      describe('Shedule item update form', function() {
        var editButton;
        var sheduleElem;
        beforeEach(function() {
          var editButtons = element.all(by.css('.edit-button-container')).get(0);
          editButton = editButtons.element(by.css('.edit'));
          sheduleElem = element.all(by.repeater('item in schedule').row(0)).get(0);
        });

        it('should allow the user to edit the command', function () {
          var command = element.all(by.binding('item.command')).get(0);
          var removeButtons = element.all(by.css('.edit-button-container')).get(1);
          var cancelButton = removeButtons.element(by.css('.cancel'));

          expect(command.getAttribute('contentEditable')).toBe('inherit');
          editButton.click();
          expect(command.getAttribute('contentEditable')).toBe('true');
          cancelButton.click();
          expect(command.getAttribute('contentEditable')).toBe('false');
        });

        it('should allow the user to edit the "dyno size"', function () {
          var dynoSize = sheduleElem.element(by.model('item.dynoSize'));
          expect(dynoSize.isPresent()).toBe(false);
          editButton.click();
          expect(dynoSize.isPresent()).toBe(true);
        });
        
        describe('Frequency is Daily', function() {
          it('should allow the user to edit the hour for Next Due', function () {
            editButton.click();
            expect(typeof hourOptions).toBe("undefined");
            var freqSelect = element.all(by.name('frequencySelect')).get(0);
            var dailyOption = freqSelect.element(by.cssContainingText('option', 'Daily'));
            dailyOption.click();
            var hourOptions = element.all(by.options('time as time for time in timeArray'));
            expect(hourOptions.first().isDisplayed()).toBe(true);
            expect(hourOptions.count()).toEqual(49);
          });
        });

        describe('Frequency is Hourly', function() {
          it('should allow the user to edit the 10 minute fraction of an hour for Next Due', function () {
            editButton.click();
            expect(typeof offHourOptions).toBe("undefined");
            var freqSelect = element.all(by.name('frequencySelect')).get(0);
            var dailyOption = freqSelect.element(by.cssContainingText('option', 'Hourly'));
            dailyOption.click();
            var offHourOptions = element.all(by.options('offHour as offHour for offHour in offHoursArray'));
            expect(offHourOptions.first().isDisplayed()).toBe(true);
            expect(offHourOptions.count()).toEqual(8);
          });
        });

        it('should save the updates when the save button is clicked', function () {
          var buttons = element.all(by.css('.edit-button-container')).first();
          var editButton = buttons.element(by.css('.edit'));
          var saveButton = buttons.element(by.css('.save'));
          var command = element.all(by.binding('item.command')).get(0);
          editButton.click();
          command.clear().then(function() {
            command.sendKeys("A new command");
          });
          saveButton.click();
          expect(command.getText()).toBe("A new command");
        });
      });

    });

    it('should present a button to add new shedule items', function () {
      var button = element.all(by.css('.add-button'));
      expect(button.count()).toBe(1);
    });

  });

});
