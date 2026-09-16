<?php
get_header();

$curauth = (get_query_var('author_name')) ? get_user_by('slug', get_query_var('author_name')) : get_userdata(get_query_var('author'));

// name fields
$firstname = $curauth->first_name;
$lastname = $curauth->last_name;
$name = $firstname . ' ' . $lastname;

$author_id = 'user_' . $curauth->ID;
// $author_image = get_field( 'author_profile_image', $author_id );
?>

	<section class="page-banner">
		<div class="page-banner-container container">
			<h1 class="page-banner-title"><?php echo $name; ?></h1>
			<?php
				// Category description
				$category_description = category_description();
				if ( ! empty( $category_description ) ){
					echo '<div class="page-banner-content">' . $category_description . '</div>';
				}
			?>
		</div>
	</section>
	<section class="page-container">
		<div class="posts-container container">
			<?php
				if( have_posts() ){
					echo '<div class="posts">';
						while( have_posts() ){
							the_post();
							get_template_part( 'parts/content' );
						}
					
						if( function_exists('wp_paginate') ){
							wp_paginate();
						}
					echo '</div>';
				}else{
					get_template_part( 'parts/content', 'none' );
				}
				
				get_sidebar();
			?>
		</div>
	</section>

<?php
get_footer();