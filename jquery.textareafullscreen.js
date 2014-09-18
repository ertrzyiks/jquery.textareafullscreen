/*

 jQuery Textarea Fullscreen Editor v1.0
 Fullscreen text editor plugin for jQuery.

 :For more details visit http://github.com/CreoArt/jquery.textareafullscreen

 - CreoArt <support@creoart.org>
 - http://github.com/CreoArt

 Licensed under Apache - https://raw.githubusercontent.com/CreoArt/jquery.textareafullscreen/master/LICENSE

 */
(function($) {
    "use strict";

    function isFullscreen() {
        return $('.tx-editor-overlay').length > 0;
    }

    function FullscreenTextarea(el, opts) {
        var method,
            i;

        this.$el = $(el);

        this.settings = {
            overlay: true,
            maxWidth: '',
            maxHeight: '',
            getTopOffset: function () {
                return 0;
            }
        };

        for( i = 0; i < this.bindMethods.length; i++) {
            method = this.bindMethods[i];
            this[method] = $.proxy(this, method);
        }

        this.init(opts);
    }

    FullscreenTextarea.prototype.bindMethods = ["onOverlayClick", "onIconClick", "onKeyUp", "onResize"];

    FullscreenTextarea.prototype.$el = null;

    FullscreenTextarea.prototype.$widget = null;

    FullscreenTextarea.prototype.$editor = null;

    FullscreenTextarea.prototype.$icon = null;

    FullscreenTextarea.prototype.init = function (opts) {
        var content;

        this.settings = $.extend(true, this.settings, opts);

        if (!this.$el.is('textarea')) {
            $.error(
                'Error initializing Textarea Fullscreen Editor Plugin. It can only work on <textarea> element.'
            );
            return;
        }

        content =
            '<div class="tx-editor-wrapper"><div class="tx-editor"><a href="#" class="tx-icon"></a></div></div>';
        this.$wrapper = $(content).insertAfter(this.$el);
        this.$editor = this.$wrapper.find('.tx-editor');
        this.$icon = this.$editor.find('.tx-icon');
        this.$editor.append(this.$el);

        this.$el.css({
            'width': '100%',
            'height': '100%',
            'resize': 'none'
        });

        //Fullscreen icon click event
        this.$icon.on('click.txeditor.icon', this.onIconClick);
    };

    FullscreenTextarea.prototype.showOverlay = function () {
        $('<div class="tx-editor-overlay" />').appendTo('body')
            .fadeTo(0, 1)
            .click(this.onOverlayClick);
        return this;
    };

    FullscreenTextarea.prototype.removeOverlay = function () {
        var $overlay = $('.tx-editor-overlay');
        if ($overlay.length) {
            $overlay.fadeTo(0, 0, function () {
                $(this).remove();
            });
        }
        return this;
    };

    FullscreenTextarea.prototype.expand = function () {
        var settings = this.settings,
            $editor = this.$editor;

        if (settings.maxWidth) {
            $editor.css('max-width', settings.maxWidth);
        }
        if (settings.maxHeight){
            $editor.css('max-height', settings.maxHeight);
        }

        if (settings.overlay) {
            this.showOverlay();
        }

        $editor.addClass('expanded');
        this.transitions();

        //Adjust editor size on resize
        $(window).on('resize.txeditor', this.onResize);

        // ESC = closes the fullscreen mode
        $(window).on("keyup.txeditor", this.onKeyUp);

        return this;
    };

    FullscreenTextarea.prototype.minimize = function () {
        var settings = this.settings,
            $editor = this.$editor;

        $(window).off('resize.txeditor', this.onResize);
        $(window).off('keyup.txeditor', this.onKeyUp);

        $editor.removeClass('expanded')
            .css({
                'max-width': 'none',
                'max-height': 'none'
            });

        this.transitions();

        if (settings.overlay) {
            this.removeOverlay();
        }

        return this;
    };

    FullscreenTextarea.prototype.destroy = function () {
        var $wrapper = this.$wrapper;

        this.removeOverlay();

        this.$el = this.$el.detach();
        this.$el.insertBefore($wrapper);
        $wrapper.remove();

        this.$wrapper = null;
        this.$icon = null;
        this.$editor = null;

        $(window).off('keyup.txeditor', this.onKeyUp)
            .off('resize.txeditor', this.onResize);

        return this;
    };

    FullscreenTextarea.prototype.onOverlayClick = function () {
        this.minimize();
    };

    FullscreenTextarea.prototype.onIconClick = function (e) {
        e.preventDefault();

        if (isFullscreen()) {
            this.minimize();
        } else {
            this.expand();
        }
    };

    FullscreenTextarea.prototype.onKeyUp = function (e) {
        if (e.keyCode === 27 && isFullscreen()) {
            this.minimize();
        }
    };

    FullscreenTextarea.prototype.onResize = function (e) {
        this.relocate();
    };

    FullscreenTextarea.prototype.relocate = function() {
        var $editor = this.$editor,
            settings = this.settings,
            topOffset = settings.getTopOffset(),
            yPos = topOffset + ($(window).height() - $editor.height() - topOffset) / 2,
            xPos = ($(window).width() - $editor.width()) / 2;

        $editor.css({
            'top': yPos,
            'left': xPos
        });
    };

    FullscreenTextarea.prototype.transitions = function () {
        var $el = this.$el,
            $editor = this.$editor;

        this.relocate();

        if (isFullscreen()) {
            $el.focus();
        } else {
            $el.focus();
            $editor.css('opacity', 1);
        }
    };

    $.fn.textareafullscreen = function(options) {
        return this.each(function () {
            var $this = $(this),
                fullscreenTextarea, args;

            if ("string" === typeof options) {
                fullscreenTextarea = $this.data('textareafullscreendata');

                if ("function" === typeof fullscreenTextarea[options]) {
                    args = Array.prototype.slice.call(arguments, 1);
                    return fullscreenTextarea[options].apply(fullscreenTextarea, args);
                } else {
                    $.error('Method ' + options +
                    ' does not exist on jQuery.textareafullscreen');
                }
            } else {
                $this.data('textareafullscreendata', new FullscreenTextarea(this, options));
            }
        });
    };
})(jQuery);
