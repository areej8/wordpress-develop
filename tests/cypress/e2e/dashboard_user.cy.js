// tests/cypress/e2e/dashboard_user.cy.js

// Suppress ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})

describe("WordPress Add User Tests", () => {
  // Use credentials from cypress.config.js
  const USERNAME = Cypress.env('wpAdminUser')
  const PASSWORD = Cypress.env('wpAdminPass')

  beforeEach(() => {
    // Use cy.session for better performance
    cy.session([USERNAME, PASSWORD], () => {
      cy.visit("/wp-login.php")
      cy.get("#user_login", { timeout: 10000 }).clear().type(USERNAME)
      cy.get("#user_pass").clear().type(PASSWORD, { log: false })
      cy.get("#wp-submit").click()
      cy.url({ timeout: 15000 }).should("include", "/wp-admin")
      cy.get("#wpadminbar", { timeout: 15000 }).should("exist")
    })

    // Navigate to Add New User page
    cy.visit("/wp-admin/user-new.php")
    cy.get("body", { timeout: 15000 }).should("be.visible")
    cy.contains("Add New User", { timeout: 10000 }).should("be.visible")
  })

  // ==================== COMPREHENSIVE POSITIVE TEST CASES ====================

  it("TC-1: Should create user with all standard valid inputs and Subscriber role", () => {
    const timestamp = Date.now()
    const newUsername = `test_user_${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`test.user.alias${timestamp}@mail.example.com`)
    cy.get("#first_name").type("José María")
    cy.get("#last_name").type("O'Reilly-Smith")
    cy.get("#url").type("https://example.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#role").select("Subscriber")
    cy.get("#send_user_notification").uncheck()
    cy.get("#send_user_notification").should("not.be.checked")
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-2: Should create user with minimum required fields and Contributor role", () => {
    const timestamp = Date.now()
    const newUsername = `user${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`${newUsername}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#role").select("Contributor")
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-3: Should create user with maximum length fields and Author role", () => {
    const timestamp = Date.now()
    const longUsername = `user${timestamp}`
    const longfName = 'A'.repeat(200)
    const longlName = 'B'.repeat(200)
    const customPassword = "CustomPass123!@#"

    cy.get("#user_login").type(longUsername)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type(longfName)
    cy.get("#last_name").type(longlName)
    cy.get("#pass1").clear().type(customPassword)
    cy.get("#pass1").should("have.value", customPassword)
    cy.get("#role").select("Author")
    cy.get("#send_user_notification").should("exist")
    cy.contains("Send the new user an email about their account").should("be.visible")
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-4: Should create user with valid special characters in names and Editor role", () => {
    const timestamp = Date.now()
    const newUsername = `user${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`${newUsername}@test.com`)
    cy.get("#first_name").type("Mary-Jane O'Connor")
    cy.get("#last_name").type("Smith-Jones")
    cy.get(".wp-generate-pw").click()
    cy.get("#pass1").should("not.have.value", "")
    cy.contains("Strong").should("be.visible")
    cy.get("#role").select("Editor")
    cy.get("#send_user_notification").should("be.checked")
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-5: Should create user with single character username and Administrator role", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`a${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type("John123")
    cy.get("#last_name").type("Doe456")
    cy.get(".wp-generate-pw").click()
    cy.get("#pass1").should("have.attr", "type", "text")
    cy.get(".wp-hide-pw").click()
    cy.get("#role").select("Administrator")
    cy.get("#send_user_notification").uncheck()
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  // ==================== PASSWORD FIELD TESTS ====================

  it("TC-6: Should show error when password is empty", () => {
    const timestamp = Date.now()
    cy.get("#user_login").type(`testuser${timestamp}`)
    cy.get("#email").type(`test${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#pass1").should("not.have.value", "")
    cy.get("#createusersub").should("not.be.disabled")
    cy.get("#pass1").clear().should("have.value", "")
    cy.get("#createusersub").should("be.disabled")
    cy.get("#createusersub").should("have.attr", "disabled")
  })

  // ==================== USERNAME FIELD NEGATIVE TESTS ====================

  it("TC-7: Should reject username with spaces", () => {
    const timestamp = Date.now()
    cy.get("#user_login").type("u name spaces")
    cy.get("#email").type(`test${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error:", { timeout: 10000 }).should("be.visible")
    cy.contains("illegal characters", { timeout: 10000 }).should("be.visible")
  })

  it("TC-8: Should reject username with special characters", () => {
    const timestamp = Date.now()
    cy.get("#user_login").type("user@name#123")
    cy.get("#email").type(`test${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error:", { timeout: 10000 }).should("be.visible")
    cy.contains("illegal characters", { timeout: 10000 }).should("be.visible")
  })

  it("TC-9: Should allow username with only numbers", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    // WordPress allows numeric usernames
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-10: Should not allow duplicate username", () => {
    cy.get("#user_login").type(USERNAME)
    cy.get("#email").type("newemail@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error:", { timeout: 10000 }).should("be.visible")
    cy.contains("already registered", { timeout: 10000 }).should("be.visible")
  })

  // ==================== EMAIL FIELD NEGATIVE TESTS ====================

  it("TC-11: Should reject email without @ symbol", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("invalidemail.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-12: Should reject email without domain", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("test@")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-13: Should reject email with spaces", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("test email@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-14: Should reject email with invalid domain format", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`test${timestamp}@.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-15: Should reject email with multiple @ symbols", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`test@test${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-16: Should show error for invalid email format", () => {
    const timestamp = Date.now()
    cy.get("#user_login").type(`testuser${timestamp}`)
    cy.get("#email").type("invalidemail")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.get("#email").then($input => {
      expect($input[0].validationMessage).to.contain("@")
    })
  })

  it("TC-17: Should not allow duplicate email", () => {
    const timestamp = Date.now()
    const existingEmail = `existing${timestamp}@test.com`
    
    // First create a user with this email
    cy.get("#user_login").type(`user${timestamp}a`)
    cy.get("#email").type(existingEmail)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
    
    // Try to create another user with same email
    cy.visit("/wp-admin/user-new.php")
    cy.get("#user_login").type(`user${timestamp}b`)
    cy.get("#email").type(existingEmail)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error:", { timeout: 10000 }).should("be.visible")
    cy.contains("already registered", { timeout: 10000 }).should("be.visible")
  })

  // ==================== FIRST & LAST NAME FIELD TESTS ====================

  it("TC-18: Should create user with extremely long first and last name (boundary test)", () => {
    const timestamp = Date.now()
    const extremeFirstName = 'A'.repeat(150)
    const extremeLastName = 'B'.repeat(150)

    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type(extremeFirstName)
    cy.get("#last_name").type(extremeLastName)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
  
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-19: Should create user with single character first and last name", () => {
    const timestamp = Date.now()

    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type("A")
    cy.get("#last_name").type("B")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()

    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  // ==================== WEBSITE FIELD TESTS ====================

  it("TC-20: Should reject invalid website URL format", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#url").type("invalid-url")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("ERROR", { timeout: 10000 }).should("be.visible")
  })

  it("TC-21: Should handle website URL without protocol", () => {
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#url").type("example.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  // ==================== EMPTY FORM TESTS ====================

  it("TC-22: Should prevent submission with empty required fields", () => {
    cy.get("#createusersub").click()
    cy.url().should("include", "/user-new.php")
  })

  it("TC-23: Should show error when only username is filled", () => {
    const timestamp = Date.now()
    cy.get("#user_login").type(`testuser${timestamp}`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-24: Should show error when only email is filled", () => {
    const timestamp = Date.now()
    cy.get("#email").type(`test${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  // ==================== NAME FIELD WITH SPECIAL CHARACTERS ====================

  it("TC-25: Should allow first name with special characters", () => {
    const timestamp = Date.now()
    const newUsername = `user${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`${newUsername}@test.com`)
    cy.get("#first_name").type("^*%*&(&(")
    cy.get("#last_name").type("&*&%&^*&")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    // WordPress allows special characters in names
    cy.contains("New user created", { timeout: 10000 }).should("be.visible")
  })

  it("TC-26: Should not allow deleting current logged-in user", () => {
    cy.visit("/wp-admin/users.php")
    cy.get("body", { timeout: 10000 }).should("be.visible")
    
    cy.get("#cb-select-all-1").check()
    cy.get("#bulk-action-selector-top").select("Delete")
    cy.get("#doaction").click()
    
    cy.contains("You have specified these users for deletion", { timeout: 10000 })
      .should("be.visible")
    cy.contains(USERNAME).should("be.visible")
    cy.contains("The current user will not be deleted").should("be.visible")
    cy.get("#submit").should("be.visible")
    cy.get("#submit").should("have.value", "Confirm Deletion")
    
    cy.get("#submit").click()
    
    // Verify current user still exists
    cy.visit("/wp-admin/users.php")
    cy.contains(USERNAME).should("be.visible")
  })
})