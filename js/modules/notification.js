define(function () {
    return {
        create: function (message) {
            if (message.type === 'notification') {
                var options = {
                    type: 'basic',
                    title: message.data.title,
                    message: moment().format('DD.MM.YYYY, HH:mm') + ": \nNew episode available.\nClick here to watch it.",
                    iconUrl: 'images/zdf-logo_48x48.png'
                };

                chrome.notifications.create('newEpisode', options, function () {
                });
                chrome.notifications.onClicked.addListener(function () {
                    window.open(message.data.url);
                });
            }
        }
    }
});
