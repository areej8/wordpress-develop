<?php
/**
 * My First WordPress Test in Docker
 */
class MyFirstTest extends WP_UnitTestCase {
    
    public function setUp(): void {
        parent::setUp();
        // Set up test data
        $this->user_id = $this->factory->user->create([
            'user_login' => 'testuser',
            'user_email' => 'test@example.com',
            'role' => 'administrator'
        ]);
    }
    
    public function test_user_creation() {
        $user = get_user_by('id', $this->user_id);
        $this->assertInstanceOf('WP_User', $user);
        $this->assertEquals('test@example.com', $user->user_email);
        $this->assertTrue(user_can($user, 'manage_options'));
    }
    
    public function test_post_creation() {
        $post_id = $this->factory->post->create([
            'post_title' => 'Test Post',
            'post_content' => 'This is test content',
            'post_status' => 'publish',
            'post_author' => $this->user_id
        ]);
        
        $this->assertIsInt($post_id);
        $this->assertGreaterThan(0, $post_id);
        
        $post = get_post($post_id);
        $this->assertEquals('Test Post', $post->post_title);
        $this->assertEquals('publish', $post->post_status);
    }
    
    public function test_option_management() {
        $test_value = 'test_option_value';
        update_option('my_test_option', $test_value);
        
        $retrieved = get_option('my_test_option');
        $this->assertEquals($test_value, $retrieved);
        
        delete_option('my_test_option');
        $this->assertFalse(get_option('my_test_option'));
    }
    
    public function test_database_connection() {
        global $wpdb;
        $result = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->users}");
        $this->assertIsNumeric($result);
        $this->assertGreaterThanOrEqual(1, $result);
    }
    
    public function test_wordpress_functions() {
        $this->assertTrue(function_exists('add_action'));
        $this->assertTrue(function_exists('wp_insert_post'));
        $this->assertTrue(function_exists('get_option'));
        $this->assertTrue(function_exists('wp_create_user'));
    }
}
