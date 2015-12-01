define(['modules/storage', 'modules/api'], function (storage, api) {

    var self;

    function View() {
        self = this;
    }

    View.prototype.init = function () {
        series.onsubmit = function () {
            api.search(series.search.value);
            return false;
        };

        options.isActivated.onchange = function () {
            localStorage.isActivated = options.isActivated.checked;
            ghost();
            this.ghost(!options.isActivated.checked);
        };

        options.frequency.onchange = function () {
            localStorage.frequency = options.frequency.value;
        };

        options.quality.onchange = function () {
            localStorage.quality = options.quality.value;
        };

        if (!options.isActivated.checked) {
            this.ghost(true);
        }
    };

    View.prototype.ghost = function (isDeactivated) {
        options.style.color = isDeactivated ? 'graytext' : 'black';
        options.frequency.disabled = isDeactivated;
    };

    View.prototype.updateView = function (message) {
        storage.loadSubscriptions();

        if (message.status === 'error') {
            self.errorOutput(message.data);
        } else if (message.status === 'success') {
            if (message.type === 'view' || message.type === 'all') {
                self.searchOutput(message.data);
            }
        }
    };

    View.prototype.searchOutput = function (response) {
        if (response) {
            var $xml = $(response);
            if ($xml.find('broadcasts').children().length > 0) {
                $('.result').append('<p>Matching series:</p><ul></ul>');
                $xml.find('broadcasts').children().each(function () {
                    $('.result ul').append('<li><div class="series"><span class="title">' + $(this).text() + '</span><span class="subscribe">(<a href="#" id="' + $(this).attr('id') + '" alt="subscribe: ' + $(this).text() + '" title="subscribe: ' + $(this).text() + '">subscribe</a>)</span></div></li>');
                    $('.result ul li').on('click', '#' + $(this).attr('id'), function () {
                        api.loadDetails($(this).attr('id'));
                    });
                });
            } else {
                $('.result').append('Nothing found for "' + $('#series input[name=search]').val() + '". Please try again');
            }
        }
    };

    View.prototype.errorOutput = function (response) {
        $('.error').show().append(response);
        return true;
    };

    return View;

});
