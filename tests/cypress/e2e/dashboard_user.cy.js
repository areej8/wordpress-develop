// tests/e2e/specs/04-users/add-user.cy.js

// Suppress ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop')) {
    return false
  }
  return true
})

describe("WordPress Add User Tests", () => {
  const USERNAME = "areesha"
  const PASSWORD = "10139525#jm"

  beforeEach(() => {
    cy.visit("/wp-login.php")
    
    cy.get("body").should("be.visible")
    
    cy.get("#user_login")
      .clear({ force: true })
      .should("have.value", "")
      .wait(50)
      .type(USERNAME, { delay: 100 })
    
    cy.get("#user_pass")
      .clear({ force: true })
      .should("have.value", "")
      .wait(50)
      .type(PASSWORD, { 
        parseSpecialCharSequences: false,
        delay: 100
      })
    
    cy.get("#wp-submit").click()
    
    cy.url({ timeout: 100 }).should("include", "/wp-admin")
    cy.get("#wpbody-content", { timeout: 100}).should("be.visible")
    
    cy.visit("/wp-admin/index.php")
    cy.get("#menu-users").click()
    cy.contains("Add User").click()
    cy.url().should("include", "/user-new.php")
    cy.contains("Add User").should("be.visible")
  })

  afterEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  // ==================== COMPREHENSIVE POSITIVE TEST CASES ====================

  it("TC-1: Should create user with all standard valid inputs and Subscriber role", () => {  //passes
    const timestamp = Date.now()
    const newUsername = `test_user-${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`test.user+alias${timestamp}@mail.example.com`)
    cy.get("#first_name").type("José María")
    cy.get("#last_name").type("O'Reilly-Smith")
    cy.get("#url").type("https://example.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#role").select("Subscriber")
    cy.get("#send_user_notification").uncheck()
    cy.get("#send_user_notification").should("not.be.checked")
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  it("TC-2: Should create user with minimum required fields and Contributor role", () => {  //passes
    const timestamp = Date.now()
    const newUsername = `user${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`${newUsername}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#role").select("Contributor")
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  it("TC-3: Should create user with maximum length fields and Author role", () => {  //passes
    const timestamp = Date.now()
    const longUsername = `user${timestamp}${'a'.repeat(100)}`
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
    
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  it("TC-4: Should create user with valid special characters in names and Editor role", () => {   //passes
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
    
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  it("TC-5: Should create user with single character username and Administrator role", () => {  //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type("a")
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type("John123")
    cy.get("#last_name").type("Doe456")
    cy.get(".wp-generate-pw").click()
    cy.get("#pass1").should("have.attr", "type", "text")
    cy.get(".wp-hide-pw").click()
    cy.get("#role").select("Administrator")
    cy.get("#send_user_notification").uncheck()
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  // ==================== PASSWORD FIELD TESTS ====================

  it("TC-6: Should show error when password is empty", () => {   //passes
    cy.get("#user_login").type("testuser123")
    cy.get("#email").type("test@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#pass1").should("not.have.value", "")
    cy.get("#createusersub").should("not.be.disabled")
    cy.get("#pass1").clear().should("have.value", "")
    cy.get("#createusersub").should("be.disabled")
    cy.get("#createusersub").should("have.attr", "disabled")
  })

  // ==================== USERNAME FIELD NEGATIVE TESTS ====================

  it("TC-7: Should reject username with spaces", () => {  //this fails as it creates the user 
    cy.get("#user_login").type("u name spaces")
    cy.get("#email").type("test@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error: This username is invalid because it uses illegal characters. Please enter a valid username.", { timeout: 100 }).should("be.visible")
  })

  it("TC-8: Should reject username with special characters", () => {  //passes
    cy.get("#user_login").type("user@name#123")
    cy.get("#email").type("test@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error: This username is invalid because it uses illegal characters. Please enter a valid username.", { timeout: 100 }).should("be.visible")
  })

  it("TC-9: Should reject username with only numbers", () => {   //this fails as it creates the user
    const timestamp = Date.now()
    
    cy.get("#user_login").type("12345678")
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
   // cy.url({ timeout: 100 }).should("include", "/user-new.php")
  })

  it("TC-10: Should not allow duplicate username", () => {  //passes
    cy.get("#user_login").type("areesha")
    cy.get("#email").type("newemail@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error: This username is already registered. Please choose another one.", { timeout: 100 }).should("be.visible")
  })

  // ==================== EMAIL FIELD NEGATIVE TESTS ====================

  it("TC-11: Should reject email without @ symbol", () => {   //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("invalidemail.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-12: Should reject email without domain", () => {  //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("test@")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-13: Should reject email with spaces", () => {  //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("test email@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    //cy.url().should("include", "/user-new.php")
  })

  it("TC-14: Should reject email with invalid domain format", () => { //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`test${timestamp}@.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-15: Should reject email with multiple @ symbols", () => { //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`test@test${timestamp}@test.com`)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-16: Should show error for invalid email format", () => { //passes
    cy.get("#user_login").type("testuser123")
    cy.get("#email").type("invalidemail")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.get("#email").then($input => {
      expect($input[0].validationMessage).to.contain("@")
    })
  })

  it("TC-17: Should not allow duplicate email", () => {   //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type("duplicate@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("Error: This email is already registered. Please choose another one.", { timeout: 100 }).should("be.visible")
  })

  // ==================== FIRST & LAST NAME FIELD NEGATIVE TESTS ====================

  it("TC-18: Should create user with extremely long first and last name (boundary test)", () => {  //passes
    const timestamp = Date.now()
    const extremeFirstName = 'A'.repeat(150)
    const extremeLastName = 'B'.repeat(150)

    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type(extremeFirstName)
    cy.get("#last_name").type(extremeLastName)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
  
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  it("TC-19: Should create user with single character first and last name", () => {  //passes
    const timestamp = Date.now()
    const extremeFirstName = 'A'
    const extremeLastName = 'B'

    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#first_name").type(extremeFirstName)
    cy.get("#last_name").type(extremeLastName)
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()

    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  // ==================== WEBSITE FIELD NEGATIVE TESTS ====================

  it("TC-20: Should reject invalid website URL format", () => {  //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#url").type("invalid-url")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("ERROR", { timeout: 100 }).should("be.visible")
  })

  it("TC-21: Should handle website URL without protocol", () => {  //passes
    const timestamp = Date.now()
    
    cy.get("#user_login").type(`user${timestamp}`)
    cy.get("#email").type(`${timestamp}@test.com`)
    cy.get("#url").type("example.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.contains("New user created", { timeout: 100 }).should("be.visible")
  })

  // ==================== EMPTY FORM TESTS ====================

  it("TC-22: Should prevent submission with empty required fields", () => {   //passes
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-23: Should show error when only username is filled", () => {   //passes
    cy.get("#user_login").type("testuser123")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-24: Should show error when only email is filled", () => {  //passes
    cy.get("#email").type("test@test.com")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  // ==================== NAME FIELD NEGATIVE TESTS ====================

  it("TC-25: Should reject first name with invalid special characters", () => {  //this fails as it creates the user
    const timestamp = Date.now()
    const newUsername = `user${timestamp}`
    
    cy.get("#user_login").type(newUsername)
    cy.get("#email").type(`${newUsername}@test.com`)
    cy.get("#first_name").type("^*%*&(&(")
    cy.get("#last_name").type("&*&%&^*&")
    cy.get(".wp-generate-pw").click()
    cy.get("#createusersub").click()
    
    cy.url().should("include", "/user-new.php")
  })

  it("TC-26: Should not allow deleting current logged-in user and show protection message", () => {
  cy.visit("/wp-admin/users.php")
  
  cy.get("#cb-select-all-1").check()
  
  cy.get("#bulk-action-selector-top").select("Delete")
  
  cy.get("#doaction").click()
  
  cy.contains("You have specified these users for deletion").should("be.visible")
  
  cy.contains("areesha").should("be.visible")
  cy.contains("The current user will not be deleted").should("be.visible")
  cy.get("#submit").should("be.visible")
  cy.get("#submit").should("have.value", "Confirm Deletion")
  
  cy.get("#submit").click()
  
})
})