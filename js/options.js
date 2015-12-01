// Options for using Chrome extension.

require(['modules/View', 'modules/notification', 'modules/storage', 'modules/api'], function (View, notification, storage, api) {
    storage.init();
    storage.loadOptions();
    storage.loadSubscriptions();

    var view = new View();
    view.init();

    api.init();
    api.addObserver(view.updateView);
    api.addObserver(storage.updateSubscription);
    api.addObserver(notification.create);
});
