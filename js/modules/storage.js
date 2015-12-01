define(['modules/api'], function (api) {
    var self = null;

    return {
        init: function() {
            self = this;
        },
        loadOptions: function () {
            options.isActivated.checked = JSON.parse(localStorage.isActivated);
            options.frequency.value = localStorage.frequency;
            options.quality.value = localStorage.quality;
        },
        loadSubscriptions: function () {
            $('.subscription').empty();

            if (!localStorage.getItem('subscription') || JSON.parse(localStorage.getItem('subscription')).length === 0) {
                $('.subscription').text('Currently you do not have any subscription.');
            } else {
                var subscriptions = JSON.parse(localStorage.getItem('subscription'));
                $('.subscription').append('<p>Your current subscription:</p><ul></ul>');

                for (var i = 0; i < subscriptions.length; i++) {
                    if (subscriptions[i].lastEpisode !== '') {
                        $('.subscription ul').append('<li><div class="series"><span class="title">' + subscriptions[i].title + '</span><span class="last"><a href="' + subscriptions[i].url + '" target="_blank" alt="last episode: ' + subscriptions[i].lastEpisode + '">last episode: ' + subscriptions[i].lastEpisode + '</a></span><span class="check-now">(<a href="#" id="' + subscriptions[i].id + '" alt="check now: ' + subscriptions[i].title + '" title="check now: ' + subscriptions[i].title + '">check now</a></span> &nbsp;|&nbsp; <span class="unsubscribe"><a href="#" id="' + subscriptions[i].id + '" alt="unsubscribe: ' + subscriptions[i].title + '" title="unsubscribe: ' + subscriptions[i].title + '">unsubscribe</a>)</span></div></li>');
                    } else {
                        $('.subscription ul').append('<li><div class="series"><span class="title">' + subscriptions[i].title + '</span><span class="last">no recent episode available</span><span class="check-now">(<a href="#" id="' + subscriptions[i].id + '" alt="check now: ' + subscriptions[i].title + '" title="check now: ' + subscriptions[i].title + '">check now</a></span> &nbsp;|&nbsp; <span class="unsubscribe"><a href="#" id="' + subscriptions[i].id + '" alt="unsubscribe: ' + subscriptions[i].title + '" title="unsubscribe: ' + subscriptions[i].title + '">unsubscribe</a>)</span></div></li>');
                    }

                    // Click handler
                    $('.subscription ul li .check-now').on('click', '#' + subscriptions[i].id, function () {
                        api.checkForUpdates($(this).attr('id'));
                    });
                    $('.subscription ul li .unsubscribe').on('click', '#' + subscriptions[i].id, function () {
                        self.deleteSubscription($(this).attr('id'));
                    });
                }
            }
        },
        updateSubscription: function (message) {
            if (message.status === 'success' && message.type !== 'search') {
                if (!localStorage.getItem('subscription')) {
                    var subscriptions = [{
                        'id': message.data.id,
                        'title': message.data.title,
                        'lastEpisode': message.data.airtime,
                        'url': message.data.url
                    }];
                    localStorage.setItem('subscription', JSON.stringify(subscriptions));
                } else {
                    var subscriptions = JSON.parse(localStorage.getItem('subscription'));
                    var seriesId = null;
                    for (var i = 0; i < subscriptions.length; i++) {
                        if (subscriptions[i].id === message.data.id) {
                            seriesId = subscriptions[i].id;
                            break;
                        }
                    }
                    if (!seriesId) {
                        subscriptions.push({
                            'id': message.data.id,
                            'title': message.data.title,
                            'lastEpisode': message.data.airtime,
                            'url': message.data.url
                        });
                        localStorage.setItem('subscription', JSON.stringify(subscriptions));
                    } else {
                        subscriptions[i].lastEpisode = message.data.airtime;
                        subscriptions[i].url = message.data.url;
                        localStorage.setItem('subscription', JSON.stringify(subscriptions));
                    }
                }
                self.loadSubscriptions();
            }
        },
        deleteSubscription: function (assetId) {
            var subscriptions = JSON.parse(localStorage.getItem('subscription'));
            if (subscriptions) {
                for (var i = 0; i < subscriptions.length; i++) {
                    if (subscriptions[i].id === assetId) {
                        subscriptions.splice(i, 1);
                    }
                }
                localStorage.setItem('subscription', JSON.stringify(subscriptions));
                self.loadSubscriptions();
            }
        }
    }
});
