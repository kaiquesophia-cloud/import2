<?php
// Andaimaq – desempenho do site
// 1) Desliga o script de emojis do WordPress (não é usado no site).
// 2) Carrega o Contact Form 7 só onde existe formulário: página de contato e páginas de região (aluguel-de-andaime-...).
// Para desfazer: desative este snippet no WPCode.

add_action( 'init', function () {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
} );

function andaimaq_pagina_tem_formulario() {
	if ( is_admin() ) {
		return true;
	}
	if ( is_page( 'contato' ) ) {
		return true;
	}
	$post = get_queried_object();
	return ( $post instanceof WP_Post && 'page' === $post->post_type && 0 === strpos( $post->post_name, 'aluguel-de-andaime-' ) );
}

add_filter( 'wpcf7_load_js', function ( $load ) {
	return andaimaq_pagina_tem_formulario() ? $load : false;
} );

add_filter( 'wpcf7_load_css', function ( $load ) {
	return andaimaq_pagina_tem_formulario() ? $load : false;
} );
