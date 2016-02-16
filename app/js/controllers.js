'use strict';

/* Controllers */

var schedulerControllers = angular.module('schedulerControllers', []);

schedulerControllers.controller('SchedulerCtrl', ['$scope', '$http', '$timeout',
  function ($scope, $http, $timeout) {
    $http.get('schedule/schedule.json').then(function(data) {
console.log("data: "+angular.toJson(data));
      $scope.schedule = data.data;
      $.each($scope.schedule,function(index,value){
console.log("value.nextDue: "+value.nextDue);
        $scope.schedule[index].edit = false;
        if(value.frequency == "Daily") {
           var dateArr = value.nextDue.split(" ");
           $scope.schedule[index].time=dateArr[2];
        }
        else if(value.frequency == "Hourly") {
           var dateArr = value.nextDue.split(" ");
           $scope.schedule[index].offHour=":"+dateArr[2].split(":")[1];
        }
        else if(value.frequency == "Every10") {
          $scope.schedule[index].next10Time = value.nextDue;
        }
console.log("$scope.schedule: "+angular.toJson($scope.schedule));
      });
     });
    $scope.getEdit = function(item) { 
      return item.edit;
    };
    $scope.toggleEdit = function(item) { 
      if(item.edit) {
        document.getElementById("item-command-"+item.id).contentEditable = "false";
        item.edit=false;
      }
      else {
        document.getElementById("item-command-"+item.id).contentEditable = "true";
        item.edit=true;
      }
    };
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var addItem = false;
    $scope.getAddItem = function() { 
      return addItem;
    };
    $scope.setNewItemCommandEdit = function() { 
      document.getElementById("new-item-command").contentEditable = "true";
      return true;
    };
    $scope.toggleAddItem = function() { 
      if(addItem) {
        addItem=false;
        $scope.newItem=null;
        document.getElementById("new-item-command").contentEditable = "false";
      }
      else {
        var newNextDue = new Date();
        newNextDue.setDate(newNextDue.getDate() + 1);
        var nextDue = getDateString(getUTCDate(newNextDue));
        $scope.newItem={"command":" ","dynoSize":"Free","frequency":"Daily","lastRun":"","nextDue":nextDue,"edit":false};
        addItem=true;
      }
    };
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var add = false;
    $scope.saveItem = function(item) {
console.log("in saveItem, item: "+angular.toJson(item));
      if(item.frequency == "Daily") {
        //Use item.time to adjust item.nextDue
        if(!item.nextDue) {
          //if item.nextDue not set, set it to now + 1d
          var newNextDue = new Date();
          newNextDue.setDate(newNextDue.getDate() + 1);
          item.nextDue = getDateString(getUTCDate(newNextDue));
        }
        var nextDueArr = item.nextDue.split(" ");
        var newNextDue = nextDueArr[0]+" "+nextDueArr[1]+" "+item.time+" "+nextDueArr[3];
        item.nextDue = newNextDue;
      }   
      else if(item.frequency == "Hourly") {
        //Use item.offHour to adjust item.nextDue
        var interval=parseInt(item.offHour.slice(1))*60*1000;
        var newNextDueDate = getLatestUTCDatePlusInterval(new Date(),new Date(item.nextDue),interval);
        item.nextDue = months[newNextDueDate.getMonth()]+" "+newNextDueDate.getDate()+" "+newNextDueDate.getHours()+":"+newNextDueDate.getMinutes()+" UTC";
      }
      else if(item.frequency == "Every10") {
        //Use item.next10Time to adjust item.nextDue
        item.nextDue = item.next10Time;
      }
      //Save with post
console.log("Leaving saveItem, item: "+angular.toJson(item));
      $http.post('schedule/schedule.json',item)
      .then(function(data) {
        console.log("POST suceeded: "+angular.toJson(data));
      },
      function(data) {
        console.log("POST failed: "+angular.toJson(data));
      });
    };
    $scope.getDate = function(date){
      var localDate = new Date(date);
      var dateOut = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(),  localDate.getUTCHours(), localDate.getUTCMinutes(), localDate.getUTCSeconds());
      return dateOut;
    };
    function getUTCDate(date){
      var utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
      return utcDate;
    }
    function getLatestUTCDatePlusInterval(date1,date2,interval){
      var utcDate1 = getUTCDate(date1);
      var utcDate2 = getUTCDate(date2);
      var intervalDate = utcDate1.getTime()>utcDate2.getTime()+interval?utcDate1.getTime()+interval:utcDate2.getTime()+interval;
       return new Date(intervalDate);
    };
    function getDateString(date) {
      var dateString=months[date.getMonth()]+" "+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+" UTC";
      return dateString;
    };
    $scope.getNext10Date = function(item){
      var next10Date=getLatestUTCDatePlusInterval(new Date(),new Date(item.nextDue),10*60*1000);
      item.next10Time=getDateString(next10Date);
      return next10Date;
    };
    $scope.timeArray = ["23:30", "-----", "0:00", "0:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"];
    $scope.offHoursArray = [":20",":30",":40",":50","-----",":00",":10"];
  }]);
