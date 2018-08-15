var Alexa = require('alexa-sdk');
var AWS = require('aws-sdk');
//var DOC = require('dynamodb-doc');

AWS.config.update({ region: 'us-east-1' });

const APP_ID = 'amzn1.ask.skill.c7ac36f4-d092-4db6-9343-724876bcc9ce';

var dynamo = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.dynamoDBTableName = 'dummy';
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


var firstNameSlot = this.event.request.intent.slots.firstName.value;
var lastNameSlot = this.event.request.intent.slots.lastName.value;

var firstName;
var lastName;


var date = new Date();
var hour = date.getHours();
curHour = hour - 5;
var min = date.getMinutes();
min = (min < 10 ? "0" : "") + min;
var sec = date.getSeconds();
sec = (sec < 10 ? "0" : "") + sec;
var year = date.getFullYear();
var month = date.getMonth() + 1;
month = (month < 10 ? "0" : "") + month;
var day = date.getDate();
day = (day < 10 ? "0" : "") + day;

currentDate = month + "/" + day + "/" + year;
currentTime = curHour + ":" + min + ":" + sec;


if (firstNameSlot && lastNameSlot) {
    firstName = firstNameSlot;
    lastName = lastNameSlot;
} else {
    this.emit('ask', 'Sorry, I didn\'t quite get that. Please say: my name is, and then state your first and last name');
}

if (firstName && lastName) {
    this.attributes['FirstName'] = firstName;
    this.attributes['LastName'] = lastName;
    this.attributes['userId'] = firstName + lastName;
    this.attributes['date'] = currentDate;
    this.attributes['timeIn'] = currentTime;


    var params = {
        TableName: 'TSBtimesheet',
        Key: {
            'userId': {
                S: firstName + lastName
            },
            'date': {
                S: currentDate
            }
        },
        ProjectedExpression: 'FirstName, LastName, timeIn, timeOut',
        ConsistentRead: true,
        ReturnConsumedCapacity: TOTAL
        };

    console.log(params);

    dynamo.getItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data.Item);
        }
    });
    this.emit(':tell', `Welcome back ${firstName}!`);
} else {
    this.emit(':ask', `Sorry I didn\'t quite get that. Sign in by saying "sign in" and then your first and last name`);
}
