'use strict';

const FileSaver = require('file-saver');
const data = require('./data.json');

/**
 * Creates timestamp of current datetime
 * @return {String} timestamp in ICS format
 */
function createTimestamp() {
  const d = new Date();
  const string = d.toISOString().replace(/-|:|\./g, '');
  return string.substr(0, 15) + 'Z';
}

/**
 * Creates datetime string
 * @param  {String} date date from csv
 * @param  {String} time time from csv
 * @return {String}      date string (DMYTHm00)
 */
function formatDate(date, time) {
  const [day, month, year] = date.split('-');
  const [hour, minute] = time.split(':');
  return `${year}${month}${day}T${hour}${minute}00`;
}

/**
 * Creates string with calendar in ICS format
 * @param  {Collection} events
 * @return {String}            ICS string
 */
function createSchedule(events) {
  const header = 'BEGIN:VCALENDAR' +
  '\nPRODID:-//rblinde/schedule-builder v1.0//EN' +
  '\nVERSION:2.0' +
  '\nCALSCALE:GREGORIAN' +
  '\nMETHOD:PUBLISH' +
  '\nX-WR-CALNAME:ScheduleBuilder' +
  '\nX-WR-TIMEZONE:Europe/Amsterdam';

  const footer = '\nEND:VCALENDAR';
  const timezone = '\nBEGIN:VTIMEZONE' + 
  '\nTZID:Europe/Amsterdam' +
  '\nX-LIC-LOCATION:Europe/Amsterdam' +
  '\nBEGIN:DAYLIGHT' +
  '\nTZOFFSETFROM:+0100' +
  '\nTZOFFSETTO:+0200' +
  '\nTZNAME:CEST' +
  '\nDTSTART:19700329T020000' +
  '\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU' +
  '\nEND:DAYLIGHT' +
  '\nBEGIN:STANDARD' +
  '\nTZOFFSETFROM:+0200' +
  '\nTZOFFSETTO:+0100' +
  '\nTZNAME:CET' +
  '\nDTSTART:19701025T030000' +
  '\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU' +
  '\nEND:STANDARD' +
  '\nEND:VTIMEZONE';

  let body = '';

  for (const event of events) {
    const { start, end, date, course, label, location } = event;
    const eventStart = formatDate(date, start);
    const eventEnd = formatDate(date, end);
    const timeStamp = createTimestamp();
    const eventString = '\nBEGIN:VEVENT' +
    `\nUID:${eventEnd}-${course}@rblinde/schedule-builder` +
    `\nSUMMARY:${label}` +
    `\nDTSTART:${eventStart}` +
    `\nDTEND:${eventEnd}` +
    `\nDTSTAMP:${timeStamp}` +
    `\nLOCATION:${location}` +
    '\nSTATUS:CONFIRMED' +
    '\nSEQUENCE:0' +
    '\nEND:VEVENT';

    body += eventString;
  }

  return header + timezone + body + footer;
}

/**
 * Checks which courses have been picked, generates
 * ICS file and downloads it to device
 */
function handleBuildBtnClick() {
  const checkboxes = [...document.getElementsByName('courses')];
  const selectedCourseIds = checkboxes
    .filter(ch => !!ch.checked)
    .map(el => el.value);

  if (selectedCourseIds.length === 0) {
    return false;
  }

  const events = data.filter(row => selectedCourseIds.includes(row.course));
  const schedule = createSchedule(events);
  // Downloading
  const file = new File([schedule], 'calendar.ics', { type: 'text/calendar;charset=utf-8' });
  FileSaver.saveAs(file);
}

/**
 * Toggle all checkboxes
 */
function toggleAllCheckboxes(checked = true) {
  const checkboxes = document.querySelectorAll('input[name="courses"]');

  for (const checkbox of checkboxes) {
    checkbox.checked = checked;
  }
}

const buildBtn = document.getElementById('build-btn');
const selectAllBtn = document.querySelector('.js-select-all');
const unselectAllBtn = document.querySelector('.js-unselect-all');
buildBtn.addEventListener('click', handleBuildBtnClick);
selectAllBtn.addEventListener('click', () => toggleAllCheckboxes());
unselectAllBtn.addEventListener('click', () => toggleAllCheckboxes(false));
