<?php
$tdir = get_template_directory_uri();
$post_id = get_the_ID();


// Additional styles
echo '<style>@media only screen{';

	// Page banner graphic
	$page_banner_graphic = get_field('page_banner_graphic', 'options');
	if( $page_banner_graphic ){
		echo '.page-banner-figure:after	{
			background-image: url(' . $page_banner_graphic . ');
		}';
	}

	// Page background
	$page_bg = get_field('page_background_graphic', $post_id);
	if( $page_bg ){
		echo 'main {
			background-image: url(' . $page_bg . ');
			background-position: 50% 5%;
			background-repeat: no-repeat;
			background-size: 100% auto;
		}
			
		.content-block	{
			background-color: transparent;
		}';
	}
echo '}</style>';


// Single Post
if( is_single() ){
	$post_id = get_queried_object_id();
	$gallery = get_field( 'slideshow_gallery', $post_id );
	if( $gallery ){
?>
		<script>
			jQuery(function($){
				jQuery(".single-post-slideshow-container").slick({
					adaptiveHeight: true, 
					fade: true, 
					infinite: true, 
					slide: '.single-post-slideshow-slide', 
					slidesToShow: 1, 
					slidesToScroll: 1, 
					swipe: false
				});
			});
		</script>
<?php
	}
}


// Careers page
if( is_page('3267') ){
?>
	<script defer="defer" src="https://boards.greenhouse.io/embed/job_board/js?for=ndhcpa"></script>
<?php
}


// Content Block Carousel
if( have_rows('content_blocks') ){
?>
	<script>
		jQuery(function($){
			<?php
				$c = 1;
				while( have_rows('content_blocks') ){
					the_row();
					$columns = get_sub_field('content_block_columns');
					$autoplay = get_sub_field('content_block_carousel_autoplay');
					$infinite = get_sub_field('content_block_carousel_infinite');
					$adaptiveHeight = get_sub_field('content_block_carousel_adaptiveHeight');
					$show = get_sub_field('content_block_carousel_slides_show');
					$scroll = get_sub_field('content_block_carousel_slides_scroll');
					
					if( $columns == 'carousel' ){
						?>
							jQuery("#content-block-carousel-<?php echo $c; ?>").slick({
								infinite: false, 
								slide: '.content-block-carousel-item', 
								<?php
									if( $autoplay ){
										echo 'autoplay: ' . $autoplay . ', ';
									}else{
										echo 'autoplay: false, ';
									}

									if( $infinite ){
										echo 'infinite: ' . $infinite . ', ';
									}else{
										echo 'infinite: true, ';
									}

									if( $adaptiveHeight ){
										echo 'adaptiveHeight: ' . $adaptiveHeight . ', ';
									}else{
										echo 'adaptiveHeight: false, ';
									}

									if( $show ){
										echo 'slidesToShow: ' . $show . ', ';
									}

									if( $scroll ){
										echo 'slidesToScroll: ' . $scroll . ', ';
									}
								?>
								responsive: [
									<?php
										if( $show > 3 ){
									?>
											{
												breakpoint: 1024,
												settings: {
													slidesToShow: 3,
													slidesToScroll: 1,
												}
											},
									<?php
										}
									?>
									{
										breakpoint: 600,
										settings: {
											slidesToShow: 2,
											slidesToScroll: 1
										}
									},{
										breakpoint: 480,
										settings: {
											slidesToShow: 1,
											slidesToScroll: 1
										}
									}
								]
							});
						<?php
					}

					$c++;
				}
			?>
		});
	</script>				
<?php
}
?>

