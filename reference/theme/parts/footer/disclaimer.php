<?php
$disclaimer = get_field('footer_disclaimer', 'option');
if( $disclaimer ){
    echo '<div class="footer-disclaimer container">
        <div class="footer-disclaimer-content">';
            echo $disclaimer;
        echo '</div>';
    echo '</div>';
}