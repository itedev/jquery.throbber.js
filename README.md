# jquery.throbber.js
Simple jQuery AJAX throbber implementation

# Usage

```javascript
(function($){
  $(document).ready(function(){
    $("#selector").throbber("show"); // will display standard throbber with overlay and circle spinner
    $("#selector").throbber("hide"); // will hide throbber
  });
})(jQuery);
```

Options
-------

```javascript
(function($){
  $(document).ready(function(){
    // all vailable options:
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
    
    // for apply options, you can use this syntax:
    $('#selector').throbber({
      position: "left-top"
    }).throbber("show");
    
  });
})(jQuery);

```

Fullscreen throbber
-------------------

If you need to bind throbber to full screen, you need to use this syntax:

```javascript
(function($){
  $(document).ready(function(){
    $.throbber("show");
    
    // of course, you can use options:
    $.throbber({image: "horizontal"}).throbber("show");
  });
})(jQuery);
```

jQuery AJAX function mappings
-----------------------------

For easier using, there are 3 functions was implemented to be a proxy for jQuery ajax functions:

* jQuery.thGet (as alias to `jQuery.get`)
* jQuery.thPost (as alias to `jQuery.post`)
* jQuery.thAjax (as alias to `jQuery.ajax`) 

So, when you are using this functions, it's yntax is fully like standard, except that function is binding to Selector. 
Throbber will be applied before AJAX call and removed right after (`jqAJAX.always` callback is used internally)

Here is the example os usage:

```javascript
$('#selector').thGet('http://github.com', {}, function () {
  // this is the success handler of AJAX resquest. 
  // right before AJAX call, throbber will be displayed on '#selector' element
  // and right after AJAX request completes (either if there is the error), throbber will be removed from the element
}, 'json');
```
