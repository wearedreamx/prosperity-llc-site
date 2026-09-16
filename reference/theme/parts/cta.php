<?php
$content = get_field('cta_content', 'option');
$form = get_field('cta_form', 'option');

$remove_cta = get_field('remove_cta');
$remove_cta_value = $remove_cta[0];

if( is_page() ){
	if( $remove_cta_value != 'remove' ){
		if( $content ){
			echo '<section class="cta"><div class="cta-container container">';
				echo '<div class="cta-content">' . $content . '</div>';
	
				if( $form ){
					echo '<div class="cta-form">';
						$form_id = $form['id'];
						gravity_form( $form_id , false, false, false, '', true, 12 );
					echo '</div>';
				}
			echo '</div></section>';
		}
	}
}