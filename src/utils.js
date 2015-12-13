module.exports = {

    //get date string for today's date (e.g. 2011-01-01)
    dateString: function() {
        var d = new Date(Date.now() - 5 * 60 * 60 * 1000); //est timezone
        return d.getUTCFullYear() + '-' +
            (d.getUTCMonth() + 1) + '-' +
            (d.getDate() - 2); // Looking for tweets in the last 2 days
    },

    minutesToMiliseconds: function(minutes) {
        return minutes * 60 * 1000;
    },

    // Get todays date
    getDateTime: function() {

        var date = new Date();
        var monthNames = ["Initial", "Jan", "Feb", "Mar", "April", "May", "June",
            "July", "Aug", "Sept", "Oct", "Nov", "Dec"
        ];

        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        var year = date.getFullYear();

        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        //return year + "/" + monthNames[parseInt(month)] + "/" + day + " at " + hour + ":" + min + ":" + sec;
        return hour + ":" + min + ":" + sec + " on " + year + "/" + monthNames[parseInt(month)] + "/" + day;
    }

};