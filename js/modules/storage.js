define(function () {
    var self;

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
                        // TODO: api.checkSubscriptionForUpdates($(this).attr('id'));
                    });
                    $('.subscription ul li .unsubscribe').on('click', '#' + subscriptions[i].id, function () {
                        self.deleteSubscription($(this).attr('id'));
                    });
                }
            }
        },
        updateSubscription: function (id, airtime, url) {
            var subscriptions = JSON.parse(localStorage.getItem('subscription'));
            for (var i = 0; i < subscriptions.length; i++) {
                if (subscriptions[i].id === id) {
                    subscriptions[i].lastEpisode = airtime;
                    subscriptions[i].url = url;
                    localStorage.setItem('subscription', JSON.stringify(subscriptions));
                }
            }
            this.loadSubscription();
        },
        saveSubscription: function (assetId, title, airtime) {
            console.log('assetId: ' + assetId);
            console.log('title: ' + title);
            console.log('airtime: ' + airtime);
            if (!localStorage.getItem('subscription')) {
                var subscriptions = [{'id': assetId, 'title': title, 'lastEpisode': airtime}];
                localStorage.setItem('subscription', JSON.stringify(subscriptions));
            } else {
                var subscriptions = JSON.parse(localStorage.getItem('subscription'));
                var seriesExists = false;
                for (var i = 0; i < subscriptions.length; i++) {
                    if (subscriptions[i].id === assetId) {
                        seriesExists = true;
                    }
                }
                if (!seriesExists) {
                    subscriptions.push({'id': assetId, 'title': title, 'lastEpisode': airtime});
                    localStorage.setItem('subscription', JSON.stringify(subscriptions));
                }
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
