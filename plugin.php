<?php
/**
 * Plugin Name:       HM Jumplinks Navigation
 * Description:       Named in-page anchor points and an auto-generated navigation list of them.
 * Version:           0.1.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Human Made
 * License:           GPL-2.0-or-later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       hm-jumplinks-navigation
 *
 * @package hm-jumplinks-navigation
 */

namespace HM\JumplinksNavigation;

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
	die;
}

const PLUGIN_VERSION = '0.1.0';
const PLUGIN_PATH    = __DIR__;

require_once __DIR__ . '/inc/namespace.php';
require_once __DIR__ . '/inc/anchors.php';

bootstrap();
