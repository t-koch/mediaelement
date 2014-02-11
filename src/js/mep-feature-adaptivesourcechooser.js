// Adapt Media Source to Element Size
// Requires Sourcechooser and Fullscreen feature to be included __before__
// Currently <source> tags need the custom tag 'data-video-height'

(function($) {

    $.extend(MediaElementPlayer.prototype, {
		buildadaptivesourcechooser: function(player, controls, layers, media) {
			// Get all playable media sources (copied from sourcechooser), including the related select box
			player.adaptiveSources = new Array()
			for (i in media.children) {
				src = media.children[i];
				if (src.nodeName === 'SOURCE' && (media.canPlayType(src.type) == 'probably' || media.canPlayType(src.type) == 'maybe')) {
					//TODO Use media queries instead of the custom data-video-height attribute
					sourceHeight = $(src).attr('data-video-height')
					// Take only sources in account which use the custom tag
					if (sourceHeight) {
						relatedSourceChooserElement = player.sourcechooserButton.find('#'+player.id+'_sourcechooser_'+src.title+src.type.split('/')[1]);
						player.adaptiveSources.push({src:src.src, type:src.type, height:sourceHeight, el:relatedSourceChooserElement});
					}
				}
			}
			// Sort by video quality (=height)
			player.adaptiveSources = player.adaptiveSources.sort(function (a, b) {
				return (+a.height) > (+b.height);	// Implicit Typecast to Integer
			});
			// Delay Resize Event to get the right geometry.
			$(window).resize(function() {
				if(this.resizeTimeout) clearTimeout(this.resizeTimeout);
				this.resizeTimeout = setTimeout(function() {
					$(this).trigger('resized');
				}, 500);
			});
			// Trigger Resize Event when entering or leaving Fullscreen Mode
			player.fullscreenBtn.bind("click", function(){ $(window).trigger('resize'); });
			// Choose an appropriate source
			$(window).bind('resized ready', function() {
				// Check for 'media.clientHeight', 'media.height' may not be correct in fullscreen mode
				h = media.clientHeight
				// Not enough adaptive sources, or not initialized?
				if ( (player.adaptiveSources.length < 2) || (h <= 0) ) return;
				for (i=0; i<player.adaptiveSources.length-1; i++) {
					if (h < ( ( parseInt(player.adaptiveSources[i].height, 10) + parseInt(player.adaptiveSources[i+1].height, 10) ) / 2 ) ) {
						//TODO Also check for Mimetype
						return player.adaptiveSources[i].el.click();
					}
				}
				// Change to the best quality if nothing else fits
				return player.adaptiveSources[player.adaptiveSources.length-1].el.click();
				});
		}
	});

})(mejs.$);
