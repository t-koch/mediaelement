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
						sourceType = src.type.split('/')[1]
						relatedSourceChooserElement = player.sourcechooserButton.find('#'+player.id+'_sourcechooser_'+src.title+sourceType);
						var foundHeight = false;
						for(j=0; j<player.adaptiveSources.length; j++) {
						  if(player.adaptiveSources[j].height == sourceHeight)
						  {
						    player.adaptiveSources[j].srcs.push({src:src.src, type:sourceType, el:relatedSourceChooserElement});
						    foundHeight = true;
						    break;
						  }
						}
						if(!foundHeight)
						  player.adaptiveSources.push( { height:sourceHeight, srcs: new Array({src:src.src, type:sourceType, el:relatedSourceChooserElement}) } );
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
				// The media element doesn't know MimeTypes, but the file extension should be the same
				currentType = media.currentSrc.split('.').pop()
				// Not enough adaptive sources, or not initialized?
				if ( (player.adaptiveSources.length < 2) || (h <= 0) ) return;
				for (i=0; i<player.adaptiveSources.length-1; i++) {
					if (h < ( ( parseInt(player.adaptiveSources[i].height, 10) + parseInt(player.adaptiveSources[i+1].height, 10) ) / 2 ) ) {
						for (j=0; j<player.adaptiveSources[i].srcs.length; j++)
						  if ( player.adaptiveSources[i].srcs[j].type == currentType )
						    return player.adaptiveSources[i].srcs[j].el.click();
						// Didn't find MimeType in this resolution, so use another playable file
						return player.adaptiveSources[i].srcs[0].el.click();
					}
				}
				// Change to the best quality if nothing else fits
				for (j=0; j<player.adaptiveSources[player.adaptiveSources.length-1].srcs.length; j++)
				  if ( player.adaptiveSources[i].srcs[j].type == currentType )
				    return player.adaptiveSources[i].srcs[j].el.click();
				// Didn't find MimeType in this resolution, so use another playable file
				return player.adaptiveSources[player.adaptiveSources.length-1].srcs[0].el.click();
				});
		}
	});

})(mejs.$);
