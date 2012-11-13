/* - 2012 - @bulgrz @kappuccinoweb
 */
var karou = {
    settings: {
        $karou : $('#caroucontainer'), // default
        $papa : {}, // parent direct de $karou
        $navbar : {}, // ref barre de nav

        elCount : 0, // nb d'elements
        carouW : 0, // width du carou
        current : 0, // elem courant
        navBtnW : 16, // width des puces nav

        hasNav : true, // afficher les puces de nav
        hasPrevNext : false // afficher precedent/suivant
    },

    $k : {}, // shortcut de settings.$karou
    $n : {}, // shortcut de navbar
    loaded : {}, // index des imgs chargées par l'ajax

    init: function(settings, elem) {

        var $this = this; // sauver l'instance du plugin

        // remplacer les options par les paramètres user
        this.settings = $.extend({}, this.settings, settings);

        this.settings.$karou= $(elem);
        this.$k				= $(elem);
        this.settings.$papa	= $(elem).parent();

        this.settings.elCount 	= this.$k.find('.karouel').length;
        this.settings.carouW 	= this.$k.find('.karouel').width();

        this.addNav();
        this.addPrevNext();

        if (this.settings.autoplay > 0) this.autoPlay();
    },

    /* Charge une image avec un ajax
     *
     * Appelle this.loadCallback au .load().
     * Le callback est overwrite a chaque appel ajax
     * pour éviter une queue d'events
     */
    ajaxLoader : function(elem) {

        if (elem.attr('src') == "#") {
            var img = $('<img src="'+ elem.attr('data-source') +'" class="'+ elem.attr('class') +'"/>');

            img.load($.proxy(function() {

                myIndex = this.$k.children('.karouel').index(elem);
                this.loaded[myIndex] = true;
                this.settings.current = myIndex - 1;
                elem.attr('src', img.attr('src'));

                // Set timeout pour laisser le temps a l'elem de se faire replace

                if (typeof this.loaderCallback !== "undefined") {
                    //this.loaderCallback.call(this.loaderCallbackParams);
                    this[this.loaderCallback](this.loaderCallbackParams);

                    delete this.loaderCallback;
                    delete this.loaderCallbackParams;
                }

            }, this ));
        }

    },

    addNav : function() {

        if (!this.settings.hasNav) return false;

        // ajouter l'elem de nav
        var carounav = $('<div class="carounav clearfix" />').insertAfter(this.settings.$papa);
        $('<br style="clear:both;"/>').insertBefore(carounav);

        // Binder les puces
        for (var i=0; i < this.settings.elCount; i++) {
            if (i === 0) {
                var nav = $('<div class="navon karoupuce" data-goto="'+i+'" />').appendTo(carounav);
            } else {
                var nav = $('<div class="navoff karoupuce" data-goto="'+i+'" />').appendTo(carounav);
            }

            this.settings.$navbar = carounav;
            this.$n = carounav;

            // event proxy pour garder le scope de l'instance
            nav.on('click', $.proxy(function(e) {
                var to = $(e.target).attr('data-goto'); // récupère le $(this) de l'event
                this.animateTo(to);
            }, this));
        };

        // centrer les puces
        this.centerNav();
    },

    isLoaded : function(i) {

        if (this.$k.children('.karouel').eq(i).attr('src') != "#") {
            return true;
        }

        return false;
    },

    /* autoplay carou
     *  timing : valeur this.settings.autoplay
     */
    autoPlay : function() {

        setTimeout($.proxy(function() {

            this.animateTo(this.settings.current + 1);
            this.autoPlay(); // recurse
        }, this ), this.settings.autoplay);
    },

    addPrevNext: function() {
        if (!this.settings.hasPrevNext) return false;

        // ajouter l'elem de prevnext
        var carouprev = $('<div class="carounav clearfix" />').appendTo(this.settings.$papa);

        var prev = $('<div class="navprev" data-goto="prev" />').appendTo(carouprev);
        var next = $('<div class="navnext" data-goto="next" />').appendTo(carouprev);

        prev.on('click', $.proxy(function() {
            this.animateTo(this.settings.current - 1);
        }, this));

        next.on('click', $.proxy(function() {
            this.animateTo(this.settings.current + 1);
        }, this));
    },

    animateTo : function(to) {

        console.log('entering animate', to)
        if (to > (this.settings.elCount - 1) || to < 0) to = 0;

        // Si l'image suivante n'est pas chargée
        if (!this.isLoaded(to)) {
            this.loaderCallback = "animateTo"
            this.loaderCallbackParams = to;
            this.ajaxLoader(this.$k.children('.karouel').eq(to));

            // Sinon animation
        } else {

            // slide
            if (this.settings.animation == '') {

                var left = ((to * this.settings.carouW) * -1);
                this.$k.animate({
                    'left' : left+'px'
                }, 218);
            }

            // fade
            if (this.settings.animation == 'fade') {

                var $from   = this.$k.children('.karouel').eq(this.settings.current);
                var $to     = this.$k.children('.karouel').eq(to);

                this.$k.children('.karouel').not($from).css('opacity', '0');

                $from.stop().animate({
                    'opacity' : 0,
                    'queue' : false
                }, 500);

                $to.stop().animate({
                    'opacity' : 1,
                    'queue' : false
                }, 500);
            }
        }

        this.settings.current = to;
        this.updateNav();
    },

    updateNav: function() {
        if (!this.settings.hasNav) return false;

        this.$n.find('.karoupuce').removeClass('navon').addClass('navoff');
        this.$n.find('.karoupuce[data-goto="'+this.settings.current+'"]').addClass('navon');
    },

    centerNav: function() {

        totalNavW 	= this.settings.elCount * this.settings.navBtnW;
        spaceLeft 	= this.settings.$navbar.width() - totalNavW;
        margin		= Math.round(spaceLeft/2);
        this.$n.find('.karoupuce[data-goto="0"]').css('margin-left', margin+'px');

    }
}


if ( typeof Object.create !== 'function') {
    Object.create = function(o) {
        function F() {};
        F.prototype = o;
        return new F();
    };
}


(function($) {
    $.fn.karou = function(options) {
        if (this.length) {
            return this.each(function() {
                var mykarou = Object.create(karou);
                mykarou.init(options, this);
                $.data(this, 'karou', mykarou);
            });
        }
    };
})(jQuery);