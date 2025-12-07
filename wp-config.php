<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress_develop' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'password' );

/** Database hostname */
define( 'DB_HOST', 'mysql' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          '+Bh7Q@X0|8Cq X[c2#yfFe2f+uV0E+V4k0hI~_2tr(S/#O[E9}|)_ZLd)YKo+}(6' );
define( 'SECURE_AUTH_KEY',   'WztIQ}x^)5J`}3Epv;Ku]uw}vU%s_RVoy^,EDD#56}bIS}cYmijLtq*O-[gEC,,t' );
define( 'LOGGED_IN_KEY',     '-P)KS.W_g ^we>X|@oEiqau|/G:(a:ywUeN}RuKr#q~&Jy$wO>Ls;v[RA$Dj(oP@' );
define( 'NONCE_KEY',         'FJRD6U(WSu=%;<M_f(3V`j,1;/x *eK=MVX-&atr!I8~bt.{>*SUuDtx@7i=np:#' );
define( 'AUTH_SALT',         'XlxH!] D`/7]=Jz@hu`5Je6oY e+wnz0.2u-SPd}GIp?nmC9+l1VGlGc!uBj/AtX' );
define( 'SECURE_AUTH_SALT',  'k{#xD,0)|5CZJgH&]WqVOIQf,stc/}OC7U uC`$D`SZzDY=KtvBEt?IL%9$ME]V_' );
define( 'LOGGED_IN_SALT',    'q(GXFN$F*r07q[^~T,Q^5WeRvpn#<UsH#^k>40<K|Db_X)w@NERhs4Yb1KALWP;<' );
define( 'NONCE_SALT',        '<8=5^1$)Iw.M1wyX::.(b=K>jBa]7htNEkb`3yo^>Nm.=^nqp 1$O!Fa(9/RETZL' );
define( 'WP_CACHE_KEY_SALT', 'qkYic F+D,4,B8-@xU~fxPm!R!,(Q:mcOp98EM /Zfu0S>L03Z,3*WA[(T|1b5}O' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', true );
}

define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', true );
define( 'SCRIPT_DEBUG', true );
define( 'WP_ENVIRONMENT_TYPE', 'local' );
define( 'WP_DEVELOPMENT_MODE', 'core' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
