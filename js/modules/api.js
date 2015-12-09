define(['modules/Subject'], function (Subject) {
    var self = null;
    var apiBaseUrl = null;
    var subject = null;

    return {
        init: function () {
            self = this;
            apiBaseUrl = 'https://www.zdf.de/ZDFmediathek/xmlservice/web/';
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

            var apiUrl = apiBaseUrl + 'detailsSuche?searchString=' + encodeURIComponent(series) + '&maxLength=5';
            $.get(apiUrl, function (data, status) {
                if (status === 'success') {
                    $('.result').removeClass('loading');
                    subject.notify({
                        status: 'success',
                        type: 'search',
                        data: data
                    });
                } else {
                    $('.result').removeClass('loading');
                    subject.notify({
                        status: 'error',
                        type: 'search',
                        data: 'No response from ZDF media center. Please try again'
                    });
                }
            });
        },
        loadDetails: function (id) {
            $('.error').empty().hide();

            var apiUrl = apiBaseUrl + 'aktuellste?id=' + encodeURIComponent(id) + '&maxLength=1';
            $.get(apiUrl, function (data, status) {
                if (status === 'success') {
                    var $xml = $(data);
                    var id = $xml.find('assetId').text();

                    self.checkForUpdates(id);
                } else {
                    subject.notify({
                        status: 'error',
                        type: 'details',
                        data: 'Subscription failed. Please try again'
                    });
                }
            });
        },
        checkForUpdates: function (id) {
            var subscriptions = JSON.parse(localStorage.getItem('subscription'));

            if (id !== undefined) {
                var lastEpisode;
                for (var i = 0; i < subscriptions.length; i++) {
                    if (subscriptions[i].id === id) {
                        lastEpisode = subscriptions[i].lastEpisode;
                    }
                }

                var apiUrl = apiBaseUrl + 'beitragsDetails?id=' + encodeURIComponent(id) + '&ak=web';
                $.get(apiUrl, function (data, status) {
                    if (status === 'success') {
                        var $xml = $(data);

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
                                subject.notify({
                                    status: 'success',
                                    type: 'notification',
                                    data: data
                                });
                            }
                        }
                    } else {
                        subject.notify({
                            status: 'error',
                            type: 'update',
                            data: 'Updating subscriptions failed. Please try again'
                        });
                    }
                });
            } else {
                // Check all
                for (var i = 0; i < subscriptions.length; i++) {
                    self.checkForUpdates(subscriptions[i].id);
                }
            }
        }
    }
});
