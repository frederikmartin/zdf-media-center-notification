define(['modules/Subject'], function (Subject) {
    var self = null;
    var apiUrl = null;
    var subject = null;

    return {
        init: function () {
            self = this;
            apiUrl = 'https://www.zdf.de/ZDFmediathek/xmlservice/web/';
            subject = new Subject();
        },
        addObserver: function (observer) {
            subject.observe(observer);
        },
        removeObserver: function (observer) {
            subject.unobserve(observer);
        },
        search: function (series) {
            $('.error').empty().hide();
            $('.result').empty().addClass('loading');

            var apiCall = apiUrl + 'detailsSuche?searchString=' + encodeURIComponent(series) + '&maxLength=5';
            var x = new XMLHttpRequest();
            x.open('GET', apiCall, true);
            x.timeout = 5000;

            x.onload = function () {
                $('.result').removeClass('loading');
                var response = x.responseXML;
                subject.notify({
                    status: 'success',
                    type: 'search',
                    data: response
                });
            };

            x.ontimeout = function () {
                $('.result').removeClass('loading');
                subject.notify({
                    status: 'error',
                    type: 'search',
                    data: 'No response from ZDF media center. Please try again'
                });
            };

            x.onerror = function () {
                $('.result').removeClass('loading');
                subject.notify({
                    status: 'error',
                    type: 'search',
                    data: 'Network error. Please try again'
                });
            };

            x.send();
        },
        loadDetails: function (id) {
            $('.error').empty().hide();

            var apiCall = apiUrl + 'aktuellste?id=' + encodeURIComponent(id) + '&maxLength=1';
            var x = new XMLHttpRequest();
            x.open('GET', apiCall, true);
            x.timeout = 5000;

            x.onload = function () {
                var response = x.responseXML;
                var $xml = $(response);
                var id = $xml.find('assetId').text();

                self.checkForUpdates(id);
            };

            x.ontimeout = function () {
                subject.notify({
                    status: 'error',
                    type: 'details',
                    data: 'Subscription failed. Please try again'
                });
            };

            x.onerror = function () {
                subject.notify({
                    status: 'error',
                    type: 'details',
                    data: 'Subscription failed. Please try again'
                });
            };

            x.send();
        },
        checkForUpdates: function (id) {
            if (id !== undefined) {
                var subscriptions = JSON.parse(localStorage.getItem('subscription'));
                var lastEpisode;
                for (var i = 0; i < subscriptions.length; i++) {
                    if (subscriptions[i].id === id) {
                        lastEpisode = subscriptions[i].lastEpisode;
                    }
                }

                var apiCall = apiUrl + 'beitragsDetails?id=' + encodeURIComponent(id) + '&ak=web';
                var x = new XMLHttpRequest();
                x.open('GET', apiCall, true);
                x.timeout = 5000;

                x.onload = function () {
                    var response = x.responseXML;
                    var $xml = $(response);

                    var title = $xml.find('title').eq(0).text();
                    var airtime = $xml.find('airtime').text();
                    var url = '';

                    $xml.find('formitaet[basetype="vp8_vorbis_webm_http_na_na"]').each(function () {
                        if ($(this).find('quality').text() === localStorage.quality) {
                            url = $(this).find('url').text();
                        }
                    });

                    var data = {
                        id: id,
                        title: title,
                        airtime: airtime,
                        url: url
                    };
                    subject.notify({
                        status: 'success',
                        type: 'update',
                        data: data
                    });

                    if (lastEpisode) {
                        if (moment(lastEpisode, 'DD.MM.YYYY HH:mm') < moment(airtime, 'DD.MM.YYYY HH:mm')) {
                            // TODO: notification.show(title, url);
                        }
                    }
                };

                x.ontimeout = function () {
                    subject.notify({
                        status: 'error',
                        type: 'update',
                        data: 'Updating subscriptions failed. Please try again'
                    });
                };

                x.onerror = function () {
                    subject.notify({
                        status: 'error',
                        type: 'update',
                        data: 'Updating subscriptions failed. Please try again'
                    });
                };

                x.send();
            } else {
                console.log('id null');
            }
        }
    }
});
