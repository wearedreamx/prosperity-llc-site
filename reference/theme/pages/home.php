<?php
/* Template Name: Homepage */
get_header();

get_template_part('pages/home/banner');
get_template_part('pages/home/content');
get_template_part('pages/home/values');
get_template_part('pages/home/achievements');
get_template_part('pages/home/posts-culture');
get_template_part('pages/home/posts-whatsnew');
?>
	<style>
		@media only screen{<?php include('wp-content/themes/ndhcpawp/assets/css/pages/homepage.css'); ?>}
	</style>
<?php
get_footer();