<?php
/* Template Name: Services */
get_header();

get_template_part( 'parts/page-banner' );
get_template_part( 'parts/content', 'blocks' );
get_template_part( 'pages/services/services' );
get_template_part( 'pages/services/members' );
?>
<style>@media only screen{<?php include('wp-content/themes/ndhcpawp/assets/css/pages/services.css'); ?>}</style>
<?php
get_footer();