// Background script for Chrome extension.

require(['modules/notification', 'modules/storage', 'modules/api'], function (notification, storage, api) {
    storage.init();

    api.init();
    api.addObserver(storage.updateSubscription);
    api.addObserver(notification.create);

    var interval = 0;

    setInterval(function () {
        interval++;

        if (JSON.parse(localStorage.isActivated) && localStorage.frequency <= interval) {
            api.checkForUpdates();
            interval = 0;
        }
    }, 60000);
});
