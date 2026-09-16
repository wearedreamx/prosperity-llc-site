<?php
$title = get_field('services_heading');
if( have_rows('services_personnel') ){
    echo '<section class="services-team">';
        echo '<div class="container">';
            if( $title ){
                echo '<h2 class="services-team-title">' . $title . '</h2>';
            }
            echo '<div class="services-team-container">';
                while( have_rows('services_personnel') ){
                    the_row();
                    $member_id = get_sub_field('services_team_member');
                    $link = get_the_permalink($member_id);
                    $name = get_the_title($member_id);
                    $member_title = get_field( 'personnel_title', $member_id );
                    $image = get_the_post_thumbnail_url($member_id);
                    $member_location = get_field('personnel_location', $member_id);

                    echo '<div class="content-block-sidebar-member"><a href="' . $link . '" class="content-block-sidebar-member-link">';
                                        
                        if( $image ){
                            echo '<figure class="content-block-sidebar-member-figure">
                                <img class="content-block-sidebar-member-image" src="' . $image . '" alt="' . $name . '" />
                            </figure>';
                        }
                                            
                        echo '<h3 class="content-block-sidebar-member-name">' . $name . '</h3>';

                        if( $member_title ){
                            echo '<h3 class="content-block-sidebar-member-title">';
                                if( $member_title == 'partners' ){
                                    echo 'Partner';
                                }elseif( $member_title == 'managers' ){
                                    echo 'Manager';
                                }elseif( $member_title == 'directors' ){
                                    echo 'Director';
                                }elseif( $member_title == 'associates' ){
                                    echo 'Associate';
                                }elseif( $member_title == 'senior-manager' ){
                                    echo 'Senior Manager';
                                }
                            echo '</h3>';
                        }

                        if( $member_location ){
                            if( is_array( $member_location ) ){
                                echo '<h4 class="content-block-sidebar-member-location">';
                                    $i = 0;
                                    foreach( $member_location as $loc ){
                                        $location_id = $loc;
                                        $loc_name = get_the_title( $location_id );
                                        $loc_link = get_permalink( $location_id );
                                
                                        if( $i > 0 ){
                                            echo ', ';
                                        }
                                        
                                        echo $loc_name;
                                        $i++;
                                    }
                                echo '</h4>';
                            }else{
                                $location_name = get_the_title( $member_location );
                        
                                echo '<h4 class="content-block-sidebar-member-location">' . $location_name . '</h4>';
                            }
                        }
                    echo '</a></div>';
                }
            echo '</div>';
        echo '</div>';
    echo '</section>';
    wp_reset_postdata();
}