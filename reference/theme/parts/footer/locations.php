<?php
if( have_rows('footer_locations', 'options') ){
	echo '<div class="footer-bottom">
		<div class="container">
			<div class="footer-locations">';
				while( have_rows('footer_locations', 'options') ){
					the_row();
					$post_id = get_sub_field('footer_location');
					$link = get_permalink( $post_id );
					$title = get_the_title( $post_id );
					$address = get_field('location_address', $post_id);
					
					echo '<div class="footer-location">';
						echo '<h3 class="footer-location-title"><a href="' . $link . '" class="footer-location-title-link">' . $title . '</a>';
							if( in_array($post_id, array(4932, 4930, 5614, 6511)) ){
								echo '*';
							}
						echo '</h3>';
						echo '<address class="footer-location-address">' . $address . '</address>';
					echo '</div>';
				}
			echo '</div>
		</div>
	</div>';
}