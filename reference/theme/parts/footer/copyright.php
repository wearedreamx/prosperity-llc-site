<?php
$copyright = get_field('footer_copyright', 'option');
if( $copyright ){
    echo '<div class="footer-copyright"><div class="footer-copyright-content">';
        echo $copyright . '</div>';
    echo '</div>';
}