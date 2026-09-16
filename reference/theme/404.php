<?php
/* Template for 404 page */
get_header();
?>
	<section class="page-banner">
		<div class="page-banner-container container">
			<h1 class="page-banner-title"><?php _e( 'Oops! That page can&rsquo;t be found.' ); ?></h1>
		</div>
	</section>
	<div class="content-container">
		<div class="container">
			<div class="content">
				<p><?php _e( 'It looks like nothing was found at this location. Try going back to the <a href="/">homepage</a>' ); ?></p>
				<?php // get_search_form(); ?>
			</div>
		</div>
	</div>
			
<?php
get_footer();