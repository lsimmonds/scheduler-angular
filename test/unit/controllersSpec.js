'use strict';

/* jasmine specs for controllers go here */
describe('Scheduler Controllers', function() {

  console.log('jasmine-version:' + jasmine.version);
  describe('SchedulerCtrl', function(){
    var scope, ctrl, $httpBackend;

    beforeEach(module('schedulerApp'));
    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      $httpBackend.expectGET('schedule/schedule.json').
          respond([{"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Daily","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 2 2:00 UTC"},{"id":"2","command":"ls -ltr","dynoSize":"Free","frequency":"Hourly","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 1 3:00 UTC"}]);
      scope = $rootScope.$new();
      ctrl = $controller('SchedulerCtrl', {$scope: scope});
    }));

    beforeEach(function() {
      jasmine.clock().install();
    });

    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('should create "schedule" model with 2 scheduled items fetched from xhr', function() {
      expect(scope.schedule).toBeUndefined();
      $httpBackend.flush();
      expect(scope.schedule.length).toEqual(2);
    });

    it('should enhance "schedule" model with data needed for processing', function() {
      expect(scope.schedule).toBeUndefined();
      $httpBackend.flush();
      expect(scope.schedule).toEqual([ { id : '1', command : 'ls -ltr', dynoSize : 'Free', frequency : 'Daily', lastRun : 'Feb 1 2:00 UTC', nextDue : 'Feb 2 2:00 UTC', edit : false, remove: false, time : '2:00' }, { id : '2', command : 'ls -ltr', dynoSize : 'Free', frequency : 'Hourly', lastRun : 'Feb 1 2:00 UTC', nextDue : 'Feb 1 3:00 UTC', edit : false, remove: false, offHour : ':00' } ]);
    });

    describe('getEdit', function(){
      it('should fetch value of "edit" boolean for a given schedule item', function() {
        $httpBackend.flush();
        expect(scope.getEdit(scope.schedule[0])).toBe(false);
      });
    });

    describe('toggleEdit', function(){
      it('should toggle value of "edit" boolean for a given schedule item', function() {
        $httpBackend.flush();
        expect(scope.getEdit(scope.schedule[0])).toBe(false);
        scope.toggleEdit(scope.schedule[0]);
        expect(scope.getEdit(scope.schedule[0])).toBe(true);
      });
    });

    describe('getAddItem', function(){
      it('should fetch value of "addItem" boolean', function() {
        $httpBackend.flush();
        expect(scope.getAddItem()).toBe(false);
      });
    });

    describe('toggleAddItem', function(){
      it('should toggle value of "addItem" boolean', function() {
        $httpBackend.flush();
        expect(scope.getAddItem()).toBe(false);
        scope.toggleAddItem();
        expect(scope.getAddItem()).toBe(true);
        scope.toggleAddItem();
        expect(scope.getAddItem()).toBe(false);
      });

      it('should create a new item for "addItem" function', function() {
        $httpBackend.flush();
        expect(typeof scope.newItem).toBe("undefined");
        scope.toggleAddItem();
        var baseTime = new Date();
        jasmine.clock().mockDate(baseTime);
        jasmine.clock().tick(1000*60*60*24);
        var useTime = scope.getDateString(scope.getUTCDateFromDate(new Date()));
        expect(scope.newItem).toEqual({"command":" ","dynoSize":"Free","frequency":"Daily","lastRun":"","nextDue":useTime,"edit":false});
      });
    });

    describe('getUTCDateFromDate', function(){
      it('should create a UTC date from a local date', function() {
        $httpBackend.flush();
        var baseTime = new Date();
        jasmine.clock().mockDate(baseTime);
        var newDate = new Date();
        expect(scope.getUTCDateFromDate(newDate)).toEqual(new Date(baseTime.getUTCFullYear(), baseTime.getUTCMonth(), baseTime.getUTCDate(),  baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds()));
      });
    });

    describe('getLatestUTCDatePlusInterval', function(){
      it('returns the latter of 2 dates and adds an interval', function() {
        var baseTime = new Date();
        jasmine.clock().mockDate(baseTime);
        var firstDate = new Date();
        jasmine.clock().tick(1000*60*60*24);
        var secondDate = new Date();
        expect(scope.getLatestUTCDatePlusInterval(firstDate,secondDate,2000).getTime()).toEqual(scope.getUTCDateFromDate(secondDate).getTime() + 2000);
      });
    });

    describe('saveItem', function() {
      describe('if frequency is "Daily"', function(){
        describe('if nextDue is not set', function(){
          var newItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Daily","lastRun":"Feb 1 2:00 UTC","time": "12:34"};
          it('Sets nextDue to now + 1 day', function() {
            expect(newItem.nextDue).toBe(undefined);
            var baseTime = new Date();
            jasmine.clock().mockDate(baseTime);
            scope.saveItem(newItem);
            jasmine.clock().tick(1000*60*60*24);
            var datePlusOne = scope.getDateString(scope.getUTCDateFromDate(new Date()));
            var nextDueArr = datePlusOne.split(" ");
            var newDatePlusOne = nextDueArr[0]+" "+nextDueArr[1]+" "+newItem.time+" "+nextDueArr[3];
            expect(newItem.nextDue).toEqual(newDatePlusOne);
          });
        });
        it('Sets hours on nextDue', function() {
          var newItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Daily","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 2 2:00 UTC"};
          var nextDueArr = newItem.nextDue.split(" ");
          var newDatePlusOne = nextDueArr[0]+" "+nextDueArr[1]+" "+newItem.time+" "+nextDueArr[3];
          scope.saveItem(newItem);
          expect(newItem.nextDue).toEqual(newDatePlusOne);
        });
      });
      describe('if frequency is "Hourly"', function(){
        it('gets an interval from offHour and adds offHour to the latest of nextDue or now', function() {
          var newItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Hourly","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 2 2:00 UTC","offHour": ":50"};
          var nextDueTimeArr = newItem.nextDue.split(" ");
          var nextDueTimeStr = nextDueTimeArr[0]+" "+nextDueTimeArr[1]+" "+new Date().getUTCFullYear()+" "+nextDueTimeArr[2]+" "+nextDueTimeArr[3];
          var itemDueTime = new Date(nextDueTimeStr);
          var baseTime = new Date("feb 16 2016 00:00 UTC");
          jasmine.clock().mockDate(baseTime);
          spyOn(scope, 'getLatestUTCDatePlusInterval').and.callThrough();
          scope.saveItem(newItem);
          expect(scope.getLatestUTCDatePlusInterval).toHaveBeenCalledWith(baseTime,itemDueTime,parseInt(newItem.offHour.slice(1))*60*1000);
          expect(newItem.nextDue).toEqual("Feb 16 0:50 UTC");
        });
      });
      describe('if frequency is "Every 10 minutes"', function(){
        it('sets nextDue to next10Time', function() {
          var newItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Every10","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 2 2:00 UTC","next10Time":"Feb 17 4:20 UTC"};
          expect(newItem.nextDue).not.toEqual("Feb 17 4:20 UTC");
          scope.saveItem(newItem);
          expect(newItem.nextDue).toEqual("Feb 17 4:20 UTC");
        });
      });
      it('posts the item', function() {
        $httpBackend.flush();
        var newItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Every10","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 2 2:00 UTC","next10Time":"Feb 17 4:20 UTC"};
        var transformedItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Every10","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 17 4:20 UTC","next10Time":"Feb 17 4:20 UTC"};
        $httpBackend.expectPOST('schedule/schedule.json', transformedItem).respond(201, '');
        scope.saveItem(newItem);
        expect(scope.sendMessage).toBe('');
        $httpBackend.flush();
        expect(scope.sendMessage).toBe('POST suceeded: {"data":"","status":201,"config":{"method":"POST","transformRequest":[null],"transformResponse":[null],"url":"schedule/schedule.json","data":'+angular.toJson(transformedItem)+',"headers":{"Accept":"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8"}},"statusText":""}');
      });
    });
    describe('getDate', function() {
      it('returns an ISO date for now', function () {
          var baseTime = new Date("feb 16 2016 00:00 UTC");
          jasmine.clock().mockDate(baseTime);
          expect(scope.getDate("feb 16 00:00 UTC")).toEqual(new Date(baseTime.getUTCFullYear(), baseTime.getUTCMonth(), baseTime.getUTCDate(),  baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds()));
      });
    });
    describe('getDateString', function() {
      it('returns a properly formatted date string from date object', function () {
        var baseTime = new Date("feb 16 2016 00:00 UTC");
        var newDate = new Date(baseTime.getUTCFullYear(), baseTime.getUTCMonth(), baseTime.getUTCDate(),  baseTime.getUTCHours(), baseTime.getUTCMinutes(), baseTime.getUTCSeconds());
        expect(scope.getDateString(newDate)).toEqual("Feb 16 0:0 UTC");
      });
    });
    describe('getNext10Date', function() {
      it('sets next10Time to nextDue plus 10 minutes', function () {
        var newItem = {"id":"1","command":"ls -ltr","dynoSize":"Free","frequency":"Every10","lastRun":"Feb 1 2:00 UTC","nextDue":"Feb 2 2:00 UTC"};
        var baseTime = new Date("feb 16 2016 00:00 UTC");
        jasmine.clock().mockDate(baseTime);
        spyOn(scope, 'getLatestUTCDatePlusInterval').and.callThrough();
        var nextDueTimeArr = newItem.nextDue.split(" ");
        var nextDueTimeStr = nextDueTimeArr[0]+" "+nextDueTimeArr[1]+" "+new Date().getUTCFullYear()+" "+nextDueTimeArr[2]+" "+nextDueTimeArr[3];
        var itemDueTime = new Date(nextDueTimeStr);
        scope.getNext10Date(newItem);
        expect(scope.getLatestUTCDatePlusInterval).toHaveBeenCalledWith(baseTime,itemDueTime,10*60*1000);
        expect(newItem.next10Time).toEqual("Feb 16 0:10 UTC");
      });
    });
    it('sets timeArray', function () {
      expect(scope.timeArray).toEqual(["23:30", "-----", "0:00", "0:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"]);
    });
    it('sets offHoursArray', function () {
      expect(scope.offHoursArray).toEqual([":20",":30",":40",":50","-----",":00",":10"]);
    });
  });
});
