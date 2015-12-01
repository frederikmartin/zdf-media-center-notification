define(function () {
    return {
        create: function (message) {
            if (message.status === 'success' && message.type === 'notification') {
                // Using HTML5 notifications instead of chrome's notifications,
                // because of unresolved problems with click handlers
                var notification = new Notification(message.data.title, {
                    icon: 'images/zdf-logo_48x48.png',
                    body: message.data.url
                });
                notification.onclick = function () {
                    window.open(notification.body);
                };
            }
        }
    }
});
