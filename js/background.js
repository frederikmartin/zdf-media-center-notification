// Background script for Chrome extension.
(function() {

    var API_URL = 'https://www.zdf.de/ZDFmediathek/xmlservice/web/';

    /*
        Check subscriptions for updates.
    */
    function checkSubscriptionsForUpdates() {
        var subscription = JSON.parse(localStorage.getItem('subscription'));
        for (var i = 0; i < subscription.length; i++) {
            queryZDF(subscription[i].id, subscription[i].lastEpisode);
        }
    }

    /*
        Query ZDF API.
    */
    function queryZDF(id, lastEpisode) {
        var apiCall = API_URL + 'beitragsDetails?id=' + encodeURIComponent(id) + '&ak=web';
        var x = new XMLHttpRequest();
        x.open('GET', apiCall, true);
        x.timeout = 5000;

        x.onload = function() {
            var response = x.responseXML;
            var $xml = $(response);

            var title = $xml.find('title').eq(0).text();
            var airtime = $xml.find('airtime').text();
            var url = '';

            $xml.find('formitaet[basetype="vp8_vorbis_webm_http_na_na"]').each(function() {
                if ($(this).find('quality').text() === localStorage.quality) {
                    url = $(this).find('url').text();
                }
            });

            if (moment(lastEpisode, 'DD.MM.YYYY h:mm') < moment(airtime, 'DD.MM.YYYY h:mm')) {
                show(title, url);
                updateLastEpisode(id, airtime);
            }
        }

        x.ontimeout = function() {}

        x.onerror = function() {}

        x.send();
    }

    /*
        Displays a notification.
    */
    function show(title, url) {
        var options = {
            type: 'basic',
            title: title,
            message: moment().format('DD.MM.YYYY, HH:mm') + ": \nNew episode available.\nClick here to watch it.",
            iconUrl: 'images/zdf-logo_48x48.png'
        };

        chrome.notifications.create('newEpisode', options, function() {});
        chrome.notifications.onClicked.addListener(function(newEpisode) {
            window.open(url);
        });
    }

    /*
        Update last episode time.
    */
    function updateLastEpisode(id, airtime) {
        var subscription = JSON.parse(localStorage.getItem('subscription'));
        for (var i = 0; i < subscription.length; i++) {
            if (subscription[i].id === id) {
                subscription[i].lastEpisode = airtime;
                localStorage.setItem('subscription', JSON.stringify(subscription));
            }
        }
    }

    if (!localStorage.isInitialized) {
        localStorage.isActivated = true;
        localStorage.frequency = 15;
        localStorage.quality = 'veryhigh';
        localStorage.isInitialized = true;
    }

    if (window.Notification) {
        if (JSON.parse(localStorage.isActivated)) {
            checkSubscriptionsForUpdates();
        }

        var interval = 0;

        setInterval(function() {
            interval++;

            if (JSON.parse(localStorage.isActivated) && localStorage.frequency <= interval) {
                checkSubscriptionsForUpdates();
                interval = 0;
            }
        }, 60000);
    }

})();
