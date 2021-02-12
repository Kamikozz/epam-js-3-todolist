// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
(function (arr) {
  for (var i = 0; i < arr.length; i += 1) {
    var item = arr[i];
    if (Object.prototype.hasOwnProperty.call(item, 'remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function remove() {
        this.parentNode.removeChild(this);
      },
    });
  }
}([Element.prototype, CharacterData.prototype, DocumentType.prototype]));

(function (ELEMENT) {
  ELEMENT.matches = ELEMENT.matches
    || ELEMENT.mozMatchesSelector
    || ELEMENT.msMatchesSelector
    || ELEMENT.oMatchesSelector
    || ELEMENT.webkitMatchesSelector;
  ELEMENT.closest = ELEMENT.closest || function closest(selector) {
    if (!this) return null;
    if (this.matches(selector)) return this;
    if (!this.parentElement) return null;
    return this.parentElement.closest(selector);
  };
}(Element.prototype));
