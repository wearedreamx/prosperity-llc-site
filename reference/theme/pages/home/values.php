<?php
$section_title = get_field('home_values_title');
if( have_rows('home_values') ){
	echo '<section class="home-values"><div class="container">';
		if( $section_title ){
			echo '<h2 class="home-values-title">' . $section_title . '</h2>';
		}
		
		echo '<div class="home-values-container">';
			while( have_rows('home_values') ){
				the_row();
				$title = get_sub_field('home_value_title');
				$content = get_sub_field('home_value_content');
				$icon = get_sub_field('home_value_icon');
				
				echo '<article class="home-value">';
					if( $icon ){
						echo '<figure class="home-value-figure animate-in fade-in">
							<img src="' . $icon['url'] . '" alt="' . $icon['alt'] . '" class="home-value-icon" />
						</figure>';
					}
					
					echo '<div class="home-value-content">';
						if( $title ){
							echo '<h3 class="home-value-content-title animate-in fade-up">' . $title . '</h3>';
						}
						
						if( $content ){
							echo '<div class="content animate-in fade-up">' . $content . '</div>';
						}
					echo '</div>';
				echo '</article>';
			}
		echo '</div>';
	echo '</div></section>';
}