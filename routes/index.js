var express = require('express');
var router = express.Router();

var CronJob = require('cron').CronJob;
var moment  = require('moment');
var request = require('request');

var Twit = require('twit');
var Tw = new Twit({
    consumer_key: process.env.twitterConsumerKey,
    consumer_secret: process.env.twitterConsumerSecret,
    access_token: process.env.twitterAccessToken,
    access_token_secret: process.env.twitterAccessSecret
});

var screen_name = process.env.twitterScreenName;

var GoogleSpreadsheet = require('google-spreadsheet');
var My_sheet = new GoogleSpreadsheet(process.env.googleWorksheetsId);
var Sheet;
create_sheet_obj();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
  	title: 'follower2spreadsheet',
  	message: cronTime
  });
});

var cronTime = process.env.cron || '0 55 23 * * *';

new CronJob({
	cronTime: cronTime,
	onTick: function() {
		logging_time();
		get_profile();
	},
	start: true
});

/////////////////////////////////////////////////////////////////////

function create_sheet_obj() {
	//var credentials = require(process.env.googleJsonPath);
	var credentials = {
		client_email: process.env.googleClientEmail,
		private_key: process.env.googlePrivateKey.replace(/\\n/g,"\n")
	};
	//console.log(credentials.client_email);
	//console.log(credentials.private_key);
	My_sheet.useServiceAccountAuth(credentials, function(err){
		My_sheet.getInfo(function(err, data){
			//console.log(data);
			Sheet = data;
		});
	});
}

function logging_time() {
	var message = 'ただいま' + get_time_now() + 'です';
	console.log(message);
}

function get_profile() {
	var params = {
		screen_name: 'unkaitter'
	};
	Tw.get('users/show', params, function(err, data, response){
		if (!err && response.statusCode == 200) {
			post_spreadsheet(data);
		} else {
			console.error(err);
		}
	});
}

function post_spreadsheet(data) {
	My_sheet.addRow(1, {
		'date': get_date_now(),
		'followers_count': data.followers_count,
		'friends_count': data.friends_count,
		'favourites_count': data.favourites_count,
		'statuses_count': data.statuses_count
	});
}

function get_time_now() {
	return moment().utc().add(9, 'h').format("YYYY/MM/DD HH:mm");
}

function get_date_now() {
	return moment().utc().add(9, 'h').format("YYYY/MM/DD");
}

module.exports = router;
