<?php
/**
 * Tests for WP_Http_Cookie class
 * 
 * @group http
 * @group cookie
 */
class Tests_WP_Http_Cookie extends WP_UnitTestCase {
    
    // ========================================
    // test() Method Tests
    // ========================================
    
    public function test_test_method_null_name_returns_false() {
        $cookie = new WP_Http_Cookie(array());
        $this->assertFalse($cookie->test('https://example.com/'));
    }
    
    public function test_test_method_expired_cookie_returns_false() {
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123',
            'expires' => time() - 3600
        ));
        $this->assertFalse($cookie->test('https://example.com/'));
    }
    
    public function test_test_method_valid_cookie_returns_true() {
        $cookie = new WP_Http_Cookie('session=abc123; Domain=example.com');
        $this->assertTrue($cookie->test('https://example.com/'));
    }
    
    public function test_test_method_domain_matching() {
        $cookie = new WP_Http_Cookie('session=abc123; Domain=example.com');
        $this->assertTrue($cookie->test('https://example.com/'));
        $this->assertFalse($cookie->test('https://wrong.com/'));
    }
    
    public function test_test_method_subdomain_matching() {
        $cookie = new WP_Http_Cookie('session=abc123; Domain=.example.com');
        $this->assertTrue($cookie->test('https://www.example.com/'));
        $this->assertTrue($cookie->test('https://sub.example.com/'));
    }
    
    public function test_test_method_path_matching() {
        $cookie = new WP_Http_Cookie('session=abc123; Domain=example.com; Path=/admin');
        $this->assertTrue($cookie->test('https://example.com/admin'));
        $this->assertTrue($cookie->test('https://example.com/admin/page'));
        $this->assertFalse($cookie->test('https://example.com/'));
    }
    
    public function test_test_method_port_matching() {
        $cookie = new WP_Http_Cookie('session=abc123; Domain=example.com; Port=8080');
        $this->assertTrue($cookie->test('https://example.com:8080/'));
        $this->assertFalse($cookie->test('https://example.com:80/'));
    }
    
    // ========================================
    // getFullHeader() Method Tests
    // ========================================
    
    public function test_get_full_header() {
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123'
        ));
        $this->assertEquals('Cookie: session=abc123', $cookie->getFullHeader());
    }
    
    public function test_get_full_header_empty() {
        $cookie = new WP_Http_Cookie(array('name' => 'session'));
        $this->assertEquals('Cookie: ', $cookie->getFullHeader());
    }
    
    // ========================================
    // Constructor Tests - FIXED
    // ========================================
    
    public function test_constructor_string_header() {
        $cookie = new WP_Http_Cookie('session=abc123; Path=/; Domain=example.com; Secure');
        
        // Debug to see actual properties
        // error_log("Cookie properties: " . print_r(get_object_vars($cookie), true));
        
        $this->assertEquals('session', $cookie->name);
        $this->assertEquals('abc123', $cookie->value);
        $this->assertEquals('/', $cookie->path);
        $this->assertEquals('example.com', $cookie->domain);
        
        // Secure is a boolean flag without value, so $this->secure should be set to empty string
        $this->assertEquals('', $cookie->secure, 'Secure flag should be empty string, not boolean true');
    }
    
    public function test_constructor_string_header_with_httponly() {
        $cookie = new WP_Http_Cookie('session=abc123; HttpOnly');
        $this->assertEquals('session', $cookie->name);
        $this->assertEquals('abc123', $cookie->value);
        $this->assertEquals('', $cookie->httponly, 'HttpOnly flag should be empty string');
    }
    
    public function test_constructor_array() {
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123',
            'path' => '/admin'
            // Note: 'secure' is not in the allowed fields list for array constructor
            // Only: 'name', 'value', 'path', 'domain', 'port', 'host_only'
        ));
        $this->assertEquals('session', $cookie->name);
        $this->assertEquals('abc123', $cookie->value);
        $this->assertEquals('/admin', $cookie->path);
        
        // 'secure' is not in the allowed fields for array constructor
        // So $cookie->secure should not exist or be null
        $this->assertObjectNotHasAttribute('secure', $cookie);
    }
    
    public function test_constructor_array_with_all_fields() {
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123',
            'path' => '/admin',
            'domain' => 'example.com',
            'port' => '8080',
            'host_only' => false,
            'expires' => time() + 3600
        ));
        
        $this->assertEquals('session', $cookie->name);
        $this->assertEquals('abc123', $cookie->value);
        $this->assertEquals('/admin', $cookie->path);
        $this->assertEquals('example.com', $cookie->domain);
        $this->assertEquals('8080', $cookie->port);
        $this->assertFalse($cookie->host_only);
        $this->assertNotNull($cookie->expires);
    }
    
    public function test_constructor_with_requested_url() {
        $cookie = new WP_Http_Cookie('session=abc123', 'https://example.com/admin/page');
        $this->assertEquals('example.com', $cookie->domain);
        $this->assertEquals('/admin/', $cookie->path); // Note trailing slash
    }
    
    public function test_constructor_with_empty_requested_url() {
        $cookie = new WP_Http_Cookie('session=abc123', '');
        $this->assertNull($cookie->domain);
        $this->assertEquals('/', $cookie->path);
    }
    
    public function test_constructor_with_urlencoded_value() {
        $cookie = new WP_Http_Cookie('session=value%20with%20spaces');
        $this->assertEquals('value with spaces', $cookie->value);
    }
    
    public function test_constructor_with_expires_string() {
        $expires_str = 'Tue, 31 Dec 2024 23:59:59 GMT';
        $cookie = new WP_Http_Cookie("session=abc123; Expires={$expires_str}");
        $this->assertEquals(strtotime($expires_str), $cookie->expires);
    }
    
    // ========================================
    // getHeaderValue() Method Tests
    // ========================================
    
    public function test_get_header_value_with_filter() {
        add_filter('wp_http_cookie_value', function($value, $name) {
            return "filtered_{$value}";
        }, 10, 2);
        
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123'
        ));
        $this->assertEquals('session=filtered_abc123', $cookie->getHeaderValue());
        
        remove_all_filters('wp_http_cookie_value');
    }
    
    // ========================================
    // get_attributes() Method Tests
    // ========================================
    
    public function test_get_attributes() {
        $expires = time() + 3600;
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123',
            'expires' => $expires,
            'path' => '/admin',
            'domain' => 'example.com'
        ));
        
        $attrs = $cookie->get_attributes();
        $this->assertEquals($expires, $attrs['expires']);
        $this->assertEquals('/admin', $attrs['path']);
        $this->assertEquals('example.com', $attrs['domain']);
    }
    
    public function test_get_attributes_with_null_values() {
        $cookie = new WP_Http_Cookie(array(
            'name' => 'session',
            'value' => 'abc123'
        ));
        
        $attrs = $cookie->get_attributes();
        $this->assertNull($attrs['expires']);
        $this->assertEquals('/', $attrs['path']); // Default path
        $this->assertNull($attrs['domain']);
    }
    
    // ========================================
    // Edge Cases
    // ========================================
    
    public function test_cookie_with_empty_name_value_pair() {
        $cookie = new WP_Http_Cookie('=value'); // Empty name
        $this->assertEquals('', $cookie->name);
        $this->assertEquals('value', $cookie->value);
    }
    
    public function test_cookie_with_only_equals_sign() {
        $cookie = new WP_Http_Cookie('=');
        $this->assertEquals('', $cookie->name);
        $this->assertEquals('', $cookie->value);
    }
    
    public function test_cookie_with_trailing_semicolon() {
        $cookie = new WP_Http_Cookie('session=abc123;');
        $this->assertEquals('session', $cookie->name);
        $this->assertEquals('abc123', $cookie->value);
    }
    
    public function test_cookie_with_multiple_semicolons() {
        $cookie = new WP_Http_Cookie('session=abc123;;;');
        $this->assertEquals('session', $cookie->name);
        $this->assertEquals('abc123', $cookie->value);
    }
   
    public function test_test_method_domain_without_dots() {
    // Test that domains without dots get .local appended (line 183)
    
    // Test 1: Single word domain
    $cookie1 = new WP_Http_Cookie('session=abc123; Domain=example');
    $this->assertTrue($cookie1->test('https://example.local/'), 
        'Domain "example" should match "example.local"');
    $this->assertFalse($cookie1->test('https://example/'),
        'Domain "example" should NOT match "example" (needs .local)');
    
    // Test 2: localhost (common case)
    $cookie2 = new WP_Http_Cookie('session=abc123; Domain=localhost');
    $this->assertTrue($cookie2->test('https://localhost.local/'),
        'Domain "localhost" should match "localhost.local"');
    
    // Test 3: Already has dot - should NOT get .local
    $cookie3 = new WP_Http_Cookie('session=abc123; Domain=example.com');
    $this->assertTrue($cookie3->test('https://example.com/'),
        'Domain "example.com" should match "example.com"');
    $this->assertFalse($cookie3->test('https://example.com.local/'),
        'Domain "example.com" should NOT match "example.com.local"');
}
}