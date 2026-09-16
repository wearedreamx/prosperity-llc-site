<?php
$logo_white = get_field('site_logo_white', 'option');
$logo_black = get_field('site_logo_black', 'option');
$logo = $logo_black;
?>
<div class="header-logo">
	<a class="header-logo-link" href="/" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>"><img class="header-logo-image" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" src="<?php echo esc_url( $logo['url'] ); ?>" /></a>
</div>