// Options for using Chrome extension.
(function() {

    var API_URL = 'https://www.zdf.de/ZDFmediathek/xmlservice/web/';

    function search(series) {
        $('.error').empty().hide();
        $('.result').empty().addClass('loading');

        var apiCall = API_URL + 'detailsSuche?searchString=' + encodeURIComponent(series) + '&maxLength=5';
        var x = new XMLHttpRequest();
        x.open('GET', apiCall, true);
        x.timeout = 5000;

        x.onload = function() {
            $('.result').removeClass('loading');
            var response = x.responseXML;
            searchOutput(response);
        }

        x.ontimeout = function() {
            $('.result').removeClass('loading');
            errorOutput('No response from ZDF media center. Please try again');
        }

        x.onerror = function() {
            $('.result').removeClass('loading');
            errorOutput('Network error. Please try again');
        }

        x.send();
    }

    function errorOutput(response) {
        $('.error').show().append(response);
    }

    function searchOutput(response) {
        var $xml = $(response);
        if ($xml.find('broadcasts').children().length > 0) {
            $('.result').append('<p>Matching series:</p><ul></ul>');
            $xml.find('broadcasts').children().each(function() {
                $('.result ul').append('<li><div class="series"><span class="title">' + $(this).text() + '</span><span class="subscribe">(<a href="#" id="' + $(this).attr('id') + '" alt="subscribe: ' + $(this).text() + '" title="subscribe: ' + $(this).text() + '">subscribe</a>)</span></div></li>');
                addClickBinding($(this).attr('id'), 'subscribe');
            });
        } else {
            $('.result').append('Nothing found for "' + $('#series input[name=search]').val() + '". Please try again');
        }
    }

    function addClickBinding(id, action) {
        switch(action) {
            case 'subscribe':
                $('.result ul li').on('click', '#' + id, function() {
                    subscribe(id)
                });
                break;
            case 'unsubscribe':
                $('.subscription ul li').on('click', '#' + id, function() {
                    unsubscribe(id)
                });
                break;
        }
    }

    function subscribe(id) {
        $('.error').empty().hide();

        var apiCall = API_URL + 'aktuellste?id=' + encodeURIComponent(id) + '&maxLength=1';
        var x = new XMLHttpRequest();
        x.open('GET', apiCall, true);
        x.timeout = 5000;

        x.onload = function() {
            var response = x.responseXML;
            var $xml = $(response);
            persistSubscription($xml.find('assetId').text(), $xml.find('title').eq(0).text(), $xml.find('airtime').text());
            loadSubscription();
        }

        x.ontimeout = function() {
            errorOutput('Subscription failed. Please try again');
        }

        x.onerror = function() {
            errorOutput('Subscription failed. Please try again');
        }

        x.send();
    }

    function persistSubscription(assetId, title, airtime) {
        if (!localStorage.getItem('subscription')) {
            var subscription = [ { 'id': assetId, 'title': title, 'lastEpisode': airtime } ];
            localStorage.setItem('subscription', JSON.stringify(subscription));
        } else {
            var subscription = JSON.parse(localStorage.getItem('subscription'));
            var seriesExists = false;
            for (var i = 0; i < subscription.length; i++) {
                if (subscription[i].id === assetId) {
                    seriesExists = true;
                }
            }
            if (!seriesExists) {
                subscription.push({ 'id': assetId, 'title': title, 'lastEpisode': airtime });
                localStorage.setItem('subscription', JSON.stringify(subscription));
            }
        }
    }

    function loadSubscription() {
        $('.subscription').empty();

        if (!localStorage.getItem('subscription') || JSON.parse(localStorage.getItem('subscription')).length === 0) {
            $('.subscription').text('Currently you do not have any subscription.');
        } else {
            var subscription = JSON.parse(localStorage.getItem('subscription'));
            $('.subscription').append('<p>Your current subscription:</p><ul></ul>');
            for (var i = 0; i < subscription.length; i++) {
                if (subscription[i].lastEpisode !== '') {
                    $('.subscription ul').append('<li><div class="series"><span class="title">' + subscription[i].title + '</span><span class="last">last episode: ' + subscription[i].lastEpisode + '</span><span class="unsubscribe">(<a href="#" id="' + subscription[i].id + '" alt="unsubscribe: ' + subscription[i].title + '" title="unsubscribe: ' + subscription[i].title + '">unsubscribe</a>)</span></div></li>');
                } else {
                    $('.subscription ul').append('<li><div class="series"><span class="title">' + subscription[i].title + '</span><span class="last">no recent episode available</span><span class="unsubscribe">(<a href="#" id="' + subscription[i].id + '" alt="unsubscribe: ' + subscription[i].title + '" title="unsubscribe: ' + subscription[i].title + '">unsubscribe</a>)</span></div></li>');
                }
                addClickBinding(subscription[i].id, 'unsubscribe');
            }
        }
    }

    function unsubscribe(assetId) {
        var subscription = JSON.parse(localStorage.getItem('subscription'));
        if (subscription) {
            for (var i = 0; i < subscription.length; i++) {
                if (subscription[i].id === assetId) {
                    subscription.splice(i, 1);
                }
            }
            localStorage.setItem('subscription', JSON.stringify(subscription));
            loadSubscription();
        }
    }

    function loadOptions() {
        options.isActivated.checked = JSON.parse(localStorage.isActivated);
        options.frequency.value = localStorage.frequency;
        options.quality.value = localStorage.quality;
    }

    function ghost(isDeactivated) {
        options.style.color = isDeactivated ? 'graytext' : 'black';
        options.frequency.disabled = isDeactivated;
    }

    window.addEventListener('load', function() {
        series.onsubmit = function() {
            search(series.search.value);
            return false;
        }

        loadSubscription();
        loadOptions();

        if (!options.isActivated.checked) { ghost(true); }

        options.isActivated.onchange = function() {
            localStorage.isActivated = options.isActivated.checked;
            ghost(!options.isActivated.checked);
        }

        options.frequency.onchange = function() {
            localStorage.frequency = options.frequency.value;
        }

        options.quality.onchange = function() {
            localStorage.quality = options.quality.value;
        }
    });

})();
