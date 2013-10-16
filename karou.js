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
		navBtnW : 28, // width des puces nav
		duration : 500, // duration autoplay
		interval: 0, // Intervant dans le autoplau

		hasNav : true, // afficher les puces de nav
		hasPrevNext : false, // afficher precedent/suivant
		autoplay: false,

		animation : 'slide', // default animation
		keyboard  : false // keyboard slide
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

		this.$els				= $(elem).find('.karouel');
		this.settings.elCount 	= this.$k.find('.karouel').length;
		this.settings.carouW 	= this.$k.find('.karouel').width();

		this.addNav();
		this.addPrevNext();

		this.autoplay();

		if (this.settings.keyboard) this.bindKeypress();

		if(this.settings.animation == 'fade'){
			$this.$els.css('opacity', 0);
			$this.$els.eq(0).css('opacity', 1);
		}
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
				this.slideTo(to);
			}, this));
		};

		// centrer les puces
		this.centerNav();
	},

	bindKeypress: function() {

		$(document).on('keyup', $.proxy(function(e) {
			if (e.keyCode == 37) {
				this.animateTo(this.settings.current - 1);
			}
			if (e.keyCode == 39) {
				this.animateTo(this.settings.current + 1);
			}
		}, this ));
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

		switch(this.settings.animation) {
			case 'slide' :
				this.slideTo(to);
				break;
			case 'fade' :
				this.fadeTo(to);
				break;
			default:
				this.slideTo(to);
		}

	},

	slideTo: function(to) {
		if (to > (this.settings.elCount - 1) || to < 0) return false;

		var left = ((to * this.settings.carouW) * -1);
		this.settings.$karou.animate({
			'left' : left+'px'
		}, 500);

		this.settings.current = to;
		this.updateNav();
	},

	fadeTo: function(to) {

		if (this.settings.current < this.settings.elCount-1) {
			this.settings.current += 1;
		} else {
			this.settings.current = 0;
		}

		this.$randel = this.$els.eq(this.settings.current);

		//this.settings.current += 1;

		this.$randel.animate({
			'opacity' : 1
		}, { duration : this.settings.duration, queue : false });

		this.$k.find('.karouel').not(this.$randel).animate({
			'opacity' : 0
		}, { duration : this.settings.duration, queue : false });

	},

	updateNav: function() {
		if (!this.settings.hasNav) return false;

		this.$n.find('.karoupuce').removeClass('navon').addClass('navoff');
		this.$n.find('.karoupuce[data-goto="'+this.settings.current+'"]').addClass('navon')
	},

	centerNav: function() {

		this.settings.navBtnW = $('.karoupuce').outerWidth();
		totalNavW 	= this.settings.elCount * this.settings.navBtnW;
		spaceLeft 	= this.settings.$navbar.width() - totalNavW;
		margin		= Math.round(spaceLeft/2);
		this.$n.find('.karoupuce[data-goto="0"]').css('margin-left', margin+'px');

	},

	autoplay : function() {

		if (!this.settings.autoplay) return;

		this.settings.autoplay = setInterval($.proxy(function() {

			if (this.settings.current < this.settings.elCount-1) {
				this.animateTo(this.settings.current + 1);
			} else {
				this.animateTo(0);
			}

		}, this), this.settings.interval)
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