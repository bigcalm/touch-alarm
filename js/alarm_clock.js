document.onselectstart = function() {return false;};
var $j = jQuery.noConflict();

var SECOND = 1000;
var MINUTE = SECOND * 60;
var HOUR = MINUTE * 60;
var DAY = HOUR * 24;

var alarmSound = '';;
var alarmTime = new Array();
var audioElement;
var currentlyPlayingSound = false;

var snoozeActive = false;
var snoozeLength = 10 * MINUTE;

var usePlayer = "html5"; // html5 or jwplayer

updateGlobalVarsFromCookies();

$j(document).ready(function()
{
  setTimeout("updateClock()", SECOND);
});

function updateClock()
{
  var now = new Date();
  
  var day = ((now.getDate() < 10) ? "0" : "") + now.getDate();
  var month = ((now.getMonth() < 10) ? "0" : "") + (now.getMonth() + 1);
  var year = 1900 + now.getYear();
    
  var displayDate = day + " / " + month + " / " + year;
  $j('#date').text(displayDate);

  var hour = ((now.getHours() < 10) ? "0" : "") + now.getHours();
  var minute = ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes();
  var second = ((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();
  
  var displayTime = hour + " : " + minute + " : " + second;
  $j('#time').text(displayTime);

  /* --- check alarm --- */
  if (alarmSound != "-1")
  {
    // normal alarm time
    if (alarmTime[0] == hour && alarmTime[1] == minute && 0 == second)
    {
      playAlarmSound('loop');
      openAlarmWrapper();
    }
    
    // snoozed alarm time
    if (snoozeActive && snoozeActive[0] == hour && snoozeActive[1] == minute && 0 == second)
    {
      playAlarmSound('loop');
      openAlarmWrapper();
    }
  }

  setTimeout("updateClock()", SECOND);
}

function alterField(elementId, direction, maxValue)
{
  var currentValue = $j('#' + elementId).val();
  if (currentValue.substring(0,1) == '0')
  {
    currentValue = currentValue.substring(1,2);
  }
  
  currentValue = Number(currentValue);
  
  var newValue = 0;
  if (direction == 'up')
  {
    newValue = currentValue + 1;
  }

  if (direction == 'down')
  {
    newValue = currentValue - 1;
  }
  
  if (newValue > maxValue)
  {
    newValue = 0;
  }
  if (newValue < 0)
  {
    newValue = maxValue;
  }
  
  if (newValue < 10)
  {
    newValue = '0' + newValue;
  }
  
  $j('#' + elementId).val(newValue);
}

function changeAlarmSound()
{
  var testAlarmSound = $j('#alarmSound').val();

  if (testAlarmSound != "-1")
  {
    $j('#testSound').show();
  }
  else
  {
    $j('#testSound').hide();
  }
}

function playAlarmSound(mode)
{
  if (!currentlyPlayingSound)
  {
    currentlyPlayingSound = true;
    
    if (mode == 'once')
    {
      playFile = $j('#alarmSound').val();
      currentlyPlayingSound = false; // allows for further tests
    }
    else
    {
      playFile = alarmSound;
    }
    
    if (usePlayer == 'html5')
    {
      audioElement = document.createElement('audio');
    
      audioElement.setAttribute('id', 'alarmAudio');
      audioElement.setAttribute('src', playFile);
    
      if (mode == 'loop')
      {
        audioElement.setAttribute('loop', 'loop');
      }

      audioElement.setAttribute('autoplay', 'autoplay');
      audioElement.addEventListener("load", function() {
        audioElement.play();
      }, true);
    }
    else if (usePlayer == 'jwplayer')
    {
      $j('body').append('<div id="jwplayerContainer"></div>');
      
      jwplayer('jwplayerContainer').setup({
        flashplayer: "third_party/jwplayer/player.swf",
        file: playFile,
      });
      
      jwplayer('jwplayerContainer').play();
    }
  }
}

function stopAlarmSound()
{
  currentlyPlayingSound = false;
  
  if (audioElement != null)
  {
    if (usePlayer == 'html5')
    {
      audioElement.pause();
    }
    else if (usePlayer == 'jwplayer')
    {
      jwplayer("jwplayerContainer").stop();
      $j("jwplayerContainer").remove();
    }
  }
}

function convertStringToNumber(value)
{
  if (value.substring(0,1) == '0')
  {
    value = value.substring(1,2);
  }

  return Number(value);
}

function setAlarm()
{
  alarmSound = $j('#alarmSound').val();
  alarmTime[0] = convertStringToNumber($j('#alarmHour').val());
  alarmTime[1] = convertStringToNumber($j('#alarmMinute').val());
  
  $j.cookie('touch_alarm_sound', alarmSound, { expires: 365});
  $j.cookie('touch_alarm_time_hour', alarmTime[0], { expires: 365});
  $j.cookie('touch_alarm_time_minute', alarmTime[1], { expires: 365});
}

function restoreAlarm()
{
  updateGlobalVarsFromCookies();
}

function closeSetAlarmWrapper()
{
  stopAlarmSound();
 
  $j('#setAlarmWrapper').hide();
  $j('#controlWrapper').show();
}

function openSetAlarmWrapper()
{
  $j('#alarmHour').val(alarmTime[0]);
  $j('#alarmMinute').val(alarmTime[1]);

  var displayHour = (alarmTime[0] < 10) ? "0" + alarmTime[0] : alarmTime[0];
  var displayMinute = (alarmTime[1] < 10) ? "0" + alarmTime[1] : alarmTime[1];
  
  $j('#alarmHour').val(displayHour);
  $j('#alarmMinute').val(displayMinute);
  
  $j('#controlWrapper').hide();
  $j('#setAlarmWrapper').show();
  
  if (alarmSound != "-1")
  {
    $j('#testSound').show();
    $j('#alarmSound option[value=' + alarmSound + ']').attr('selected', 'selected');
  }
  else
  {
    $j('#testSound').hide();
  }
}

function openAlarmWrapper()
{
  $j('#controlWrapper').hide();
  $j('#setAlarmWrapper').hide();
  $j('#alarmWrapper').show();
}

function closeAlarmWrapper(snooze)
{
  stopAlarmSound();
  
  $j('#setAlarmWrapper').hide();
  $j('#alarmWrapper').hide();
  $j('#controlWrapper').show();
  
  if (snooze != undefined)
  {
    $j('#cancelSnoozeButton').show();
    var now = new Date();
    now.setTime(now.getTime()+snoozeLength);
    snoozeActive = new Array();
    snoozeActive[0] = now.getHours();
    snoozeActive[1] = now.getMinutes();
  }
}

function cancelSnooze()
{
  stopAlarmSound();
  
  snoozeActive = false;
  
  $j('#cancelSnoozeButton').hide();
}

function updateGlobalVarsFromCookies()
{
  var cookie_sound = $j.cookie("touch_alarm_sound");
  alarmSound = (cookie_sound != null) ? cookie_sound : 'wakeup';

  var cookie_time_hour = $j.cookie("touch_alarm_time_hour");
  var cookie_time_minute = $j.cookie("touch_alarm_time_minute");
  alarmTime[0] = cookie_time_hour != null ? cookie_time_hour : 7;
  alarmTime[1] = cookie_time_minute != null ? cookie_time_minute : 15;
}

