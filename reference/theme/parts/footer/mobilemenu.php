<nav class="mobile-menu">
	<div class="close"></div>
	<?php
		wp_nav_menu(array('theme_location' => 'mobile-menu'));
		
		/*
	?>
	<form role="search" method="get" class="mobile-menu-search" action="<?php echo home_url('/'); ?>">
		<input name="post-type" type="hidden" value="product" />
		<label class="mobile-menu-search-label" for="s"><span class="mobile-menu-search-label-text">Search</span></label>
		<input id="s" class="mobile-menu-search-field" type="search" placeholder="Search..." value="<?php echo get_search_query() ?>" name="s" aria-label="Search field" title="Search field" required />
		<input class="mobile-menu-search-button white solid button" type="submit" value="Search" />
	</form>
	<?php
		*/
	?>
</nav>