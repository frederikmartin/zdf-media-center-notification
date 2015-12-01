define(function () {

    function Subject() {
        this._list = [];
    }

    Subject.prototype.observe = function observeObject(obj) {
        this._list.push(obj);
    };

    Subject.prototype.unobserve = function unobserveObject(obj) {
        for (var i = 0, len = this._list.length; i < len; i++) {
            if (this._list[i] === obj) {
                this._list.splice((i, 1));
                return true;
            }
        }
        return false;
    };

    Subject.prototype.notify = function notifyObservers() {
        var args = Array.prototype.slice.call(arguments, 0);
        for (var i = 0, len = this._list.length; i < len; i++) {
            this._list[i].apply(null, args);
        }
    };

    return Subject;

});
