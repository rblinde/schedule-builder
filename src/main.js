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
  const [day, month, year] = date.split('/');
  const [hour, minute] = time.split(':');
  return `${year}${month}${day}T${hour}${minute}00`;
}

/**
 * Creates string with calendar in ICS format
 * @param  {Collection} events
 * @return {String}            ICS string
 */
function createSchedule(events) {
  const header = 'BEGIN:VCALENDAR\nVERSION:2.0\nMETHOD:PUBLISH\nPRODID:-//rblinde/schedule-builder v1.0//EN';
  const footer = '\nEND:VCALENDAR';

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

  return header + body + footer;
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
  const blob = new Blob([schedule], { type: 'text/calendar' });
  FileSaver.saveAs(blob, `calendar.ics`);
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
