var schedules = require('../controllers/ScheduleController.js');

module.exports = function (){

	schedules.startAllSavedSchedules();
	schedules.startFeaturedSchedule();
};