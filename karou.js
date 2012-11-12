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

    addNav: function() {

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

    animateTo: function(to) {

        // slide
        if (this.settings.animation == '') {
            if (to > (this.settings.elCount - 1) || to < 0) to = 0;
            var left = ((to * this.settings.carouW) * -1);
            this.$k.animate({
                'left' : left+'px'
            }, 218);
        }

        // fade
        if (this.settings.animation == 'fade') {
            if (to > (this.settings.elCount - 1) || to < 0) to = 0;

            var $from   = this.$k.children('.karouel').eq(this.settings.current);
            var $to     = this.$k.children('.karouel').eq(to);

            this.$k.children('.karouel').not($from).hide();
            $to.css({
                'display' : 'block',
                'display' : 'block'
            })

            $from.animate({
                'opacity' : 0,
                'queue' : false
            }, 218);

            $to.animate({
                'opacity' : 1,
                'queue' : false
            }, 218);
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