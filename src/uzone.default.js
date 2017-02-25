$(function () {
    $('table').tablesorter({
        usNumberFormat: false,
        sortReset: true,
        sortRestart: true,
    });
});
var app = new Vue({
    el: '#app',
    data: {
        rtdb: uzone.rtdb.createNew(),
        alarm: uzone.alarm.createActive(),
        devices:uzone.device.getDevice()
    },
    methods: {
        ontimer: function (val) {
            this.rtdb.update(val);
            this.alarm.update(uzone.alarm.activeAlarmUrl);
        },
    }
});