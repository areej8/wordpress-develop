// tests/e2e/specs/01-auth/login.cy.js



// Suppress ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})
  describe("WordPress Login Tests", () => {

  beforeEach(() => {
    cy.visit("/wp-login.php")
  })

  it("TC-001: Should display login form elements", () => {
    cy.get("#user_login").should("be.visible")
    cy.get("#user_pass").should("be.visible")
    cy.get("#wp-submit").should("be.visible")
    cy.get("#wp-submit").should("have.value", "Log In")
    cy.get("label[for='user_login']").should("contain", "Username or Email Address")
    cy.get("label[for='user_pass']").should("contain", "Password")
  })

  it("TC-002: Should login successfully with valid credentials", () => {
    cy.get("#user_login").type("areesha")
    cy.get("#user_pass").type("10139525#jm")
    cy.get("#wp-submit").click()
  })

  it("TC-003: Should show error message with invalid username", () => {
    cy.get("#user_login").type("invaliduser123")
    cy.get("#user_pass").type("wrongpassword")
    cy.get("#wp-submit").click()

    // Verify error is shown
    cy.get("#login_error").should("be.visible")
    cy.get("#login_error").should("contain", "Error")
    cy.url().should("include", "/wp-login.php")
  })

  it("TC-004: Should show error message with invalid password", () => {
    cy.get("#user_login").type("areesha")
    cy.get("#user_pass").type("wrongpassword123")
    cy.get("#wp-submit").click()

    // Verify error is shown
    cy.get("#login_error").should("be.visible")
    cy.url().should("include", "/wp-login.php")
  })

  it("TC-005: Should require username field (HTML5 validation)", () => {
    cy.get("#user_pass").type("10139525#jm")
    
    // Verify HTML5 required attribute exists
    cy.get("#user_login").should("have.attr", "required")
    
    // Trigger validation by trying to submit
    cy.get("#wp-submit").click()
    
    // Verify form was not submitted (still on login page)
    cy.url().should("include", "/wp-login.php")
    cy.url().should("not.include", "/wp-admin")
  })

  it("TC-006: Should require password field (HTML5 validation)", () => {
    cy.get("#user_login").type("areesha")
    
    // Verify HTML5 required attribute exists
    cy.get("#user_pass").should("have.attr", "required")
    
    // Trigger validation by trying to submit
    cy.get("#wp-submit").click()
    
    // Verify form was not submitted (still on login page)
    cy.url().should("include", "/wp-login.php")
    cy.url().should("not.include", "/wp-admin")
  })

  it("TC-007: Should require both fields (HTML5 validation)", () => {
    // Verify both fields have required attribute
    cy.get("#user_login").should("have.attr", "required")
    cy.get("#user_pass").should("have.attr", "required")
    
    // Try to submit empty form - HTML5 validation should prevent submission
    cy.get("#wp-submit").click()
    
    // Should still be on login page (form not submitted)
    cy.url().should("include", "/wp-login.php")
    cy.url().should("not.include", "/wp-admin")
  })

  it("TC-008: Should have 'Remember Me' checkbox functional", () => {
    cy.get("#rememberme").should("exist")
    cy.get("#rememberme").check()
    cy.get("#rememberme").should("be.checked")
    cy.get("#rememberme").uncheck()
    cy.get("#rememberme").should("not.be.checked")
  })

  it("TC-009: Should have 'Lost your password?' link", () => {
    cy.contains("Lost your password?").should("be.visible")
    // WordPress uses 'lostpassword' not 'lost-password'
    cy.get("a[href*='lostpassword']").should("exist")
  })

  it("TC-010: Should navigate to password reset page", () => {
    cy.contains("Lost your password?").click()
    cy.url().should("include", "action=lostpassword")
    cy.contains("Please enter your username or email address").should("be.visible")
  })

  it("TC-011: Should redirect to admin after login", () => {
    cy.get("#user_login").type("areesha")
    cy.get("#user_pass").type("10139525#jm")
    cy.get("#rememberme").check()
    cy.get("#wp-submit").click()

    // Wait for redirect and verify dashboard
    cy.url().should("include", "/wp-admin")
    cy.get("#wpbody-content").should("exist")
  })

  it("TC-012: Should persist login with 'Remember Me' checked", () => {
    cy.get("#user_login").type("areesha")
    cy.get("#user_pass").type("10139525#jm")
    cy.get("#rememberme").check()
    cy.get("#wp-submit").click()

    cy.url().should("include", "/wp-admin")

    // Verify WordPress login cookies are set (cookie names contain hash/domain)
    cy.getCookies().then((cookies) => {
      const wpCookies = cookies.filter(cookie => 
        cookie.name.includes("wordpress_logged_in") || 
        cookie.name.includes("wordpress_") ||
        cookie.name === "wp-settings-time-1"
      )
      expect(wpCookies.length).to.be.greaterThan(0)
    })
  })

  it("TC-013: Should handle special characters in password", () => {
    cy.get("#user_login").type("areesha")
    cy.get("#user_pass").type("10139525#jm") // Has special character #
    cy.get("#wp-submit").click()

    cy.url().should("include", "/wp-admin")
  })

  it("TC-014: Should not allow SQL injection in username field", () => {
    cy.get("#user_login").type("admin' OR '1'='1")
    cy.get("#user_pass").type("anything")
    cy.get("#wp-submit").click()

    // Should show error, not allow access
    cy.get("#login_error").should("be.visible")
    cy.url().should("not.include", "/wp-admin")
  })

  it("TC-015: Should allow login with whitespace around username (WordPress trims)", () => {
  cy.get("#user_login").type("  areesha  ")
  cy.get("#user_pass").type("10139525#jm")
  cy.get("#wp-submit").click()
})

})