const convertDateToDay = date => `${date.toLocaleDateString('en-us', {weekday: 'long'})}`.slice(0, 3);
const compareTime = (time1, time2) => {
  // Parse time strings into Date objects
  const date1 = new Date('2000-01-01T' + time1); // Use a common date (e.g., 2000-01-01) for comparison
  const date2 = new Date('2000-01-01T' + time2);
  return date1 <= date2;
};
const getNextHrTimestamp = (hr = 1) => {
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + hr);
  return currentDate.toISOString();
};

module.exports = {
  convertDateToDay,
  compareTime,
  getNextHrTimestamp,
};
