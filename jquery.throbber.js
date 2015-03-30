/**
 * Created by sam0delkin on 24.03.2015.
 */
(function ($) {

  var defaults = {
    size: 'medium', //possible values are "small", "medium", "large", number (for same width and height) or hash: {width: 100, height: 100}
    image: 'circle', //possible values are "circle", "horizontal", or custom image_url
    type: 'block', //possible values are "block", "inline", or custom value.
    position: 'center', //possible values are "center", "left-top", "right-top", "left-bottom", "right-bottom", "fullscreen", hash: {x: 0, y: 0} or callback that return hash
    overlay: { // can be hash or false
      color: '#000',
      opacity: 0.3
    },
    animation: { // can be hash or false
      hide: {
        type: 'hide', // can be any jQuery animation effect or callback
        length: 0
      },
      show: {
        type: 'show', // can be any jQuery animation effect or callback
        length: 0
      }
    },
    throbber_class: 'jquery-throbber',
    overlay_class: 'jquery-throbber-overlay'
  };

  /**
   * Helper function for throw error if it's needed.
   *
   * @param parameter
   * @param message
   */
  function throwError(parameter, message) {
    throw new Error('jQuery.Throbber: invalid parameter "' + parameter + '". ' + message);
  }

  /**
   * Calculates throbber size, based on given options.
   *
   * @param options
   * @returns {{width: number, height: number}}
   */
  function getThrobberSize(options) {
    var size = {width: 0, height: 0};

    switch (typeof options.size) {
      case 'string':
        switch (options.size) {
          case 'small':
            if (options.image === 'circle') {
              size = {width: 16, height: 16};
            } else {
              size = {width: 40, height: 5};
            }
            break;
          case 'medium':
            if (options.image === 'circle') {
              size = {width: 32, height: 32};
            } else {
              size = {width: 80, height: 10};
            }
            break;
          case 'large':
            if (options.image === 'circle') {
              size = {width: 64, height: 64};
            } else {
              size = {width: 160, height: 20};
            }
            break;
          default:
            throwError('size', 'Possible values are "small", "medium", "large", number (for same width and height) or hash: {width: 100, height: 100}');
            break;
        }
        break;
      case 'object':
        if (typeof options.size.width == 'number' && typeof options.size.height == 'number') {
          size = options.size;
        } else {
          throwError('size', 'Possible values are "small", "medium", "large", number (for same width and height) or hash: {width: 100, height: 100}');
        }
        break;
      case 'number':
        size = {width: options.size, height: options.size};
        break;
      default:
        throwError('size', 'Possible values are "small", "medium", "large", number (for same width and height) or hash: {width: 100, height: 100}');
        break;
    }

    return size;
  }

  /**
   * Calculates throbber position, based on element and given options
   *
   * @param element
   * @param options
   * @returns {{x: number, y: number}}
   */
  function getThrobberPostion(element, options) {
    var position = {x: 0, y: 0};
    var size = getThrobberSize(options);
    switch (typeof options.position) {
      case 'string':
        switch (options.position) {
          case 'center':
            position.x = element.outerWidth() / 2 - (size.width / 2);
            position.y = element.outerHeight() / 2 - (size.height / 2);
            break;
          case 'left-top':
            position.x = 0;
            position.y = 0;
            break;
          case 'right-top':
            position.x = element.outerWidth() - size.width;
            position.y = 0;
            break;
          case 'left-bottom':
            position.x = 0;
            position.y = element.outerHeight() - size.height;
            break;
          case 'right-bottom':
            position.x = element.outerWidth() - size.width;
            position.y = element.outerHeight() - size.height;
            break;
          case 'fullscreen':
            position.x = '50%';
            position.y = '50%';
            break;
          default:
            throwError('position', 'Possible values are "center", "left-top", "right-top", "left-bottom", "right-bottom", hash: {x: 0, y: 0} or callback that return hash');
            break;
        }
        if (options.position != 'fullscreen') {
          position.x += element.position().left;
          position.y += element.position().top;
        }
        break;
      case 'object':
        if (typeof options.position.x == 'number' && typeof options.position.y == 'number') {
          position = options.position;
        } else {
          throwError('position', 'Possible values are "center", "left-top", "right-top", "left-bottom", "right-bottom", hash: {x: 0, y: 0} or callback that return hash');
        }
        break;
      case 'function':
        options.position.apply(element, [options]);
        break;
      default:
        throwError('position', 'Possible values are "center", "left-top", "right-top", "left-bottom", "right-bottom", hash: {x: 0, y: 0} or callback that return hash');
        break;
    }

    return position;
  }

  /**
   * Helper function for return throbber objects
   *
   * @param element
   * @param options
   * @returns {{throbber: (*|HTMLElement), overlay: (*|HTMLElement)}}
   */
  function getThrobberObjects(element, options) {
    var throberClass = options.throbber_class;
    if (typeof options.size === 'string') {
      throberClass += ' throbber-size-' + options.size;
    }
    if (typeof options.position === 'string') {
      throberClass += ' throbber-posistion-' + options.size;
    }
    if (typeof options.image === 'string') {
      throberClass += ' throbber-image-type-' + options.image;
    }
    if (options.type == 'inline' || element.css('display').indexOf('inline') >= 0) {
      throberClass += ' throbber-type-inline';
    } else if (options.type == 'block') {
      throberClass += ' throbber-type-block';
    } else {
      throberClass += ' throbber-type-custom';
    }
    return {
      throbber: $('<div style="display: none;" class="' + throberClass + '"></div>'),
      overlay: $('<div style="display: none;" class="' + options.overlay_class + '"></div>')
    };
  }

  /**
   * Throbber constructor.
   *
   * @param element
   * @param options
   * @constructor
   */
  function Throbber(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, defaults, this.$element.data(), options);
    this.throbber = null;
    this.overlay = null;
  }

  /**
   * Show throbber on element
   */
  Throbber.prototype.show = function () {
    if (this.throbber) {
      return;
    }

    var throbberObjects = getThrobberObjects(this.$element, this.options);
    var throbber = this.throbber = throbberObjects.throbber;

    if (this.options.image != 'circle' && this.options.image != 'horizontal') {
      throbber.css({
        'background-image': this.options.image
      });
    }

    var overlay = this.overlay = throbberObjects.overlay;

    var position = getThrobberPostion(this.$element, this.options);
    var size = getThrobberSize(this.options);

    overlay.css({
      width: this.$element.outerWidth(),
      height: this.$element.outerHeight(),
      left: this.$element.position().left,
      top: this.$element.position().top
    });

    if (this.options.type == 'inline' || this.$element.css('display').indexOf('inline') >= 0) {
      throbber.css({
        display: 'inline-block',
        width: this.options.image == 'circle' ? this.$element.outerHeight() : size.width,
        height: this.$element.outerHeight(),
        'background-size': this.options.image == 'circle' ? this.$element.outerHeight() : size.height
      });

      this.$element.after(throbber);
      throbber.show();
    } else {
      throbber.css({
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        'background-size': size.width,
        position: this.options.position == 'fullscreen' ? 'fixed' : 'absolute'
      });

      if (this.options.overlay !== false) {
        overlay.css({
          background: this.options.overlay.color,
          opacity: this.options.overlay.opacity,
          // @todo @sam0delkin, maybe we should copy some other css styles?
          'border-radius': this.$element.css('border-radius')
        });

        this.$element.append(overlay);
        overlay[this.options.animation.show.type](this.options.animation.show.length);
      }

      this.$element.append(throbber);
      throbber[this.options.animation.show.type](this.options.animation.show.length);
    }
  };

  /**
   * Hide throbber from element
   */
  Throbber.prototype.hide = function () {
    var instance = this;

    if (!this.throbber) {
      return;
    }

    this.throbber[this.options.animation.hide.type](this.options.animation.hide.length, function () {
      instance.throbber.remove();
      instance.throbber = null;
    });

    if (this.overlay.is(':visible')) {
      this.overlay[this.options.animation.hide.type](this.options.animation.hide.length, function () {
        instance.overlay.remove();
        instance.overlay = null;
      });
    } else {
      instance.overlay.remove();
      instance.overlay = null;
    }
  };

  /**
   * Plugin constructor
   *
   * @param param
   * @returns {jQuery}
   */
  $.fn.throbber = function (param) {
    var instance;

    this.each(function () {
      instance = $.data(this, 'throbber');

      if (!instance) {
        if (param === 'hide' || param === 'destroy') {
          return;
        }
        // Create the plugin instance
        instance = new Throbber(this, typeof param === 'object' ? param : {});
        $.data(this, 'throbber', instance);
      }
      try {
        if (param === 'destroy') {
          instance.hide();
          $.data(this, 'throbber', null);

          return this;
        }

        instance[param]();
      } catch (e) {
      }

    });

    return this;
  };
  /**
   * Helper method to wrap jQuery.get, jQuery.post, jQuery.ajax with throbber
   *
   * @param originalName
   * @returns {jQuery}
   */
  function ajaxThrobber(originalName) {

    var originalArguments = $.merge([], arguments).slice(1);
    if (originalArguments.length == 0) {
      return this;
    }
    var element = this;
    element.throbber("show");
    var jqAjax = $[originalName].apply(window, originalArguments);
    jqAjax.always(function () {
      element.throbber("hide");
    });

    return jqAjax;
  }

  //jQuery AJAX wrapper methods
  $.fn.thGet = function(){
    return ajaxThrobber.apply(this, $.merge(['get'], arguments));
  };
  $.fn.thPost = function(){
    return ajaxThrobber.apply(this, $.merge(['post'], arguments));
  };
  $.fn.thAjax = function(){
    return ajaxThrobber.apply(this, $.merge(['ajax'], arguments));
  };

  // add throbber to fullscreen
  $.throbber = function (param) {
    if (typeof  param == 'string') {
      $('body').throbber({position: 'fullscreen'}).throbber(param);
    } else {
      $('body').throbber($.extend({}, param, {position: 'fullscreen'}));
    }
  }
})(jQuery);