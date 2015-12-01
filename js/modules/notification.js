define(function () {
    return {
        create: function (message) {
            if (message.type === 'notification') {
                var options = {
                    type: 'basic',
                    title: message.data.title,
                    message: "New episode available.\nClick here to watch it.",
                    iconUrl: 'images/zdf-logo_48x48.png'
                };

                chrome.notifications.clear(message.data.title, function () {
                    chrome.notifications.create(message.data.title, options, null);
                    chrome.notifications.onClicked.addListener(function () {
                        window.open(message.data.url);
                    });
                });
            }
        }
    }
});
